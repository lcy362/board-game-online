#!/usr/bin/env bash
# 极速101 · 极简离线 APK 构建脚本
# 不使用 Gradle，直接用 Android build-tools 命令行工具。
set -euo pipefail

SDK="${ANDROID_HOME:-$HOME/Library/Android/sdk}"
BT="$SDK/build-tools/36.1.0"
PLATFORM="$SDK/platforms/android-36"

AAPT2="$BT/aapt2"
D8="$BT/d8"
ZIPALIGN="$BT/zipalign"
APKSIGNER="$BT/apksigner"
JAVAC="javac"
JAVA="java"

# ---------- 路径 ----------
ROOT="$(cd "$(dirname "$0")" && pwd)"
SRC="$ROOT/src"
RES="$ROOT/res"
ASSETS="$ROOT/assets"
MANIFEST="$ROOT/AndroidManifest.xml"
BUILD="$ROOT/build"
OUT="$ROOT/output"
ANDROID_JAR="$PLATFORM/android.jar"

APP_ID="com.speed101.app"
APP_VERSION="1.0.0"
KEYSTORE="$ROOT/speed101.keystore"
KEY_ALIAS="speed101"
KEYSTORE_PASS="speed101"

echo "==> 清空构建目录"
rm -rf "$BUILD" "$OUT"
mkdir -p "$BUILD/compiled" "$BUILD/classes" "$OUT"

echo "==> 1/7 编译资源 (aapt2 compile)"
"$AAPT2" compile --dir "$RES" -o "$BUILD/compiled/"

echo "==> 2/7 链接资源并生成 R.java + base.apk (aapt2 link)"
"$AAPT2" link \
  -o "$BUILD/base.apk" \
  -I "$ANDROID_JAR" \
  --manifest "$MANIFEST" \
  --java "$BUILD/gen" \
  --min-sdk-version 21 \
  --target-sdk-version 35 \
  --version-code 1 \
  --version-name "$APP_VERSION" \
  $(find "$BUILD/compiled" -name "*.flat")

echo "==> 3/7 编译 Java 源码 (javac)"
"$JAVAC" -source 8 -target 8 \
  -cp "$ANDROID_JAR" \
  -d "$BUILD/classes" \
  $(find "$BUILD/gen" "$SRC" -name "*.java")

echo "==> 4/7 转 dex (d8)"
"$D8" --release --lib "$ANDROID_JAR" \
  --output "$BUILD" \
  $(find "$BUILD/classes" -name "*.class")

echo "==> 5/7 组装未签名 APK（加入 classes.dex + assets，UTF-8 中文文件名）"
cp "$BUILD/base.apk" "$BUILD/unsigned.apk"
cd "$BUILD" && zip -q -X unsigned.apk classes.dex
cd "$ROOT"
# 用 Python zipfile 追加 assets（系统 zip / aapt2 都会损坏 UTF-8 中文文件名）
python3 - "$BUILD" "$ASSETS" <<'PYEOF'
import sys, zipfile, os
build, assets = sys.argv[1], sys.argv[2]
apk = os.path.join(build, 'unsigned.apk')
with zipfile.ZipFile(apk, 'a', zipfile.ZIP_DEFLATED) as z:
    for root, dirs, files in os.walk(assets):
        for f in files:
            src = os.path.join(root, f)
            rel = os.path.relpath(src, assets)
            arc = os.path.join('assets', rel)
            z.write(src, arc)
print("    -- assets 已追加（UTF-8 编码）")
PYEOF

echo "==> 6/7 zipalign 对齐"
"$ZIPALIGN" -f 4 "$BUILD/unsigned.apk" "$OUT/unsigned-aligned.apk"

echo "==> 7/7 签名 (apksigner)"
if [ ! -f "$KEYSTORE" ]; then
  echo "    -- 生成 debug keystore"
  keytool -genkeypair \
    -keystore "$KEYSTORE" -storepass "$KEYSTORE_PASS" -keypass "$KEYSTORE_PASS" \
    -alias "$KEY_ALIAS" -keyalg RSA -keysize 2048 -validity 10000 \
    -dname "CN=Speed101, OU=Dev, O=Speed101, L=City, S=State, C=CN"
fi
"$APKSIGNER" sign \
  --ks "$KEYSTORE" --ks-pass "pass:$KEYSTORE_PASS" --ks-key-alias "$KEY_ALIAS" \
  --out "$OUT/speed101-${APP_VERSION}-offline.apk" \
  "$OUT/unsigned-aligned.apk"

echo "==> 完成 ✅"
ls -lh "$OUT/speed101-${APP_VERSION}-offline.apk"
