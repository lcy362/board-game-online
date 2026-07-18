#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
itch-set-metadata.py — 用 itch.io REST API 设置《极速101》项目资料字段。

【重要前提 / 限制】
1. 本脚本必须在你自己的机器上跑（沙箱/CI 出口通常连不到 itch.io）。
2. 凭据复用 butler 的 key：~/Library/Application Support/itch/butler_creds
3. itch 官方 server-side API 只文档化了 GET 接口（my-games / me / purchases…）。
   游戏元数据更新与封面/截图上传属于【非官方端点】，可能随 itch 改版失效。
4. 本脚本对文本字段走常见的 PUT /game/{id}；封面/截图走常见的 upload-cover /
   upload-screenshots。若这些端点改了或返回错误，相关字段请到
   itch.io dashboard 手动补全（docs/itch-metadata.md 已按字段整理好，可直接粘贴）。

【用法】
  python3 itch-set-metadata.py                 # 只改文本字段
  python3 itch-set-metadata.py --cover cover.png
  python3 itch-set-metadata.py --cover cover.png --screenshots a.png,b.png,c.png

跑完看每步的 HTTP 状态与返回；非 2xx 的字段去 dashboard 补。
"""

import os
import sys
import json
import base64
import mimetypes
import urllib.request
import urllib.error
import urllib.parse

# ---------- 配置 ----------
CREDS_PATH = os.path.expanduser("~/Library/Application Support/itch/butler_creds")
SLUG = "speed101"          # 项目短链
USER = "sandgrid"          # itch 用户名（仅用于提示）

# ---------- 资料数据（来自 docs/itch-metadata.md）----------
TITLE = "Speed 101"
SHORT_TEXT = "Single-player card game — race 1–5 AI drivers to exactly 101 using math and strategy."
TAGS = "card game, racing, math, casual, singleplayer, strategy, html5, english, education"
MIN_PRICE = 0              # 美分；0 = 免费
CAN_BE_BOUGHT = False      # False = 不售卖（免费）

# 长描述：itch 存 HTML。下面是把 itch-metadata.md 的 Markdown 模板转成的 HTML。
DESCRIPTION_HTML = """<h1>Speed 101</h1>
<p>Single-player card game — race 1–5 AI drivers to exactly 101 using math and strategy.</p>
<h2>Gameplay</h2>
<p>You and 1–5 AI drivers take turns playing cards, pushing your speed toward 101. Go over 101 and you "blow a tire" — lose one of your 3 tires and reset to zero. Each driver has only 3 tires; when they're gone you're out. Last driver standing wins.</p>
<h2>Features</h2>
<ul>
<li>🃏 Card strategy: a 74-card deck — 48 speed cards + 9 function cards (Brake / Hard Brake / Refuel / Set 50 / Overtake / Reverse / Throttle / Gear Up / Spinout).</li>
<li>🧮 Math race: stop right at the blowout edge — mental math meets bluffing.</li>
<li>🤖 Three AI tiers: Easy / Medium / Hard, with 1–5 AI opponents.</li>
<li>🌐 Bilingual (Chinese / English): toggle in-game, defaults to browser language.</li>
</ul>
<h2>Languages</h2>
<p>Chinese / English</p>
<h2>System Requirements</h2>
<p>Any modern browser (Chrome / Edge / Safari / Firefox). Just open and play — no install, no internet required.</p>"""


# ---------- 加载 key（兼容明文 / base64 两种 butler_creds 格式）----------
def load_key_candidates():
    try:
        with open(CREDS_PATH, "rb") as f:
            raw = f.read().strip()
    except FileNotFoundError:
        print(f"[错误] 找不到凭据文件：{CREDS_PATH}\n请先在本机执行 `butler login`。")
        sys.exit(1)
    cands = [raw.decode("utf-8", "replace").strip()]
    try:
        dec = base64.b64decode(raw)
        cands.append(dec.decode("utf-8", "replace").strip())
    except Exception:
        pass
    return [c for c in cands if c]


# ---------- 底层请求 ----------
def api_call(method, path, key, params=None, files=None):
    url = f"https://itch.io/api/1/{key}{path}"
    headers = {"Accept": "application/json"}
    data = None
    if files:
        boundary = "----itchsetboundary"
        parts = []
        if params:
            for k, v in params.items():
                parts.append(
                    f'--{boundary}\r\nContent-Disposition: form-data; name="{k}"\r\n\r\n{str(v)}\r\n'.encode("utf-8")
                )
        for fld, fpath in files:
            mime = mimetypes.guess_type(fpath)[0] or "application/octet-stream"
            try:
                with open(fpath, "rb") as fh:
                    content = fh.read()
            except OSError as e:
                print(f"  [跳过] 读文件失败 {fpath}: {e}")
                continue
            parts.append(
                f'--{boundary}\r\nContent-Disposition: form-data; name="{fld}"; filename="{os.path.basename(fpath)}"\r\n'
                f'Content-Type: {mime}\r\n\r\n'.encode("utf-8") + content + b"\r\n"
            )
        parts.append(f"--{boundary}--\r\n".encode("utf-8"))
        data = b"".join(parts)
        headers["Content-Type"] = f"multipart/form-data; boundary={boundary}"
    elif params:
        data = urllib.parse.urlencode(params).encode("utf-8")
        headers["Content-Type"] = "application/x-www-form-urlencoded"

    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            return r.status, r.read().decode("utf-8", "replace")
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode("utf-8", "replace")[:800]
    except Exception as e:  # 网络错误等
        return -1, f"{type(e).__name__}: {e}"


# ---------- 解析参数 ----------
def parse_args(argv):
    cover = None
    screenshots = []
    if "--cover" in argv:
        i = argv.index("--cover")
        if i + 1 < len(argv):
            cover = argv[i + 1]
    if "--screenshots" in argv:
        i = argv.index("--screenshots")
        if i + 1 < len(argv):
            screenshots = [s for s in argv[i + 1].split(",") if s]
    return cover, screenshots


# ---------- 主流程 ----------
def main():
    cover, screenshots = parse_args(sys.argv)
    keys = load_key_candidates()
    print(f"凭据候选数：{len(keys)}（不打印 key 内容）")

    for key in keys:
        # 1) 解析 game_id
        st, body = api_call("GET", "/my-games", key)
        if st != 200:
            print(f"[warn] GET /my-games -> {st}: {body[:200]}")
            continue
        try:
            games = json.loads(body).get("games", [])
        except Exception:
            print(f"[warn] /my-games 返回非 JSON：{body[:200]}")
            continue

        gid = None
        for g in games:
            url = (g.get("url") or "")
            title = (g.get("title") or "")
            if SLUG in url or "极速101" in title or "speed 101" in title.lower():
                gid = g.get("id")
                break
        if not gid:
            print(f"[warn] 在 {len(games)} 个项目里没找到 slug='{SLUG}' 的项目。")
            print("       已有项目 url：", ", ".join(g.get("url", "?") for g in games[:10]))
            continue

        print(f"找到项目：id={gid}")

        # 2) 更新文本元数据（非官方 PUT /game/{id}）
        params = {
            "title": TITLE,
            "short_text": SHORT_TEXT,
            "description": DESCRIPTION_HTML,
            "tags": TAGS,
            "min_price": MIN_PRICE,
            "can_be_bought": "true" if CAN_BE_BOUGHT else "false",
        }
        st, body = api_call("PUT", f"/game/{gid}", key, params=params)
        print(f"PUT /game/{gid}（文本字段）-> {st}")
        print("  " + body.replace("\n", "\n  ")[:600])

        # 3) 封面（可选，非官方）
        if cover:
            st, body = api_call("POST", f"/game/{gid}/upload-cover", key,
                                files=[("cover", cover)])
            print(f"POST /game/{gid}/upload-cover -> {st}: {body[:200]}")

        # 4) 截图（可选，非官方）
        if screenshots:
            files = [("screenshots", s) for s in screenshots]
            st, body = api_call("POST", f"/game/{gid}/upload-screenshots", key, files=files)
            print(f"POST /game/{gid}/upload-screenshots -> {st}: {body[:200]}")

        print("\n完成。若某步非 2xx：该字段请到 itch.io dashboard 手动补"
              "（参考 docs/itch-metadata.md）。")
        return

    print("所有 key 候选都失败，未能设置字段。请确认但ler login 成功且网络可达 itch.io。")


if __name__ == "__main__":
    main()
