<script setup>
import { onMounted, onUnmounted } from 'vue'
import { RouterView } from 'vue-router'
import AppHeader from './components/layout/AppHeader.vue'
import AppFooter from './components/layout/AppFooter.vue'

let glowObserver = null

onMounted(() => {
  // Glow effect mouse tracking
  const handleGlow = (e) => {
    const cards = document.querySelectorAll('.glow-card:hover, .glow-hero:hover')
    cards.forEach(el => {
      const glow = el.querySelector('.glow-effect')
      if (!glow) return
      const rect = el.getBoundingClientRect()
      glow.style.left = (e.clientX - rect.left) + 'px'
      glow.style.top = (e.clientY - rect.top) + 'px'
    })
  }

  document.addEventListener('mousemove', handleGlow, { passive: true })

  // MutationObserver to handle dynamically added cards
  glowObserver = new MutationObserver(() => {
    // Touch device detection
    if ('ontouchstart' in window) {
      document.querySelectorAll('.glow-effect').forEach(el => {
        el.style.display = 'none'
      })
    }
  })
  glowObserver.observe(document.body, { childList: true, subtree: true })

  // Initial check for touch devices
  if ('ontouchstart' in window) {
    document.querySelectorAll('.glow-effect').forEach(el => {
      el.style.display = 'none'
    })
  }
})

onUnmounted(() => {
  if (glowObserver) glowObserver.disconnect()
})
</script>

<template>
  <div class="app-container">
    <a class="skip-link" href="#main">跳到主内容</a>
    <AppHeader />
    <RouterView />
    <AppFooter />
  </div>
</template>

<style scoped>
.app-container {
  min-height: 100vh;
}
</style>
