# 极速101 · itch.io 上传指南

> 面向对象：最终发布人员（非开发者）。本文档教你如何把《极速101》H5 卡牌游戏发布到 itch.io。
> 你不需要会写代码——只要会复制命令、回车即可。

---

## 0. 本机环境说明（可选读）

- 在当前的开发机上，butler 已经预先安装好了：版本 **v15.29.0**，命令位于 `~/butler/butler`，并已加入 PATH（执行 `butler --version` 即可看到版本号）。因此你可以直接跳到第 3 步。
- 如果你在另一台干净的 Mac 上发布，请先按第 2 步安装 butler。

---

## 1. 前置准备

1. 注册 itch.io 账号：<https://itch.io/register>（已有账号可跳过）。
2. 登录后，点击右上角头像 → **Create new project**（创建新项目）。
3. 项目类型（Kind / 项目种类）选择 **HTML**（即“网页 / HTML5 游戏”）。
   - 选 HTML 最省事；也可以选 “Game” 之后再上传，但选 HTML 一步到位。
4. 填写项目名称（如「极速101」），其余先留空或随意，保存。
5. 记下项目的 **owner/game-slug**，格式形如：
   - `你的用户名/你的游戏短名`
   - 例如：`speedstudio/speed101`
   - 下文统一用 **`your-username/your-game-slug`** 表示，请替换成你自己的。

---

## 2. 安装 butler（仅首次 / 换机器时需要）

butler 是 itch.io 官方的命令行上传工具。

- **方式 A（官方一键脚本，推荐）**：
  ```bash
  curl -L https://itch.io/butler/downloads/install | bash
  ```
  脚本会把 `butler` 装到当前目录或你的家目录，按提示把它放到 PATH 可达处（如 `~/butler/butler`）。
- **方式 B（手动下载二进制）**：
  到 GitHub 发布页 <https://github.com/itchio/butler/releases> 下载对应系统的压缩包：
  - Apple 芯片 Mac（M1 / M2 / M3 / M4）：`butler-darwin-arm64.zip`
  - Intel Mac：`butler-darwin-amd64.zip`
  解压后把 `butler` 放到例如 `/usr/local/bin/butler` 或 `~/butler/butler`，并 `chmod +x butler`。
- **验证安装**：
  ```bash
  butler --version
  ```
  看到类似 `v15.29.0, built on ...` 即成功。

---

## 3. butler 登录（仅首次，一次性）

```bash
butler login
```

- 会自动打开浏览器，跳到 itch.io 做 OAuth 授权，点 **Authorize** 允许即可。
- 登录状态会保存，之后上传不用再登录。
- 如果浏览器没自动打开，终端会打印一个网址，手动复制去浏览器打开授权。

---

## 4. 打包 / 上传命令模板

《极速101》是**单文件 H5 游戏，无需任何构建**，直接把含 `index.html` 的 `speed101/` 目录整个上传即可。

基础命令（请把 `your-username/your-game-slug` 换成你自己的）：

```bash
butler push /Users/lcy/speed101/speed101 your-username/your-game-slug:html
```

- `:html` 是 **channel（频道）名**。itch 对网页游戏常用 `html` 或 `web`，任选一个、保持一致即可。
- 首次 push 时，butler 会让你选择该 channel 的类型，请选 **web**（或 html5）。选一次后以后就不用再选。

**排除测试文件（推荐）**：仓库里的 `tests/` 目录是开发用的自动化测试脚本，不应随游戏发布。用 `--ignore` 跳过它：

```bash
butler push --ignore=tests /Users/lcy/speed101/speed101 your-username/your-game-slug:html
```

> 说明：`--ignore=tests` 会忽略 `tests/` 整个目录，玩家端不会看到这些测试文件。`README.md` 无害，可随包带上；若想更干净，也可一并 `--ignore=README.md` 排除。

---

## 5. 增量更新（发新版本）

游戏更新后（比如 i18n 改完、修了 bug），**再次执行同一条 push 命令即可**：

```bash
butler push --ignore=tests /Users/lcy/speed101/speed101 your-username/your-game-slug:html
```

- butler 会自动对比新旧目录，**只上传有变动的文件**，速度很快。
- 建议每次发版前，在 itch 项目页的 **Version** 字段填一个新版本号（如 `1.0.1`），方便玩家和你在后台区分版本。

---

## 6. 常见问题（Troubleshooting）

**Q1：macOS 第一次运行 butler 被拦截（“无法打开，因为无法验证开发者”）？**

- 这是 macOS 的 Gatekeeper 安全机制。去 **系统设置 → 隐私与安全性**，找到关于 butler 的拦截提示，点 **“仍要打开” / “允许”**。
- 或在终端执行一次：`xattr -dr com.apple.quarantine ~/butler/butler`（路径按你实际安装位置改）。
- （当前开发机已预先处理过，一般不会再弹。）

**Q2：push 报 401 / 403（未授权）？**

- 登录态失效了。重新执行 `butler login`，在浏览器里再授权一次，然后重跑 push。

**Q3：push 一直卡住或报网络错误？**

- 确认电脑能正常联网；公司 / 校园网络若有代理或防火墙，可能拦截上传，换一个网络环境再试。
- 不是大文件问题——本游戏只是约 70KB 的单个 HTML，极小，走 itch 的 CDN 秒传。

**Q4：玩家打开游戏后是空白 / 白屏？**

- 这是发布后玩家端的问题，通常不是上传导致。确认 push 的目录里确有 `index.html` 且未被 `--ignore` 误伤。itch 会直接以 `index.html` 作为入口加载。

**Q5：上传后想改频道名（html ↔ web）？**

- 频道名只是个标签，首次选定后保持一致即可；想换就重新 push 到新频道名（如 `:web`），旧频道可在 itch 后台隐藏。

---

## 7. 当前游戏的特殊说明

- **单文件、零构建**：本游戏就是 `speed101/index.html` 一个文件（含全部 HTML / CSS / JS，音效用 Web Audio 实时合成，零外部资源）。不用 npm、不用打包工具，上传整个 `speed101/` 目录即可。
- **中英双语（i18n）已内置**：游戏内提供中文 / English 切换，玩家在游戏里点一下就能换语言，**发布时无需任何额外步骤**。
- **不要改动游戏代码**：`index.html` 等源文件由开发同事维护；你只负责按本指南上传，不要手动编辑游戏文件。

---

## 附：一条命令速查

```bash
# 1) 首次：登录（一次性）
butler login

# 2) 上传（每次发布都跑这条，自动增量）
butler push --ignore=tests /Users/lcy/speed101/speed101 your-username/your-game-slug:html
```
