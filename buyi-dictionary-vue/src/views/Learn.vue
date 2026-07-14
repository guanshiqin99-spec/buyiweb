<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import imgBg from '@/assets/images/bg-vocabulary.jpg'
import { contentApi, recordsApi } from '@/utils/api'
import { useAuthStore } from '@/stores/auth'
import { useFavoritesStore } from '@/stores/favorites'
import IconChevronRight from '@/components/icons/IconChevronRight.vue'
import IconHeart from '@/components/icons/IconHeart.vue'
import IconPlay from '@/components/icons/IconPlay.vue'

const authStore = useAuthStore()
const favoritesStore = useFavoritesStore()
const words = ref([])
const isLoading = ref(false)
const currentIndex = ref(0)
const isFlipped = ref(false)
const learnedCount = ref(0)
const actionMsg = ref('')
const bgParallax = ref(0)
let msgTimer = null
let scrollHandler = null
let currentVisitId = 0
const recordedVisitIds = new Set()
const recordingVisitIds = new Set()
// 学习统计（登录态拉取）
const learnStats = ref({ todayCount: 0, totalCount: 0, streakDays: 0, typeCounts: {} })

const currentWord = computed(() => words.value[currentIndex.value] || {
  bouyei: '', chinese: '', english: '', phonetic: ''
})

const flipCard = () => {
  isFlipped.value = !isFlipped.value
}

function showMsg(text) {
  actionMsg.value = text
  if (msgTimer) clearTimeout(msgTimer)
  msgTimer = setTimeout(() => { actionMsg.value = '' }, 2200)
}

// 发音（占位：后端暂无 TTS）
function handlePlay() {
  showMsg('发音功能即将上线')
}

// 收藏切换
async function handleFavorite() {
  if (!authStore.isLoggedIn) {
    showMsg('请先登录后再收藏')
    return
  }
  if (!currentWord.value?.id) return
  try {
    await favoritesStore.toggleFavorite('dictionary', currentWord.value.id, {
      buyiText: currentWord.value.bouyei,
      zhText: currentWord.value.chinese,
      title: currentWord.value.bouyei || currentWord.value.chinese,
      subtitle: currentWord.value.chinese || currentWord.value.english
    })
    showMsg('已更新收藏')
  } catch (e) {
    showMsg('操作失败，请重试')
  }
}

async function recordCurrentView() {
  const visitId = currentVisitId
  if (!authStore.isLoggedIn || !currentWord.value?.id || recordedVisitIds.has(visitId) || recordingVisitIds.has(visitId)) return false
  recordingVisitIds.add(visitId)
  try {
    await recordsApi.create({
      contentType: 'dictionary',
      contentId: currentWord.value.id,
      actionType: 'view'
    })
    recordingVisitIds.delete(visitId)
    if (visitId === currentVisitId) recordedVisitIds.add(visitId)
    return true
  } catch (error) {
    recordingVisitIds.delete(visitId)
    throw error
  }
}

// 标记复习。同一张卡片在本次停留期间只写入一次 view 记录。
async function handleReview() {
  if (!authStore.isLoggedIn) {
    showMsg('请先登录后再标记复习')
    return
  }
  if (!currentWord.value?.id) return
  try {
    const created = await recordCurrentView()
    showMsg(created ? '已加入复习清单' : '这张卡片已记录，无需重复添加')
  } catch (e) {
    showMsg('操作失败，请重试')
  }
}

const nextWord = () => {
  isFlipped.value = false
  if (words.value.length > 0) {
    // 先记录当前词，再切换索引，避免把“下一词”写入学习记录
    const previousVisitId = currentVisitId
    recordCurrentView().catch(() => { /* 记录失败静默忽略 */ })
    currentIndex.value = (currentIndex.value + 1) % words.value.length
    currentVisitId += 1
    recordedVisitIds.delete(previousVisitId)
    recordingVisitIds.delete(previousVisitId)
    learnedCount.value++
  }
}

onMounted(async () => {
  isLoading.value = true
  // 并行：加载词汇 + 拉取学习统计（登录态）
  const tasks = [
    contentApi.list('dictionary', { page: 1, pageSize: 50 }).then(res => {
      words.value = (res.items || []).map(item => ({
        id: item.id,
        bouyei: item.buyiText || '',
        chinese: item.zhText || '',
        english: item.enText || '',
        phonetic: item.description || ''
      }))
    }).catch(e => {
      console.error('词汇加载失败', e)
      words.value = []
    }),
    authStore.isLoggedIn ? recordsApi.stats().then(res => {
      learnStats.value = res || learnStats.value
    }).catch(() => {}) : Promise.resolve()
  ]
  await Promise.allSettled(tasks)
  isLoading.value = false

  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const isMobile = window.matchMedia('(max-width: 768px)').matches
    const coefficient = isMobile ? 0.035 : 0.07
    scrollHandler = () => {
      bgParallax.value = window.scrollY * coefficient
    }
    window.addEventListener('scroll', scrollHandler, { passive: true })
  }
})

onUnmounted(() => {
  if (msgTimer) clearTimeout(msgTimer)
  if (scrollHandler) window.removeEventListener('scroll', scrollHandler)
})
</script>

<template>
  <main id="main" class="learn-page">
    <div class="learn-page__bg" :style="{ transform: `translate3d(0, ${bgParallax}px, 0)` }"><img :src="imgBg" alt="" loading="eager" fetchpriority="high" /></div>
    <div class="learn-content">
      <header class="learn-header">
        <p>学习布依语</p>
        <h1>翻转卡片，记住每一个词</h1>
      </header>
      <!-- 学习统计条（登录态显示） -->
      <div v-if="authStore.isLoggedIn" class="learn-stats liquid-glass-content" aria-live="polite" aria-atomic="false">
        <div class="learn-stat">
          <span class="learn-stat-value">{{ learnStats.streakDays ?? 0 }}</span>
          <span class="learn-stat-label">连续天数</span>
        </div>
        <div class="learn-stat-divider"></div>
        <div class="learn-stat">
          <span class="learn-stat-value">{{ learnStats.totalCount ?? 0 }}</span>
          <span class="learn-stat-label">累计学习</span>
        </div>
        <div class="learn-stat-divider"></div>
        <div class="learn-stat">
          <span class="learn-stat-value">{{ learnStats.todayCount ?? 0 }}</span>
          <span class="learn-stat-label">今日</span>
        </div>
      </div>

      <p v-if="isLoading" class="loading-hint">加载中…</p>
      <p v-else-if="words.length === 0" class="loading-hint">暂无词汇</p>
      <template v-else>
      <div class="progress liquid-glass-quiet">
        <span>已学习: {{ learnedCount }} 词</span>
        <span>进度: {{ currentIndex + 1 }} / {{ words.length }}</span>
      </div>
      
      <button
        class="card-container"
        type="button"
        aria-label="翻转学习卡片"
        @click="flipCard"
      >
        <div class="card" :class="{ flipped: isFlipped }">
          <div class="card-front liquid-glass liquid-glass-hero">
            <span class="phonetic">{{ currentWord.phonetic }}</span>
            <h2 class="word">{{ currentWord.bouyei }}</h2>
            <p class="hint">点击翻转</p>
          </div>
          <div class="card-back liquid-glass liquid-glass-hero">
            <h2>{{ currentWord.chinese }}</h2>
            <p class="english">{{ currentWord.english }}</p>
            <p class="phonetic">{{ currentWord.phonetic }}</p>
          </div>
        </div>
      </button>

      <p v-if="actionMsg" class="action-msg" aria-live="polite">{{ actionMsg }}</p>

      <div class="action-bar" role="group" aria-label="学习动作">
        <button v-pointer-glow="{ tone: 'brand', size: 'sm' }" class="action-btn" type="button" aria-label="播放发音" @click="handlePlay">
          <IconPlay :size="20" />
          <span>发音</span>
        </button>
        <button v-pointer-glow="{ tone: 'accent', size: 'sm' }" class="action-btn" type="button" aria-label="收藏词条" @click="handleFavorite">
          <IconHeart :size="20" />
          <span>收藏</span>
        </button>
        <button class="action-btn" type="button" aria-label="标记复习" @click="handleReview">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
            <path d="M3 3v5h5"/>
          </svg>
          <span>复习</span>
        </button>
        <button v-pointer-glow="{ tone: 'brand', size: 'md' }" class="action-btn action-btn-primary" type="button" aria-label="下一个词条" @click="nextWord">
          <IconChevronRight :size="20" />
          <span>下一词</span>
        </button>
      </div>
      </template>
    </div>
  </main>
</template>

<style scoped>
.learn-page {
  position: relative;
  min-height: 100vh;
  padding: 104px 24px 80px;
  overflow: hidden;
  color: var(--c-text);
  background: transparent;
}

/* 背景直接使用原图，不叠加整页蒙层。 */
.learn-page__bg { position: fixed; inset: -10%; z-index: -2; will-change: transform; }
.learn-page__bg img { width: 100%; height: 100%; object-fit: cover; transform: scale(1.04); animation: learnBgReveal var(--duration-slow) var(--ease-out-quint) forwards; }
@keyframes learnBgReveal { to { transform: scale(1); } }
@media (prefers-reduced-motion: reduce) { .learn-page__bg, .learn-page__bg img { animation: none !important; transform: none !important; } }

.learn-header { text-align: center; margin-bottom: 28px; }
.learn-header p { margin: 0; color: var(--c-accent); font-size: 12px; font-weight: 700; letter-spacing: .1em; }
.learn-header h1 { margin: 8px 0 0; color: var(--c-white); font: 600 clamp(1.6rem, 3vw, 2.2rem) / 1.15 var(--font-serif); letter-spacing: -.02em; text-shadow: 0 2px 18px rgba(7, 23, 36, .78); text-wrap: balance; }

.learn-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 32px;
  max-width: 400px;
  margin: 0 auto;
  padding-top: 8px;
}

.loading-hint {
  text-align: center;
  color: var(--c-text-60);
  font-size: 14px;
  padding: 48px 0;
}

/* 学习统计条 */
.learn-stats {
  display: flex;
  align-items: center;
  justify-content: space-around;
  width: 100%;
  padding: 16px 24px;
}

.learn-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.learn-stat-value {
  font: 600 24px var(--font-sans);
  color: var(--c-brand);
  line-height: 1;
  font-variant-numeric: tabular-nums;
}

.learn-stat-label {
  font-size: 11px;
  color: var(--c-text-60);
}

.learn-stat-divider {
  width: 1px;
  height: 28px;
  background: var(--c-divider, rgba(58, 107, 140, 0.12));
}

.progress {
  display: flex;
  justify-content: space-between;
  width: 100%;
  padding: 16px 24px;
  font-size: 14px;
  color: var(--c-text-70);
}

.card-container {
  display: block;
  perspective: 1000px;
  cursor: pointer;
  width: 100%;
  overflow: visible;
  padding: 0;
  border: none;
  background: transparent;
  font: inherit;
  color: inherit;
  text-align: inherit;
}

.card-container:focus-visible {
  outline: 2px solid var(--c-focus);
  outline-offset: 4px;
  border-radius: var(--radius);
}

.card {
  width: 100%;
  height: 300px;
  position: relative;
  transform-style: preserve-3d;
  transition: transform 0.6s cubic-bezier(0.32, 0.72, 0, 1);
}

.card.flipped {
  transform: rotateY(180deg);
}

.card-front,
.card-back {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  border-radius: var(--radius);
  padding: 32px;
  box-sizing: border-box;
}

.card-front {
  --lg-radius: var(--radius);
  --lg-tint-a: 0.55;
}

.card-back {
  --lg-radius: var(--radius);
  --lg-tint: 27, 58, 92;
  --lg-tint-a: 0.88;
  transform: rotateY(180deg);
  color: white;
}

.word {
  font-size: 48px;
  font-weight: 700;
  color: var(--c-text);
  margin: 12px 0;
  letter-spacing: -0.02em;
}

.card-back h2 {
  font-size: 40px;
  font-weight: 600;
  margin: 0 0 8px 0;
}

.phonetic {
  font-size: 16px;
  color: var(--c-brand);
  font-family: var(--font-mono);
}

.card-back .phonetic {
  color: rgba(255,255,255,0.7);
}

.english {
  font-size: 18px;
  color: rgba(255,255,255,0.8);
  margin: 0 0 12px 0;
}

.hint {
  color: var(--c-text-70);
  font-size: 14px;
  margin: 16px 0 0 0;
}

.action-msg {
  font-size: 13px;
  color: var(--c-brand);
  margin: -8px 0 0 0;
  text-align: center;
  min-height: 18px;
}

.action-bar {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
  width: 100%;
}

.action-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 14px 8px;
  background: var(--c-white-78);
  border: 1px solid var(--c-white-50);
  border-radius: 14px;
  color: var(--c-text-70);
  font: 500 12px var(--font-sans);
  cursor: pointer;
  transition: background 200ms ease, color 200ms ease, transform 200ms ease, border-color 200ms ease;
}

.action-btn:hover {
  background: var(--c-brand-06, rgba(58, 107, 140, 0.06));
  color: var(--c-brand);
  transform: translateY(-2px);
}

.action-btn:focus-visible {
  outline: 2px solid var(--c-focus);
  outline-offset: 2px;
}

.action-btn:active {
  transform: translateY(0);
}

.action-btn-primary {
  background: var(--c-brand);
  color: var(--c-brand-foreground);
  border-color: var(--c-brand);
}

.action-btn-primary:hover {
  background: var(--c-brand-dark);
  color: var(--c-brand-foreground);
}

@media (prefers-reduced-motion: reduce) {
  .card {
    transition: none !important;
  }
  .action-btn {
    transition: none !important;
  }
}
</style>
