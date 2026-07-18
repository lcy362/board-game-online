/* 极速桌游馆 · 站点分析 / 广告 / 验证 集中配置与注入
 * 只需要改这一个文件即可，各页面无需改动。
 * 拿到真实 ID 后：把下方占位符替换掉，并把 enabled 改为 true。
 */
window.SITE_CONFIG = {
  // Google Analytics 4 测量 ID（格式 G-XXXXXXXXXX）
  gaId: 'G-SFKXJS8H9Q',
  // Google AdSense 发布商 ID（格式 ca-pub-XXXXXXXXXXXXXXXX）
  adsenseId: 'ca-pub-7310841175510611',
  // 是否启用（占位符阶段保持 false，避免控制台报错；拿到真实 ID 后改为 true）
  enabled: true,
};

(function () {
  'use strict';
  var cfg = window.SITE_CONFIG || {};
  if (!cfg.enabled) return;

  // ---------- Google Analytics 4 ----------
  if (cfg.gaId && cfg.gaId.indexOf('G-') === 0) {
    (function (i, s, o, g, r, a, m) {
      i['GoogleAnalyticsObject'] = r;
      i[r] = i[r] || function () { (i[r].q = i[r].q || []).push(arguments); };
      i[r].l = 1 * new Date();
      a = s.createElement(o); m = s.getElementsByTagName(o)[0];
      a.async = 1; a.src = g; m.parentNode.insertBefore(a, m);
    })(window, document, 'script', 'https://www.googletagmanager.com/gtag/js?id=' + cfg.gaId, 'ga');
    window.dataLayer = window.dataLayer || [];
    function gtag() { dataLayer.push(arguments); }
    gtag('js', new Date());
    gtag('config', cfg.gaId);
  }

  // ---------- Google AdSense（自动广告；手动广告位见页面内 <ins class="adsbygoogle"> 示例）----------
  if (cfg.adsenseId && cfg.adsenseId.indexOf('ca-pub-') === 0) {
    var s = document.createElement('script');
    s.async = true;
    s.crossOrigin = 'anonymous';
    s.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=' + cfg.adsenseId;
    document.head.appendChild(s);
  }
})();
