/*
 * app.js - 布依族词典 Web 版共享交互脚本
 * 职责：统一播放条注入、沉浸式导航、光效跟随、蜡染粒子生成
 * 各页面通过 <script src="../app.js"></script> 引入
 */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var isTouch = 'ontouchstart' in window;

  /* ===== 统一底部播放条（注入到 [data-player-bar]） ===== */
  var playerBarHTML =
    '<div class="liquid-glass liquid-glass-pill glow-card" data-dom-id="player-bar" id="playerBar"' +
    ' style="position: fixed; bottom: 16px; left: 50%; transform: translateX(-50%);' +
    ' width: calc(100% - 32px); max-width: 980px; height: 72px; display: flex;' +
    ' align-items: center; padding: 0 24px; border-radius: 999px; z-index: 40;">' +
      '<div class="glow-effect"></div>' +
      '<div style="display: flex; align-items: center; gap: 12px; flex: 1; min-width: 0;">' +
        '<div style="width: 48px; height: 48px; border-radius: 12px; background: linear-gradient(135deg, var(--c-brand-dark), var(--c-brand)); flex-shrink: 0; display: flex; align-items: center; justify-content: center;">' +
          '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--c-white)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>' +
        '</div>' +
        '<div style="min-width: 0;">' +
          '<p style="font-size: 14px; font-weight: 600; color: var(--c-text); margin: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">布依迎客歌</p>' +
          '<p style="font-size: 12px; color: var(--c-text-50); margin: 2px 0 0 0;">布依青年合唱团</p>' +
        '</div>' +
      '</div>' +
      '<div style="display: flex; flex-direction: column; align-items: center; gap: 6px; flex: 2; max-width: 480px; padding: 0 24px;">' +
        '<div style="display: flex; align-items: center; gap: 16px;">' +
          '<button style="border: none; background: transparent; color: var(--c-text-60); cursor: pointer; padding: 4px;" aria-label="上一首">' +
            '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><polygon points="19 20 9 12 19 4 19 20"/><line x1="5" y1="19" x2="5" y2="5" stroke="currentColor" stroke-width="2"/></svg>' +
          '</button>' +
          '<button style="width: 36px; height: 36px; border: none; border-radius: 999px; background: var(--c-brand); color: var(--c-white); cursor: pointer; display: flex; align-items: center; justify-content: center;" aria-label="播放">' +
            '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>' +
          '</button>' +
          '<button style="border: none; background: transparent; color: var(--c-text-60); cursor: pointer; padding: 4px;" aria-label="下一首">' +
            '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 4 15 12 5 20 5 4"/><line x1="19" y1="5" x2="19" y2="19" stroke="currentColor" stroke-width="2"/></svg>' +
          '</button>' +
        '</div>' +
        '<div style="display: flex; align-items: center; gap: 8px; width: 100%;">' +
          '<span style="font-size: 11px; color: var(--c-text-50);">02:15</span>' +
          '<div style="flex: 1; height: 4px; border-radius: 999px; background: var(--c-divider); overflow: hidden;">' +
            '<div style="width: 61%; height: 100%; border-radius: 999px; background: linear-gradient(90deg, var(--c-brand), var(--c-brand-light));"></div>' +
          '</div>' +
          '<span style="font-size: 11px; color: var(--c-text-50);">03:42</span>' +
        '</div>' +
      '</div>' +
      '<div style="display: flex; align-items: center; gap: 16px; flex: 1; justify-content: flex-end;">' +
        '<div style="display: flex; align-items: flex-end; gap: 3px; height: 16px;">' +
          '<div class="eq-bar"></div><div class="eq-bar"></div><div class="eq-bar"></div>' +
        '</div>' +
        '<button style="border: none; background: transparent; color: var(--c-accent); cursor: pointer; padding: 4px;" aria-label="收藏">' +
          '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>' +
        '</button>' +
      '</div>' +
    '</div>';

  document.querySelectorAll('[data-player-bar]').forEach(function (el) {
    el.innerHTML = playerBarHTML;
    // 绑定占位事件
    el.querySelectorAll('button').forEach(function (btn) {
      var label = btn.getAttribute('aria-label') || 'player-btn';
      btn.addEventListener('click', function () { console.log('[player-bar]', label); });
    });
  });

  /* ===== 沉浸式导航栏滚动监听 ===== */
  var nav = document.getElementById('mainNav');
  if (nav) {
    var burger = nav.querySelector('.nav-burger');
    var drawer = document.getElementById('navDrawer');

    window.addEventListener('scroll', function () {
      if (window.scrollY > 100) {
        nav.classList.add('scrolled');
      } else {
        nav.classList.remove('scrolled');
      }
    }, { passive: true });

    if (burger && drawer) {
      burger.addEventListener('click', function () {
        var isOpen = drawer.classList.toggle('open');
        burger.setAttribute('aria-expanded', isOpen);
      });
      // 点击 drawer 内链接后自动关闭
      drawer.querySelectorAll('a').forEach(function (a) {
        a.addEventListener('click', function () {
          drawer.classList.remove('open');
          burger.setAttribute('aria-expanded', 'false');
        });
      });
    }
  }

  /* ===== 光效跟随鼠标（指针追踪统一由下方液态玻璃模块处理） ===== */
  /* 触屏：隐藏 .glow-effect 光斑（无 hover 概念）；非触屏绑定在液态玻璃模块 */
  if (isTouch) {
    document.querySelectorAll('.glow-effect').forEach(function (el) {
      el.style.display = 'none';
    });
  }

  /* ===== 蜡染纹样粒子生成 ===== */
  var patterns = {
    batik: '<path d="M12 2L22 8.5V15.5L12 22L2 15.5V8.5L12 2Z" fill="none" stroke="currentColor" stroke-width="1.5"/>' +
           '<circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" stroke-width="1"/>',
    drum: '<circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="1.5"/>' +
          '<circle cx="12" cy="12" r="6" fill="none" stroke="currentColor" stroke-width="1"/>' +
          '<circle cx="12" cy="12" r="2" fill="currentColor"/>' +
          '<line x1="12" y1="2" x2="12" y2="5" stroke="currentColor" stroke-width="1.5"/>' +
          '<line x1="12" y1="19" x2="12" y2="22" stroke="currentColor" stroke-width="1.5"/>' +
          '<line x1="2" y1="12" x2="5" y2="12" stroke="currentColor" stroke-width="1.5"/>' +
          '<line x1="19" y1="12" x2="22" y2="12" stroke="currentColor" stroke-width="1.5"/>',
    weaving: '<path d="M2 6H22M2 12H22M2 18H22" stroke="currentColor" stroke-width="1.5"/>' +
             '<path d="M6 2V22M12 2V22M18 2V22" stroke="currentColor" stroke-width="1"/>' +
             '<circle cx="6" cy="6" r="1.5" fill="currentColor"/>' +
             '<circle cx="12" cy="12" r="1.5" fill="currentColor"/>' +
             '<circle cx="18" cy="18" r="1.5" fill="currentColor"/>'
  };

  document.querySelectorAll('.particles').forEach(function (layer) {
    if (reduceMotion) { layer.style.display = 'none'; return; }
    var pattern = layer.getAttribute('data-pattern') || 'batik';
    var count = parseInt(layer.getAttribute('data-count') || '12', 10);
    if (window.innerWidth < 640) count = Math.floor(count / 2);
    var svg = patterns[pattern] || patterns.batik;
    var frag = document.createDocumentFragment();
    for (var i = 0; i < count; i++) {
      var size = Math.random() * 40 + 20;
      var opacity = (Math.random() * 0.08 + 0.04).toFixed(3);
      var duration = (Math.random() * 15 + 15).toFixed(1);
      var delay = (Math.random() * -30).toFixed(1);
      var drift = (Math.random() * 20 - 10).toFixed(0);
      var x = (Math.random() * 100).toFixed(2);
      var ns = 'http://www.w3.org/2000/svg';
      var svgEl = document.createElementNS(ns, 'svg');
      svgEl.setAttribute('class', 'particle');
      svgEl.setAttribute('width', size);
      svgEl.setAttribute('height', size);
      svgEl.setAttribute('viewBox', '0 0 24 24');
      svgEl.setAttribute('aria-hidden', 'true');
      svgEl.style.left = x + '%';
      svgEl.style.opacity = opacity;
      svgEl.style.animationDuration = duration + 's';
      svgEl.style.animationDelay = delay + 's';
      svgEl.style.setProperty('--p-drift', drift + 'px');
      svgEl.style.setProperty('--p-opacity', opacity);
      svgEl.innerHTML = svg;
      frag.appendChild(svgEl);
    }
    layer.appendChild(frag);
  });
})();

/* ===== 液态玻璃光学系统 (WWDC25) =====
 * 职责：注入 SVG 折射/色散滤镜、Chromium 探测、镜面高光跟随光标与滚动、
 *       基于视口位置的自适应透明度。仅作用于 .liquid-glass 卡片材质本身。
 */
(function () {
  'use strict';
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var isTouch = 'ontouchstart' in window;
  var svgNS = 'http://www.w3.org/2000/svg';

  /* 1. 注入 SVG 滤镜定义：位移折射 + RGB 色散 (chromatic aberration) */
  function injectSVGFilters() {
    if (document.getElementById('lg-refract')) return;
    var svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('id', 'lg-filter-defs');
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('width', '0');
    svg.setAttribute('height', '0');
    svg.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden;pointer-events:none';
    svg.innerHTML =
      '<defs>' +
        '<filter id="lg-refract" x="-15%" y="-15%" width="130%" height="130%" color-interpolation-filters="sRGB">' +
          // 折射：分形噪声驱动位移，让背景被"折射穿透"而非仅模糊
          '<feTurbulence type="fractalNoise" baseFrequency="0.012 0.018" numOctaves="2" seed="9" result="noise"/>' +
          '<feGaussianBlur in="noise" stdDeviation="1.6" result="softNoise"/>' +
          '<feDisplacementMap in="SourceGraphic" in2="softNoise" scale="12" xChannelSelector="R" yChannelSelector="G" result="refract"/>' +
          // 色散：分离 R/G/B 通道并横向偏移，模拟玻璃边缘的彩色镶边
          '<feColorMatrix in="refract" type="matrix" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" result="chR"/>' +
          '<feOffset in="chR" dx="-1.4" dy="0.4" result="chROff"/>' +
          '<feColorMatrix in="refract" type="matrix" values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0" result="chG"/>' +
          '<feColorMatrix in="refract" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0" result="chB"/>' +
          '<feOffset in="chB" dx="1.4" dy="-0.4" result="chBOff"/>' +
          '<feBlend in="chROff" in2="chG" mode="screen" result="rg"/>' +
          '<feBlend in="rg" in2="chBOff" mode="screen" result="rgb"/>' +
          '<feComposite in="rgb" in2="SourceAlpha" operator="in"/>' +
        '</filter>' +
      '</defs>';
    (document.body || document.documentElement).appendChild(svg);
  }

  /* 2. Chromium 探测：仅 Chromium 系支持 backdrop-filter: url()，启用真实折射 */
  var isChromium = !!window.chrome && navigator.vendor === 'Google Inc.';
  if (isChromium) document.documentElement.classList.add('lg-refract');

  /* 3. 镜面高光跟随光标 + 滚动视差 + 自适应透明度
   *    单一来源平滑：rAF lerp（系数 ~0.28 → ~80ms 收敛），CSS 不再 transition 这些属性。
   *    统一 bindPointer 同时处理 .liquid-glass 镜面与 .glow-effect 光斑，避免重复监听器。
   */
  var LERP = 0.28;
  var glasses = [];      // .liquid-glass 元素（镜面 + 可能的 glow-effect）
  var glowOnly = [];     // 非 liquid 的 .glow-card/.glow-hero（仅 glow-effect）
  var rafDecay = null;
  var lastScrollY = window.scrollY || 0;
  var scrollShift = 0;   // 滚动引起的镜面纵向偏移 (%)，衰减回零
  var lastAdaptive = 0;  // applyAdaptive 节流时间戳

  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }

  // 读取并缓存 rect，scroll/resize 时置脏懒重算，避免每事件强制布局
  function ensureRect(el) {
    if (!el._lgRect) el._lgRect = el.getBoundingClientRect();
    return el._lgRect;
  }
  function invalidateRects() {
    for (var i = 0; i < glasses.length; i++) glasses[i]._lgRect = null;
    for (var j = 0; j < glowOnly.length; j++) glowOnly[j]._lgRect = null;
  }

  // 统一指针绑定：specular 更新 --lg-mx/--lg-my，glow 更新 .glow-effect left/top
  function bindPointer(el, opts) {
    var hasSpec = opts.specular;
    var glow = opts.glow;
    var cx = 50, cy = 22;          // 镜面当前位置 (%)，lerp 收敛
    var gx = 0, gy = 0;            // 光斑当前位置 (px)
    var tx = 50, ty = 22;          // 镜面目标 (%)
    var tgx = 0, tgy = 0;          // 光斑目标 (px)
    var rafId = null;

    function frame() {
      rafId = null;
      cx += (tx - cx) * LERP;
      cy += (ty - cy) * LERP;
      if (hasSpec) {
        el._lgBaseMy = cy;
        el.style.setProperty('--lg-mx', cx.toFixed(2) + '%');
        el.style.setProperty('--lg-my', (cy + scrollShift).toFixed(2) + '%');
      }
      if (glow) {
        gx += (tgx - gx) * LERP;
        gy += (tgy - gy) * LERP;
        glow.style.left = gx.toFixed(1) + 'px';
        glow.style.top = gy.toFixed(1) + 'px';
      }
      // 未收敛则继续，否则停帧节能
      if (Math.abs(tx - cx) > 0.05 || Math.abs(ty - cy) > 0.05 ||
          (glow && (Math.abs(tgx - gx) > 0.3 || Math.abs(tgy - gy) > 0.3))) {
        rafId = requestAnimationFrame(frame);
      }
    }
    function kick() {
      if (!rafId) rafId = requestAnimationFrame(frame);
    }

    el.addEventListener('mousemove', function (e) {
      var r = ensureRect(el);
      tx = ((e.clientX - r.left) / r.width) * 100;
      ty = ((e.clientY - r.top) / r.height) * 100;
      if (glow) { tgx = e.clientX - r.left; tgy = e.clientY - r.top; }
      kick();
    }, { passive: true });

    el.addEventListener('mouseleave', function () {
      var r = ensureRect(el);
      tx = 50; ty = 22;
      if (glow) { tgx = r.width / 2; tgy = r.height / 2; }
      kick();
    }, { passive: true });
  }

  function collect() {
    var canBind = !isTouch && !reduceMotion;
    // .liquid-glass：镜面 + 内部 .glow-effect（若有）
    var liquidNodes = document.querySelectorAll('.liquid-glass');
    for (var i = 0; i < liquidNodes.length; i++) {
      var el = liquidNodes[i];
      glasses.push(el);
      if (canBind) bindPointer(el, { specular: true, glow: el.querySelector('.glow-effect') });
    }
    // 非 liquid 的 .glow-card/.glow-hero：仅 glow-effect
    if (canBind) {
      var glowNodes = document.querySelectorAll('.glow-card, .glow-hero');
      for (var j = 0; j < glowNodes.length; j++) {
        var gel = glowNodes[j];
        if (gel.classList.contains('liquid-glass')) continue;  // 已绑定
        var gchild = gel.querySelector('.glow-effect');
        if (!gchild) continue;
        glowOnly.push(gel);
        bindPointer(gel, { specular: false, glow: gchild });
      }
    }
  }

  // 自适应透明：页面背景顶部深、底部浅，玻璃随位置调节着色强度
  function applyAdaptive(el) {
    var rect = ensureRect(el);
    var vh = window.innerHeight || 1;
    var cy = rect.top + rect.height / 2;
    var t = clamp(cy / vh, 0, 1);              // 0=视口顶(深底) 1=视口底(浅底)
    var tintA = 0.22 - t * 0.12;               // 0.22 -> 0.10
    var g = Math.round(255 - t * 6);
    var b = Math.round(255 - t * 12);
    el.style.setProperty('--lg-tint', '255,' + g + ',' + b);
    el.style.setProperty('--lg-tint-a', tintA.toFixed(3));
  }

  // 廉价：仅写 --lg-my = baseMy + scrollShift，不读 rect
  function applyScrollShift() {
    for (var i = 0; i < glasses.length; i++) {
      var el = glasses[i];
      if (!el.parentNode) continue;
      var baseMy = (typeof el._lgBaseMy === 'number') ? el._lgBaseMy : 22;
      el.style.setProperty('--lg-my', (baseMy + scrollShift).toFixed(2) + '%');
    }
  }

  // 节流自适应：最多每 200ms 一次，且仅在真实滚动时
  function maybeAdaptive() {
    var now = (window.performance && performance.now()) || 0;
    if (now - lastAdaptive < 200) return;
    lastAdaptive = now;
    invalidateRects();
    for (var i = 0; i < glasses.length; i++) {
      if (glasses[i].parentNode) applyAdaptive(glasses[i]);
    }
  }

  // 滚动偏移衰减循环：滚动停止后镜面缓缓归位（只做廉价 --lg-my 更新）
  function decay() {
    if (Math.abs(scrollShift) > 0.05) {
      scrollShift *= 0.88;
      applyScrollShift();
      rafDecay = requestAnimationFrame(decay);
    } else {
      scrollShift = 0;
      applyScrollShift();
      rafDecay = null;
    }
  }

  if (!reduceMotion) {
    window.addEventListener('scroll', function () {
      var y = window.scrollY || 0;
      var vel = y - lastScrollY;
      lastScrollY = y;
      scrollShift = clamp(scrollShift + vel * 0.04, -10, 10);
      applyScrollShift();
      maybeAdaptive();
      if (!rafDecay) rafDecay = requestAnimationFrame(decay);
    }, { passive: true });
    window.addEventListener('resize', function () {
      invalidateRects();
      lastAdaptive = 0;
      maybeAdaptive();
    }, { passive: true });
  }

  // 启动：DOM 就绪后注入滤镜、收集卡片、首次自适应
  function init() {
    injectSVGFilters();
    collect();
    invalidateRects();
    for (var i = 0; i < glasses.length; i++) applyAdaptive(glasses[i]);
    lastAdaptive = (window.performance && performance.now()) || 0;
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

/* ============================================================
   搜索 Modal / Overlay（仅首页）
   点击触发按钮或按 / 键唤起，对接后端 suggest 接口实时联想
   ============================================================ */
(function () {
  'use strict';

  /* ===== 配置 ===== */
  var API_BASE = window.BUYI_API_BASE || 'http://localhost:3000/api/miniapp/search';
  var SUGGEST_URL = API_BASE + '/suggest';
  var DEBOUNCE_MS = 300;
  var RECENT_KEY = 'buyi_recent_searches';
  var RECENT_MAX = 6;

  /* ===== 仅首页初始化 ===== */
  var modalHost = document.querySelector('[data-search-modal]');
  var trigger = document.querySelector('[data-search-trigger]');
  if (!modalHost || !trigger) return;

  /* ===== 注入 Modal DOM ===== */
  modalHost.innerHTML =
    '<div class="search-modal-overlay" role="dialog" aria-modal="true" aria-label="词典搜索">' +
      '<div class="liquid-glass search-modal">' +
        '<div class="search-modal-input-wrap search-glow">' +
          '<span class="search-icon" aria-hidden="true">' +
            '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
              '<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>' +
            '</svg>' +
          '</span>' +
          '<input type="search" class="search-modal-input" placeholder="搜索布依语词汇、短语…" ' +
                 'autocomplete="off" aria-label="搜索布依语词汇" aria-autocomplete="list" />' +
        '</div>' +
        '<div class="suggestion-list" role="listbox" aria-label="联想词"></div>' +
        '<div class="search-modal-footer">' +
          '<span>↑↓ 导航</span><span>Enter 查询</span><span>Esc 关闭</span>' +
        '</div>' +
      '</div>' +
    '</div>';

  var overlay = modalHost.querySelector('.search-modal-overlay');
  var input = overlay.querySelector('.search-modal-input');
  var listEl = overlay.querySelector('.suggestion-list');

  /* ===== 状态 ===== */
  var isOpen = false;
  var items = [];
  var activeIndex = -1;
  var lastFocus = null;
  var reqId = 0;

  /* ===== 打开 / 关闭 ===== */
  function open() {
    if (isOpen) return;
    isOpen = true;
    lastFocus = document.activeElement;
    overlay.classList.add('is-open');
    input.value = '';
    renderEmpty(false);
    setTimeout(function () { input.focus(); }, 60);
  }

  function close() {
    if (!isOpen) return;
    isOpen = false;
    overlay.classList.remove('is-open');
    activeIndex = -1;
    items = [];
    if (lastFocus && typeof lastFocus.focus === 'function') {
      setTimeout(function () { lastFocus.focus(); }, 60);
    }
  }

  /* ===== 防抖 ===== */
  function debounce(fn, ms) {
    var t;
    return function () {
      var args = arguments;
      clearTimeout(t);
      t = setTimeout(function () { fn.apply(null, args); }, ms);
    };
  }

  /* ===== 输入处理 ===== */
  function handleInput() {
    var kw = input.value.trim();
    activeIndex = -1;
    if (!kw) { renderEmpty(false); return; }
    var id = ++reqId;
    fetchSuggestions(kw).then(function (data) {
      if (id !== reqId) return; // 过期请求丢弃
      renderSuggestions(data);
    }).catch(function () {
      if (id !== reqId) return;
      renderError();
    });
  }

  /* ===== 请求联想词 ===== */
  function fetchSuggestions(kw) {
    return fetch(SUGGEST_URL + '?keyword=' + encodeURIComponent(kw))
      .then(function (r) {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.json();
      });
  }

  /* ===== 渲染联想词 ===== */
  function renderSuggestions(data) {
    items = [];
    var html = '';
    var groups = [['dictionary', '词典'], ['phrases', '短语'], ['proverbs', '谚语']];
    for (var i = 0; i < groups.length; i++) {
      var arr = data[groups[i][0]] || [];
      if (!arr.length) continue;
      html += '<div class="suggestion-group-title">' + esc(groups[i][1]) + '</div>';
      for (var j = 0; j < arr.length; j++) {
        var it = arr[j];
        items.push(it);
        var idx = items.length - 1;
        html += '<div class="suggestion-item" role="option" data-idx="' + idx + '"' +
                ' tabindex="-1">' +
                  '<span class="suggestion-item-buyi">' + esc(it.buyiText || '') + '</span>' +
                  '<span class="suggestion-item-zh">' + esc(it.zhText || '') + '</span>' +
                '</div>';
      }
    }
    if (!items.length) { renderEmpty(true); return; }
    listEl.innerHTML = html;
    activeIndex = -1;
  }

  function renderEmpty(noMatch) {
    if (noMatch) {
      listEl.innerHTML = '<div class="suggestion-empty">未找到匹配结果</div>';
      return;
    }
    var recent = getRecent();
    if (recent.length) {
      var html = '<div class="recent-section"><div class="recent-title">最近搜索</div><div class="recent-list">';
      for (var i = 0; i < recent.length; i++) {
        html += '<span class="recent-item" data-recent="' + i + '">' + esc(recent[i]) + '</span>';
      }
      html += '</div></div>';
      listEl.innerHTML = html;
    } else {
      listEl.innerHTML = '<div class="suggestion-empty">输入布依语或中文开始查词</div>';
    }
  }

  function renderError() {
    listEl.innerHTML = '<div class="suggestion-empty">搜索服务暂时不可用，按 Enter 跳转结果页</div>';
  }

  /* ===== 键盘导航 ===== */
  function moveActive(delta) {
    if (!items.length) return;
    if (delta > 0) {
      activeIndex = activeIndex < items.length - 1 ? activeIndex + 1 : 0;
    } else {
      activeIndex = activeIndex > 0 ? activeIndex - 1 : items.length - 1;
    }
    updateActive();
  }

  function updateActive() {
    var els = listEl.querySelectorAll('.suggestion-item');
    for (var i = 0; i < els.length; i++) {
      if (i === activeIndex) {
        els[i].classList.add('is-active');
        var el = els[i];
        var top = el.offsetTop;
        var bottom = top + el.offsetHeight;
        if (top < listEl.scrollTop) listEl.scrollTop = top;
        else if (bottom > listEl.scrollTop + listEl.clientHeight) listEl.scrollTop = bottom - listEl.clientHeight;
      } else {
        els[i].classList.remove('is-active');
      }
    }
  }

  function selectActive() {
    if (activeIndex >= 0 && items[activeIndex]) {
      var it = items[activeIndex];
      submitSearch(it.zhText || it.buyiText);
    } else if (input.value.trim()) {
      submitSearch(input.value.trim());
    }
  }

  /* ===== 提交搜索 ===== */
  function submitSearch(kw) {
    if (!kw) return;
    saveRecent(kw);
    window.location.href = 'search.html?q=' + encodeURIComponent(kw);
  }

  /* ===== 最近搜索（localStorage）===== */
  function getRecent() {
    try {
      var raw = localStorage.getItem(RECENT_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) { return []; }
  }

  function saveRecent(kw) {
    try {
      var list = getRecent();
      var idx = list.indexOf(kw);
      if (idx >= 0) list.splice(idx, 1);
      list.unshift(kw);
      if (list.length > RECENT_MAX) list = list.slice(0, RECENT_MAX);
      localStorage.setItem(RECENT_KEY, JSON.stringify(list));
    } catch (e) { /* localStorage 不可用时静默忽略 */ }
  }

  /* ===== Focus Trap ===== */
  function trapFocus(e) {
    if (e.key !== 'Tab') return;
    e.preventDefault();
    input.focus();
  }

  /* ===== HTML 转义 ===== */
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function isTypingTarget(el) {
    return el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable);
  }

  /* ===== 事件绑定 ===== */
  trigger.addEventListener('click', open);

  document.addEventListener('keydown', function (e) {
    if (e.key === '/' && !isOpen && !isTypingTarget(e.target)) {
      e.preventDefault();
      open();
    }
    if (isOpen) {
      if (e.key === 'Escape') { e.preventDefault(); close(); }
      else if (e.key === 'ArrowDown') { e.preventDefault(); moveActive(1); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); moveActive(-1); }
      else if (e.key === 'Enter') { e.preventDefault(); selectActive(); }
      else if (e.key === 'Tab') { trapFocus(e); }
    }
  });

  overlay.addEventListener('click', function (e) {
    if (e.target === overlay) close();
  });

  input.addEventListener('input', debounce(handleInput, DEBOUNCE_MS));

  listEl.addEventListener('click', function (e) {
    var itemEl = e.target.closest ? e.target.closest('.suggestion-item') : null;
    if (itemEl) {
      var idx = parseInt(itemEl.getAttribute('data-idx'), 10);
      if (!isNaN(idx) && items[idx]) {
        var it = items[idx];
        submitSearch(it.zhText || it.buyiText);
      }
      return;
    }
    var recentEl = e.target.closest ? e.target.closest('.recent-item') : null;
    if (recentEl) {
      var list = getRecent();
      var ridx = parseInt(recentEl.getAttribute('data-recent'), 10);
      if (!isNaN(ridx) && list[ridx]) {
        input.value = list[ridx];
        input.focus();
        handleInput();
      }
    }
  });
})();
