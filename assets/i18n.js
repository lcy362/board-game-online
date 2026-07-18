/* 极速桌游馆 · 共享双语框架（无依赖）
 * 用法：
 *   1) 在页面中定义 window.I18N = { zh: {...}, en: {...} }
 *   2) 文本节点加 data-i18n="key"；含标签的加 data-i18n-html="key"
 *      meta/og 加 data-i18n-meta="key"；<title> 用字典里的 page_title
 *   3) 切换入口：<a href="javascript:void(0)" data-lang="zh">中文</a>
 *   4) 引入本脚本即可（会自动初始化）
 */
(function () {
  'use strict';

  var KEY = 'speed101_lang';

  function lsGet() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
  function lsSet(v) { try { localStorage.setItem(KEY, v); } catch (e) {} }

  function detect() {
    var s = lsGet();
    if (s === 'zh' || s === 'en') return s;
    var nav = (navigator.language || 'zh-CN').toLowerCase();
    return nav.indexOf('zh') === 0 ? 'zh' : 'en';
  }

  var LANG = detect();

  function apply(lang) {
    var base = (window.I18N && window.I18N.zh) || {};
    var dict = (window.I18N && window.I18N[lang]) || base;
    function val(k) {
      if (dict[k] != null) return dict[k];
      if (base[k] != null) return base[k];
      return null;
    }

    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var v = val(el.getAttribute('data-i18n'));
      if (v != null) el.textContent = v;
    });
    document.querySelectorAll('[data-i18n-html]').forEach(function (el) {
      var v = val(el.getAttribute('data-i18n-html'));
      if (v != null) el.innerHTML = v;
    });
    document.querySelectorAll('[data-i18n-meta]').forEach(function (el) {
      var v = val(el.getAttribute('data-i18n-meta'));
      if (v != null) el.setAttribute('content', v);
    });

    var t = val('page_title');
    if (t != null) document.title = t;

    document.documentElement.lang = (lang === 'en') ? 'en' : 'zh-CN';

    document.querySelectorAll('[data-lang]').forEach(function (a) {
      a.classList.toggle('active', a.getAttribute('data-lang') === lang);
    });
  }

  function setLang(lang) {
    LANG = (lang === 'en') ? 'en' : 'zh';
    lsSet(LANG);
    apply(LANG);
  }

  function init() {
    document.querySelectorAll('[data-lang]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        e.preventDefault();
        setLang(a.getAttribute('data-lang'));
      });
    });
    apply(LANG);
  }

  window.setLang = setLang;
  window.initI18n = init;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
