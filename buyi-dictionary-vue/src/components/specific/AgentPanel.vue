<script setup>
import { ref, watch, nextTick, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAgentStore } from '@/stores/agent'

const route = useRoute()
const agentStore = useAgentStore()

// 将导览员返回的轻量 Markdown 渲染为 HTML
// 处理：代码块/行内代码、加粗、斜体、标题、无序列表、换行
// 输入来自受控系统提示词下的 DeepSeek，先转义 HTML 再还原标题/加粗等标签
function renderMarkdown(text) {
  if (!text) return ''
  let html = String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
  // 行内代码 `code`
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>')
  // 加粗 **text** 或 __text__
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
  html = html.replace(/__([^_]+)__/g, '<strong>$1</strong>')
  // 斜体 *text*（避开已处理的 **）
  html = html.replace(/(^|[^*])\*([^*\s][^*]*?)\*(?!\*)/g, '$1<em>$2</em>')
  // 标题 ### / ## / # → 加粗
  html = html.replace(/^#{1,6}\s+(.+)$/gm, '<strong>$1</strong>')
  // 无序列表 * / - / + → 项目符号
  html = html.replace(/^\s*[-*+]\s+/gm, '• ')
  // 压缩连续空行（模型分点输出常带 \n\n，避免气泡内出现大段空白）
  html = html.replace(/(\s*\n){2,}/g, '\n')
  // 换行
  html = html.replace(/\n/g, '<br>')
  return html
}

const inputRef = ref(null)
const listRef = ref(null)
const panelRef = ref(null)
const draft = ref('')
let lastFocus = null

// 首页欢迎气泡：仅进入首页时在悬浮球旁弹出一条消息
const showGreeting = ref(false)
let greetingTimer = null

watch(() => route.path, (p) => {
  if (p === '/') {
    showGreeting.value = true
    clearTimeout(greetingTimer)
    greetingTimer = setTimeout(() => { showGreeting.value = false }, 6000)
  } else {
    showGreeting.value = false
  }
}, { immediate: true })

function dismissGreeting() {
  showGreeting.value = false
  clearTimeout(greetingTimer)
}

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
  dismissGreeting()
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
  clearTimeout(greetingTimer)
  agentStore.close()
})
</script>

<template>
  <!-- 首页欢迎气泡：悬浮球旁弹出一条导览员消息 -->
  <Transition name="greet">
    <div v-if="showGreeting && !agentStore.isOpen" class="agent-greeting" role="status">
      <p class="greet-text">你好，我是 AI 导览员，可以为你讲解布依语词汇、民歌、谚语与民俗。</p>
      <button class="greet-close" type="button" aria-label="关闭提示" @click="dismissGreeting">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
          <line x1="18" y1="6" x2="6" y2="18"/>
          <line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    </div>
  </Transition>

  <!-- 悬浮入口按钮：全站可见 -->
  <button
    class="agent-fab"
    type="button"
    :aria-expanded="agentStore.isOpen"
    aria-controls="agent-panel"
    aria-label="打开布依文化导览员"
    @click="togglePanel"
  >
    <svg width="42" height="42" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path fill="currentColor" d="M512 64c259.2 0 469.333333 200.576 469.333333 448s-210.133333 448-469.333333 448a484.48 484.48 0 0 1-232.725333-58.88l-116.394667 50.645333a42.666667 42.666667 0 0 1-58.517333-49.002666l29.76-125.013334C76.629333 703.402667 42.666667 611.477333 42.666667 512 42.666667 264.576 252.8 64 512 64z m0 64C287.488 128 106.666667 300.586667 106.666667 512c0 79.573333 25.557333 155.434667 72.554666 219.285333l5.525334 7.317334 18.709333 24.192-26.965333 113.237333 105.984-46.08 27.477333 15.018667C370.858667 878.229333 439.978667 896 512 896c224.512 0 405.333333-172.586667 405.333333-384S736.512 128 512 128z m-157.696 341.333333a42.666667 42.666667 0 1 1 0 85.333334 42.666667 42.666667 0 0 1 0-85.333334z m159.018667 0a42.666667 42.666667 0 1 1 0 85.333334 42.666667 42.666667 0 0 1 0-85.333334z m158.997333 0a42.666667 42.666667 0 1 1 0 85.333334 42.666667 42.666667 0 0 1 0-85.333334z"/>
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
            <svg width="26" height="26" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
              <path fill="currentColor" d="M512 64c259.2 0 469.333333 200.576 469.333333 448s-210.133333 448-469.333333 448a484.48 484.48 0 0 1-232.725333-58.88l-116.394667 50.645333a42.666667 42.666667 0 0 1-58.517333-49.002666l29.76-125.013334C76.629333 703.402667 42.666667 611.477333 42.666667 512 42.666667 264.576 252.8 64 512 64z m0 64C287.488 128 106.666667 300.586667 106.666667 512c0 79.573333 25.557333 155.434667 72.554666 219.285333l5.525334 7.317334 18.709333 24.192-26.965333 113.237333 105.984-46.08 27.477333 15.018667C370.858667 878.229333 439.978667 896 512 896c224.512 0 405.333333-172.586667 405.333333-384S736.512 128 512 128z m-157.696 341.333333a42.666667 42.666667 0 1 1 0 85.333334 42.666667 42.666667 0 0 1 0-85.333334z m159.018667 0a42.666667 42.666667 0 1 1 0 85.333334 42.666667 42.666667 0 0 1 0-85.333334z m158.997333 0a42.666667 42.666667 0 1 1 0 85.333334 42.666667 42.666667 0 0 1 0-85.333334z"/>
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
            <template v-if="msg.text"><span class="msg-text-content" v-html="renderMarkdown(msg.text)"></span></template>
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
  right: 56px;
  bottom: 96px;
  z-index: 90;
  width: 64px;
  height: 64px;
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

/* 首页欢迎气泡：半透明底 + 毛玻璃模糊，既协调又保证文字可读 */
.agent-greeting {
  position: fixed;
  right: 136px;
  bottom: 108px;
  z-index: 89;
  max-width: min(300px, 60vw);
  padding: 12px 16px;
  border-radius: 14px;
  display: flex;
  align-items: flex-start;
  gap: 10px;
  background: rgba(255, 255, 255, 0.45);
  border: 1px solid rgba(212, 136, 58, 0.25);
  box-shadow: 0 4px 14px rgba(27, 58, 92, 0.10), 0 1px 3px rgba(27, 58, 92, 0.06);
  backdrop-filter: blur(10px) saturate(1.2);
  -webkit-backdrop-filter: blur(10px) saturate(1.2);
}

.greet-text {
  margin: 0;
  font-size: 0.86rem;
  line-height: 1.5;
  color: var(--c-text);
}

.greet-close {
  flex-shrink: 0;
  border: none;
  background: none;
  padding: 2px;
  color: var(--c-text-70);
  cursor: pointer;
  border-radius: 4px;
  line-height: 0;
}

.greet-close:hover {
  color: var(--c-text);
}

[data-theme="dark"] .agent-greeting {
  background: rgba(38, 49, 61, 0.45);
  border-color: rgba(224, 168, 90, 0.30);
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.35), 0 1px 3px rgba(0, 0, 0, 0.25);
}

/* 弹出/收起过渡 */
.greet-enter-active,
.greet-leave-active {
  transition: opacity 280ms ease, transform 280ms cubic-bezier(0.32, 0.72, 0, 1);
}

.greet-enter-from,
.greet-leave-to {
  opacity: 0;
  transform: translateY(8px);
}

@media (max-width: 768px) {
  .agent-fab {
    right: 40px;
    bottom: 150px;
  }

  .agent-greeting {
    right: 116px;
    bottom: 162px;
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

.msg-text-content :deep(strong) {
  font-weight: 600;
}

.msg-text-content :deep(em) {
  font-style: italic;
}

.msg-text-content :deep(code) {
  padding: 1px 5px;
  border-radius: 4px;
  background: rgba(58, 107, 140, 0.12);
  font-family: var(--font-mono, monospace);
  font-size: 0.92em;
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
