# 极速101 H5 原型

一个单文件 HTML5 游戏，可在浏览器直接打开或上传 itch.io。

## 在线试玩
- 本地：`http://localhost:8777`（启动服务器后）
- itch.io：（待发布）

## 玩法
- 开局选择 AI 数量（1–5）与难度（简单/中等/困难）。
- 轮流出牌，把速度累加到当前总值，但不能超过 101。
- 超过 101 会爆胎：失去 1 个轮胎，速度归零。
- 轮胎用完即淘汰，最后存活者获胜。

## 功能牌
- 加速 `+20`、刹车 `-10`、急刹 `-20`
- 升档：下一张数字牌效果翻倍
- 超车：额外再出一回合
- 极速50：速度直接变为 50

## 技术
- 纯原生 HTML/CSS/JS，单文件，无构建。
- 响应式，优先移动端竖屏。
- Web Audio 合成音效，零外部资源。

## 运行
```bash
npx serve .
# 或
node -e "require('http').createServer((r,s)=>{const fs=require('fs');const p=r.url==='/'?'index.html':r.url;s.writeHead(200,{'Content-Type':'text/html'});s.end(fs.readFileSync(p));}).listen(8777)"
```
