<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { RouterLink, useRoute } from 'vue-router'

const route = useRoute()
const isDrawerOpen = ref(false)
const isScrolled = ref(false)

const navLinks = [
  { path: '/dictionary', label: '词典' },
  { path: '/learn', label: '学习' },
  { path: '/songs', label: '民歌' },
  { path: '/culture', label: '文化' },
  { path: '/profile', label: '我的' }
]

let scrollHandler = null

onMounted(() => {
  scrollHandler = () => {
    isScrolled.value = window.scrollY > 100
  }
  window.addEventListener('scroll', scrollHandler, { passive: true })
})

onUnmounted(() => {
  if (scrollHandler) window.removeEventListener('scroll', scrollHandler)
})

const toggleDrawer = () => {
  isDrawerOpen.value = !isDrawerOpen.value
}

const closeDrawer = () => {
  isDrawerOpen.value = false
}

const isActive = (path) => route.path === path
</script>

<template>
  <nav 
    class="nav-immersive" 
    :class="{ scrolled: isScrolled }"
    style="position: fixed; top: 0; left: 0; right: 0; z-index: 40;"
  >
    <div class="nav-inner">
      <RouterLink to="/" class="nav-brand" @click="closeDrawer">
        <svg class="nav-brand-icon" width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M12 2L6 8V16L12 22L18 16V8L12 2Z" stroke="currentColor" stroke-width="1.5"/>
          <path d="M8 12L10 14L15 9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <span class="nav-brand-text">布依族词典</span>
      </RouterLink>
      
      <div class="nav-rail">
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
      </div>
      
      <button
        class="nav-burger"
        aria-label="打开菜单"
        :aria-expanded="isDrawerOpen"
        @click="toggleDrawer"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>
    </div>
    
    <div
      id="navDrawer"
      class="nav-drawer"
      :class="{ open: isDrawerOpen, scrolled: isScrolled }"
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
}

.nav-immersive.scrolled {
  background: var(--c-glass-nav);
  backdrop-filter: blur(20px) saturate(120%);
  -webkit-backdrop-filter: blur(20px) saturate(120%);
  box-shadow: 0 1px 0 rgba(27,58,92,0.06);
}

.nav-inner {
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
}

@media (min-width: 640px) {
  .nav-rail {
    display: flex;
  }
}

.nav-link {
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
  text-decoration: none;
  transition: all 200ms ease;
  position: relative;
}

.nav-immersive:not(.scrolled) .nav-link {
  color: rgba(255, 255, 255, 0.8);
}

.nav-immersive:not(.scrolled) .nav-link:hover {
  color: #ffffff;
  background: rgba(255, 255, 255, 0.10);
}

.nav-immersive:not(.scrolled) .nav-link.active {
  color: #ffffff;
  background: rgba(255, 255, 255, 0.15);
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

/* 汉堡按钮 */
.nav-burger {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 8px;
  background: transparent;
  cursor: pointer;
  padding: 0;
  transition: color 300ms ease;
}

.nav-immersive:not(.scrolled) .nav-burger {
  color: rgba(255, 255, 255, 0.9);
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
  background: rgba(245, 242, 239, 0.98);
  backdrop-filter: blur(20px) saturate(120%);
  -webkit-backdrop-filter: blur(20px) saturate(120%);
  border-bottom: 1px solid rgba(27,58,92,0.06);
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
  transition: all 150ms ease;
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

/* 减少动效 */
@media (prefers-reduced-motion: reduce) {
  .nav-immersive {
    transition: none !important;
  }
}
</style>
