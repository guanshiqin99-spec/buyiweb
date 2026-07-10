/* 液态玻璃光学系统：镜面高光跟随光标 + 滚动视差 + 自适应透明度。
 * 仅作用于 .liquid-glass 卡片及 .glow-card/.glow-hero 的光斑。
 */
'use strict'

var reduceMotion = typeof window !== 'undefined' && window.matchMedia
  ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
  : false
var isTouch = typeof window !== 'undefined' && 'ontouchstart' in window

var LERP = 0.18
var glasses = []      // .liquid-glass 元素（镜面 + 可能的 glow-effect）
var glowOnly = []     // 非 liquid 的 .glow-card/.glow-hero（仅 glow-effect）
var rafDecay = null
var lastScrollY = typeof window !== 'undefined' ? (window.scrollY || 0) : 0
var scrollShift = 0   // 滚动引起的镜面纵向偏移 (%)，衰减回零
var lastAdaptive = 0  // applyAdaptive 节流时间戳
var canBind = !isTouch && !reduceMotion
var scrollHandler = null
var resizeHandler = null
var initialized = false
var RECT_TTL = 100  // rect 缓存有效期 (ms)

function clamp(v, a, b) { return v < a ? a : v > b ? b : v }

// rect 缓存：scroll/resize 时置脏，mousemove 中按有效期复用，避免高频 layout read
function ensureRect(el) {
  var now = (window.performance && performance.now()) || 0
  if (!el._lgRect || !el._lgRectAt || (now - el._lgRectAt > RECT_TTL)) {
    el._lgRect = el.getBoundingClientRect()
    el._lgRectAt = now
  }
  return el._lgRect
}
function invalidateRects() {
  for (var i = 0; i < glasses.length; i++) { glasses[i]._lgRect = null; glasses[i]._lgRectAt = 0 }
  for (var j = 0; j < glowOnly.length; j++) { glowOnly[j]._lgRect = null; glowOnly[j]._lgRectAt = 0 }
}

// 指针绑定：specular 更新 --lg-mx/--lg-my，glow 更新 .glow-effect left/top
// 幂等：已绑元素打 _lgBound 标记跳过
function bindPointer(el, opts) {
  if (el._lgBound) return
  el._lgBound = true
  if (!canBind) return
  var hasSpec = opts.specular
  var glow = opts.glow
  var cx = 50, cy = 22          // 镜面当前位置 (%)，lerp 收敛
  var gx = 0, gy = 0            // 光斑当前位置 (px)
  var tx = 50, ty = 22          // 镜面目标 (%)
  var tgx = 0, tgy = 0          // 光斑目标 (px)
  var edge = 0, tedge = 0       // 边缘光 x 偏移 (px)，lerp 收敛
  var rafId = null

  function frame() {
    rafId = null
    cx += (tx - cx) * LERP
    cy += (ty - cy) * LERP
    edge += (tedge - edge) * LERP
    if (hasSpec) {
      el._lgBaseMy = cy
      el.style.setProperty('--lg-mx', cx.toFixed(2) + '%')
      el.style.setProperty('--lg-my', (cy + scrollShift).toFixed(2) + '%')
      el.style.setProperty('--lg-edge-x', edge.toFixed(1))
    }
    if (glow) {
      gx += (tgx - gx) * LERP
      gy += (tgy - gy) * LERP
      glow.style.left = gx.toFixed(1) + 'px'
      glow.style.top = gy.toFixed(1) + 'px'
    }
    // 未收敛则继续，否则停帧节能
    if (Math.abs(tx - cx) > 0.05 || Math.abs(ty - cy) > 0.05 ||
        Math.abs(tedge - edge) > 0.3 ||
        (glow && (Math.abs(tgx - gx) > 0.3 || Math.abs(tgy - gy) > 0.3))) {
      rafId = requestAnimationFrame(frame)
    }
  }
  function kick() {
    if (!rafId) rafId = requestAnimationFrame(frame)
  }

  el.addEventListener('mousemove', function (e) {
    var r = ensureRect(el)
    tx = ((e.clientX - r.left) / r.width) * 100
    ty = ((e.clientY - r.top) / r.height) * 100
    // 边缘光：光标相对卡片中心的 x 偏移，钳制 ±60px 防溢出
    tedge = clamp(e.clientX - r.left - r.width / 2, -60, 60)
    if (glow) { tgx = e.clientX - r.left; tgy = e.clientY - r.top }
    kick()
  }, { passive: true })

  el.addEventListener('mouseleave', function () {
    var r = ensureRect(el)
    tx = 50; ty = 22
    tedge = 0
    if (glow) { tgx = r.width / 2; tgy = r.height / 2 }
    kick()
  }, { passive: true })
}

// 自适应透明：背景顶部深、底部浅，玻璃随视口位置调节着色
function applyAdaptive(el) {
  var rect = ensureRect(el)
  var vh = window.innerHeight || 1
  var cy = rect.top + rect.height / 2
  var t = clamp(cy / vh, 0, 1)              // 0=视口顶(深底) 1=视口底(浅底)
  var tintA = 0.22 - t * 0.12               // 0.22 -> 0.10
  var g = Math.round(255 - t * 6)
  var b = Math.round(255 - t * 12)
  el.style.setProperty('--lg-tint', '255,' + g + ',' + b)
  el.style.setProperty('--lg-tint-a', tintA.toFixed(3))
}

// 廉价：仅写 --lg-my = baseMy + scrollShift，不读 rect
function applyScrollShift() {
  for (var i = 0; i < glasses.length; i++) {
    var el = glasses[i]
    if (!el.parentNode) continue
    var baseMy = (typeof el._lgBaseMy === 'number') ? el._lgBaseMy : 22
    el.style.setProperty('--lg-my', (baseMy + scrollShift).toFixed(2) + '%')
  }
}

// 节流自适应：最多每 200ms 一次，且仅在真实滚动时
function maybeAdaptive() {
  var now = (window.performance && performance.now()) || 0
  if (now - lastAdaptive < 200) return
  lastAdaptive = now
  invalidateRects()
  for (var i = 0; i < glasses.length; i++) {
    if (glasses[i].parentNode) applyAdaptive(glasses[i])
  }
}

// 滚动偏移衰减循环：滚动停止后镜面缓缓归位（仅廉价 --lg-my 更新）
function decay() {
  if (Math.abs(scrollShift) > 0.05) {
    scrollShift *= 0.88
    applyScrollShift()
    rafDecay = requestAnimationFrame(decay)
  } else {
    scrollShift = 0
    applyScrollShift()
    rafDecay = null
  }
}

function collect() {
  var liquidNodes = document.querySelectorAll('.liquid-glass')
  for (var i = 0; i < liquidNodes.length; i++) {
    var el = liquidNodes[i]
    if (el._lgCollected) continue
    el._lgCollected = true
    glasses.push(el)
    bindPointer(el, { specular: true, glow: el.querySelector('.glow-effect') })
  }
  // 非 liquid 的 .glow-card/.glow-hero：仅 glow-effect
  if (canBind) {
    var glowNodes = document.querySelectorAll('.glow-card, .glow-hero')
    for (var j = 0; j < glowNodes.length; j++) {
      var gel = glowNodes[j]
      if (gel.classList.contains('liquid-glass')) continue
      if (gel._lgCollected) continue
      gel._lgCollected = true
      var gchild = gel.querySelector('.glow-effect')
      if (!gchild) continue
      glowOnly.push(gel)
      bindPointer(gel, { specular: false, glow: gchild })
    }
  }
}

// App 级单例初始化
export function initLiquidGlass() {
  if (initialized || typeof window === 'undefined') return
  initialized = true

  collect()
  invalidateRects()
  for (var i = 0; i < glasses.length; i++) applyAdaptive(glasses[i])
  lastAdaptive = (window.performance && performance.now()) || 0

  if (!reduceMotion) {
    scrollHandler = function () {
      var y = window.scrollY || 0
      var vel = y - lastScrollY
      lastScrollY = y
      scrollShift = clamp(scrollShift + vel * 0.04, -10, 10)
      applyScrollShift()
      maybeAdaptive()
      if (!rafDecay) rafDecay = requestAnimationFrame(decay)
    }
    resizeHandler = function () {
      invalidateRects()
      lastAdaptive = 0
      maybeAdaptive()
    }
    window.addEventListener('scroll', scrollHandler, { passive: true })
    window.addEventListener('resize', resizeHandler, { passive: true })
  }
}

// 路由切换后重新收集动态挂载的光学元素（幂等）
export function collectLiquidGlass() {
  if (!initialized || typeof document === 'undefined') return
  collect()
  invalidateRects()
  for (var i = 0; i < glasses.length; i++) {
    if (glasses[i].parentNode) applyAdaptive(glasses[i])
  }
  lastAdaptive = (window.performance && performance.now()) || 0
}
