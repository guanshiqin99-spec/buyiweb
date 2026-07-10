/* 鼠标跟随光晕动效：全局固定层，rAF + lerp 平滑跟随鼠标。
 * 独立于 liquidGlass 模块。触屏 / reduced-motion 下不绑定。
 */
'use strict'

var reduceMotion = typeof window !== 'undefined' && window.matchMedia
  ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
  : false
var isTouch = typeof window !== 'undefined' && 'ontouchstart' in window

var LERP = 0.18  // 比 liquidGlass 镜面(0.28)慢，光晕有漂浮滞后感
var glowEl = null
var rafId = null
var mouseHandler = null
var leaveHandler = null
var initialized = false
var canRun = !isTouch && !reduceMotion

var tx = -500, ty = -500   // 目标位置（初始视口外）
var x = -500, y = -500     // 当前位置
var visible = false

function frame() {
  rafId = null
  x += (tx - x) * LERP
  y += (ty - y) * LERP
  if (glowEl) {
    glowEl.style.transform = 'translate(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px)'
  }
  // 未收敛则继续，否则停帧节能
  if (Math.abs(tx - x) > 0.5 || Math.abs(ty - y) > 0.5) {
    rafId = requestAnimationFrame(frame)
  }
}

function kick() {
  if (!rafId) rafId = requestAnimationFrame(frame)
}

// App.vue onMounted 调一次，传入固定 DOM 元素
export function initCursorGlow(el) {
  if (initialized || typeof window === 'undefined') return
  initialized = true
  if (!canRun || !el) return

  glowEl = el
  x = -500; y = -500
  tx = -500; ty = -500

  mouseHandler = function (e) {
    if (!visible) {
      visible = true
      glowEl.style.opacity = '1'
    }
    tx = e.clientX
    ty = e.clientY
    kick()
  }
  leaveHandler = function () {
    visible = false
    if (glowEl) glowEl.style.opacity = '0'
  }
  window.addEventListener('mousemove', mouseHandler, { passive: true })
  document.addEventListener('mouseleave', leaveHandler, { passive: true })
}

// App.vue onUnmounted 调用
export function destroyCursorGlow() {
  if (mouseHandler) {
    window.removeEventListener('mousemove', mouseHandler)
    mouseHandler = null
  }
  if (leaveHandler) {
    document.removeEventListener('mouseleave', leaveHandler)
    leaveHandler = null
  }
  if (rafId) {
    cancelAnimationFrame(rafId)
    rafId = null
  }
  glowEl = null
  initialized = false
}
