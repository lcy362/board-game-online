# 极速101 · itch.io 项目资料字段清单

> 用途：在 itch.io 创建 / 编辑《极速101》游戏项目时，逐字段对照填写。
> 本文档**只列字段与建议值**，不涉及上传操作（上传用 butler，见 `itch-upload-guide.md`）。
> 版本：v0.1.0（初版）

---

## 字段速查表

| 字段（Field） | 建议填写值 | 说明 |
|---|---|---|
| **Title（标题）** | Speed 101 | 站内展示名（英文）。 |
| **URL（项目短链 slug）** | `speed101` | 项目地址形如 `your-username/speed101`；slug 一旦确定尽量不改。 |
| **Short description（一句话简介）** | Single-player card game — race 1–5 AI drivers to exactly 101 using math and strategy. | 列表页 / 卡片展示用，≤ 1 句，点明品类与卖点。 |
| **Long description（长描述）** | 见下方「长描述模板」 | 项目主页正文，支持 Markdown / 简单 HTML。 |
| **Tags（标签）** | card game, racing, math, casual, singleplayer, strategy, html5, english, education | 影响站内发现与推荐；多选，尽量覆盖品类与语言。 |
| **Category（分类）** | Games | 项目大类选 Games。 |
| **Genre / Classification（类型标签）** | Card Game / Racing / Educational | itch 用标签多选，可同时勾多个类型。 |
| **Pricing（价格模式）** | Free | 免费游玩；如需支持可另开 Pay what you want（见下）。 |
| **Platforms（平台）** | ☑ Web (HTML5) | 本游戏仅 Web，浏览器即点即玩，无需下载客户端。 |
| **Release date / Version（版本）** | v0.1.0 | 在 Version 字段填版本号，便于区分发版。 |
| **Cover image（封面图）** | 建议 315×250 | 项目卡片缩略图；用游戏截图或卡通小车仪表盘图。 |
| **Screenshots（截图）** | 建议 1280×800，3–5 张 | 展示开始屏、对局、规则弹层、单卡说明等。 |
| **Languages（语言）** | Chinese (zh), English (en) | 标注游戏内支持的语言。 |
| **Distribution（上传 channel）** | html | 将来用 butler 上传时的 channel 名（如 `:html`），保持一致即可。 |
| **External links / source（可选）** | GitHub 仓库占位链接 | 可选；放源码 / 开发日志外链。 |

---

## 各字段详细说明

### Title（标题）
- **建议值**：`Speed 101`
- 说明：英文标题，便于国际玩家检索。

### URL（项目短链 slug）
- **建议值**：`speed101`
- 说明：即项目地址 `https://your-username.itch.io/speed101` 中的短链部分。创建后尽量保持不变；改 slug 会换地址。

### Short description（一句话简介）
- **建议值**：`Single-player card game — race 1–5 AI drivers to exactly 101 using math and strategy.`
- 说明：出现在项目列表、分享卡片。务必简短、突出「卡牌 + 竞速 + 数学 + 单人 vs AI」。

### Long description（长描述）
可直接复制以下 Markdown 版本粘贴到项目描述框：

```markdown
# Speed 101

Single-player card game — race 1–5 AI drivers to exactly 101 using math and strategy.

## Gameplay
You and 1–5 AI drivers take turns playing cards, pushing your speed toward 101.
Go over 101 and you "blow a tire" — lose one of your 3 tires and reset to zero.
Each driver has only 3 tires; when they're gone you're out. Last driver standing wins.

## Features
- 🃏 Card strategy: a 74-card deck — 48 speed cards + 9 function cards (Brake / Hard Brake / Refuel / Set 50 / Overtake / Reverse / Throttle / Gear Up / Spinout).
- 🧮 Math race: stop right at the blowout edge — mental math meets bluffing.
- 🤖 Three AI tiers: Easy / Medium / Hard, with 1–5 AI opponents.
- 🌐 Bilingual (Chinese / English): toggle in-game, defaults to browser language.

## Languages
Chinese / English

## System Requirements
Any modern browser (Chrome / Edge / Safari / Firefox). Just open and play — no install, no internet required.
```

> 如需纯 HTML 版本，把上述标题（# / ##）换成 `<h1>`/`<h2>`，列表换成 `<ul><li>`，其余文案一致即可。

### Tags（标签）
- **建议值**：`card game, racing, math, casual, singleplayer, strategy, html5, english, education`
- 说明：标签是 itch 站内发现与推荐的主要依据，建议多选、覆盖品类（card game / racing / math / strategy / casual）、形态（singleplayer / html5）与语言（chinese / english）。也可补 `puzzle`、`family`、`education` 以触达教育向玩家。

### Category（分类）
- **建议值**：`Games`
- 说明：项目大类。本游戏为可玩游戏，选 Games。

### Genre / Classification（类型标签）
- **建议值**：`Card Game` / `Racing` / `Educational`
- 说明：itch 的类型用「标签多选」而非单选下拉，可同时勾 Card Game、Racing、Educational，更准确描述「卡牌 + 竞速 + 数学教育」的复合定位。

### Pricing（价格模式）
- **建议值**：`Free`
- 说明：
  - **Free**：完全免费，玩家即点即玩，门槛最低，适合初版拉新与收集反馈。
  - **Pay what you want（PWYW）**：免费基础上允许玩家自愿付费支持；若日后想接受捐赠/支持可切换为此模式，不影响免费下载。
  - 本游戏初版建议 **Free**；后续如开放支持再考虑 PWYW。

### Platforms（平台）
- **建议值**：勾选 **Web (HTML5)**
- 说明：本游戏是单文件 H5，浏览器直接运行，**仅 Web**，无需 Windows / macOS / Linux 下载客户端，也无需 Android / iOS 安装包。只在 Web 项打勾即可。

### Release date / Version（版本）
- **建议值**：`v0.1.0`
- 说明：在项目的 Version 字段填版本号，方便玩家与后台区分发版；每次更新同步递增（如 v0.1.1）。

### Cover image（封面图）
- **建议值尺寸**：约 **315×250**（itch 项目卡片缩略图常用比例）
- 获取方式：截取游戏开始屏或主对局画面，叠加卡通小车 / 仪表盘元素；保持高对比、文字清晰。初版可暂用游戏截图代替。

### Screenshots（截图）
- **建议值尺寸**：约 **1280×800**（16:10，桌面浏览清晰）
- 建议数量：**3–5 张**，覆盖：① 开始屏（选 AI 数量与难度）；② 主对局（手牌 + 速度表）；③ 规则弹层；④ 单卡 ? 说明；⑤ 中英切换 / 结算画面。

### Languages（语言）
- **建议值**：`Chinese (zh)`、`English (en)`
- 说明：标注游戏内支持的语言，便于对应语种玩家检索。

### Distribution（将来用 butler 上传的 channel）
- **建议值**：`html`
- 说明：将来执行 `butler push ... your-username/speed101:html` 时的 channel 名。itch 对网页游戏常用 `html` 或 `web`，任选其一并**保持一致**即可。首次 push 时按提示把该 channel 类型选为 web / html5。

### External links / source（可选）
- **建议值**：GitHub 仓库占位链接（如 `https://github.com/your-username/speed101`）
- 说明：可选填，用于指向源码或开发日志；初版可留空或填占位，正式开源后再补真实地址。

---

*本文档与 `itch-upload-guide.md` 配合使用：本文件负责「填什么」，上传指南负责「怎么传」。*
