/* 极速桌游馆 · 共享脚本（无依赖） */
(function () {
  'use strict';

  // 移动端导航开关
  var toggle = document.querySelector('.nav-toggle');
  var links = document.querySelector('.nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', function () {
      links.classList.toggle('open');
      toggle.setAttribute('aria-expanded', links.classList.contains('open') ? 'true' : 'false');
    });
    links.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') links.classList.remove('open');
    });
  }

  // FAQ 手风琴
  document.querySelectorAll('.faq-q').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var item = btn.closest('.faq-item');
      var ans = item.querySelector('.faq-a');
      var isOpen = item.classList.toggle('open');
      btn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      ans.style.maxHeight = isOpen ? (ans.scrollHeight + 'px') : '0px';
    });
  });

  // 页脚年份
  var y = document.querySelector('[data-year]');
  if (y) y.textContent = new Date().getFullYear();

  // 当前页高亮
  var here = location.pathname.replace(/index\.html$/, '').replace(/\/$/, '');
  document.querySelectorAll('.nav-links a').forEach(function (a) {
    var href = a.getAttribute('href');
    if (!href) return;
    var path = href.replace(/index\.html$/, '').replace(/\/$/, '');
    if (path && here === path) a.classList.add('active');
  });
})();
