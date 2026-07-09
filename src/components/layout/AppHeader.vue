<script setup>
import { ref } from 'vue'
import { RouterLink, useRoute } from 'vue-router'

const route = useRoute()
const isDrawerOpen = ref(false)

const navLinks = [
  { path: '/dictionary', label: '词典' },
  { path: '/learn', label: '学习' },
  { path: '/songs', label: '民歌' },
  { path: '/culture', label: '文化' },
  { path: '/profile', label: '我的' }
]

const toggleDrawer = () => {
  isDrawerOpen.value = !isDrawerOpen.value
}

const closeDrawer = () => {
  isDrawerOpen.value = false
}
</script>

<template>
  <nav style="position: fixed; top: 0; left: 0; right: 0; z-index: 40;">
    <div class="liquid-glass-nav">
      <div class="nav-inner">
        <RouterLink to="/" style="font-size: 14px; font-weight: 600; color: var(--c-text); text-decoration: none;" @click="closeDrawer">
          布依族词典
        </RouterLink>
        
        <div class="nav-rail" style="gap: 24px;">
          <RouterLink
            v-for="link in navLinks"
            :key="link.path"
            :to="link.path"
            style="font-size: 14px; font-weight: 400; color: var(--c-text-60); text-decoration: none; transition: color 150ms ease;"
            :style="{ color: route.path === link.path ? 'var(--c-text)' : undefined, fontWeight: route.path === link.path ? '600' : undefined }"
            :aria-current="route.path === link.path ? 'page' : undefined"
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
    </div>
    
    <div
      id="navDrawer"
      class="nav-drawer liquid-glass-nav"
      :class="{ open: isDrawerOpen }"
      style="border-radius: 0;"
    >
      <RouterLink
        v-for="link in navLinks"
        :key="link.path"
        :to="link.path"
        :aria-current="route.path === link.path ? 'page' : undefined"
        @click="closeDrawer"
      >
        {{ link.label }}
      </RouterLink>
    </div>
  </nav>
</template>

<style scoped>
.nav-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 980px;
  width: 100%;
  height: 100%;
  margin: 0 auto;
  padding: 0 24px;
}

.nav-rail {
  display: none;
  align-items: center;
}

@media (min-width: 640px) {
  .nav-rail {
    display: flex;
  }
}

.nav-burger {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  color: var(--c-text);
  cursor: pointer;
  padding: 0;
}

@media (min-width: 640px) {
  .nav-burger {
    display: none;
  }
}

.nav-drawer {
  position: fixed;
  top: 48px;
  left: 0;
  right: 0;
  z-index: 39;
  display: none;
  flex-direction: column;
  padding: 16px 24px 24px;
  gap: 4px;
  overscroll-behavior: contain;
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
  padding: 12px 0;
  border-bottom: 1px solid rgba(27,58,92,0.08);
  transition: color 150ms ease;
}

.nav-drawer a:last-child {
  border-bottom: none;
}

.nav-drawer a[aria-current="page"] {
  color: var(--c-text);
  font-weight: 600;
}
</style>
