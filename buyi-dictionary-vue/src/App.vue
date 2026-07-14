<script setup>
import { onMounted, onUnmounted } from 'vue'
import { RouterView } from 'vue-router'
import AppHeader from './components/layout/AppHeader.vue'
import AppFooter from './components/layout/AppFooter.vue'
import AudioPlayer from './components/specific/AudioPlayer.vue'
import AgentPanel from './components/specific/AgentPanel.vue'
import SearchModal from './components/common/SearchModal.vue'
import { initLiquidGlass } from './utils/liquidGlass'
import { useSearchStore } from './stores/search'

const searchStore = useSearchStore()

// 判断目标是否为输入型元素，避免在输入框内按 / 误触发搜索
function isTypingTarget(el) {
  return el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable)
}

// 全局 "/" 热键唤起搜索 Modal
function handleHotkey(e) {
  if (e.ctrlKey || e.metaKey || e.altKey) return
  if (e.key === '/' && !searchStore.isOpen && !isTypingTarget(e.target)) {
    e.preventDefault()
    searchStore.open()
  }
}

onMounted(() => {
  initLiquidGlass()
  document.addEventListener('keydown', handleHotkey)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleHotkey)
})
</script>

<template>
  <div class="app-container">
    <a class="skip-link" href="#main">跳到主内容</a>
    <AppHeader />
    <RouterView v-slot="{ Component }">
      <Suspense>
        <component :is="Component" />
        <template #fallback>
          <div class="app-loading">加载中…</div>
        </template>
      </Suspense>
    </RouterView>
    <AppFooter />
    <AudioPlayer />
    <AgentPanel />
    <SearchModal :is-open="searchStore.isOpen" @close="searchStore.close()" />
  </div>
</template>

<style scoped>
.app-container {
  min-height: 100vh;
}

.app-loading {
  min-height: 60vh;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--c-text-70);
  font-size: 0.95rem;
}
</style>
