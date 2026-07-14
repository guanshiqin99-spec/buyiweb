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
const burgerRef = ref(null)
const isImmersive = computed(() => route.meta.navTone === 'immersive')
const navContrast = computed(() => route.meta.navContrast || 'on-light')
// 动态探测：根据导航栏正下方的背景区块实时切换深/浅文字（苹果式）
const dynamicTone = ref(null) // 'dark' | 'light' | null
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
let scrollRaf = null

// 检测导航栏正下方所处区块的 data-nav-tone，实时切换深/浅文字
function detectNavTone() {
  const x = window.innerWidth / 2
  const y = 72 // 紧贴导航栏（56px）下方
  const el = document.elementFromPoint(x, y)
  if (!el) { dynamicTone.value = null; return }
  const marked = el.closest('[data-nav-tone]')
  dynamicTone.value = marked ? marked.dataset.navTone : null
}

onMounted(() => {
  scrollHandler = () => {
    isScrolled.value = window.scrollY > 100
    if (scrollRaf) return
    scrollRaf = requestAnimationFrame(() => {
      scrollRaf = null
      detectNavTone()
    })
  }
  window.addEventListener('scroll', scrollHandler, { passive: true })
  window.addEventListener('resize', detectNavTone, { passive: true })
  nextTick(detectNavTone)
})

onUnmounted(() => {
  if (scrollHandler) window.removeEventListener('scroll', scrollHandler)
  window.removeEventListener('resize', detectNavTone)
  if (scrollRaf) cancelAnimationFrame(scrollRaf)
})

// 路由切换后重置并重新探测
watch(() => route.path, () => {
  dynamicTone.value = null
  nextTick(detectNavTone)
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
    class="nav-immersive" 
    :class="{
      scrolled: isScrolled,
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

/* 下拉菜单 */
.nav-drawer {
  position: fixed;
  top: 56px;
  left: 0;
  right: 0;
  z-index: 39;
  display: none;
  flex-direction: column;
  padding: 8px 24px 24px;
  gap: 2px;
  overscroll-behavior: contain;
  transition: background 300ms ease, backdrop-filter 300ms ease;
  background: var(--c-glass-nav);
  backdrop-filter: blur(20px) saturate(120%);
  -webkit-backdrop-filter: blur(20px) saturate(120%);
  border-bottom: 1px solid var(--c-divider);
  max-height: calc(100vh - 56px);
  overflow-y: auto;
}

.nav-drawer.open {
  display: flex;
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

/* 减少动效 */
@media (prefers-reduced-motion: reduce) {
  .nav-immersive {
    transition: none !important;
  }
}
</style>
