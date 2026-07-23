<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import SearchBar from '@/components/common/SearchBar.vue'
import SourceBadge from '@/components/common/SourceBadge.vue'
import ShareCard from '@/components/specific/ShareCard.vue'
import { healthApi, searchApi, recordsApi } from '@/utils/api'
import { generateStream } from '@/utils/agentStream'
import { useFavoritesStore } from '@/stores/favorites'
import { useAuthStore } from '@/stores/auth'
import { useAgentStore } from '@/stores/agent'
import IconHeart from '@/components/icons/IconHeart.vue'
import IconVolume from '@/components/icons/IconVolume.vue'
import imgBg from '@/assets/images/generated/dictionary-archive-study.png'
import { getContentLabel } from '../utils/contentTypes'

const route = useRoute()
const router = useRouter()
const favoritesStore = useFavoritesStore()
const authStore = useAuthStore()
const agentStore = useAgentStore()

const searchQuery = ref(String(route.query.q || ''))
const activeFilter = ref(String(route.query.type || 'all'))
const allResults = ref([])
const selectedId = ref(null)
const requestState = ref('idle')
const requestError = ref('')
const serviceState = ref('unknown')
const actionMsg = ref('')
const cacheNotice = ref('')
const bgParallax = ref(0)
const playingId = ref(null)
const shareCardRef = ref(null)
const isSharing = ref(false)
const aiSentenceState = ref({ itemId: '', status: 'idle', content: '' })
const relatedState = ref({ itemId: '', status: 'idle', words: [] })
const relatedCache = new Map()
let sentenceController = null
let relatedController = null
let debounceTimer = null
let requestSequence = 0
let scrollHandler = null
let pronunciationAudio = null
const SEARCH_CACHE_KEY = 'buyi-dictionary-search-cache-v1'
// 本次会话内已记录过浏览的搜索结果，避免同一词条重复写入学习记录
const recordedSearchIds = new Set()

const filters = [
  { key: 'all', label: '全部' },
  { key: 'word', label: getContentLabel('dictionary') },
  { key: 'phrase', label: getContentLabel('phrase') },
  { key: 'proverb', label: getContentLabel('proverb') }
]

function mapResults(data) {
  const mapped = []
  const add = (items, type) => (items || []).forEach((item) => mapped.push({
    id: `${type}-${item.id}`,
    type,
    rawId: item.id,
    bouyei: item.buyiText,
    chinese: item.zhText,
    english: item.enText,
    phonetic: item.description || '',
    example: item.culturalNote || item.description || '',
    audioUrl: item.audioUrl || '',
    relatedExhibits: item.relatedExhibits || [],
    isFavorited: Boolean(item.isFavorited)
  }))
  add(data.dictionary, 'dictionary')
  add(data.phrases, 'phrase')
  add(data.proverbs, 'proverb')
  return mapped
}

const filteredResults = computed(() => {
  if (activeFilter.value === 'all') return allResults.value
  // filters 仍以 word 作为 UI key，这里映射回 API content type
  const apiType = activeFilter.value === 'word' ? 'dictionary' : activeFilter.value
  return allResults.value.filter((item) => item.type === apiType)
})

const selectedItem = computed(() => filteredResults.value.find((item) => item.id === selectedId.value) || null)
const hasQuery = computed(() => Boolean(searchQuery.value.trim()))
const isFavoriteSelected = computed(() => {
  if (!selectedItem.value) return false
  return selectedItem.value.isFavorited
})

// 仅保存接口成功返回的原始词条，离线时不伪造任何文化内容。
function readCachedSearch(keyword) {
  try {
    const cache = JSON.parse(window.localStorage.getItem(SEARCH_CACHE_KEY) || '{}')
    return cache[String(keyword || '').trim()]?.data || null
  } catch {
    return null
  }
}

function saveCachedSearch(keyword, data) {
  const key = String(keyword || '').trim()
  if (!key) return
  try {
    const cache = JSON.parse(window.localStorage.getItem(SEARCH_CACHE_KEY) || '{}')
    cache[key] = { cachedAt: Date.now(), data }
    const entries = Object.entries(cache).sort((a, b) => b[1].cachedAt - a[1].cachedAt).slice(0, 20)
    window.localStorage.setItem(SEARCH_CACHE_KEY, JSON.stringify(Object.fromEntries(entries)))
  } catch {
    // 浏览器禁用存储时仍保持在线查询流程可用。
  }
}

async function runSearch() {
  clearTimeout(debounceTimer)
  router.replace({ query: { ...route.query, q: searchQuery.value.trim() || undefined } })
  const sequence = ++requestSequence
  requestState.value = 'loading'
  requestError.value = ''
  cacheNotice.value = ''
  try {
    const data = await searchApi.search({ keyword: searchQuery.value.trim() })
    if (sequence !== requestSequence) return
    saveCachedSearch(searchQuery.value, data)
    allResults.value = mapResults(data)
    selectedId.value = filteredResults.value[0]?.id || null
    requestState.value = allResults.value.length ? 'ready' : 'empty'
    serviceState.value = 'ready'
    recordSearchView(filteredResults.value[0])
  } catch {
    if (sequence !== requestSequence) return
    const cachedData = readCachedSearch(searchQuery.value)
    if (cachedData) {
      allResults.value = mapResults(cachedData)
      selectedId.value = filteredResults.value[0]?.id || null
      requestState.value = allResults.value.length ? 'ready' : 'empty'
      cacheNotice.value = '词典服务暂不可用，当前展示此前成功加载的本地缓存词条。'
      recordSearchView(filteredResults.value[0])
    } else {
      allResults.value = []
      selectedId.value = null
      requestState.value = 'error'
      requestError.value = '暂时无法连接词典服务。请确认服务已启动后重试。'
    }
    checkService()
  }
}

async function checkService() {
  serviceState.value = 'checking'
  try {
    const readiness = await healthApi.ready()
    serviceState.value = readiness?.status === 'ready' ? 'ready' : 'degraded'
  } catch {
    serviceState.value = 'offline'
  }
}

function scheduleSearch() {
  clearTimeout(debounceTimer)
  debounceTimer = window.setTimeout(() => {
    router.replace({ query: { ...route.query, q: searchQuery.value.trim() || undefined } })
    runSearch()
  }, 420)
}

function setFilter(key) {
  activeFilter.value = key
  selectedId.value = filteredResults.value[0]?.id || null
  router.replace({ query: { ...route.query, type: key === 'all' ? undefined : key } })
}

function selectItem(item) {
  selectedId.value = item.id
  recordSearchView(item)
}

// 搜索并查看词条即记一次浏览，让“搜索词语”也进入学习足迹；同会话同词条去重。
async function recordSearchView(item) {
  if (!authStore.isLoggedIn || !item?.rawId) return
  const key = `${item.type}:${item.rawId}`
  if (recordedSearchIds.has(key)) return
  recordedSearchIds.add(key)
  try {
    await recordsApi.create({ contentType: item.type, contentId: item.rawId, actionType: 'view' })
  } catch {
    // 写入失败不阻塞搜索流程，移除标记以便下次查看时重试
    recordedSearchIds.delete(key)
  }
}

async function handleFavorite(item) {
  if (!authStore.isLoggedIn) return notify('登录后可以把词条加入收藏。')
  try {
    const result = await favoritesStore.toggleFavorite(item.type, item.rawId, {
      buyiText: item.bouyei,
      zhText: item.chinese,
      title: item.bouyei || item.chinese,
      subtitle: item.chinese || item.english
    })
    const isFavorited = result?.isFavorited ?? result?.favorited
    if (typeof isFavorited === 'boolean') {
      allResults.value = allResults.value.map((entry) => (
        entry.type === item.type && String(entry.rawId) === String(item.rawId)
          ? { ...entry, isFavorited }
          : entry
      ))
    }
    notify('已更新收藏。')
  } catch {
    notify('收藏未完成，请稍后重试。')
  }
}

async function handleLearn(item) {
  if (!authStore.isLoggedIn) return notify('登录后可以记录学习轨迹。')
  try {
    await recordsApi.create({ contentType: item.type, contentId: item.rawId, actionType: 'view' })
    notify('已加入学习记录。')
  } catch {
    notify('学习记录未保存，请稍后重试。')
  }
}

function stopPronunciation() {
  if (pronunciationAudio) {
    pronunciationAudio.onended = null
    pronunciationAudio.onerror = null
    pronunciationAudio.pause()
    try { pronunciationAudio.currentTime = 0 } catch { /* 尚未加载元数据时无需重置进度 */ }
  }
  pronunciationAudio = null
  playingId.value = null
}

async function handlePlay(item) {
  const audioUrl = String(item.audioUrl || '').trim()
  if (!audioUrl) {
    notify('该词条暂未收录可播放发音。')
    return
  }

  if (playingId.value === item.id && pronunciationAudio && !pronunciationAudio.paused) {
    stopPronunciation()
    notify('已停止播放。')
    return
  }

  stopPronunciation()
  const audio = new Audio(audioUrl)
  audio.preload = 'auto'
  pronunciationAudio = audio
  playingId.value = item.id
  audio.onended = () => {
    if (pronunciationAudio === audio) stopPronunciation()
  }
  audio.onerror = () => {
    if (pronunciationAudio !== audio) return
    stopPronunciation()
    notify('发音加载失败，请检查网络后重试。')
  }

  try {
    await audio.play()
    notify(`正在播放“${item.bouyei || item.chinese}”的发音。`)
  } catch {
    if (pronunciationAudio === audio) {
      stopPronunciation()
      notify('浏览器未能播放该发音，请稍后重试。')
    }
  }
}

function handleAskAgent(item) {
  agentStore.ask(`请解释“${item.bouyei || item.chinese || ''}”这个词`, '/dictionary')
}

function handleAISentence(item) {
  if (!authStore.isLoggedIn) return notify('登录后可以使用 AI 造句。')
  sentenceController?.abort()
  aiSentenceState.value = { itemId: item.id, status: 'loading', content: '' }
  sentenceController = generateStream({
    type: 'sentence',
    word: item.bouyei,
    onDelta: (chunk) => {
      if (aiSentenceState.value.itemId !== item.id) return
      aiSentenceState.value.content += chunk
    },
    onDone: () => {
      if (aiSentenceState.value.itemId !== item.id) return
      aiSentenceState.value.status = aiSentenceState.value.content.trim() ? 'ready' : 'error'
    },
    onError: () => {
      if (aiSentenceState.value.itemId !== item.id) return
      aiSentenceState.value = { itemId: item.id, status: 'error', content: '' }
    }
  })
}

function parseRelatedWords(content) {
  const withoutFence = String(content || '')
    .trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')
  const start = withoutFence.indexOf('{')
  const end = withoutFence.lastIndexOf('}')
  if (start < 0 || end <= start) throw new Error('关联词 JSON 无效')
  const parsed = JSON.parse(withoutFence.slice(start, end + 1))
  if (!Array.isArray(parsed.words)) throw new Error('关联词字段缺失')
  const words = [...new Set(parsed.words.map((word) => String(word || '').trim()).filter(Boolean))].slice(0, 3)
  if (!words.length) throw new Error('关联词为空')
  return words
}

function handleRelated(item) {
  if (!authStore.isLoggedIn) return notify('登录后可以获取 AI 关联推荐。')
  const cacheKey = String(item.bouyei || '').trim().toLowerCase()
  if (!cacheKey) return
  const cached = relatedCache.get(cacheKey)
  if (cached) {
    relatedState.value = { itemId: item.id, status: 'ready', words: cached }
    return
  }

  relatedController?.abort()
  relatedState.value = { itemId: item.id, status: 'loading', words: [] }
  let content = ''
  relatedController = generateStream({
    type: 'related',
    word: item.bouyei,
    onDelta: (chunk) => {
      content += chunk
    },
    onDone: () => {
      if (relatedState.value.itemId !== item.id) return
      try {
        const words = parseRelatedWords(content)
        relatedCache.set(cacheKey, words)
        relatedState.value = { itemId: item.id, status: 'ready', words }
      } catch {
        relatedState.value = { itemId: item.id, status: 'idle', words: [] }
        notify('AI 关联推荐暂不可用。')
      }
    },
    onError: () => {
      if (relatedState.value.itemId !== item.id) return
      relatedState.value = { itemId: item.id, status: 'idle', words: [] }
      notify('AI 关联推荐暂不可用。')
    }
  })
}

function searchRelatedWord(word) {
  searchQuery.value = word
  runSearch()
}

async function handleShare(item) {
  if (!item || isSharing.value) return
  isSharing.value = true
  try {
    const result = await shareCardRef.value?.share({
      word: item.bouyei,
      translation: item.chinese,
      filename: `${item.bouyei || item.chinese || '布依语'}-分享卡片.png`
    })
    if (result?.action === 'shared') notify('已打开系统分享。')
    if (result?.action === 'downloaded') notify('分享卡片已下载。')
  } catch {
    notify('分享卡片生成失败，请稍后重试。')
  } finally {
    isSharing.value = false
  }
}

function notify(message) {
  actionMsg.value = message
  window.setTimeout(() => { actionMsg.value = '' }, 2600)
}

watch(searchQuery, scheduleSearch)
watch(filteredResults, (items) => {
  if (!items.some((item) => item.id === selectedId.value)) selectedId.value = items[0]?.id || null
})
watch(() => route.query.q, (value) => {
  const next = String(value || '')
  if (next !== searchQuery.value) searchQuery.value = next
})

onMounted(async () => {
  await runSearch()
  if (route.query.focus) {
    await nextTick()
    document.querySelector('.dictionary-search input')?.focus()
  }

  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const isMobile = window.matchMedia('(max-width: 768px)').matches
    const coefficient = isMobile ? 0.04 : 0.08
    scrollHandler = () => {
      bgParallax.value = window.scrollY * coefficient
    }
    window.addEventListener('scroll', scrollHandler, { passive: true })
  }
})

onUnmounted(() => {
  clearTimeout(debounceTimer)
  stopPronunciation()
  if (scrollHandler) window.removeEventListener('scroll', scrollHandler)
})

onUnmounted(() => {
  sentenceController?.abort()
  relatedController?.abort()
})
</script>

<template>
  <main id="main" class="dictionary-workspace" data-nav-tone="light" data-motion-surface="tool" data-tool-page="">
    <div class="dictionary-bg" :style="{ transform: `translate3d(0, ${bgParallax}px, 0)` }"><img :src="imgBg" alt="" loading="eager" fetchpriority="high" /></div>

    <header class="dictionary-hero">
      <div>
        <p class="dict-hero-kicker">布依语词典</p>
        <h1 class="dict-hero-title">从一个词，找到下一段文化线索。</h1>
        <span class="dict-hero-subtitle">支持布依语、汉字与拼音查询；每个关联展项都保留资料出处。</span>
      </div>
    </header>

    <section class="dictionary-search liquid-glass liquid-glass-hero dict-search-anim" aria-label="词典搜索">
      <SearchBar v-model="searchQuery" placeholder="输入布依语、汉字或拼音" @search="runSearch" />
      <div class="dictionary-search__meta">
        <div class="filter-pills" aria-label="内容筛选">
          <button
            v-for="filter in filters"
            :key="filter.key"
            type="button"
            :class="{ active: activeFilter === filter.key }"
            :aria-pressed="activeFilter === filter.key"
            @click="setFilter(filter.key)"
          >{{ filter.label }}</button>
        </div>
        <p aria-live="polite">{{ requestState === 'ready' ? `${filteredResults.length} 条结果` : '查询结果会显示在这里' }}</p>
      </div>
    </section>

    <section class="dictionary-results dict-results-anim" aria-label="词典结果">
      <div class="result-list liquid-glass liquid-glass-content" aria-live="polite">
        <p v-if="cacheNotice" class="cache-notice" role="status">{{ cacheNotice }}</p>
        <template v-if="requestState === 'loading'">
          <div v-for="item in 4" :key="item" class="result-skeleton" aria-hidden="true"><i></i><b></b><span></span></div>
          <p class="state-copy">正在检索词典与文化关联…</p>
        </template>
        <div v-else-if="requestState === 'error'" class="state-panel state-panel--error">
          <strong>词典服务暂不可用</strong>
          <p>{{ requestError }}</p>
          <small class="service-status" :class="`service-status--${serviceState}`">{{ serviceState === 'checking' ? '正在检查服务状态…' : serviceState === 'ready' ? '服务在线，但本次词典请求失败。' : serviceState === 'degraded' ? '服务已响应，但数据库或媒体配置异常。' : serviceState === 'offline' ? '服务状态：未连接。' : '服务状态：未知。' }}</small>
          <button type="button" @click="runSearch">重新连接</button>
        </div>
        <div v-else-if="requestState === 'empty'" class="state-panel">
          <strong>{{ hasQuery ? '没有找到匹配词条' : '词典还没有可显示的词条' }}</strong>
          <p>{{ hasQuery ? '换一个汉字、拼音或布依语拼写再试。' : '请确认后端词库已启动并包含已发布内容。' }}</p>
        </div>
        <div v-else-if="!filteredResults.length" class="state-panel">
          <strong>这个分类暂时没有匹配词条</strong>
          <p>可切换到“全部”，或使用其他关键词继续查询。</p>
        </div>
        <button
          v-else
          v-for="result in filteredResults"
          :key="result.id"
          type="button"
          class="result-row"
          :class="{ selected: result.id === selectedId }"
          :aria-pressed="result.id === selectedId"
          @click="selectItem(result)"
        >
          <span class="result-row__type">{{ getContentLabel(result.type) }}</span>
          <strong>{{ result.bouyei }}</strong>
          <span>{{ result.chinese }}</span>
          <small v-if="result.relatedExhibits.length">关联 {{ result.relatedExhibits.length }} 个文化展项</small>
        </button>
      </div>

      <aside class="entry-detail liquid-glass liquid-glass-content" aria-label="词条详情">
        <template v-if="selectedItem">
          <div class="entry-detail__topline"><span>{{ getContentLabel(selectedItem.type) }}</span><span>{{ selectedItem.english || '布依语词典' }}</span></div>
          <h2>{{ selectedItem.bouyei }}</h2>
          <p class="entry-detail__meaning">{{ selectedItem.chinese }}</p>
          <p v-if="selectedItem.example" class="entry-detail__note">{{ selectedItem.example }}</p>

          <div class="entry-actions">
            <button
              v-pointer-glow="{ tone: 'brand', size: 'sm' }"
              type="button"
              :class="{ 'is-playing': playingId === selectedItem.id }"
              :aria-pressed="playingId === selectedItem.id"
              @click="handlePlay(selectedItem)"
            ><IconVolume :size="16" />{{ playingId === selectedItem.id ? '停止播放' : '播放发音' }}</button>
            <button v-pointer-glow="{ tone: 'accent', size: 'sm' }" type="button" :aria-pressed="isFavoriteSelected" :aria-label="isFavoriteSelected ? '取消收藏' : '收藏词条'" @click="handleFavorite(selectedItem)"><IconHeart :size="16" :filled="isFavoriteSelected" />{{ isFavoriteSelected ? '已收藏' : '收藏词条' }}</button>
            <button type="button" :disabled="isSharing" @click="handleShare(selectedItem)">{{ isSharing ? '生成中…' : '分享卡片' }}</button>
            <button type="button" @click="handleLearn(selectedItem)">加入学习</button>
            <button type="button" @click="handleAskAgent(selectedItem)">请求解释</button>
            <button
              type="button"
              :disabled="aiSentenceState.itemId === selectedItem.id && aiSentenceState.status === 'loading'"
              @click="handleAISentence(selectedItem)"
            >{{ aiSentenceState.itemId === selectedItem.id && aiSentenceState.status === 'loading' ? '造句中…' : 'AI 造句' }}</button>
          </div>

          <div
            v-if="aiSentenceState.itemId === selectedItem.id && aiSentenceState.status !== 'idle'"
            class="ai-sentence"
            role="status"
          >
            <strong>AI 学习辅助</strong>
            <p v-if="aiSentenceState.status === 'error'">AI 造句暂不可用</p>
            <p v-else>{{ aiSentenceState.content || '正在组织例句…' }}</p>
          </div>

          <section v-if="selectedItem.relatedExhibits.length" class="culture-links" aria-labelledby="culture-links-title">
            <p>由词入馆</p>
            <h3 id="culture-links-title">继续探索关联文化</h3>
            <RouterLink
              v-for="exhibit in selectedItem.relatedExhibits"
              :key="exhibit.slug"
              :to="{ path: '/culture', query: { exhibit: exhibit.slug } }"
            >
              <span>{{ exhibit.kicker || '文化展项' }}</span>
              <strong>{{ exhibit.title }}</strong>
              <b aria-hidden="true">→</b>
            </RouterLink>
          </section>

          <SourceBadge
            class="entry-detail__source"
            :source="selectedItem.source || '布依词典数据库'"
          />

          <section class="related-learning" aria-label="AI 关联推荐">
            <button
              type="button"
              :disabled="relatedState.itemId === selectedItem.id && relatedState.status === 'loading'"
              @click="handleRelated(selectedItem)"
            >{{ relatedState.itemId === selectedItem.id && relatedState.status === 'loading' ? '推荐中…' : '猜你想学' }}</button>
            <div v-if="relatedState.itemId === selectedItem.id && relatedState.words.length">
              <span>AI 推荐</span>
              <button v-for="word in relatedState.words" :key="word" type="button" @click="searchRelatedWord(word)">{{ word }}</button>
            </div>
          </section>

          <RouterLink class="related-navigation" :to="{ path: '/culture', hash: '#pattern-exhibit' }">相关文化展项 →</RouterLink>
        </template>
        <div v-else class="entry-detail__empty">
          <span aria-hidden="true">⌁</span>
          <p>从左侧选择一个词条，阅读释义并继续走进文化展项。</p>
        </div>
        <p v-if="actionMsg" class="action-message" aria-live="polite">{{ actionMsg }}</p>
      </aside>
    </section>
    <ShareCard ref="shareCardRef" />
  </main>
</template>

<style scoped>
.dictionary-workspace { position: relative; min-height: 100vh; padding: 104px max(24px, calc((100% - 1100px) / 2)) 120px; color: var(--c-text); background: transparent; overflow: hidden; }
.dictionary-bg { position: fixed; inset: -10%; z-index: -2; will-change: transform; }
.dictionary-bg img { width: 100%; height: 100%; object-fit: cover; transform: scale(1.04); animation: dictBgReveal var(--duration-slow) var(--ease-out-quint) forwards; }
@keyframes dictBgReveal { to { transform: scale(1); } }
@media (prefers-reduced-motion: reduce) { .dictionary-bg, .dictionary-bg img { animation: none !important; transform: none !important; } }
.dictionary-hero { padding: 8px 0 22px; }.dictionary-hero p, .culture-links > p { margin: 0; color: var(--c-accent); font-size: .75rem; font-weight: 700; letter-spacing: .08em; }.dictionary-hero h1 { max-width: 18ch; margin: 6px 0 8px; color: var(--c-text); font: 600 clamp(1.85rem, 3.4vw, 2.85rem) / 1.08 var(--font-serif); letter-spacing: -.025em; text-shadow: 0 2px 16px rgba(255, 255, 255, .78); text-wrap: balance; }.dictionary-hero > div > span { display: block; max-width: 48ch; color: var(--c-text-70); font-size: 1rem; line-height: 1.75; text-shadow: 0 1px 10px rgba(255, 255, 255, .82); }
/* 搜索区：hero 玻璃外壳。内部 SearchBar 自带 content 玻璃会被下面 :deep 抹平，避免双层玻璃叠糊。 */
.dictionary-search { padding: 24px; }.dictionary-search :deep(.search-bar) { border-color: transparent; background: var(--c-glass); box-shadow: none; }.dictionary-search :deep(.search-bar:focus-within) { box-shadow: 0 0 0 4px var(--c-brand-08); }.dictionary-search__meta { display: flex; align-items: center; justify-content: space-between; gap: 16px; margin-top: 16px; }.dictionary-search__meta p { margin: 0; color: var(--c-text-60); font-size: .875rem; }.filter-pills { display: flex; flex-wrap: wrap; gap: 6px; }.filter-pills button { min-height: 36px; padding: 0 14px; border: 1px solid transparent; border-radius: 999px; color: var(--c-text-70); background: transparent; cursor: pointer; font: 600 .8125rem var(--font-sans); }.filter-pills button:hover { color: var(--c-text); background: var(--c-brand-06); }.filter-pills button.active { color: var(--c-white); background: var(--c-brand); }.filter-pills button:focus-visible, .entry-actions button:focus-visible, .state-panel button:focus-visible, .result-row:focus-visible, .culture-links a:focus-visible { outline: 2px solid var(--c-focus); outline-offset: 3px; }
.dictionary-results { display: grid; grid-template-columns: minmax(280px, .72fr) minmax(0, 1.28fr); gap: 32px; align-items: start; margin-top: 28px; }.result-list { min-height: 420px; padding: 4px 8px 12px; }.result-row { display: grid; grid-template-columns: auto minmax(0, 1fr); gap: 5px 12px; width: 100%; padding: 18px 14px; border: 0; border-bottom: 1px solid var(--c-divider); color: inherit; background: transparent; cursor: pointer; text-align: left; }.result-row:hover { background: var(--c-brand-06); }.result-row.selected { background: var(--c-brand-08); box-shadow: inset 3px 0 0 var(--c-brand); }.result-row__type { grid-row: span 2; align-self: start; padding: 4px 7px; border-radius: 999px; color: var(--c-brand); background: var(--c-brand-08); font-size: .6875rem; font-weight: 700; }.result-row strong { overflow: hidden; color: var(--c-text); font-size: 1.0625rem; text-overflow: ellipsis; white-space: nowrap; }.result-row > span:not(.result-row__type) { overflow: hidden; color: var(--c-text-70); font-size: .875rem; text-overflow: ellipsis; white-space: nowrap; }.result-row small { grid-column: 2; color: var(--c-accent); font-size: .75rem; }
.entry-detail { position: sticky; top: calc(56px + env(safe-area-inset-top, 0px) + 20px); min-height: 420px; padding: clamp(24px, 4vw, 46px); }.entry-detail__topline { display: flex; justify-content: space-between; gap: 16px; color: var(--c-text-60); font-size: .75rem; }.entry-detail__topline span:first-child { color: var(--c-accent); font-weight: 700; }.entry-detail h2 { margin: 26px 0 6px; font: 600 3rem / 1.1 var(--font-serif); letter-spacing: -.025em; }.entry-detail__meaning { margin: 0; color: var(--c-text); font-size: 1.25rem; font-weight: 600; }.entry-detail__note { max-width: 55ch; margin: 28px 0; padding-left: 16px; border-left: 1px solid var(--c-brand-40); color: var(--c-text-70); line-height: 1.8; }.entry-actions { display: flex; flex-wrap: wrap; gap: 8px; }.entry-actions button { min-height: 40px; padding: 0 14px; border: 1px solid var(--c-brand-25); border-radius: 999px; color: var(--c-brand); background: transparent; cursor: pointer; font: 600 .8125rem var(--font-sans); }.entry-actions button:hover { color: var(--c-white); background: var(--c-brand); }
.entry-actions button.is-playing { color: var(--c-white); background: var(--c-brand); }
.entry-actions button:disabled { cursor: wait; opacity: .58; }
.entry-detail__source { margin-top: 28px; }
.ai-sentence { margin-top: 18px; padding: 16px 18px; border-left: 3px solid var(--c-accent); border-radius: var(--radius-sm); color: var(--c-text); background: var(--c-accent-04); }
.ai-sentence strong { color: var(--c-accent-text); font-size: .75rem; letter-spacing: .06em; }
.ai-sentence p { margin: 7px 0 0; color: var(--c-text-70); font-size: .875rem; line-height: 1.75; white-space: pre-wrap; }
.related-learning { display: grid; gap: 12px; margin-top: 22px; padding-top: 22px; border-top: 1px solid var(--c-divider); }
.related-learning > button { justify-self: start; min-height: 38px; padding: 0 15px; border: 1px solid var(--c-brand-25); border-radius: 999px; color: var(--c-brand); background: transparent; cursor: pointer; font: 600 .8125rem var(--font-sans); }
.related-learning > button:hover { color: var(--c-white); background: var(--c-brand); }
.related-learning > button:disabled { cursor: wait; opacity: .58; }
.related-learning > div { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }
.related-learning > div > span { color: var(--c-text-60); font-size: .75rem; }
.related-learning > div > button { min-height: 34px; padding: 0 12px; border: 0; border-radius: 999px; color: var(--c-brand); background: var(--c-brand-08); cursor: pointer; font: 600 .8125rem var(--font-sans); }
.related-learning > div > button:hover { color: var(--c-white); background: var(--c-brand); }
.related-learning button:focus-visible { outline: 2px solid var(--c-focus); outline-offset: 3px; }
.related-navigation { display: inline-flex; margin-top: 20px; color: var(--c-brand); font-size: .875rem; font-weight: 700; text-decoration: none; }
.related-navigation:hover { text-decoration: underline; }
.related-navigation:focus-visible { outline: 2px solid var(--c-focus); outline-offset: 3px; }
.culture-links { display: grid; gap: 10px; margin-top: 38px; padding-top: 28px; border-top: 1px solid var(--c-divider); }.culture-links h3 { margin: 0 0 4px; font: 600 1.5rem var(--font-serif); }.culture-links a { display: grid; grid-template-columns: 1fr auto; gap: 4px 12px; padding: 15px 0; border-bottom: 1px solid var(--c-divider); color: inherit; text-decoration: none; }.culture-links a:hover strong { color: var(--c-brand); }.culture-links a span { color: var(--c-text-60); font-size: .75rem; }.culture-links a strong { color: var(--c-text); font-size: 1rem; }.culture-links a b { grid-row: span 2; align-self: center; color: var(--c-accent); }
.state-panel { max-width: 34rem; margin: 40px auto; padding: 28px; border: 1px solid var(--c-divider); border-radius: var(--radius-md); background: var(--c-bg-silver); }.state-panel strong { color: var(--c-text); }.state-panel p { margin: 8px 0 20px; color: var(--c-text-70); line-height: 1.7; }.state-panel button { min-height: 40px; padding: 0 16px; border: 0; border-radius: 999px; color: var(--c-white); background: var(--c-brand); cursor: pointer; font: 600 .875rem var(--font-sans); }.state-panel--error { background: var(--c-danger-08); border-color: color-mix(in srgb, var(--c-danger) 28%, transparent); }.state-copy { margin: 16px 0; color: var(--c-text-60); font-size: .875rem; }.result-skeleton { display: grid; grid-template-columns: 50px 1fr; gap: 10px; padding: 20px 14px; border-bottom: 1px solid var(--c-divider); }.result-skeleton i, .result-skeleton b, .result-skeleton span { display: block; border-radius: 999px; background: linear-gradient(90deg, var(--c-brand-06), var(--c-brand-08), var(--c-brand-06)); animation: shimmer 1.4s ease-in-out infinite; }.result-skeleton i { grid-row: span 2; height: 22px; }.result-skeleton b { height: 17px; width: 44%; }.result-skeleton span { height: 12px; width: 64%; }.entry-detail__empty { display: grid; min-height: 340px; place-content: center; gap: 14px; color: var(--c-text-60); text-align: center; }.entry-detail__empty span { color: var(--c-accent); font: 3rem var(--font-serif); }.entry-detail__empty p { max-width: 25ch; margin: 0; line-height: 1.8; }.action-message { position: absolute; right: 24px; bottom: 18px; left: 24px; margin: 0; padding: 10px 12px; border-radius: var(--radius-sm); color: var(--c-text); background: var(--c-accent-10); font-size: .8125rem; }
.service-status { display: block; margin: -8px 0 20px; color: var(--c-text-60); font-size: .75rem; }.service-status--ready { color: var(--c-brand); }.service-status--degraded, .service-status--offline { color: var(--c-danger); }
@keyframes shimmer { 50% { opacity: .45; } }
@media (max-width: 860px) { .dictionary-workspace { padding-top: 92px; }.dictionary-results { grid-template-columns: 1fr; }.entry-detail { position: static; }.result-list { min-height: 0; }.dictionary-search__meta { align-items: flex-start; flex-direction: column; } }
@media (max-width: 560px) { .dictionary-workspace { padding-right: 16px; padding-left: 16px; }.dictionary-hero { padding-bottom: 28px; }.dictionary-hero h1 { font-size: 2.45rem; }.dictionary-search { padding: 14px; }.dictionary-search :deep(.search-bar) { height: 52px; padding-left: 16px; }.dictionary-search :deep(.search-btn) { padding: 0 17px; }.entry-detail { padding: 24px; }.entry-detail h2 { font-size: 2.5rem; }.entry-actions button { flex: 1 1 calc(50% - 8px); } }
.dict-hero-kicker {
  opacity: 0;
  transform: translateY(12px);
  animation: dictHeroIn 480ms var(--ease-out-quint) 200ms forwards;
}

.dict-hero-title {
  opacity: 0;
  transform: translateY(18px);
  filter: blur(4px);
  animation: dictHeroTitleIn 580ms var(--ease-out-expo) 280ms forwards;
}

@keyframes dictHeroTitleIn {
  to {
    opacity: 1;
    transform: translateY(0);
    filter: blur(0);
  }
}

.dict-hero-subtitle {
  opacity: 0;
  transform: translateY(14px);
  animation: dictHeroIn 500ms var(--ease-out-quint) 380ms forwards;
}

@keyframes dictHeroIn {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.dict-search-anim {
  opacity: 0;
  transform: translateY(20px);
  animation: dictPanelIn 550ms var(--ease-out-quint) 480ms forwards;
}

@keyframes dictPanelIn {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.dict-results-anim {
  opacity: 0;
  transform: translateY(24px);
  animation: dictPanelIn 600ms var(--ease-out-quint) 600ms forwards;
}

@media (prefers-reduced-motion: reduce) {
  .result-skeleton i, .result-skeleton b, .result-skeleton span { animation: none; }
  .dict-hero-kicker, .dict-hero-title, .dict-hero-subtitle,
  .dict-search-anim, .dict-results-anim {
    animation: none !important;
    opacity: 1 !important;
    transform: none !important;
    filter: none !important;
  }
}
</style>

<style scoped>
.dictionary-workspace .dictionary-hero p,
.dictionary-workspace .culture-links > p,
.dictionary-workspace .result-row small,
.dictionary-workspace .entry-detail__topline span:first-child,
.dictionary-workspace .culture-links a b,
.dictionary-workspace .entry-detail__empty span {
  color: var(--c-accent-text);
}

.dictionary-workspace .filter-pills button.active,
.dictionary-workspace .entry-actions button:hover,
.dictionary-workspace .state-panel button {
  color: var(--c-brand-foreground);
}

.dictionary-workspace .dictionary-search,
.dictionary-workspace .dictionary-results,
.dictionary-workspace .result-list,
.dictionary-workspace .entry-detail,
.dictionary-workspace .entry-actions,
.dictionary-workspace .entry-actions button { min-width: 0; }
.dictionary-workspace .entry-actions button { display: inline-flex; align-items: center; gap: 7px; }
.dictionary-workspace .cache-notice { margin: 14px 0 0; padding: 10px 12px; border-left: 3px solid var(--c-accent); color: var(--c-text-70); background: var(--c-accent-04); font-size: .8125rem; line-height: 1.6; }

@media (max-width: 560px) {
  .dictionary-workspace .dictionary-search,
  .dictionary-workspace .dictionary-search__meta,
  .dictionary-workspace .filter-pills { width: 100%; min-width: 0; }
  .dictionary-workspace .dictionary-search :deep(.search-bar) { min-width: 0; width: 100%; }
  .dictionary-workspace .dictionary-search :deep(.search-input) { min-width: 0; }
  .dictionary-workspace .dictionary-search :deep(.search-btn) { flex: 0 0 auto; min-width: 76px; padding-inline: 12px; }
  .dictionary-workspace .dictionary-results { min-width: 0; gap: 24px; }
  .dictionary-workspace .result-row { min-width: 0; }
}

@media (max-width: 360px) {
  .dictionary-workspace { padding-right: 12px; padding-left: 12px; }
  .dictionary-workspace .dictionary-search { padding: 12px; }
  .dictionary-workspace .dictionary-search :deep(.search-btn) { min-width: 68px; padding-inline: 9px; font-size: .8125rem; }
  .dictionary-workspace .filter-pills button { padding-inline: 11px; }
}
</style>
