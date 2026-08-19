# 极速101 · 离线安卓 APK 交付说明

## 产物

| 项目 | 说明 |
|---|---|
| **APK 文件** | `apk-build/output/speed101-1.0.0-offline.apk` |
| **体积** | 约 41 KB（极简 WebView 壳 + 单文件游戏） |
| **包名** | `com.speed101.app` |
| **应用名** | 极速101 · 数学竞速 |
| **系统要求** | Android 5.0（API 21）及以上 |
| **签名** | 自签名 RSA-2048（SHA-256），可正常安装 |

## 完全离线保证

- **零网络权限**：`AndroidManifest.xml` 中未声明 `INTERNET` 权限，系统安装时也不会请求联网权限。
- **零外部资源**：游戏 `index.html` 为单文件自包含实现（CSS/JS/SVG/音效全部内联），已验证无任何 `http(s)://`、`fetch`、CDN 请求。
- **本地加载**：WebView 从 `file:///android_asset/index.html` 加载，无需服务器。
- 结论：安装后完全离线、即点即玩。

## 构建方式

本 APK 采用「极简 WebView 壳」手工构建，**不使用 Gradle / Cordova / Capacitor 等框架**，仅依赖 Android build-tools 命令行工具。

依赖（构建环境）：
- JDK 21 + 编译目标 class 8
- Android build-tools 36.1.0（`aapt2`、`d8`、`zipalign`、`apksigner`）
- Android platform android-36（`android.jar`）

一键重建：

```bash
cd apk-build
bash build.sh
```

## 目录结构

```
apk-build/
├── AndroidManifest.xml          # 应用清单（无网络权限）
├── src/com/speed101/app/
│   └── MainActivity.java        # 极简 WebView 壳
├── assets/
│   └── index.html               # 从 speed101/ 复制来的游戏本体
├── res/
│   ├── values/strings.xml       # 应用名
│   └── mipmap-*/ic_launcher.png # 启动图标（5 个密度）
├── tools/gen_icon.py            # 纯 Python 图标生成器
├── speed101.keystore            # 签名密钥（自动生成，密码 speed101）
├── build.sh                     # 一键构建脚本
└── output/
    └── speed101-1.0.0-offline.apk   # ★ 最终产物
```

## 安装到手机

1. 将 `speed101-1.0.0-offline.apk` 传到手机（微信/网盘/USB 均可）。
2. 手机端点击安装。若系统提示「未知来源」，需在系统设置中允许安装来自此来源的应用。
3. 打开「极速101 · 数学竞速」，即点即玩，全程无需联网。

## 自定义

- **换图标**：替换 `res/mipmap-*/ic_launcher.png` 后重新 `bash build.sh`。
- **换游戏内容**：替换 `assets/index.html`（需保持单文件自包含）后重新构建。
- **改版本号**：修改 `AndroidManifest.xml` 的 `versionCode` / `versionName`。
