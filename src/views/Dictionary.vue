<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import SearchBar from '@/components/common/SearchBar.vue'
import PageShell from '@/components/common/PageShell.vue'
import { searchApi, recordsApi } from '@/utils/api'
import { useFavoritesStore } from '@/stores/favorites'
import { useAuthStore } from '@/stores/auth'
import { useAgentStore } from '@/stores/agent'
import imgBg from '@/assets/images/bg-vocabulary.jpg'

const route = useRoute()
const router = useRouter()
const favoritesStore = useFavoritesStore()
const authStore = useAuthStore()
const agentStore = useAgentStore()
const searchQuery = ref(route.query.q || '')
const activeFilter = ref(route.query.type || 'all')
const isLoading = ref(false)
const allResults = ref([])
const selectedId = ref(null)
const listRef = ref(null)
const actionMsg = ref('')

const filters = [
  { key: 'all', label: '全部' },
  { key: 'word', label: '词汇' },
  { key: 'phrase', label: '短语' },
  { key: 'proverb', label: '谚语' }
]

// 筛选类型映射到后端 contentType
const typeToContentType = {
  word: 'dictionary',
  phrase: 'phrase',
  proverb: 'proverb'
}

// 将后端综合搜索结果映射为统一格式
function mapResults(data) {
  const mapped = []
  ;(data.dictionary || []).forEach(item => mapped.push({
    id: 'word-' + item.id, type: 'word', rawId: item.id,
    bouyei: item.buyiText, chinese: item.zhText, english: item.enText,
    phonetic: item.description || '', example: item.description || ''
  }))
  ;(data.phrases || []).forEach(item => mapped.push({
    id: 'phrase-' + item.id, type: 'phrase', rawId: item.id,
    bouyei: item.buyiText, chinese: item.zhText, english: item.enText,
    phonetic: '', example: item.description || ''
  }))
  ;(data.proverbs || []).forEach(item => mapped.push({
    id: 'proverb-' + item.id, type: 'proverb', rawId: item.id,
    bouyei: item.buyiText, chinese: item.zhText, english: item.enText,
    phonetic: '', example: item.description || ''
  }))
  return mapped
}

async function fetchResults() {
  isLoading.value = true
  try {
    const data = await searchApi.search({ keyword: searchQuery.value })
    allResults.value = mapResults(data)
    // 默认选中第一个结果
    selectedId.value = filteredResults.value[0]?.id || null
  } catch (e) {
    console.error('搜索失败', e)
    allResults.value = []
    selectedId.value = null
  } finally {
    isLoading.value = false
    nextTick(revealItems)
  }
}

const filteredResults = computed(() => {
  let results = allResults.value
  if (activeFilter.value !== 'all') {
    results = results.filter(item => item.type === activeFilter.value)
  }
  return results
})

const selectedItem = computed(() => {
  return filteredResults.value.find(r => r.id === selectedId.value) || null
})

const getTypeLabel = (type) => {
  const labels = { word: '词汇', phrase: '短语', proverb: '谚语' }
  return labels[type] || type
}

function selectItem(item) {
  selectedId.value = item.id
}

// 收藏切换
async function handleFavorite(item) {
  if (!authStore.isLoggedIn) {
    actionMsg.value = '请先登录后再收藏'
    clearMsg()
    return
  }
  try {
    const contentType = typeToContentType[item.type] || 'dictionary'
    await favoritesStore.toggleFavorite(contentType, item.rawId)
    actionMsg.value = '已更新收藏'
  } catch (e) {
    actionMsg.value = '操作失败，请重试'
  }
  clearMsg()
}

// 加入学习记录
async function handleLearn(item) {
  if (!authStore.isLoggedIn) {
    actionMsg.value = '请先登录后再记录学习'
    clearMsg()
    return
  }
  try {
    const contentType = typeToContentType[item.type] || 'dictionary'
    await recordsApi.create({ contentType, contentId: item.rawId, actionType: 'view' })
    actionMsg.value = '已加入学习记录'
  } catch (e) {
    actionMsg.value = '操作失败，请重试'
  }
  clearMsg()
}

// 播放发音（占位：后端暂无 TTS，提示用户）
function handlePlay(item) {
  actionMsg.value = '发音功能即将上线'
  clearMsg()
}

// 唤起智能体解释当前词条
function handleAskAgent(item) {
  const word = item.bouyei || item.chinese || ''
  agentStore.ask(`请解释"${word}"这个词`, '/dictionary')
}

function clearMsg() {
  setTimeout(() => { actionMsg.value = '' }, 2500)
}

// 筛选变化时同步 URL
function setFilter(key) {
  activeFilter.value = key
  router.replace({
    query: {
      ...route.query,
      type: key === 'all' ? undefined : key
    }
  })
}

// 滚动入场：IntersectionObserver，transform/opacity only
let observer = null
function revealItems() {
  if (!listRef.value || !observer) return
  const els = listRef.value.querySelectorAll('.reveal-on-scroll:not(.is-visible)')
  for (const el of els) observer.observe(el)
}

onMounted(() => {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (!reduce) {
    observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible')
          observer.unobserve(entry.target)
        }
      }
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' })
  }
  fetchResults()
})

onUnmounted(() => {
  if (observer) observer.disconnect()
  if (debounceTimer) clearTimeout(debounceTimer)
})

// 筛选结果变化时，若当前选中项已被过滤掉，则自动选中第一项
watch(filteredResults, (results) => {
  if (results.length === 0) {
    selectedId.value = null
  } else if (!results.find(r => r.id === selectedId.value)) {
    selectedId.value = results[0].id
  }
})

watch(() => route.query.q, (newQuery) => {
  if (newQuery !== undefined) {
    searchQuery.value = newQuery || ''
    fetchResults()
  }
})

// 搜索框内容变化时延迟搜索
let debounceTimer = null
watch(searchQuery, () => {
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    // 同步搜索关键词到 URL，支持分享与后退
    router.replace({
      query: {
        ...route.query,
        q: searchQuery.value || undefined
      }
    })
    fetchResults()
  }, 400)
})
</script>

<template>
  <PageShell
    :bg-image="imgBg"
    title="词典查询"
    subtitle="搜索布依语词汇、短语与谚语"
    overlay-style="cool"
    pattern-type="batik"
  >
    <main id="main">
      <h1 class="sr-only">词典搜索</h1>

      <!-- 搜索区域 -->
      <section class="search-section">
        <div class="search-wrapper">
          <SearchBar
            v-model="searchQuery"
            placeholder="搜索布依语词汇、短语、谚语…"
          />

          <div class="search-meta">
            <div class="filter-pills liquid-glass">
              <button
                v-for="filter in filters"
                :key="filter.key"
                class="filter-btn"
                :class="{ active: activeFilter === filter.key }"
                :aria-pressed="activeFilter === filter.key"
                @click="setFilter(filter.key)"
              >
                {{ filter.label }}
              </button>
            </div>
            <p class="result-count" aria-live="polite">{{ filteredResults.length }} 个结果</p>
          </div>
        </div>
      </section>

      <!-- 阅读型双栏：左列表 + 右详情 -->
      <section class="results-section">
        <!-- 左：结果列表 -->
        <div ref="listRef" class="results-list" role="region" aria-label="搜索结果列表">
          <p v-if="isLoading" class="loading-hint">加载中…</p>
          <p v-else-if="filteredResults.length === 0" class="loading-hint">暂无结果</p>
          <button
            v-for="result in filteredResults"
            :key="result.id"
            type="button"
            class="result-item reveal-on-scroll"
            :class="{ 'is-selected': result.id === selectedId }"
            :aria-pressed="result.id === selectedId"
            @click="selectItem(result)"
          >
            <span :class="['result-type', 'type-' + result.type]">
              {{ getTypeLabel(result.type) }}
            </span>
            <span class="result-bouyei">{{ result.bouyei }}</span>
            <span v-if="result.phonetic" class="result-phonetic">{{ result.phonetic }}</span>
            <span class="result-chinese">{{ result.chinese }}</span>
          </button>
        </div>

        <!-- 右：选中条目详情卡（阅读型） -->
        <aside class="detail-panel liquid-glass glow-card" aria-label="词条详情">
          <div class="glow-effect"></div>
          <div v-if="selectedItem" class="detail-content">
            <span :class="['result-type', 'type-' + selectedItem.type]">
              {{ getTypeLabel(selectedItem.type) }}
            </span>
            <h2 class="detail-bouyei">{{ selectedItem.bouyei }}</h2>
            <p v-if="selectedItem.phonetic" class="detail-phonetic">{{ selectedItem.phonetic }}</p>
            <dl class="detail-fields">
              <div class="detail-field">
                <dt>中文释义</dt>
                <dd>{{ selectedItem.chinese }}</dd>
              </div>
              <div v-if="selectedItem.english" class="detail-field">
                <dt>英文</dt>
                <dd>{{ selectedItem.english }}</dd>
              </div>
              <div v-if="selectedItem.example" class="detail-field">
                <dt>例句/说明</dt>
                <dd class="detail-example">{{ selectedItem.example }}</dd>
              </div>
            </dl>
            <div v-if="actionMsg" class="action-msg" aria-live="polite">{{ actionMsg }}</div>
            <div class="detail-actions">
              <button class="action-btn" aria-label="播放发音" @click="handlePlay(selectedItem)">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <polygon points="5 3 19 12 5 21 5 3"/>
                </svg>
                <span>播放</span>
              </button>
              <button class="action-btn" aria-label="收藏" @click="handleFavorite(selectedItem)">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                </svg>
                <span>收藏</span>
              </button>
              <button class="action-btn" aria-label="加入学习" @click="handleLearn(selectedItem)">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <path d="M12 20h9"/>
                  <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
                </svg>
                <span>加入学习</span>
              </button>
              <button class="action-btn" aria-label="让导览员解释这个词" @click="handleAskAgent(selectedItem)">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
                  <line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
                <span>解释</span>
              </button>
            </div>
          </div>
          <div v-else class="detail-empty">
            <p>点击左侧条目查看详情</p>
          </div>
        </aside>
      </section>
    </main>
  </PageShell>
</template>

<style scoped>
.search-section {
  padding: 0 0 32px;
  display: flex;
  justify-content: center;
}

.search-wrapper {
  width: 100%;
  max-width: 760px;
}

.search-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 20px;
  flex-wrap: wrap;
  gap: 12px;
}

.filter-pills {
  display: inline-flex;
  align-items: center;
  padding: 4px;
  border-radius: 999px;
}

.filter-btn {
  padding: 6px 16px;
  border: none;
  border-radius: 999px;
  background: transparent;
  color: var(--c-text-60);
  font: 500 13px var(--font-sans);
  cursor: pointer;
  transition: color 150ms ease, background 150ms ease;
}

.filter-btn:hover {
  color: var(--c-text);
}

.filter-btn:focus-visible {
  outline: 2px solid var(--c-brand);
  outline-offset: 2px;
}

.filter-btn.active {
  background: var(--c-brand);
  color: var(--c-white);
}

.result-count {
  font-size: 13px;
  color: var(--c-text-50);
  margin: 0;
  font-variant-numeric: tabular-nums;
}

/* ===== 阅读型双栏 ===== */
.results-section {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1.1fr);
  gap: 32px;
  max-width: 1200px;
  margin: 0 auto;
  align-items: start;
}

@media (max-width: 900px) {
  .results-section {
    grid-template-columns: 1fr;
  }
}

.results-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
  max-height: 70vh;
  overflow-y: auto;
  overscroll-behavior: contain;
  scrollbar-width: thin;
  scrollbar-color: var(--c-brand-40) transparent;
  padding-right: 4px;
}

.results-list::-webkit-scrollbar { width: 5px; }
.results-list::-webkit-scrollbar-thumb {
  background: var(--c-brand-40);
  border-radius: 3px;
}

.loading-hint {
  padding: 32px 20px;
  text-align: center;
  color: var(--c-text-60);
  font-size: 14px;
  margin: 0;
}

/* 列表项：阅读型，大行高，无 card chrome */
.result-item {
  display: block;
  width: 100%;
  padding: 18px 20px;
  border: none;
  border-left: 3px solid transparent;
  border-radius: 12px;
  background: transparent;
  color: inherit;
  font: inherit;
  text-align: left;
  cursor: pointer;
  transition: background 160ms ease, border-color 160ms ease;
  outline: none;
}

.result-item:hover {
  background: var(--c-brand-06);
}

.result-item:focus-visible {
  outline: 2px solid var(--c-brand);
  outline-offset: -2px;
}

.result-item.is-selected {
  background: var(--c-brand-08);
  border-left-color: var(--c-brand);
}

.result-type {
  display: inline-block;
  padding: 2px 9px;
  border-radius: 999px;
  font: 600 10px var(--font-sans);
  letter-spacing: 0.03em;
  margin-bottom: 8px;
}

.type-word { background: var(--c-brand); color: var(--c-white); }
.type-phrase { background: var(--c-accent); color: var(--c-white); }
.type-proverb { background: var(--c-brand-light); color: var(--c-white); }

.result-bouyei {
  display: block;
  font-size: 20px;
  font-weight: 600;
  color: var(--c-text);
  margin: 0 0 3px 0;
  line-height: 1.3;
}

.result-phonetic {
  display: block;
  font-size: 12px;
  color: var(--c-brand-light);
  margin: 0 0 4px 0;
  font-family: var(--font-mono);
}

.result-chinese {
  display: block;
  font-size: 14px;
  color: var(--c-text-70);
  margin: 0;
  line-height: 1.5;
}

/* ===== 右侧详情面板（阅读型） ===== */
.detail-panel {
  position: sticky;
  top: 88px;
  padding: 36px 36px 32px;
  min-height: 320px;
}

.detail-content {
  position: relative;
}

.detail-bouyei {
  font-size: 36px;
  font-weight: 600;
  color: var(--c-text);
  margin: 8px 0 6px 0;
  line-height: 1.2;
  letter-spacing: -0.01em;
}

.detail-phonetic {
  font-size: 14px;
  color: var(--c-brand-light);
  font-family: var(--font-mono);
  margin: 0 0 24px 0;
}

.detail-fields {
  margin: 0 0 28px 0;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.detail-field dt {
  font: 500 11px var(--font-mono);
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--c-text-50);
  margin-bottom: 6px;
}

.detail-field dd {
  margin: 0;
  font-size: 16px;
  color: var(--c-text);
  line-height: 1.6;
}

.detail-example {
  font-style: italic;
  color: var(--c-text-70);
  padding-left: 14px;
  border-left: 2px solid var(--c-brand-25);
}

.detail-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.action-msg {
  font-size: 13px;
  color: var(--c-brand);
  margin: 0 0 12px 0;
  padding: 8px 14px;
  background: var(--c-brand-06);
  border-radius: 8px;
}

.action-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 18px;
  border: 1px solid var(--c-brand-25);
  border-radius: 999px;
  background: var(--c-white-50);
  color: var(--c-text-70);
  font: 500 13px var(--font-sans);
  cursor: pointer;
  transition: background 150ms ease, color 150ms ease, border-color 150ms ease;
}

.action-btn:hover {
  background: var(--c-brand-08);
  color: var(--c-brand);
  border-color: var(--c-brand-25);
}

.action-btn:focus-visible {
  outline: 2px solid var(--c-brand);
  outline-offset: 2px;
}

.detail-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 280px;
  color: var(--c-text-50);
  font-size: 14px;
}

/* ===== 滚动入场 ===== */
.reveal-on-scroll {
  opacity: 0;
  transform: translateY(16px);
  transition: opacity 420ms cubic-bezier(0.22, 1, 0.36, 1),
              transform 420ms cubic-bezier(0.22, 1, 0.36, 1);
}

.reveal-on-scroll.is-visible {
  opacity: 1;
  transform: translateY(0);
}

@media (prefers-reduced-motion: reduce) {
  .reveal-on-scroll {
    opacity: 1 !important;
    transform: none !important;
    transition: none !important;
  }
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
</style>
