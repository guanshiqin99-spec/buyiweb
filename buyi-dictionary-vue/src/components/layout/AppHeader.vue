<script setup>
import { computed, ref, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import IconMenu from '@/components/icons/IconMenu.vue'
import IconClose from '@/components/icons/IconClose.vue'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const isDrawerOpen = ref(false)
const isScrolled = ref(false)
const navRef = ref(null)
const burgerRef = ref(null)
const isImmersive = computed(() => route.meta.navTone === 'immersive')
const navContrast = computed(() => route.meta.navContrast || 'on-light')
// 动态探测：根据导航栏正下方的背景区块实时切换深/浅文字（苹果式）
const dynamicTone = ref(null) // 'dark' | 'light' | null
const toneConfidence = ref('low') // 'high' | 'low'
const effectiveContrast = computed(() => {
  if (dynamicTone.value === 'dark' || dynamicTone.value === 'light') {
    return `on-${dynamicTone.value}`
  }
  return navContrast.value
})
const isClearRail = computed(() => route.meta.navRail === 'clear')

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
const intersectingToneElements = new Set()
const TONE_SWITCH_DELAY = 96

function isValidTone(value) {
  return value === 'dark' || value === 'light'
}

function getProbeY() {
  const navBottom = navRef.value?.getBoundingClientRect().bottom || 56
  return Math.min(window.innerHeight - 1, Math.max(0, Math.round(navBottom + 8)))
}

function clearPendingTone() {
  pendingTone = null
  if (toneSwitchTimer) window.clearTimeout(toneSwitchTimer)
  toneSwitchTimer = null
}

function acceptTone(tone) {
  if (!isValidTone(tone)) return

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
    }, TONE_SWITCH_DELAY)
  }
}

function markToneUncertain() {
  clearPendingTone()
  toneConfidence.value = 'low'
}

function toneAtPoint(x, y) {
  const stack = typeof document.elementsFromPoint === 'function'
    ? document.elementsFromPoint(x, y)
    : [document.elementFromPoint(x, y)].filter(Boolean)

  for (const element of stack) {
    if (navRef.value?.contains(element)) continue
    const marked = element.closest?.('[data-nav-tone]')
    if (!marked || navRef.value?.contains(marked)) continue
    const tone = marked.dataset.navTone
    if (isValidTone(tone)) return tone
  }
  return null
}

function observedTone() {
  const tones = new Set(
    [...intersectingToneElements]
      .map((element) => element.dataset.navTone)
      .filter(isValidTone)
  )
  return tones.size === 1 ? [...tones][0] : null
}

// 语义区块优先；区块边界或复杂图层中使用左、中、右三点投票。
function detectNavTone() {
  const markers = document.querySelectorAll('[data-nav-tone]')
  if (!markers.length) {
    acceptTone(navContrast.value === 'on-dark' ? 'dark' : 'light')
    return
  }

  const semanticTone = observedTone()
  if (semanticTone) {
    acceptTone(semanticTone)
    return
  }

  const y = getProbeY()
  const sampleXs = [window.innerWidth * 0.14, window.innerWidth * 0.5, window.innerWidth * 0.86]
  const votes = sampleXs.map((x) => toneAtPoint(x, y)).filter(isValidTone)
  const darkVotes = votes.filter((tone) => tone === 'dark').length
  const lightVotes = votes.filter((tone) => tone === 'light').length

  if (darkVotes >= 2) acceptTone('dark')
  else if (lightVotes >= 2) acceptTone('light')
  else if (!votes.length) acceptTone(navContrast.value === 'on-dark' ? 'dark' : 'light')
  else markToneUncertain()
}

function scheduleToneDetection() {
  if (scrollRaf) return
  scrollRaf = requestAnimationFrame(() => {
    scrollRaf = null
    detectNavTone()
  })
}

function setupToneObserver() {
  toneObserver?.disconnect()
  intersectingToneElements.clear()

  const markers = [...document.querySelectorAll('[data-nav-tone]')]
  if (!markers.length || typeof IntersectionObserver === 'undefined') {
    scheduleToneDetection()
    return
  }

  const probeY = getProbeY()
  const bottomInset = Math.max(0, window.innerHeight - probeY - 2)
  toneObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) intersectingToneElements.add(entry.target)
      else intersectingToneElements.delete(entry.target)
    })
    scheduleToneDetection()
  }, {
    rootMargin: `-${probeY}px 0px -${bottomInset}px 0px`,
    threshold: 0
  })
  markers.forEach((element) => toneObserver.observe(element))
  scheduleToneDetection()
}

onMounted(() => {
  scrollHandler = () => {
    isScrolled.value = window.scrollY > 100
    scheduleToneDetection()
  }
  resizeHandler = () => {
    isScrolled.value = window.scrollY > 100
    setupToneObserver()
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
</script>

<template>
  <nav 
    ref="navRef"
    class="nav-immersive" 
    :class="{
      scrolled: isScrolled,
      'nav-immersive--tone-uncertain': toneConfidence === 'low',
      'nav-immersive--light': !isImmersive,
      'nav-immersive--culture': route.name === 'culture',
      'nav-immersive--on-dark': effectiveContrast === 'on-dark',
      'nav-immersive--on-light': effectiveContrast !== 'on-dark'
    }"
    style="position: fixed; top: 0; left: 0; right: 0; z-index: 40;"
  >
    <div class="nav-inner">
      <RouterLink to="/" class="nav-brand" @click="closeDrawer">
        <svg class="nav-brand-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M12 2L6 8V16L12 22L18 16V8L12 2Z" stroke="currentColor" stroke-width="1.5"/>
          <path d="M8 12L10 14L15 9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <span class="nav-brand-text">布依族词典</span>
      </RouterLink>
      
      <div class="nav-rail" :class="{ 'liquid-glass': !isClearRail, 'nav-rail--clear': isClearRail }">
        <RouterLink
          v-for="link in navLinks"
          :key="link.path"
          :to="link.path"
          class="nav-link"
          :class="{ active: isActive(link.path) }"
          :aria-current="isActive(link.path) ? 'page' : undefined"
        >
          {{ link.label }}
        </RouterLink>
        <button class="nav-auth-btn" type="button" @click="handleAuthAction">
          {{ authStore.isLoggedIn ? '退出' : '登录' }}
        </button>
      </div>
      
      <button
        ref="burgerRef"
        class="nav-burger"
        type="button"
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

.nav-immersive:not(.scrolled) .nav-brand-icon {
  color: rgba(255, 255, 255, 0.9);
}

.nav-immersive.nav-immersive--light .nav-brand-icon { color: var(--c-brand); }

.nav-brand-text {
  font-family: 'Noto Serif SC', serif;
  font-size: 16px;
  font-weight: 600;
  letter-spacing: 0.02em;
  transition: color 300ms ease;
}

.nav-immersive:not(.scrolled) .nav-brand-text {
  color: #ffffff;
}

.nav-immersive.nav-immersive--light .nav-brand-text { color: var(--c-text); }

.nav-immersive:not(.scrolled) .nav-brand:hover .nav-brand-text {
  color: rgba(255, 255, 255, 0.85);
}

.nav-immersive.scrolled .nav-brand-text {
  color: var(--c-text);
}

.nav-immersive.scrolled .nav-brand-icon {
  color: var(--c-brand);
}

/* 导航链接 */
.nav-rail {
  display: none;
  align-items: center;
  gap: 4px;
  --lg-radius: 999px;
  --lg-spec: 0.12;
  --lg-tint-a: 0.42;
  padding: 6px 8px;
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

.nav-immersive:not(.scrolled) .nav-link {
  color: var(--c-text-70);
}

.nav-immersive.nav-immersive--light .nav-link { color: var(--c-text-70); }
.nav-immersive.nav-immersive--light .nav-link:hover { color: var(--c-text); background: var(--c-brand-06); }
.nav-immersive.nav-immersive--light .nav-link.active { color: var(--c-brand); background: var(--c-brand-08); font-weight: 600; }

.nav-immersive:not(.scrolled) .nav-link:hover {
  color: var(--c-text);
  background: var(--c-brand-06);
}

.nav-immersive:not(.scrolled) .nav-link.active {
  color: var(--c-brand);
  background: var(--c-brand-08);
  font-weight: 600;
}

.nav-immersive.scrolled .nav-link {
  color: var(--c-text-70);
}

.nav-immersive.scrolled .nav-link:hover {
  color: var(--c-text);
  background: var(--c-brand-06);
}

.nav-immersive.scrolled .nav-link.active {
  color: var(--c-brand);
  background: var(--c-brand-08);
  font-weight: 600;
}

/* 登录/退出按钮 */
.nav-auth-btn {
  margin-left: 8px;
  padding: 6px 16px;
  border: 1px solid currentColor;
  border-radius: 999px;
  background: transparent;
  font: 500 13px var(--font-sans);
  cursor: pointer;
  transition: background 200ms ease, border-color 200ms ease;
  outline: none;
}

.nav-auth-btn:focus-visible {
  outline: 2px solid currentColor;
  outline-offset: 2px;
}

.nav-immersive:not(.scrolled) .nav-auth-btn {
  color: var(--c-brand);
  border-color: var(--c-brand-25);
}

.nav-immersive.nav-immersive--light .nav-auth-btn { color: var(--c-brand); border-color: var(--c-brand-25); }
.nav-immersive.nav-immersive--light .nav-auth-btn:hover { background: var(--c-brand-08); }

.nav-immersive:not(.scrolled) .nav-auth-btn:hover {
  background: var(--c-brand-08);
}

.nav-immersive.scrolled .nav-auth-btn {
  color: var(--c-brand);
  border-color: var(--c-brand-25);
}

.nav-immersive.scrolled .nav-auth-btn:hover {
  background: var(--c-brand-08);
}

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

/* 导航对比主题：深色背景使用浅色文字，浅色背景使用深色文字。 */
.nav-immersive.nav-immersive--on-dark .nav-rail {
  --lg-tint: 14, 31, 48;
  --lg-tint-a: .56;
  border-color: rgba(255, 255, 255, .28);
}

.nav-immersive.nav-immersive--on-dark .nav-brand-text,
.nav-immersive.nav-immersive--on-dark.scrolled .nav-brand-text {
  color: var(--c-white);
}

.nav-immersive.nav-immersive--on-dark .nav-brand-icon,
.nav-immersive.nav-immersive--on-dark.scrolled .nav-brand-icon {
  color: rgba(255, 255, 255, .9);
}

.nav-immersive.nav-immersive--on-dark .nav-link,
.nav-immersive.nav-immersive--on-dark.scrolled .nav-link {
  color: var(--c-white-78);
}

.nav-immersive.nav-immersive--on-dark .nav-link:hover,
.nav-immersive.nav-immersive--on-dark.scrolled .nav-link:hover {
  color: var(--c-white);
  background: rgba(255, 255, 255, .14);
}

.nav-immersive.nav-immersive--on-dark .nav-link.active,
.nav-immersive.nav-immersive--on-dark.scrolled .nav-link.active {
  color: var(--c-white);
  background: rgba(255, 255, 255, .30);
  font-weight: 600;
}

.nav-immersive.nav-immersive--on-dark .nav-auth-btn,
.nav-immersive.nav-immersive--on-dark.scrolled .nav-auth-btn {
  color: var(--c-white);
  border-color: rgba(255, 255, 255, .52);
}

.nav-immersive.nav-immersive--on-dark .nav-auth-btn:hover,
.nav-immersive.nav-immersive--on-dark.scrolled .nav-auth-btn:hover {
  background: rgba(255, 255, 255, .14);
}

.nav-immersive.nav-immersive--on-dark .nav-burger,
.nav-immersive.nav-immersive--on-dark.scrolled .nav-burger {
  color: var(--c-white);
}

.nav-immersive.nav-immersive--on-light .nav-rail {
  --lg-tint: 255, 255, 255;
  --lg-tint-a: .5;
  border-color: var(--c-brand-25);
}

.nav-immersive.nav-immersive--on-light .nav-brand-text,
.nav-immersive.nav-immersive--on-light.scrolled .nav-brand-text {
  color: var(--c-text);
}

.nav-immersive.nav-immersive--on-light .nav-brand-icon,
.nav-immersive.nav-immersive--on-light.scrolled .nav-brand-icon {
  color: var(--c-brand);
}

.nav-immersive.nav-immersive--on-light .nav-link,
.nav-immersive.nav-immersive--on-light.scrolled .nav-link {
  color: var(--c-text-70);
}

.nav-immersive.nav-immersive--on-light .nav-link:hover,
.nav-immersive.nav-immersive--on-light.scrolled .nav-link:hover {
  color: var(--c-text);
  background: var(--c-brand-06);
}

.nav-immersive.nav-immersive--on-light .nav-link.active,
.nav-immersive.nav-immersive--on-light.scrolled .nav-link.active {
  color: var(--c-text);
  background: var(--c-brand-25);
  font-weight: 600;
}

.nav-immersive.nav-immersive--on-light .nav-auth-btn,
.nav-immersive.nav-immersive--on-light.scrolled .nav-auth-btn {
  color: var(--c-brand);
  border-color: var(--c-brand-25);
}

.nav-immersive.nav-immersive--on-light .nav-auth-btn:hover,
.nav-immersive.nav-immersive--on-light.scrolled .nav-auth-btn:hover {
  background: var(--c-brand-08);
}

.nav-immersive.nav-immersive--on-light .nav-burger,
.nav-immersive.nav-immersive--on-light.scrolled .nav-burger {
  color: var(--c-text);
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

.nav-immersive:not(.scrolled) .nav-burger {
  color: rgba(255, 255, 255, 0.9);
}

.nav-immersive.nav-immersive--light .nav-burger {
  color: var(--c-text);
  background: var(--c-glass);
  border: 1px solid var(--c-brand-25);
}

.nav-immersive.scrolled .nav-burger {
  color: var(--c-text);
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
