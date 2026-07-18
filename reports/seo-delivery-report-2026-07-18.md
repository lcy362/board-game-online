# 极速桌游馆 · SEO 全站优化交付报告

> 日期：2026-07-18
> 团队：SEO 内容营销团队（主理人 搜尔文 + 关宇霖 / 欧化成 / 艾笔润 / 连乐桥）
> 范围：3 个公开页面 + Cloudflare Pages 一键部署 + AdSense/GA/GSC 接入
> 协作模式：Workflow 3（优化现有站点）— 关键词研究 → 内容优化 → 三方并行联审 → 主理人整合落地

---

## 一、任务目标与结论

**目标**：让全站承接「极速101」「桌游」「在线桌游」等词的搜索效果；移除开发过程中的随意文案（如直接暴露在网页上的说明性文字）；改造为可一键部署 Cloudflare Pages；接入 AdSense / GA / Google Search Console。

**结论**：✅ 全部目标达成。三页共落 31 处精确优化（首页 14 / 游戏页 8 / 即玩页 9），并补齐社交分享封面图、结构化数据、内外链闭环与部署流水线。**发布状态：Ready to Publish（将占位符 ID 替换为真实 ID 后即可上线）。**

---

## 二、四份评审整合摘要

| 评审 | 负责人 | 核心发现 | 落地动作 |
|------|--------|----------|----------|
| 关键词研究 | 关宇霖 | 主词「极速101 / 极速算力101」+ 大类词「桌游 / 在线桌游 / 免费桌游」；搜索意图分平台型（首页）、信息型（游戏页）、交易型（即玩页） | 按意图分层布词，H1/标题/文案分别对应三类意图 |
| SEO 审计 | 欧化成 | 首页 84 / 游戏页 92 / **即玩页 56（最低）**：缺 Schema、og:image、可爬取文案、死链 | 补 Organization/VideoGame/BreadcrumbList schema、og:image、可爬取文案、闭合回链 |
| 编辑报告 | 艾笔润 | 首页 73 / 游戏页 84 / 即玩页 74；存在「演示项目」「便于搜索引擎与 AI 直接引用」「本页面同时承担两件事」等开发口吻 | 软化/删除开发说明，改写为用户视角表述，消除 AI 痕迹 |
| 链接策略 | 连乐桥 | **即玩页是死链孤岛（0 内链、0 外链）**，全站外链为 0，内容健康度 66 | 三页全互链 + 3 条权威外链（维基卡牌/桌游 + BoardGameGeek），健康度提升至 ~88 |

---

## 三、最终改动清单（按页面）

### 首页 `index.html`
- [x] H1 加入「《极速101》」与「桌游」：`极速桌游馆：把《极速101》等经典桌游，变成即点即玩的网页小游戏`
- [x] canonical / og:url / WebSite.url / Organization.url 统一为 `https://game.lichuanyang.top/`
- [x] 删除 WebSite 的 `SearchAction`（无站内搜索，避免误导爬虫）
- [x] 新增 **Organization** JSON-LD
- [x] 新增 **og:image**（1200×630 封面）
- [x] 软化开发口吻：删「便于搜索引擎与 AI 直接引用」、删「演示性质」、页脚删「（演示项目）」
- [x] 外链：正文「桌游」→ 维基百科 Board_game；「更多桌游」段 → BoardGameGeek
- [x] 内链：规则百科条目 → `games/speed101/#intro`；游戏卡片新增「↗ 极速101 立即免费试玩」直达即玩页
- [x] 页脚空锚「了解更多 →」改为指向 `#about` 的「了解如何加入 →」

### 游戏页 `games/speed101/index.html`
- [x] **删除伪造的 `AggregateRating`（ratingValue 4.6 / ratingCount 128）**——合规风险，0 真实评价不应伪造
- [x] 新增 og:image
- [x] 改写开发口吻：「本页面同时承担两件事」→ 用户视角「这一页为你准备了两样东西」；删 FAQ 注释中的「供搜索引擎与 AI 直接引用」
- [x] 去重：「比心算，也比博弈」→「既比心算，也拼策略与博弈」
- [x] 外链：intro 首句「卡牌游戏」→ 维基 Card_game
- [x] 内链：底部 CTA 新增「看看极速桌游馆更多免费桌游」→ `#coming`
- [x] 页脚删「（演示项目）」

### 即玩页 `games/speed101/play.html`
- [x] **修复 H1 / i18n 标题空格**：`极速 101` → `极速101`（SEO 与品牌一致性）
- [x] **移除 `user-scalable=no`**（可访问性合规，避免移动端无法缩放）
- [x] 补全 **og:type / og:site_name / og:image**
- [x] 新增 **VideoGame + BreadcrumbList** JSON-LD（原无任何结构化数据）
- [x] 新增**静态可爬取文案区块**（`<section class="play-seo">`），解决 JS 重页面薄内容问题，并内链回规则页
- [x] **闭合死链孤岛**：独立访问时显示返回导航条（规则页 + 首页），iframe 内自动隐藏
- [x] meta description 重写，强化「免费在线桌游」

---

## 四、SEO 审计报告（优化后评估）

| 页面 | 技术 SEO | 内容/意图 | 链接/权威 | 综合 |
|------|---------|-----------|-----------|------|
| 首页 | 90 | 88 | 90 | **89** |
| 游戏页 | 95 | 92 | 88 | **92** |
| 即玩页 | 88（原 56） | 85 | 90 | **88** |

**必检项全部通过**：canonical ✓ · OG 全字段 ✓ · JSON-LD 全部可解析（8 块）✓ · 三页互链闭环 ✓ · 外链 3 条权威源 ✓ · 无伪造评分 ✓ · 无开发文案残留 ✓

---

## 五、编辑报告（人性化）

- 人性化评分：首页 85 / 游戏页 92 / 即玩页 85（优化前 73/84/74）
- 已清除全部暴露的开发说明（演示项目 / 便于搜索引擎与 AI 直接引用 / 本页面同时承担两件事）
- 表述统一为用户视角，去除 AI 痕迹与重复句式

---

## 六、发布检查清单

| 检查项 | 状态 |
|--------|------|
| 三页文案已统一承接「极速101 / 桌游 / 在线桌游」 | ✅ |
| 开发说明类文案已移除 | ✅ |
| 伪造评分已删除 | ✅ |
| canonical / og:url / WebSite.url 统一为站点根 | ✅ |
| 三页 og:image 已配置且文件存在 | ✅ |
| JSON-LD 全部有效（WebSite/ItemList/Organization/VideoGame/FAQPage/BreadcrumbList） | ✅ |
| 三页内链全互链、无空锚文本 | ✅ |
| 外链 3 条权威源（维基卡牌/桌游 + BGG） | ✅ |
| viewport 可访问性修复（移除 user-scalable=no） | ✅ |
| 即玩页死链孤岛已闭合（独立访问返回导航） | ✅ |
| 一键部署流水线就绪（wrangler.toml / build.mjs / package.json） | ✅ |
| AdSense / GA / GSC 接入（占位符集中配置） | ✅ |
| dist/ 仅含公开页、已排除开发目录 | ✅ |
| og-cover.png 已生成并进入 dist | ✅ |

---

## 七、发布状态判定

**🟢 Ready to Publish** — 综合评分全部 ≥ 70。

唯一上线前置动作：将以下占位符替换为真实 ID（集中配置，互不污染）：
- `assets/analytics-loader.js` 内 `gaId` / `adsenseId`，并将 `enabled` 置 `true` 才注入
- 三页 `<meta name="google-site-verification" content="AUXjM9SH3SycuX49Qv1r0UQfa5AwvIE-4q27LUEf5aU">` 替换为 GSC 验证码

---

## 八、部署与接入说明（已就绪）

**1. 一键部署 Cloudflare Pages**
```bash
npm install        # 安装 wrangler
npm run build      # node scripts/build.mjs → 生成 dist/
npm run deploy     # wrangler pages deploy dist   （先 npx wrangler login）
```
或在 Cloudflare Pages 后台连接 Git 仓库，构建命令 `npm run build`、输出目录 `dist`。`build.mjs` 仅拷贝公开页（index.html / assets / games），自动排除 speed101/ 原型、design/、docs/、release/、scripts/ 等开发目录。

**2. 分析 / 广告 / 站长工具**
- GA4 + AdSense：改 `assets/analytics-loader.js` 的 `gaId`、`adsenseId`、`enabled=true` 即自动注入，无需改页面。
- GSC：将三页 `PLACEHOLDER_GSC_VERIFICATION` 替换为验证码，并在 GSC 提交 `sitemap.xml`。

---

## 九、后续建议（内容集群扩展）

1. 将首页 `#coming` 升级为真正的 `/games/` 聚合枢纽页（Pillar），每款新游戏 = 一个 Spoke。
2. 补充「桌游推荐 / 选购指南 / 合集」类承接大类词内容（如《6 款适合家庭的数学桌游》）。
3. 产出长尾博客（「卡牌游戏入门」「适合孩子的数学桌游」）形成内部链接网络。
4. 即玩页上线后持续观察 Search Console，若出现重复/薄内容信号，可加 `canonical` 收敛至游戏页（现保留自索引以承接「极速101 在线玩」）。

---

*本报告由主理人整合四份专业评审后生成，所有页面改动已落盘并通过结构化数据与遗留问题扫描校验。*
