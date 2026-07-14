<script setup>
import { ref, watch, nextTick, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAgentStore } from '@/stores/agent'

const route = useRoute()
const agentStore = useAgentStore()

const inputRef = ref(null)
const listRef = ref(null)
const panelRef = ref(null)
const draft = ref('')
let lastFocus = null

// 路由变化时同步上下文
watch(() => route.path, (p) => {
  agentStore.setContext(p)
}, { immediate: true })

// 面板打开/关闭：焦点管理
watch(() => agentStore.isOpen, (open) => {
  if (open) {
    lastFocus = document.activeElement
    nextTick(() => inputRef.value?.focus())
  } else {
    if (lastFocus && typeof lastFocus.focus === 'function') {
      nextTick(() => lastFocus.focus())
    }
  }
})

// 新消息自动滚动到底部
watch(() => agentStore.messages.length, () => {
  nextTick(() => {
    if (listRef.value) listRef.value.scrollTop = listRef.value.scrollHeight
  })
})

function togglePanel() {
  if (agentStore.isOpen) agentStore.close()
  else agentStore.open(route.path)
}

function sendQuestion(text) {
  const q = (text ?? draft.value).trim()
  if (!q) return
  agentStore.send(q)
  draft.value = ''
}

function handleKeydown(e) {
  if (e.key === 'Escape') {
    e.preventDefault()
    agentStore.close()
  } else if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    sendQuestion()
  } else if (e.key === 'Tab') {
    // 简单焦点陷阱：Tab 在面板内循环
    const panel = panelRef.value
    if (!panel) return
    const focusable = panel.querySelectorAll('button, [href], input, [tabindex]:not([tabindex="-1"])')
    if (!focusable.length) return
    const first = focusable[0]
    const last = focusable[focusable.length - 1]
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault()
      last.focus()
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault()
      first.focus()
    }
  }
}

onUnmounted(() => {
  // 组件卸载时确保面板关闭，避免焦点丢失
  agentStore.close()
})
</script>

<template>
  <!-- 悬浮入口按钮：全站可见 -->
  <button
    class="agent-fab"
    type="button"
    :aria-expanded="agentStore.isOpen"
    aria-controls="agent-panel"
    aria-label="打开布依文化导览员"
    @click="togglePanel"
  >
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2z"/>
      <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
      <line x1="9" y1="9" x2="9.01" y2="9"/>
      <line x1="15" y1="9" x2="15.01" y2="9"/>
    </svg>
  </button>

  <!-- 侧边面板 -->
  <div
    v-if="agentStore.isOpen"
    class="agent-overlay"
    @click.self="agentStore.close()"
  >
    <section
      id="agent-panel"
      ref="panelRef"
      class="agent-panel liquid-glass"
      role="dialog"
      aria-modal="true"
      aria-label="布依文化导览员"
      @keydown="handleKeydown"
    >
      <div class="glow-effect"></div>

      <!-- 头部 -->
      <header class="agent-header">
        <div class="agent-title-wrap">
          <span class="agent-avatar" aria-hidden="true">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2z"/>
              <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
              <line x1="9" y1="9" x2="9.01" y2="9"/>
              <line x1="15" y1="9" x2="15.01" y2="9"/>
            </svg>
          </span>
          <div>
            <h2 class="agent-title">布依文化导览员</h2>
            <p class="agent-status">在线 · 可解答词汇/纹样/民俗</p>
          </div>
        </div>
        <button class="agent-close" type="button" aria-label="关闭面板" @click="agentStore.close()">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </header>

      <!-- 消息列表 -->
      <div ref="listRef" class="agent-messages" aria-live="polite">
        <div
          v-for="(msg, i) in agentStore.messages"
          :key="i"
          class="msg"
          :class="msg.role === 'user' ? 'msg-user' : 'msg-agent'"
        >
          <p class="msg-text">
            <template v-if="msg.text">{{ msg.text }}</template>
            <span
              v-else-if="agentStore.loading && i === agentStore.messages.length - 1"
              class="typing"
            >正在思考…</span>
          </p>
        </div>
      </div>

      <!-- 快捷提问 -->
      <div v-if="agentStore.quickQuestions.length" class="agent-quick">
        <button
          v-for="(q, i) in agentStore.quickQuestions"
          :key="i"
          class="quick-chip"
          type="button"
          @click="sendQuestion(q)"
        >{{ q }}</button>
      </div>

      <!-- 输入区 -->
      <form class="agent-input-wrap" @submit.prevent="sendQuestion()">
        <label class="sr-only" for="agent-input">向导览员提问</label>
        <input
          id="agent-input"
          ref="inputRef"
          v-model="draft"
          type="text"
          class="agent-input"
          placeholder="向导览员提问…"
          autocomplete="off"
          spellcheck="false"
        />
        <button v-if="agentStore.loading" class="agent-send agent-stop" type="button" aria-label="停止生成" @click="agentStore.stop()">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <rect x="6" y="6" width="12" height="12" rx="2"/>
          </svg>
        </button>
        <button v-else class="agent-send" type="submit" aria-label="发送">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <line x1="22" y1="2" x2="11" y2="13"/>
            <polygon points="22 2 15 22 11 13 2 9 22 2"/>
          </svg>
        </button>
      </form>
    </section>
  </div>
</template>

<style scoped>
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* 悬浮入口按钮 */
.agent-fab {
  position: fixed;
  right: 24px;
  bottom: 96px;
  z-index: 90;
  width: 56px;
  height: 56px;
  border: none;
  border-radius: 50%;
  background: var(--grad-accent);
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 24px rgba(212, 136, 58, 0.4);
  transition: transform 220ms cubic-bezier(0.32, 0.72, 0, 1), box-shadow 220ms ease;
}

.agent-fab:hover {
  transform: scale(1.08);
  box-shadow: 0 12px 32px rgba(212, 136, 58, 0.5);
}

.agent-fab:focus-visible {
  outline: 2px solid var(--c-focus);
  outline-offset: 3px;
}

@media (max-width: 768px) {
  .agent-fab {
    right: 16px;
    bottom: 88px;
  }
}

/* 遮罩 + 面板 */
.agent-overlay {
  position: fixed;
  inset: 0;
  z-index: 100;
  background: rgba(27, 58, 92, 0.28);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  display: flex;
  justify-content: flex-end;
  animation: overlayIn 240ms cubic-bezier(0.22, 1, 0.36, 1);
}

@keyframes overlayIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@supports not (backdrop-filter: blur(4px)) {
  .agent-overlay { background: rgba(27, 58, 92, 0.6); }
}

.agent-panel {
  width: min(400px, 100%);
  height: 100%;
  display: flex;
  flex-direction: column;
  --lg-radius: 0;
  border-radius: 24px 0 0 24px;
  animation: panelIn 280ms cubic-bezier(0.22, 1, 0.36, 1);
}

@keyframes panelIn {
  from { opacity: 0; transform: translateX(24px); }
  to { opacity: 1; transform: translateX(0); }
}

/* 头部 */
.agent-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid rgba(58, 107, 140, 0.12);
  flex-shrink: 0;
}

.agent-title-wrap {
  display: flex;
  align-items: center;
  gap: 12px;
}

.agent-avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--c-brand-08);
  color: var(--c-brand);
  flex-shrink: 0;
}

.agent-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--c-text);
  margin: 0;
}

.agent-status {
  font-size: 12px;
  color: var(--c-text-60);
  margin: 2px 0 0 0;
}

.agent-close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 50%;
  background: transparent;
  color: var(--c-text-60);
  cursor: pointer;
  transition: background 160ms ease, color 160ms ease;
}

.agent-close:hover {
  background: var(--c-brand-08);
  color: var(--c-text);
}

.agent-close:focus-visible {
  outline: 2px solid var(--c-focus);
  outline-offset: 2px;
}

/* 消息列表 */
.agent-messages {
  flex: 1;
  overflow-y: auto;
  overscroll-behavior: contain;
  padding: 20px 24px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  scrollbar-width: thin;
  scrollbar-color: rgba(58, 107, 140, 0.3) transparent;
}

.agent-messages::-webkit-scrollbar { width: 5px; }
.agent-messages::-webkit-scrollbar-thumb {
  background: rgba(58, 107, 140, 0.3);
  border-radius: 3px;
}

.msg {
  max-width: 85%;
  padding: 10px 14px;
  border-radius: 16px;
  font-size: 14px;
  line-height: 1.6;
}

.msg-text {
  margin: 0;
  word-break: break-word;
}

.msg-agent {
  align-self: flex-start;
  background: var(--c-brand-06, rgba(58, 107, 140, 0.06));
  color: var(--c-text);
  border-bottom-left-radius: 4px;
}

.msg-user {
  align-self: flex-end;
  background: var(--c-brand);
  color: var(--c-brand-foreground);
  border-bottom-right-radius: 4px;
}

/* 快捷提问 */
.agent-quick {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 12px 24px;
  border-top: 1px solid rgba(58, 107, 140, 0.08);
  flex-shrink: 0;
}

.quick-chip {
  padding: 6px 12px;
  border: 1px solid rgba(58, 107, 140, 0.2);
  border-radius: 999px;
  background: var(--c-glass);
  color: var(--c-text-70);
  font: 500 12px var(--font-sans);
  cursor: pointer;
  transition: background 160ms ease, border-color 160ms ease, color 160ms ease;
}

.quick-chip:hover {
  background: var(--c-brand-08);
  border-color: var(--c-brand);
  color: var(--c-brand);
}

.quick-chip:focus-visible {
  outline: 2px solid var(--c-focus);
  outline-offset: 2px;
}

/* 输入区 */
.agent-input-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 24px 20px;
  border-top: 1px solid rgba(58, 107, 140, 0.12);
  flex-shrink: 0;
}

.agent-input {
  flex: 1;
  min-width: 0;
  height: 42px;
  padding: 0 16px;
  border: 1px solid rgba(58, 107, 140, 0.18);
  border-radius: 999px;
  background: var(--input);
  color: var(--c-text);
  font: 400 14px var(--font-sans);
  outline: none;
  transition: border-color 200ms ease;
}

.agent-input:focus-visible {
  border-color: var(--c-brand);
}

.agent-input::placeholder {
  color: var(--c-text-50);
}

.agent-send {
  flex-shrink: 0;
  width: 42px;
  height: 42px;
  border: none;
  border-radius: 50%;
  background: var(--c-brand);
  color: var(--c-brand-foreground);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 200ms ease, transform 200ms ease;
}

.agent-send:hover {
  background: var(--c-brand-dark);
  transform: scale(1.05);
}

.agent-send:focus-visible {
  outline: 2px solid var(--c-focus);
  outline-offset: 2px;
}

.agent-stop {
  background: #e05a4f;
}

.agent-stop:hover {
  background: #d04840;
  transform: scale(1.05);
}

.typing {
  color: var(--c-text-60);
  animation: blink 1.2s ease-in-out infinite;
}

@keyframes blink {
  0%, 100% { opacity: 0.4; }
  50% { opacity: 1; }
}

@media (prefers-reduced-motion: reduce) {
  .agent-overlay,
  .agent-panel { animation: none !important; }
  .agent-fab,
  .agent-send { transition: none !important; }
}
</style>
