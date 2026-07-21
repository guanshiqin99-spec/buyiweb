<script setup>
import { computed, ref, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import IconMenu from '@/components/icons/IconMenu.vue'
import IconClose from '@/components/icons/IconClose.vue'
import {
  NAV_TONE_POLICY,
  isNavTone,
  resolveNavToneDecision,
  toneFromContrast
} from '@/utils/navTonePolicy'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const isDrawerOpen = ref(false)
const isScrolled = ref(false)
const navRef = ref(null)
const burgerRef = ref(null)
const isImmersive = computed(() => route.meta.navTone === 'immersive')
const navContrast = computed(() => route.meta.navContrast || 'on-light')
const isClearRail = computed(() => route.meta.navRail === 'clear')
const fallbackTone = computed(() => toneFromContrast(navContrast.value))

// 整栏保护衬底状态（P0 锁定契约：保留 3 点采样 + 2/3 多数投票，仅用于不确定时的轻微保护衬底）
const dynamicTone = ref(null)
const toneConfidence = ref('low')
const hasBusyBackdrop = ref(false)
const effectiveContrast = computed(() => {
  if (dynamicTone.value === 'dark' || dynamicTone.value === 'light') {
    return `on-${dynamicTone.value}`
  }
  return navContrast.value
})

// 分段 tone：每个导航片段（品牌 / 各链接 / 登录按钮 / 汉堡）独立探测其正下方背景，
// 而非整栏统一。这样跨深浅区块边界时，左右片段可同时呈现不同字色与玻璃底色。
const segmentTones = ref({})

const navLinks = [
  { path: '/quiz', label: '答题' },
  { path: '/dictionary', label: '词典' },
  { path: '/learn', label: '学习' },
  { path: '/songs', label: '民歌' },
  { path: '/culture', label: '文化' },
  { path: '/profile', label: '我的' }
]

let scrollHandler = null
let resizeHandler = null
let scrollRaf = null
let toneObserver = null
let pendingTone = null
let toneSwitchTimer = null
const TONE_SELECTOR = `[${NAV_TONE_POLICY.markerAttribute}]`

function getProbeY() {
  const navBottom = navRef.value?.getBoundingClientRect().bottom || 56
  return Math.min(
    window.innerHeight - 1,
    Math.max(0, Math.round(navBottom - NAV_TONE_POLICY.probeInsetPx))
  )
}

function clearPendingTone() {
  pendingTone = null
  if (toneSwitchTimer) window.clearTimeout(toneSwitchTimer)
  toneSwitchTimer = null
}

function acceptTone(tone) {
  if (!isNavTone(tone)) return

  if (!dynamicTone.value || dynamicTone.value === tone) {
    clearPendingTone()
    dynamicTone.value = tone
    toneConfidence.value = 'high'
    return
  }

  if (pendingTone !== tone) {
    clearPendingTone()
    pendingTone = tone
    toneConfidence.value = 'low'
    toneSwitchTimer = window.setTimeout(() => {
      if (pendingTone !== tone) return
      dynamicTone.value = tone
      toneConfidence.value = 'high'
      clearPendingTone()
    }, NAV_TONE_POLICY.switchDelayMs)
  }
}

function markToneUncertain() {
  clearPendingTone()
  toneConfidence.value = 'low'
}

function probeAtPoint(x, y) {
  const stack = typeof document.elementsFromPoint === 'function'
    ? document.elementsFromPoint(x, y)
    : [document.elementFromPoint(x, y)].filter(Boolean)

  for (const element of stack) {
    if (navRef.value?.contains(element)) continue
    const marked = element.closest?.(TONE_SELECTOR)
    if (!marked || navRef.value?.contains(marked)) continue
    const tone = marked.dataset.navTone
    if (isNavTone(tone)) {
      return {
        tone,
        busy: Boolean(element.closest?.(NAV_TONE_POLICY.busySelector))
      }
    }
  }
  return { tone: null, busy: false }
}

// 整栏 3 点投票：仅用于不确定保护衬底（P0 锁定契约）
function detectNavTone() {
  const markers = document.querySelectorAll(TONE_SELECTOR)
  const fallbackToneVal = fallbackTone.value
  hasBusyBackdrop.value = false
  if (!markers.length) {
    acceptTone(fallbackToneVal)
    return
  }

  const y = getProbeY()
  const probes = NAV_TONE_POLICY.sampleRatios
    .map((ratio) => probeAtPoint(window.innerWidth * ratio, y))
  const samples = probes.map((probe) => probe.tone)
  hasBusyBackdrop.value = probes.some((probe) => probe.busy)
  const decision = resolveNavToneDecision({
    samples,
    fallbackTone: fallbackToneVal,
    lastReliableTone: dynamicTone.value
  })

  if (decision.confidence === 'high') acceptTone(decision.tone)
  else markToneUncertain()
}

// 分段探测：取元素中心 x，探测其正下方背景 tone。
// 跨深浅边界时，左侧链接与右侧链接可得到不同 tone，独立着色。
function probeSegmentTone(el) {
  if (!el || !navRef.value) return { tone: null, busy: false }
  const y = getProbeY()
  const rect = el.getBoundingClientRect()
  if (!rect.width && !rect.height) return { tone: null, busy: false }
  const x = Math.round(rect.left + rect.width / 2)
  return probeAtPoint(x, y)
}

function detectSegmentTones() {
  if (!navRef.value) return
  const ft = fallbackTone.value
  const prev = segmentTones.value
  const next = { ...prev }

  const brandEl = navRef.value.querySelector('.nav-brand')
  const brandProbe = probeSegmentTone(brandEl)
  if (brandProbe.tone && !brandProbe.busy) next.brand = brandProbe.tone
  else if (!next.brand) next.brand = ft

  const linkEls = [...navRef.value.querySelectorAll('.nav-rail [data-path]')]
  for (const el of linkEls) {
    const path = el.dataset.path
    if (!path) continue
    const probe = probeSegmentTone(el)
    if (probe.tone && !probe.busy) next[path] = probe.tone
    else if (!next[path]) next[path] = ft
  }

  const authEl = navRef.value.querySelector('.nav-auth-btn')
  const authProbe = probeSegmentTone(authEl)
  if (authProbe.tone && !authProbe.busy) next.auth = authProbe.tone
  else if (!next.auth) next.auth = ft

  const burgerEl = navRef.value.querySelector('.nav-burger')
  if (burgerEl) {
    const bp = probeSegmentTone(burgerEl)
    if (bp.tone && !bp.busy) next.burger = bp.tone
    else if (!next.burger) next.burger = ft
  }

  segmentTones.value = next
}

function detectAll() {
  detectNavTone()
  detectSegmentTones()
}

function scheduleToneDetection() {
  if (scrollRaf) return
  scrollRaf = requestAnimationFrame(() => {
    scrollRaf = null
    detectAll()
  })
}

function setupToneObserver() {
  toneObserver?.disconnect()
  const markers = [...document.querySelectorAll(TONE_SELECTOR)]
  if (!markers.length || typeof IntersectionObserver === 'undefined') {
    scheduleToneDetection()
    return
  }

  const probeY = getProbeY()
  const bottomInset = Math.max(0, window.innerHeight - probeY - 2)
  toneObserver = new IntersectionObserver(() => {
    scheduleToneDetection()
  }, {
    rootMargin: `-${probeY}px 0px -${bottomInset}px 0px`,
    threshold: 0
  })
  markers.forEach((element) => toneObserver.observe(element))
  scheduleToneDetection()
}

// 液态玻璃轨道：分段水平渐变着色，每段色调跟随其下方背景。
// 跨深浅边界时玻璃底色平滑过渡，与各段文字色协同。
const railStyle = computed(() => {
  if (!isImmersive.value || isClearRail.value || !navRef.value) return null
  const railEl = navRef.value.querySelector('.nav-rail')
  if (!railEl) return null
  const railRect = railEl.getBoundingClientRect()
  if (!railRect.width) return null

  const linkEls = [...navRef.value.querySelectorAll('.nav-rail [data-path]')]
  const segs = []
  for (const el of linkEls) {
    const path = el.dataset.path
    const tone = segmentTones.value[path]
    if (!tone) continue
    const r = el.getBoundingClientRect()
    if (!r.width) continue
    const pct = ((r.left + r.width / 2) - railRect.left) / railRect.width * 100
    segs.push({ pct: Math.max(0, Math.min(100, pct)), tone })
  }
  segs.sort((a, b) => a.pct - b.pct)
  if (!segs.length) return null

  const stops = segs.map((s) => {
    const color = s.tone === 'dark' ? 'rgba(14, 31, 48, 0.56)' : 'rgba(255, 255, 255, 0.50)'
    return `${color} ${s.pct.toFixed(1)}%`
  })
  // 顶部高光带（厚度感，色调无关）+ 分段水平色调
  return {
    background:
      'linear-gradient(180deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.05) 14%, transparent 60%),' +
      'linear-gradient(90deg, ' + stops.join(', ') + ')'
  }
})

onMounted(() => {
  scrollHandler = () => {
    isScrolled.value = window.scrollY > 100
    scheduleToneDetection()
  }
  resizeHandler = () => {
    isScrolled.value = window.scrollY > 100
    setupToneObserver()
    detectAll()
  }
  window.addEventListener('scroll', scrollHandler, { passive: true })
  window.addEventListener('resize', resizeHandler, { passive: true })
  isScrolled.value = window.scrollY > 100
  nextTick(setupToneObserver)
})

onUnmounted(() => {
  if (scrollHandler) window.removeEventListener('scroll', scrollHandler)
  if (resizeHandler) window.removeEventListener('resize', resizeHandler)
  if (scrollRaf) cancelAnimationFrame(scrollRaf)
  toneObserver?.disconnect()
  clearPendingTone()
  window.removeEventListener('keydown', handleEscape)
})

// 路由切换后重置并重新探测
watch(() => route.path, () => {
  closeDrawer()
  clearPendingTone()
  dynamicTone.value = null
  toneConfidence.value = 'low'
  hasBusyBackdrop.value = false
  // 分段 tone 重置为 fallback，下一帧重新探测
  const ft = fallbackTone.value
  const reset = { brand: ft, auth: ft, burger: ft }
  for (const l of navLinks) reset[l.path] = ft
  segmentTones.value = reset
  nextTick(() => {
    isScrolled.value = window.scrollY > 100
    setupToneObserver()
  })
})

const toggleDrawer = () => {
  isDrawerOpen.value = !isDrawerOpen.value
}

const closeDrawer = () => {
  const wasOpen = isDrawerOpen.value
  isDrawerOpen.value = false
  if (wasOpen) {
    nextTick(() => burgerRef.value?.focus())
  }
}

// Escape 关闭抽屉：只在打开时挂载监听，关闭后即时卸载
const handleEscape = (e) => {
  if (e.key === 'Escape' && isDrawerOpen.value) {
    closeDrawer()
  }
}

watch(isDrawerOpen, (open) => {
  if (open) {
    window.addEventListener('keydown', handleEscape)
  } else {
    window.removeEventListener('keydown', handleEscape)
  }
})

const isActive = (path) => route.path === path

const handleAuthAction = () => {
  if (authStore.isLoggedIn) {
    if (window.confirm('确定要退出当前账号吗？')) {
      authStore.logout()
    }
  } else {
    router.push('/login')
  }
}

// 各片段 tone 用于模板 :data-tone 绑定（始终有 fallback，首屏不闪烁）
const brandTone = computed(() => segmentTones.value.brand || fallbackTone.value)
const authTone = computed(() => segmentTones.value.auth || fallbackTone.value)
const burgerTone = computed(() => segmentTones.value.burger || fallbackTone.value)
function linkTone(path) {
  return segmentTones.value[path] || fallbackTone.value
}
</script>

<template>
  <nav
    ref="navRef"
    class="nav-immersive"
    :class="{
      scrolled: isScrolled,
      'nav-immersive--tone-uncertain': toneConfidence === 'low' || hasBusyBackdrop,
      'nav-immersive--light': !isImmersive,
      'nav-immersive--culture': route.name === 'culture',
      'nav-immersive--on-dark': effectiveContrast === 'on-dark',
      'nav-immersive--on-light': effectiveContrast !== 'on-dark'
    }"
    style="position: fixed; top: 0; left: 0; right: 0; z-index: 40;"
  >
    <div class="nav-inner">
      <RouterLink to="/" class="nav-brand" data-tone="brand" :data-tone-actual="brandTone" @click="closeDrawer">
        <svg class="nav-brand-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M12 2L6 8V16L12 22L18 16V8L12 2Z" stroke="currentColor" stroke-width="1.5"/>
          <path d="M8 12L10 14L15 9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <span class="nav-brand-text">布依族词典</span>
      </RouterLink>

      <div
        class="nav-rail"
        :class="{ 'liquid-glass': !isClearRail, 'nav-rail--clear': isClearRail }"
        :style="railStyle"
      >
        <RouterLink
          v-for="link in navLinks"
          :key="link.path"
          :to="link.path"
          class="nav-link"
          :data-path="link.path"
          :data-tone="linkTone(link.path)"
          :class="{ active: isActive(link.path) }"
          :aria-current="isActive(link.path) ? 'page' : undefined"
        >
          {{ link.label }}
        </RouterLink>
        <button
          class="nav-auth-btn"
          type="button"
          :data-tone="authTone"
          @click="handleAuthAction"
        >
          {{ authStore.isLoggedIn ? '退出' : '登录' }}
        </button>
      </div>

      <button
        ref="burgerRef"
        class="nav-burger"
        type="button"
        :data-tone="burgerTone"
        :aria-label="isDrawerOpen ? '关闭菜单' : '打开菜单'"
        :aria-expanded="isDrawerOpen"
        @click="toggleDrawer"
      >
        <IconClose v-if="isDrawerOpen" :size="20" />
        <IconMenu v-else :size="20" />
      </button>
    </div>

    <div
      class="nav-drawer-scrim"
      :class="{ open: isDrawerOpen }"
      :aria-hidden="!isDrawerOpen"
      @click="closeDrawer"
    ></div>
    <div
      id="navDrawer"
      class="nav-drawer"
      :class="{ open: isDrawerOpen, scrolled: isScrolled }"
      :aria-hidden="!isDrawerOpen"
      :inert="!isDrawerOpen"
    >
      <RouterLink
        v-for="link in navLinks"
        :key="link.path"
        :to="link.path"
        :class="{ active: isActive(link.path) }"
        :aria-current="isActive(link.path) ? 'page' : undefined"
        @click="closeDrawer"
      >
        {{ link.label }}
      </RouterLink>
    </div>
  </nav>
</template>

<style scoped>
/* 沉浸式导航栏 */
.nav-immersive {
  transition: background 300ms ease, backdrop-filter 300ms ease, box-shadow 300ms ease;
  background: transparent;
  backdrop-filter: none;
  padding-top: env(safe-area-inset-top, 0px);
  padding-left: env(safe-area-inset-left, 0px);
  padding-right: env(safe-area-inset-right, 0px);
}

.nav-immersive.scrolled {
  background: transparent;
  backdrop-filter: none;
  -webkit-backdrop-filter: none;
  box-shadow: none;
}

.nav-immersive--light {
  background: var(--c-glass-nav);
  backdrop-filter: blur(20px) saturate(120%);
  -webkit-backdrop-filter: blur(20px) saturate(120%);
  box-shadow: 0 1px 0 var(--c-divider);
}

/* 非沉浸式工具页滚动后仍需常驻玻璃背景，避免导航浮在内容上失去衬底 */
.nav-immersive.nav-immersive--light.scrolled {
  background: var(--c-glass-nav);
  backdrop-filter: blur(20px) saturate(120%);
  -webkit-backdrop-filter: blur(20px) saturate(120%);
  box-shadow: 0 1px 0 var(--c-divider);
}

.nav-inner {
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 1100px;
  width: 100%;
  height: 56px;
  margin: 0 auto;
  padding: 0 24px;
}

.nav-brand {
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  color: inherit;
  transition: color 300ms ease;
}

.nav-brand-icon {
  color: var(--c-brand);
  transition: color 300ms ease;
}

.nav-brand-text {
  font-family: 'Noto Serif SC', serif;
  font-size: 16px;
  font-weight: 600;
  letter-spacing: 0.02em;
  transition: color 300ms ease;
}

/* 分段 tone：品牌独立着色（沉浸式页面） */
.nav-brand[data-tone-actual="dark"] .nav-brand-text { color: rgba(255, 255, 255, 0.95); }
.nav-brand[data-tone-actual="dark"] .nav-brand-icon { color: rgba(255, 255, 255, 0.9); }
.nav-brand[data-tone-actual="dark"]:hover .nav-brand-text { color: rgba(255, 255, 255, 0.82); }
.nav-brand[data-tone-actual="light"] .nav-brand-text { color: var(--c-text); }
.nav-brand[data-tone-actual="light"] .nav-brand-icon { color: var(--c-brand); }
.nav-brand[data-tone-actual="light"]:hover .nav-brand-text { color: var(--c-text-85); }

/* 非沉浸式页：品牌走单色（--light 容器） */
.nav-immersive.nav-immersive--light .nav-brand-text { color: var(--c-text); }
.nav-immersive.nav-immersive--light .nav-brand-icon { color: var(--c-brand); }

/* 导航链接容器 */
.nav-rail {
  display: none;
  align-items: center;
  gap: 4px;
  --lg-radius: 999px;
  --lg-spec: 0.12;
  --lg-tint-a: 0.42;
  padding: 6px 8px;
  transition: background 300ms ease;
}

@media (min-width: 640px) {
  .nav-rail {
    display: flex;
  }
}

/* 液体玻璃胶囊：禁用默认浮起，避免导航栏跳动 */
.nav-rail.liquid-glass:hover {
  transform: none;
}

.nav-rail--clear {
  border-color: transparent;
  background: transparent;
  box-shadow: none;
  backdrop-filter: none;
  -webkit-backdrop-filter: none;
}

.nav-link {
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
  text-decoration: none;
  transition: color 200ms ease, background 200ms ease;
  position: relative;
  outline: none;
}

.nav-link:focus-visible {
  outline: 2px solid currentColor;
  outline-offset: 2px;
}

/* 分段 tone：每个链接独立着色，跨深浅边界时左右可不同 */
.nav-link[data-tone="dark"] { color: rgba(255, 255, 255, 0.78); }
.nav-link[data-tone="dark"]:hover { color: #ffffff; background: rgba(255, 255, 255, 0.14); }
.nav-link[data-tone="dark"].active { color: #ffffff; background: rgba(255, 255, 255, 0.24); font-weight: 600; }
.nav-link[data-tone="light"] { color: var(--c-text-70); }
.nav-link[data-tone="light"]:hover { color: var(--c-text); background: var(--c-brand-06); }
.nav-link[data-tone="light"].active { color: var(--c-brand); background: var(--c-brand-08); font-weight: 600; }

/* 非沉浸式页：链接走单色（--light 容器，覆盖分段 tone） */
.nav-immersive.nav-immersive--light .nav-link { color: var(--c-text-70); }
.nav-immersive.nav-immersive--light .nav-link:hover { color: var(--c-text); background: var(--c-brand-06); }
.nav-immersive.nav-immersive--light .nav-link.active { color: var(--c-brand); background: var(--c-brand-08); font-weight: 600; }

/* 登录/退出按钮 */
.nav-auth-btn {
  margin-left: 8px;
  padding: 6px 16px;
  border: 1px solid currentColor;
  border-radius: 999px;
  background: transparent;
  font: 500 13px var(--font-sans);
  cursor: pointer;
  transition: background 200ms ease, border-color 200ms ease, color 200ms ease;
  outline: none;
}

.nav-auth-btn:focus-visible {
  outline: 2px solid currentColor;
  outline-offset: 2px;
}

/* 分段 tone：登录按钮独立着色 */
.nav-auth-btn[data-tone="dark"] { color: #ffffff; border-color: rgba(255, 255, 255, 0.52); }
.nav-auth-btn[data-tone="dark"]:hover { background: rgba(255, 255, 255, 0.14); }
.nav-auth-btn[data-tone="light"] { color: var(--c-brand); border-color: var(--c-brand-25); }
.nav-auth-btn[data-tone="light"]:hover { background: var(--c-brand-08); }

/* 非沉浸式页：登录按钮走单色 */
.nav-immersive.nav-immersive--light .nav-auth-btn { color: var(--c-brand); border-color: var(--c-brand-25); }
.nav-immersive.nav-immersive--light .nav-auth-btn:hover { background: var(--c-brand-08); }

/* 文化页保持深色展陈背景，导航在滚动后也必须维持高对比度。 */
.nav-immersive.nav-immersive--culture .nav-brand-text,
.nav-immersive.nav-immersive--culture.scrolled .nav-brand-text,
.nav-immersive.nav-immersive--culture .nav-link,
.nav-immersive.nav-immersive--culture.scrolled .nav-link,
.nav-immersive.nav-immersive--culture .nav-auth-btn,
.nav-immersive.nav-immersive--culture.scrolled .nav-auth-btn {
  color: rgba(255, 255, 255, .9);
}

.nav-immersive.nav-immersive--culture .nav-brand-icon,
.nav-immersive.nav-immersive--culture.scrolled .nav-brand-icon {
  color: #d6f0f3;
}

.nav-immersive.nav-immersive--culture .nav-link:hover,
.nav-immersive.nav-immersive--culture.scrolled .nav-link:hover {
  color: #ffffff;
  background: rgba(255, 255, 255, .14);
}

.nav-immersive.nav-immersive--culture .nav-link.active,
.nav-immersive.nav-immersive--culture.scrolled .nav-link.active {
  color: #ffffff;
  background: rgba(128, 203, 215, .24);
}

.nav-immersive.nav-immersive--culture .nav-auth-btn,
.nav-immersive.nav-immersive--culture.scrolled .nav-auth-btn {
  border-color: rgba(214, 240, 243, .5);
}

.nav-immersive.nav-immersive--culture .nav-auth-btn:hover,
.nav-immersive.nav-immersive--culture.scrolled .nav-auth-btn:hover {
  background: rgba(255, 255, 255, .14);
}

/* 导轨玻璃 tint 兜底（分段渐变未注入时，按整栏 tone 着色） */
.nav-immersive.nav-immersive--on-dark .nav-rail {
  --lg-tint: 14, 31, 48;
  --lg-tint-a: .56;
  border-color: rgba(255, 255, 255, .28);
}

.nav-immersive.nav-immersive--on-light .nav-rail {
  --lg-tint: 255, 255, 255;
  --lg-tint-a: .5;
  border-color: var(--c-brand-25);
}

/* 探测结果不确定时仅增加轻微保护衬底，可靠时仍保持完全透明。 */
.nav-immersive:not(.nav-immersive--light).nav-immersive--tone-uncertain.nav-immersive--on-dark {
  background: rgba(10, 27, 42, .16);
  backdrop-filter: blur(10px) saturate(110%);
  -webkit-backdrop-filter: blur(10px) saturate(110%);
  box-shadow: 0 1px 0 rgba(255, 255, 255, .12);
}

.nav-immersive:not(.nav-immersive--light).nav-immersive--tone-uncertain.nav-immersive--on-light {
  background: rgba(247, 245, 242, .22);
  backdrop-filter: blur(10px) saturate(110%);
  -webkit-backdrop-filter: blur(10px) saturate(110%);
  box-shadow: 0 1px 0 var(--c-divider);
}

/* 汉堡按钮 */
.nav-burger {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border: none;
  border-radius: 8px;
  background: transparent;
  cursor: pointer;
  padding: 0;
  transition: color 300ms ease;
  outline: none;
}

.nav-burger:focus-visible {
  outline: 2px solid currentColor;
  outline-offset: 2px;
}

/* 分段 tone：汉堡按钮独立着色 */
.nav-burger[data-tone="dark"] { color: rgba(255, 255, 255, 0.92); }
.nav-burger[data-tone="light"] { color: var(--c-text); }

/* 非沉浸式页：汉堡带玻璃底（覆盖分段 tone） */
.nav-immersive.nav-immersive--light .nav-burger {
  color: var(--c-text);
  background: var(--c-glass);
  border: 1px solid var(--c-brand-25);
}

@media (min-width: 640px) {
  .nav-burger {
    display: none;
  }
}

/* 下拉菜单：常驻 DOM，用 transform 平移到屏外配合透明度做过渡，避免 display 切换导致无动画 */
.nav-drawer {
  position: fixed;
  top: 56px;
  left: 0;
  right: 0;
  z-index: 39;
  display: flex;
  flex-direction: column;
  padding: 8px 24px 24px;
  gap: 2px;
  overscroll-behavior: contain;
  transition: transform var(--duration-base) ease-out, opacity var(--duration-base) ease-out, background 300ms ease, backdrop-filter 300ms ease;
  background: var(--c-glass-nav);
  backdrop-filter: blur(20px) saturate(120%);
  -webkit-backdrop-filter: blur(20px) saturate(120%);
  border-bottom: 1px solid var(--c-divider);
  max-height: calc(100vh - 56px);
  overflow-y: auto;
  opacity: 0;
  transform: translateX(100%);
  pointer-events: none;
}

.nav-drawer.open {
  opacity: 1;
  transform: translateX(0);
  pointer-events: auto;
}

@media (min-width: 640px) {
  .nav-drawer {
    display: none !important;
  }
}

.nav-drawer a {
  font-size: 16px;
  font-weight: 500;
  color: var(--c-text-70);
  text-decoration: none;
  padding: 14px 12px;
  border-radius: 10px;
  transition: background 150ms ease, color 150ms ease;
}

.nav-drawer a:hover {
  background: var(--c-brand-06);
  color: var(--c-text);
}

.nav-drawer a.active {
  color: var(--c-brand);
  background: var(--c-brand-08);
  font-weight: 600;
}

.nav-drawer a:focus-visible {
  outline: 2px solid var(--c-focus);
  outline-offset: 2px;
  background: var(--c-brand-06);
}

/* 抽屉遮罩：点击关闭，与抽屉同步淡入淡出 */
.nav-drawer-scrim {
  position: fixed;
  top: 56px;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 38;
  background: var(--c-modal-overlay);
  opacity: 0;
  pointer-events: none;
  transition: opacity var(--duration-base) ease-out;
}

.nav-drawer-scrim.open {
  opacity: 1;
  pointer-events: auto;
}

@media (min-width: 640px) {
  .nav-drawer-scrim {
    display: none !important;
  }
}

/* 减少动效 */
@media (prefers-reduced-motion: reduce) {
  .nav-immersive {
    transition: none !important;
  }
  .nav-drawer,
  .nav-drawer-scrim {
    transition: none !important;
  }
}
</style>
