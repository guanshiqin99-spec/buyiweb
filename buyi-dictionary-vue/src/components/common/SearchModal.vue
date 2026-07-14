<script setup>
import { ref, computed, watch, nextTick, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { searchApi } from '@/utils/api'
import IconSearch from '@/components/icons/IconSearch.vue'
import IconClose from '@/components/icons/IconClose.vue'

const props = defineProps({
  isOpen: { type: Boolean, default: false }
})
const emit = defineEmits(['close'])

const router = useRouter()
const query = ref('')
const results = ref({ dictionary: [], phrases: [], proverbs: [], songs: [] })
const isLoading = ref(false)
const inputRef = ref(null)
const listRef = ref(null)
const modalRef = ref(null)

// 键盘导航：flatItems 是拍平后的可导航列表，activeIndex 对应 draft 的 items[]
const flatItems = ref([])
const activeIndex = ref(-1)
let lastFocus = null
let reqId = 0

const FOCUSABLE_SELECTOR = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'

// 最近搜索（localStorage，try/catch 静默兜底）
const RECENT_KEY = 'buyi_recent_searches'
const RECENT_MAX = 6
const recentSearches = ref([])
const historyStatus = ref('')

// 热门搜索词（后端基于学习记录聚合，失败静默忽略）
const hotSearches = ref([])

async function fetchHot() {
  try {
    const data = await searchApi.hot()
    // 兼容字符串数组或 { keyword } 对象数组
    const arr = Array.isArray(data) ? data : (data?.items || data?.list || [])
    hotSearches.value = arr.slice(0, 8).map(it => {
      if (typeof it === 'string') return it
      return it.keyword || it.word || it.text || ''
    }).filter(Boolean)
  } catch (e) {
    hotSearches.value = []
  }
}

function getRecent() {
  try {
    const raw = localStorage.getItem(RECENT_KEY)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed.filter((item) => typeof item === 'string' && item.trim()) : []
  } catch (e) { return [] }
}
function saveRecent(kw) {
  try {
    let list = getRecent()
    const idx = list.indexOf(kw)
    if (idx >= 0) list.splice(idx, 1)
    list.unshift(kw)
    if (list.length > RECENT_MAX) list = list.slice(0, RECENT_MAX)
    localStorage.setItem(RECENT_KEY, JSON.stringify(list))
  } catch (e) { /* localStorage 不可用时静默忽略 */ }
}

function updateRecent(list) {
  recentSearches.value = list
  try {
    if (list.length) localStorage.setItem(RECENT_KEY, JSON.stringify(list))
    else localStorage.removeItem(RECENT_KEY)
  } catch (e) { /* localStorage 不可用时仍更新当前界面 */ }
}

function removeRecent(kw) {
  updateRecent(recentSearches.value.filter((item) => item !== kw))
  historyStatus.value = `已删除搜索记录“${kw}”`
}

function clearRecent() {
  updateRecent([])
  historyStatus.value = '已清空全部搜索记录'
}

// 防抖搜索 + 竞态保护
let debounceTimer = null
watch(query, (val) => {
  if (debounceTimer) clearTimeout(debounceTimer)
  activeIndex.value = -1
  if (!val.trim()) {
    flatItems.value = []
    results.value = { dictionary: [], phrases: [], proverbs: [], songs: [] }
    recentSearches.value = getRecent()
    return
  }
  debounceTimer = setTimeout(async () => {
    isLoading.value = true
    const id = ++reqId
    try {
      const data = await searchApi.suggest(val.trim())
      if (id !== reqId) return // 过期请求丢弃
      results.value = data
      rebuildFlatItems(data)
    } catch (e) {
      if (id !== reqId) return
      console.error('搜索失败', e)
      results.value = { dictionary: [], phrases: [], proverbs: [], songs: [] }
      flatItems.value = []
    } finally {
      if (id === reqId) isLoading.value = false
    }
  }, 300)
})

// 把分组结果拍平为单一可导航列表（分组标题作为分隔节点不占 activeIndex）
function rebuildFlatItems(data) {
  const flat = []
  const groups = [
    { key: 'dictionary', label: '词汇' },
    { key: 'phrases', label: '短语' },
    { key: 'proverbs', label: '谚语' },
    { key: 'songs', label: '民歌' }
  ]
  let remaining = 8
  for (const g of groups) {
    const arr = (data[g.key] || []).slice(0, remaining)
    if (!arr.length) continue
    flat.push({ type: 'title', label: g.label })
    for (const it of arr) flat.push({ type: 'item', data: it, group: g.key })
    remaining -= arr.length
    if (!remaining) break
  }
  flatItems.value = flat
  activeIndex.value = -1
}

// 弹窗打开/关闭
watch(() => props.isOpen, (open) => {
  if (open) {
    lastFocus = document.activeElement
    query.value = ''
    recentSearches.value = getRecent()
    fetchHot()
    nextTick(() => inputRef.value?.focus())
  } else {
    activeIndex.value = -1
    flatItems.value = []
    if (lastFocus && typeof lastFocus.focus === 'function') {
      nextTick(() => lastFocus.focus())
    }
  }
})

onUnmounted(() => {
  if (debounceTimer) clearTimeout(debounceTimer)
})

// 键盘事件：↑↓ 导航 / Enter 选中 / Tab 焦点陷阱 / Esc 关闭
function handleKeydown(e) {
  if (e.key === 'Escape') {
    e.preventDefault()
    emit('close')
  } else if (e.key === 'ArrowDown') {
    e.preventDefault()
    moveActive(1)
  } else if (e.key === 'ArrowUp') {
    e.preventDefault()
    moveActive(-1)
  } else if (e.key === 'Enter') {
    e.preventDefault()
    selectActive()
  } else if (e.key === 'Tab') {
    trapFocus(e)
  }
}

function trapFocus(e) {
  if (!modalRef.value) return
  const focusables = Array.from(modalRef.value.querySelectorAll(FOCUSABLE_SELECTOR))
    .filter((el) => !el.disabled)
  if (focusables.length === 0) return
  const first = focusables[0]
  const last = focusables[focusables.length - 1]
  if (e.shiftKey && document.activeElement === first) {
    e.preventDefault()
    last.focus()
  } else if (!e.shiftKey && document.activeElement === last) {
    e.preventDefault()
    first.focus()
  }
}

function moveActive(delta) {
  const itemIndexes = flatItems.value
    .map((f, i) => (f.type === 'item' ? i : -1))
    .filter((i) => i >= 0)
  if (!itemIndexes.length) return
  const curPos = itemIndexes.indexOf(activeIndex.value)
  let nextPos
  if (delta > 0) {
    nextPos = curPos < itemIndexes.length - 1 ? curPos + 1 : 0
  } else {
    nextPos = curPos > 0 ? curPos - 1 : itemIndexes.length - 1
  }
  activeIndex.value = itemIndexes[nextPos]
  updateActive()
}

function updateActive() {
  if (!listRef.value) return
  const els = listRef.value.querySelectorAll('.suggestion-item')
  for (let i = 0; i < els.length; i++) {
    if (els[i].getAttribute('data-idx') === String(activeIndex.value)) {
      els[i].classList.add('is-active')
      els[i].scrollIntoView({ block: 'nearest', inline: 'nearest' })
    } else {
      els[i].classList.remove('is-active')
    }
  }
}

function selectActive() {
  if (activeIndex.value >= 0 && flatItems.value[activeIndex.value]?.type === 'item') {
    const it = flatItems.value[activeIndex.value].data
    submitSearch(it.zhText || it.buyiText || it.title || '')
  } else if (query.value.trim()) {
    submitSearch(query.value.trim())
  }
}

function selectResult(item) {
  submitSearch(item.zhText || item.buyiText || item.title || '')
}

function selectRecent(kw) {
  query.value = kw
  nextTick(() => inputRef.value?.focus())
}

function submitSearch(kw) {
  if (!kw) return
  saveRecent(kw)
  router.push({ path: '/dictionary', query: { q: kw } })
  emit('close')
}

const hasResults = computed(() => flatItems.value.some((f) => f.type === 'item'))
const listboxId = 'search-modal-listbox'
const activeDescendantId = computed(() =>
  activeIndex.value >= 0 && flatItems.value[activeIndex.value]?.type === 'item'
    ? optionId(activeIndex.value)
    : undefined
)

// 联想项主文案与副文案（兼容 songs 的 title/artist 字段）
function primary(item) {
  return item.buyiText || item.title || ''
}
function secondary(item) {
  return item.zhText || item.artist || item.description || ''
}

function optionId(idx) {
  return `search-option-${idx}`
}
</script>

<template>
  <div
    v-if="isOpen"
    ref="modalRef"
    class="search-modal-overlay"
    role="dialog"
    aria-modal="true"
    aria-label="词典搜索"
    @click.self="emit('close')"
  >
    <div
      class="search-modal liquid-glass liquid-glass-hero"
      @keydown="handleKeydown"
    >
      <!-- 输入区 -->
      <div class="search-modal-input-wrap search-glow">
        <span class="search-icon" aria-hidden="true">
          <IconSearch :size="22" />
        </span>
        <label class="sr-only" for="search-modal-input">搜索布依语词汇</label>
        <input
          id="search-modal-input"
          ref="inputRef"
          v-model="query"
          type="text"
          name="q"
          class="search-modal-input"
          placeholder="搜索布依语词汇、短语、谚语、民歌…"
          autocomplete="off"
          spellcheck="false"
          aria-label="搜索布依语词汇"
          aria-autocomplete="list"
          :aria-controls="listboxId"
          :aria-activedescendant="activeDescendantId"
        />
        <kbd class="search-kbd">ESC</kbd>
      </div>

      <!-- 联想列表 -->
      <div
        ref="listRef"
        :id="listboxId"
        class="suggestion-list"
        role="listbox"
        aria-label="联想词"
      >
        <p v-if="isLoading" class="suggestion-empty" aria-live="polite">加载中…</p>
        <template v-else-if="query.trim()">
          <p v-if="!hasResults" class="suggestion-empty" aria-live="polite">未找到匹配结果</p>
          <template v-else>
            <template v-for="(f, idx) in flatItems" :key="idx">
              <p v-if="f.type === 'title'" class="suggestion-group-title">{{ f.label }}</p>
              <button
                v-else
                type="button"
                class="suggestion-item"
                role="option"
                :id="optionId(idx)"
                :aria-selected="idx === activeIndex"
                :data-idx="idx"
                :class="{ 'is-active': idx === activeIndex }"
                @click="selectResult(f.data)"
                @mouseenter="activeIndex = idx"
              >
                <span class="suggestion-item-buyi">{{ primary(f.data) }}</span>
                <span class="suggestion-item-zh">{{ secondary(f.data) }}</span>
              </button>
            </template>
          </template>
        </template>
        <!-- 空输入：最近搜索 / 热门搜索 / 引导文案 -->
        <template v-else>
          <div v-if="recentSearches.length" class="recent-section">
            <div class="recent-heading">
              <p class="recent-title">最近搜索</p>
              <button type="button" class="recent-clear" @click="clearRecent">清空全部</button>
            </div>
            <div class="recent-list">
              <span v-for="kw in recentSearches" :key="kw" class="recent-chip">
                <button type="button" class="recent-item" @click="selectRecent(kw)">{{ kw }}</button>
                <button type="button" class="recent-remove" :aria-label="`删除搜索记录“${kw}”`" @click="removeRecent(kw)">
                  <IconClose :size="14" aria-hidden="true" />
                </button>
              </span>
            </div>
          </div>
          <p class="sr-only" aria-live="polite">{{ historyStatus }}</p>
          <div v-if="hotSearches.length" class="hot-section">
            <p class="recent-title">热门搜索</p>
            <div class="hot-list">
              <button
                v-for="(kw, i) in hotSearches"
                :key="i"
                type="button"
                class="hot-item"
                @click="selectRecent(kw)"
              >
                <span class="hot-rank" :class="{ 'hot-rank-top': i < 3 }">{{ i + 1 }}</span>
                <span class="hot-text">{{ kw }}</span>
              </button>
            </div>
          </div>
          <p v-if="!recentSearches.length && !hotSearches.length" class="suggestion-empty">输入布依语或中文开始查词…</p>
        </template>
      </div>

      <!-- 底部提示 -->
      <div class="search-modal-footer">
        <span>↑↓ 导航</span>
        <span>Enter 查询</span>
        <span>Esc 关闭</span>
      </div>
    </div>
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

.search-modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 18vh;
  background: var(--c-modal-overlay);
  backdrop-filter: blur(8px) brightness(0.8);
  -webkit-backdrop-filter: blur(8px) brightness(0.8);
  animation: overlayIn 280ms cubic-bezier(0.22, 1, 0.36, 1);
}

@keyframes overlayIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@supports not (backdrop-filter: blur(8px)) {
  .search-modal-overlay { background: var(--c-modal-overlay-fallback); }
}

.search-modal {
  width: min(640px, calc(100% - 32px));
  max-height: 70vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  --lg-radius: 24px;
  animation: modalIn 280ms cubic-bezier(0.22, 1, 0.36, 1);
}

@keyframes modalIn {
  from { opacity: 0; transform: scale(0.96) translateY(8px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}

.search-modal-input-wrap {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 22px 26px;
  border-bottom: 1px solid var(--c-divider);
}

.search-icon {
  flex-shrink: 0;
  color: var(--c-brand);
}

.search-modal-input {
  flex: 1;
  min-width: 0;
  border: none;
  background: transparent;
  color: var(--c-text);
  font: 400 20px var(--font-sans);
  outline: none;
}

/* 聚焦反馈由外层 .search-glow 的青色光环统一承担，input 内不再画焦点环，避免出现黄色描边 */
.search-modal-input:focus-visible {
  outline: none;
}

/* 覆盖浏览器自动填充的默认黄色背景，保持弹窗搜索框玻璃质感 */
.search-modal-input:-webkit-autofill,
.search-modal-input:-webkit-autofill:hover,
.search-modal-input:-webkit-autofill:focus,
.search-modal-input:-webkit-autofill:active {
  -webkit-text-fill-color: var(--c-text);
  -webkit-box-shadow: 0 0 0 1000px transparent inset;
  transition: background-color 9999s ease-in-out 0s;
}

.search-modal-input::placeholder {
  color: var(--c-text-50);
}

.search-kbd {
  font: 500 12px var(--font-mono);
  color: var(--c-text-60);
  background: var(--c-white-50);
  border: 1px solid var(--c-brand-08);
  border-radius: 6px;
  padding: 2px 8px;
  line-height: 1.4;
  flex-shrink: 0;
}

.suggestion-list {
  overflow-y: auto;
  overscroll-behavior: contain;
  flex: 1;
  padding: 8px 0;
  scrollbar-width: thin;
  scrollbar-color: var(--c-brand-40) transparent;
}

.suggestion-list::-webkit-scrollbar { width: 6px; }
.suggestion-list::-webkit-scrollbar-thumb {
  background: var(--c-brand-40);
  border-radius: 3px;
}

.suggestion-group-title {
  font: 500 11px var(--font-mono);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--c-text-60);
  padding: 12px 26px 6px;
  margin: 0;
}

.suggestion-item {
  width: 100%;
  padding: 12px 26px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  border: none;
  background: transparent;
  color: inherit;
  font: inherit;
  text-align: left;
  cursor: pointer;
  transition: background 160ms ease;
}

.suggestion-item:hover {
  background: var(--c-brand-08);
}

.suggestion-item.is-active {
  background: var(--c-brand-25);
}

.suggestion-item-buyi {
  color: var(--c-text);
  font-size: 15px;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.suggestion-item-zh {
  color: var(--c-text-70);
  font-size: 13px;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.suggestion-empty {
  padding: 28px 26px;
  text-align: center;
  color: var(--c-text-50);
  font: 400 14px var(--font-sans);
  margin: 0;
}

.recent-section {
  padding: 14px 26px 18px;
}

.recent-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 12px;
}

.recent-title {
  font: 500 11px var(--font-mono);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--c-text-60);
  margin: 0;
}

.recent-clear {
  min-height: 32px;
  padding: 0 4px;
  border: 0;
  color: var(--c-text-60);
  background: transparent;
  cursor: pointer;
  font: 600 12px var(--font-sans);
}

.recent-clear:hover { color: var(--c-brand); }
.recent-clear:focus-visible { outline: 2px solid var(--c-focus); outline-offset: 2px; }

.recent-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.recent-chip {
  display: inline-flex;
  overflow: hidden;
  border: 1px solid var(--c-brand-25);
  border-radius: 999px;
  background: var(--c-white-50);
  transition: background 160ms ease, border-color 160ms ease;
}

.recent-chip:hover {
  border-color: var(--c-brand-40);
  background: var(--c-brand-08);
}

.recent-item {
  border: 0;
  background: transparent;
  color: var(--c-text);
  font: 400 13px var(--font-sans);
  padding: 6px 6px 6px 14px;
  cursor: pointer;
}

.recent-remove {
  display: grid;
  width: 34px;
  padding: 0;
  border: 0;
  color: var(--c-text-50);
  background: transparent;
  cursor: pointer;
  place-items: center;
}

.recent-remove:hover { color: var(--c-danger); }

.recent-item:focus-visible,
.recent-remove:focus-visible {
  outline: 2px solid var(--c-focus);
  outline-offset: -2px;
}

/* 热门搜索：纵向带序号列表 */
.hot-section {
  padding: 4px 26px 18px;
  border-top: 1px solid var(--c-divider);
  margin-top: 6px;
}

.hot-section .recent-title { margin-bottom: 12px; }

.hot-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.hot-item {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 9px 8px;
  border: none;
  background: transparent;
  color: var(--c-text);
  font: 400 14px var(--font-sans);
  cursor: pointer;
  border-radius: 6px;
  text-align: left;
  transition: background 160ms ease;
}

.hot-item:hover {
  background: var(--c-brand-08);
}

.hot-item:focus-visible {
  outline: 2px solid var(--c-focus);
  outline-offset: 2px;
}

.hot-rank {
  flex-shrink: 0;
  width: 20px;
  text-align: center;
  font: 600 13px var(--font-mono);
  color: var(--c-text-50);
  font-variant-numeric: tabular-nums;
}

.hot-rank-top {
  color: var(--c-accent);
}

.hot-text {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.search-modal-footer {
  padding: 10px 26px;
  border-top: 1px solid var(--c-divider);
  font: 400 12px var(--font-mono);
  color: var(--c-text-50);
  display: flex;
  gap: 16px;
}

@media (max-width: 768px) {
  .search-modal { max-height: 76vh; }
  .search-modal-overlay { padding-top: 12vh; }
  .search-kbd { display: none; }
}

@media (prefers-reduced-motion: reduce) {
  .search-modal-overlay,
  .search-modal { animation: none !important; }
}
</style>
