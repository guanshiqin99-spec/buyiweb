<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { RouterLink } from 'vue-router'
import FloatingParticles from '@/components/common/FloatingParticles.vue'
import { homeApi, contentApi, recordsApi, badgesApi } from '@/utils/api'
import { useSearchStore } from '@/stores/search'
import { useAuthStore } from '@/stores/auth'
import imgCraft from '@/assets/images/bouyei-craft.jpg'
import imgTextile from '@/assets/images/bouyei-textile.jpg'
import imgNature from '@/assets/images/bouyei-nature.jpg'

const searchStore = useSearchStore()
const authStore = useAuthStore()
const isLoaded = ref(false)
const counters = ref({ vocab: 0, phrases: 0, proverbs: 0, songs: 0 })
const statsVisible = ref(false)
const banners = ref([])
const suggestions = ref([])

// 学习进度（登录态）
const learnStats = ref(null)
const badges = ref([])

// 统计数据：从后端各类型列表的 total 字段获取真实计数
const stats = ref([
  { key: 'vocab', number: 0, suffix: '+', label: '收录词汇' },
  { key: 'phrases', number: 0, suffix: '+', label: '常用短语' },
  { key: 'proverbs', number: 0, suffix: '', label: '智慧谚语' },
  { key: 'songs', number: 0, suffix: '', label: '传统民歌' }
])

// 词典入口（纵向列表，非卡片网格）
const dictEntries = [
  { pattern: 'batik', title: '词汇', desc: '布依语日常词汇与释义', link: '/dictionary' },
  { pattern: 'drum', title: '短语', desc: '高频日常交流表达', link: '/dictionary' },
  { pattern: 'weaving', title: '谚语', desc: '世代相传的智慧结晶', link: '/dictionary' }
]

// 文化内容（横向三联，配真实工艺图）
const cultureItems = [
  { img: imgCraft, title: '蜡染', note: '靛蓝为底，铜蜡刀绘就花鸟鱼虫，是布依族最古老的纺织记忆。' },
  { img: imgTextile, title: '织锦', note: '腰机穿梭间，几何纹样编织出族群的身份密码。' },
  { img: imgNature, title: '银饰', note: '盛装载银，项圈手镯叮当作响，承载着族群对光与美的信仰。' }
]

// 民族纹样小图标 SVG path
const patternIcons = {
  batik: 'M12 2L22 8.5V15.5L12 22L2 15.5V8.5L12 2Z',
  drum: 'M12 2A10 10 0 1 0 12 22A10 10 0 1 0 12 2Z',
  weaving: 'M3 3H21V21H3Z'
}

// 数字计数动画
const animateCounter = (key, target, duration = 1600) => {
  const start = Date.now()
  const animate = () => {
    if (isUnmounted) return
    const elapsed = Date.now() - start
    const progress = Math.min(elapsed / duration, 1)
    const eased = 1 - Math.pow(1 - progress, 3)
    counters.value[key] = Math.floor(eased * target)
    if (progress < 1) requestAnimationFrame(animate)
  }
  requestAnimationFrame(animate)
}

let scrollObserver = null
let statsObserver = null
let loadTimer = null
let isUnmounted = false

onMounted(async () => {
  loadTimer = setTimeout(() => { isLoaded.value = true }, 100)

  // 拉取首页数据
  try {
    const homeData = await homeApi.get()
    banners.value = homeData.banners || []
    suggestions.value = homeData.suggestions || []
  } catch (e) {
    console.error('首页数据加载失败', e)
  }

  // 各类型真实计数
  try {
    const types = [
      { key: 'vocab', type: 'dictionary' },
      { key: 'phrases', type: 'phrase' },
      { key: 'proverbs', type: 'proverb' },
      { key: 'songs', type: 'song' }
    ]
    const results = await Promise.all(
      types.map(t => contentApi.list(t.type, { page: 1, pageSize: 1 }).catch(() => ({ total: 0 })))
    )
    results.forEach((res, i) => {
      stats.value[i].number = res.total || 0
    })
  } catch (e) {
    console.error('统计数据加载失败', e)
  }

  // 登录态：拉取学习进度与徽章
  if (authStore.isLoggedIn) {
    try {
      const [statsRes, badgesRes] = await Promise.all([
        recordsApi.stats().catch(() => null),
        badgesApi.list().catch(() => ({ items: [] }))
      ])
      learnStats.value = statsRes
      badges.value = (badgesRes.items || badgesRes || []).slice(0, 6)
    } catch (e) {
      console.error('学习数据加载失败', e)
    }
  }

  // 滚动入场：IntersectionObserver
  await nextTick()
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (!reduceMotion) {
    scrollObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible')
          scrollObserver.unobserve(entry.target)
        }
      })
    }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' })
    document.querySelectorAll('.reveal-on-scroll').forEach(el => scrollObserver.observe(el))
  } else {
    document.querySelectorAll('.reveal-on-scroll').forEach(el => el.classList.add('is-visible'))
  }

  // 统计区数字动画
  const statsEl = document.querySelector('.stats-section')
  if (statsEl) {
    const triggerStats = () => {
      if (!statsVisible.value) {
        statsVisible.value = true
        stats.value.forEach((stat, i) => {
          setTimeout(() => animateCounter(stat.key, stat.number), i * 150)
        })
      }
    }
    if (reduceMotion) {
      triggerStats()
    } else {
      statsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            triggerStats()
            statsObserver.unobserve(entry.target)
          }
        })
      }, { threshold: 0.3 })
      statsObserver.observe(statsEl)
    }
  }
})

onUnmounted(() => {
  isUnmounted = true
  if (loadTimer) clearTimeout(loadTimer)
  if (scrollObserver) scrollObserver.disconnect()
  if (statsObserver) statsObserver.disconnect()
})
</script>

<template>
  <div class="home-page" :class="{ loaded: isLoaded }">
    <main id="main">
      <!-- 1. Hero 封面 -->
      <section class="hero">
        <div class="hero-bg">
          <img src="@/assets/images/bouyei-landscape.jpg" alt="布依族梯田风光" width="1920" height="1280" loading="eager" fetchpriority="high"/>
        </div>
        <div class="hero-scrim"></div>
        <FloatingParticles pattern="batik" :count="8" />
        <div class="hero-content">
          <p class="hero-tag reveal">少数民族语言数字化保护</p>
          <h1 class="hero-title reveal">布依族<br/>词典</h1>
          <p class="hero-desc reveal">传承布依文化，连接语言之美</p>
          <button class="search-trigger reveal" type="button" aria-label="打开搜索" @click="searchStore.open()">
            <svg class="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <circle cx="11" cy="11" r="8" stroke="currentColor"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65" stroke="currentColor"/>
            </svg>
            <span class="search-placeholder">搜索布依语词汇、短语…</span>
            <kbd class="search-kbd">⌘&nbsp;K</kbd>
          </button>
          <p class="hero-footnote reveal">{{ counters.vocab || 646 }}+ 词汇收录</p>
        </div>
      </section>

      <!-- 2. 词典入口区 -->
      <section class="dict-entry-section reveal-on-scroll">
        <div class="section-inner">
          <div class="dict-entry-head">
            <p class="section-eyebrow">EXHIBIT 01</p>
            <h2 class="section-title-serif">查词·读典</h2>
            <p class="section-lead">布依语词汇、短语与谚语的知识宝库，支持发音、例句与文化注释。</p>
          </div>
          <!-- 今日推荐词条 -->
          <div v-if="suggestions.length" class="today-picks">
            <p class="picks-label">今日推荐</p>
            <div class="picks-list">
              <RouterLink
                v-for="item in suggestions.slice(0, 4)"
                :key="item.id || item.buyiText || item.title"
                class="pick-chip"
                :to="{ path: '/dictionary', query: { q: item.buyiText || item.zhText || item.title || '' } }"
              >
                {{ item.buyiText || item.title || item.zhText }}
              </RouterLink>
            </div>
          </div>
          <ul class="dict-entry-list">
            <li v-for="(entry, idx) in dictEntries" :key="entry.title">
              <RouterLink
                class="dict-entry-item"
                :class="{ 'is-primary': idx === 0 }"
                :to="entry.link"
              >
                <span class="entry-pattern" aria-hidden="true">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--c-brand)" stroke-width="1.4">
                    <path :d="patternIcons[entry.pattern]"/>
                  </svg>
                </span>
                <span class="entry-body">
                  <span class="entry-title">{{ entry.title }}</span>
                  <span class="entry-desc">{{ entry.desc }}</span>
                </span>
                <svg class="entry-arrow" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--c-text-50)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <line x1="5" y1="12" x2="19" y2="12"/>
                  <polyline points="12 5 19 12 12 19"/>
                </svg>
              </RouterLink>
            </li>
          </ul>
        </div>
      </section>

      <!-- 3. 文化内容区 -->
      <section class="culture-section reveal-on-scroll">
        <div class="section-inner">
          <p class="section-eyebrow">EXHIBIT 02</p>
          <h2 class="section-title-serif">纹样与手作</h2>
          <div class="culture-grid">
            <article v-for="item in cultureItems" :key="item.title" class="culture-card liquid-glass liquid-glass-content">
              <div class="culture-img-wrap">
                <img :src="item.img" :alt="item.title + '工艺'" width="480" height="320" loading="lazy"/>
              </div>
              <div class="culture-body">
                <h3 class="culture-title">{{ item.title }}</h3>
                <p class="culture-note">{{ item.note }}</p>
              </div>
            </article>
          </div>
        </div>
      </section>

      <!-- 4. 民歌入口区 -->
      <section class="song-entry-section reveal-on-scroll">
        <div class="song-entry-bg">
          <img src="@/assets/images/folk-song-bg.jpg" alt="布依族民歌" width="1920" height="900" loading="lazy"/>
        </div>
        <div class="song-entry-scrim"></div>
        <div class="song-entry-content">
          <p class="section-eyebrow light">EXHIBIT 03</p>
          <h2 class="song-entry-title">布依族民歌</h2>
          <p class="song-entry-desc">大歌唱彻山野，八音坐唱悠远绵长——聆听布依族的天籁之音。</p>
          <RouterLink to="/songs" class="cta-pill">
            聆听布依天籁
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <line x1="5" y1="12" x2="19" y2="12"/>
              <polyline points="12 5 19 12 12 19"/>
            </svg>
          </RouterLink>
        </div>
      </section>

      <!-- 5. 学习进度区 -->
      <section class="learn-section reveal-on-scroll">
        <div class="section-inner">
          <p class="section-eyebrow">EXHIBIT 04</p>
          <h2 class="section-title-serif">学习进度</h2>
          <div v-if="authStore.isLoggedIn && learnStats" class="learn-panel liquid-glass liquid-glass-content">
            <div class="learn-stats-row">
              <div class="learn-stat">
                <p class="learn-stat-num">{{ learnStats.todayCount || 0 }}</p>
                <p class="learn-stat-label">今日已学</p>
              </div>
              <div class="learn-stat">
                <p class="learn-stat-num">{{ learnStats.streakDays || 0 }}</p>
                <p class="learn-stat-label">连续天数</p>
              </div>
              <div class="learn-stat">
                <p class="learn-stat-num">{{ learnStats.totalCount || 0 }}</p>
                <p class="learn-stat-label">累计学习</p>
              </div>
            </div>
            <div v-if="badges.length" class="badge-row">
              <p class="badge-row-title">已获徽章</p>
              <div class="badge-thumbs">
                <span v-for="b in badges" :key="b.code" class="badge-thumb" :class="{ locked: !b.unlocked }" :title="b.name">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3">
                    <path :d="patternIcons[b.pattern || 'batik']"/>
                  </svg>
                </span>
              </div>
            </div>
          </div>
          <div v-else class="learn-panel liquid-glass liquid-glass-content learn-panel-empty">
            <p class="learn-empty-text">{{ authStore.isLoggedIn ? '暂无学习记录，去词典开始第一课…' : '登录后开启你的学习记录与徽章收集。' }}</p>
            <RouterLink v-if="!authStore.isLoggedIn" to="/login" class="cta-pill-outline">登录开启</RouterLink>
            <RouterLink v-else to="/dictionary" class="cta-pill-outline">开始学习</RouterLink>
          </div>
        </div>
      </section>

      <!-- 6. 数据统计区 -->
      <section class="stats-section reveal-on-scroll">
        <div class="section-inner">
          <p class="section-eyebrow">EXHIBIT 05</p>
          <h2 class="section-title-serif">平台数据</h2>
          <div class="stats-grid">
            <div v-for="stat in stats" :key="stat.key" class="stat-item liquid-glass-quiet">
              <p class="stat-number">{{ counters[stat.key] }}<span class="stat-suffix">{{ stat.suffix }}</span></p>
              <p class="stat-label">{{ stat.label }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- 7. 收束 CTA -->
      <section class="cta-section reveal-on-scroll">
        <div class="cta-inner">
          <h2 class="cta-title">开始探索布依语</h2>
          <p class="cta-desc">一键进入词典，开启数字文化之旅。</p>
          <RouterLink to="/dictionary" class="cta-pill large">
            进入词典
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <line x1="5" y1="12" x2="19" y2="12"/>
              <polyline points="12 5 19 12 12 19"/>
            </svg>
          </RouterLink>
        </div>
      </section>
    </main>
  </div>
</template>

<style scoped>
/* ===== 通用 ===== */
.section-inner {
  max-width: 1080px;
  margin: 0 auto;
  padding: 0 24px;
}
.section-eyebrow {
  font: 500 11px var(--font-mono);
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--c-accent);
  margin: 0 0 16px 0;
}
.section-eyebrow.light { color: var(--c-accent-300); }
.section-title-serif {
  font-family: var(--font-serif);
  font-size: clamp(28px, 4.5vw, 44px);
  font-weight: 600;
  letter-spacing: -0.01em;
  color: var(--c-text);
  margin: 0 0 12px 0;
  text-wrap: balance;
}
.section-lead {
  font-size: 16px;
  line-height: 1.6;
  color: var(--c-text-60);
  max-width: 540px;
  margin: 0 0 0 0;
  text-wrap: pretty;
}

/* 滚动入场 */
.reveal-on-scroll {
  opacity: 0;
  transform: translateY(32px);
  transition: opacity 0.7s cubic-bezier(0.32, 0.72, 0, 1), transform 0.7s cubic-bezier(0.32, 0.72, 0, 1);
}
.reveal-on-scroll.is-visible {
  opacity: 1;
  transform: translateY(0);
}

/* ===== 1. Hero ===== */
.hero {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: flex-end;
  padding: 0 24px 72px;
  overflow: hidden;
}
.hero-bg {
  position: absolute;
  inset: 0;
  z-index: -2;
}
.hero-bg img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  animation: heroImgReveal 1.4s cubic-bezier(0.32, 0.72, 0, 1) both;
}
@keyframes heroImgReveal {
  from { opacity: 0; transform: scale(1.06); }
  to { opacity: 1; transform: scale(1); }
}
.hero-scrim {
  position: absolute;
  inset: 0;
  z-index: -1;
  background: var(--grad-hero-scrim), var(--grad-hero-bottom);
}
.hero-content {
  max-width: 720px;
  color: #fff;
  position: relative;
  z-index: 2;
}
.hero-tag {
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--c-accent);
  margin: 0 0 20px 0;
}
.hero-title {
  font-family: var(--font-serif);
  font-size: clamp(60px, 11vw, 140px);
  font-weight: 600;
  line-height: 0.88;
  color: #fff;
  margin: 0 0 20px 0;
}
.hero-desc {
  font-size: clamp(16px, 2vw, 20px);
  font-weight: 400;
  line-height: 1.55;
  color: rgba(255,255,255,0.82);
  margin: 0 0 36px 0;
}
.search-trigger {
  display: flex;
  align-items: center;
  width: 100%;
  max-width: 520px;
  height: 48px;
  padding: 0 18px;
  border: 1px solid rgba(255,255,255,0.2);
  border-radius: var(--btn-radius);
  background: rgba(255,255,255,0.12);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  color: rgba(255,255,255,0.7);
  cursor: pointer;
  transition: background 220ms ease, border-color 220ms ease, transform 220ms cubic-bezier(0.32, 0.72, 0, 1);
}
.search-trigger:hover {
  background: rgba(255,255,255,0.18);
  border-color: rgba(255,255,255,0.32);
}
.search-trigger:focus-visible {
  outline: 2px solid var(--c-accent);
  outline-offset: 3px;
}
.search-icon { flex-shrink: 0; color: rgba(255,255,255,0.6); }
.search-placeholder {
  flex: 1;
  text-align: left;
  font: 400 15px var(--font-sans);
  user-select: none;
  margin-left: 10px;
}
.search-kbd {
  display: inline-flex;
  align-items: center;
  height: 24px;
  padding: 0 8px;
  border: 1px solid rgba(255,255,255,0.22);
  border-radius: 6px;
  background: rgba(255,255,255,0.08);
  color: rgba(255,255,255,0.6);
  font: 500 11px var(--font-mono);
  flex-shrink: 0;
}
.hero-footnote {
  font-size: 12px;
  color: rgba(255,255,255,0.55);
  margin: 20px 0 0 0;
  font-variant-numeric: tabular-nums;
}
.reveal {
  opacity: 0;
  transform: translateY(24px);
  animation: heroFadeUp 0.8s cubic-bezier(0.32, 0.72, 0, 1) forwards;
}
@keyframes heroFadeUp {
  from { opacity: 0; transform: translateY(24px); }
  to { opacity: 1; transform: translateY(0); }
}
.loaded .hero-tag { animation-delay: 0.3s; }
.loaded .hero-title { animation-delay: 0.5s; }
.loaded .hero-desc { animation-delay: 0.7s; }
.loaded .search-trigger { animation-delay: 0.9s; }
.loaded .hero-footnote { animation-delay: 1.1s; }

/* ===== 2. 词典入口区 ===== */
.dict-entry-section { padding: 96px 0; }
.dict-entry-head { margin-bottom: 48px; }

/* 今日推荐词条 */
.today-picks {
  margin-bottom: 40px;
  padding: 20px 24px;
  background: var(--c-brand-06);
  border-radius: var(--radius-md);
  border-left: 3px solid var(--c-accent);
}
.picks-label {
  font: 500 11px var(--font-mono);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--c-accent);
  margin: 0 0 12px 0;
}
.picks-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
.pick-chip {
  display: inline-flex;
  align-items: center;
  padding: 8px 16px;
  border: 1px solid var(--c-brand-25);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.6);
  color: var(--c-text);
  font: 500 14px var(--font-sans);
  cursor: pointer;
  transition: background 150ms ease, border-color 150ms ease, transform 150ms ease;
  text-decoration: none;
}
.pick-chip:hover {
  background: var(--c-brand-08);
  border-color: var(--c-brand-40);
  transform: translateY(-1px);
}
.pick-chip:focus-visible {
  outline: 2px solid var(--c-brand);
  outline-offset: 2px;
}

/* 核心入口高亮 */
.dict-entry-item.is-primary {
  background: var(--c-brand-06);
  border-radius: var(--radius-md);
  padding: 28px 20px;
  margin-bottom: 8px;
}
.dict-entry-item.is-primary .entry-pattern {
  width: 56px;
  height: 56px;
  background: var(--c-brand-08);
}
.dict-entry-item.is-primary .entry-title {
  font-size: 24px;
}
.dict-entry-item.is-primary:hover {
  background: var(--c-brand-08);
}
.dict-entry-list {
  list-style: none;
  margin: 0;
  padding: 0;
  border-top: 1px solid var(--c-divider);
}
.dict-entry-list li { border-bottom: 1px solid var(--c-divider); }
.dict-entry-item {
  display: flex;
  align-items: center;
  gap: 20px;
  width: 100%;
  padding: 24px 8px;
  border: none;
  background: transparent;
  color: inherit;
  cursor: pointer;
  text-align: left;
  text-decoration: none;
  transition: padding-left 280ms cubic-bezier(0.32, 0.72, 0, 1), background 220ms ease;
}
.dict-entry-item:hover {
  padding-left: 20px;
  background: var(--c-brand-06);
}
.dict-entry-item:focus-visible {
  outline: 2px solid var(--c-brand);
  outline-offset: -2px;
}
.entry-pattern {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: var(--radius-md);
  background: var(--c-brand-06);
  flex-shrink: 0;
}
.entry-body { display: flex; flex-direction: column; gap: 4px; min-width: 0; flex: 1; }
.entry-title { font: 600 20px var(--font-serif); color: var(--c-text); }
.entry-desc { font-size: 14px; color: var(--c-text-60); }
.entry-arrow { flex-shrink: 0; transition: transform 280ms cubic-bezier(0.32, 0.72, 0, 1); }
.dict-entry-item:hover .entry-arrow { transform: translateX(6px); stroke: var(--c-brand); }

/* ===== 3. 文化内容区 ===== */
.culture-section { padding: 96px 0; background: var(--c-bg-silver); }
.culture-section .section-eyebrow,
.culture-section .section-title-serif { margin-bottom: 16px; }
.culture-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  margin-top: 40px;
}
@media (max-width: 900px) { .culture-grid { grid-template-columns: 1fr; } }
.culture-card {
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
.culture-img-wrap { aspect-ratio: 3 / 2; overflow: hidden; }
.culture-img-wrap img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 600ms cubic-bezier(0.32, 0.72, 0, 1);
}
.culture-card:hover .culture-img-wrap img { transform: scale(1.05); }
.culture-body { padding: 20px 24px 24px; }
.culture-title { font: 600 20px var(--font-serif); color: var(--c-text); margin: 0 0 8px 0; }
.culture-note { font-size: 14px; line-height: 1.6; color: var(--c-text-60); margin: 0; text-wrap: pretty; }

/* ===== 4. 民歌入口区 ===== */
.song-entry-section {
  position: relative;
  min-height: 60vh;
  display: flex;
  align-items: center;
  overflow: hidden;
}
.song-entry-bg { position: absolute; inset: 0; z-index: -2; }
.song-entry-bg img { width: 100%; height: 100%; object-fit: cover; }
.song-entry-scrim {
  position: absolute;
  inset: 0;
  z-index: -1;
  background: linear-gradient(105deg, rgba(27,58,92,0.92) 0%, rgba(27,58,92,0.70) 40%, rgba(27,58,92,0.30) 100%);
}
.song-entry-content {
  max-width: 1080px;
  margin: 0 auto;
  padding: 0 24px;
  color: #fff;
}
.song-entry-title {
  font-family: var(--font-serif);
  font-size: clamp(36px, 6vw, 64px);
  font-weight: 600;
  line-height: 1;
  margin: 0 0 16px 0;
}
.song-entry-desc {
  font-size: clamp(15px, 1.6vw, 18px);
  color: rgba(255,255,255,0.82);
  max-width: 460px;
  margin: 0 0 32px 0;
  line-height: 1.6;
}

/* ===== CTA 按钮 ===== */
.cta-pill {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: var(--btn-h-md);
  padding: var(--btn-pad-md);
  border: none;
  border-radius: var(--btn-radius);
  background: var(--grad-accent);
  color: #fff;
  font: 600 15px var(--font-sans);
  cursor: pointer;
  transition: transform 220ms cubic-bezier(0.32, 0.72, 0, 1), box-shadow 220ms ease;
  box-shadow: var(--shadow-sm);
  text-decoration: none;
}
.cta-pill:hover { transform: translateY(-2px); box-shadow: var(--shadow-md); }
.cta-pill:focus-visible { outline: 2px solid var(--c-accent); outline-offset: 3px; }
.cta-pill.large { height: var(--btn-h-lg); padding: var(--btn-pad-lg); font-size: 16px; }
.cta-pill-outline {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: var(--btn-h-md);
  padding: var(--btn-pad-md);
  border: 1px solid var(--c-brand-40);
  border-radius: var(--btn-radius);
  background: transparent;
  color: var(--c-brand);
  font: 600 14px var(--font-sans);
  cursor: pointer;
  transition: background 220ms ease, border-color 220ms ease;
  text-decoration: none;
}
.cta-pill-outline:hover { background: var(--c-brand-06); border-color: var(--c-brand); }
.cta-pill-outline:focus-visible { outline: 2px solid var(--c-brand); outline-offset: 2px; }

/* ===== 5. 学习进度区 ===== */
.learn-section { padding: 96px 0; }
.learn-section .section-title-serif { margin-bottom: 32px; }
.learn-panel { padding: 32px; }
.learn-stats-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  margin-bottom: 28px;
}
.learn-stat { text-align: center; }
.learn-stat-num {
  font: 700 36px var(--font-mono);
  color: var(--c-brand);
  margin: 0;
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.02em;
}
.learn-stat-label { font-size: 13px; color: var(--c-text-60); margin: 4px 0 0 0; }
.badge-row { border-top: 1px solid var(--c-divider); padding-top: 24px; }
.badge-row-title { font-size: 13px; color: var(--c-text-60); margin: 0 0 12px 0; }
.badge-thumbs { display: flex; gap: 10px; flex-wrap: wrap; }
.badge-thumb {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: var(--radius-sm);
  background: var(--c-accent-10);
  color: var(--c-accent);
}
.badge-thumb.locked { background: var(--c-brand-06); color: var(--c-text-35); }
.learn-panel-empty {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 16px;
}
.learn-empty-text { font-size: 15px; color: var(--c-text-60); margin: 0; }

/* ===== 6. 数据统计区 ===== */
.stats-section { padding: 0 0 96px; }
.stats-section .section-title-serif { margin-bottom: 32px; }
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
  max-width: 720px;
}
@media (max-width: 640px) { .stats-grid { grid-template-columns: repeat(2, 1fr); } }
.stat-item {
  padding: 28px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.stat-number {
  font: 700 36px var(--font-mono);
  color: var(--c-text);
  margin: 0;
  letter-spacing: -0.02em;
  font-variant-numeric: tabular-nums;
}
.stat-suffix { font-size: 20px; color: var(--c-brand); }
.stat-label { font-size: 13px; color: var(--c-text-60); margin: 4px 0 0 0; }

/* ===== 7. 收束 CTA ===== */
.cta-section { padding: 80px 24px 120px; text-align: center; }
.cta-inner { max-width: 560px; margin: 0 auto; }
.cta-title {
  font-family: var(--font-serif);
  font-size: clamp(28px, 4vw, 40px);
  font-weight: 600;
  color: var(--c-text);
  margin: 0 0 12px 0;
  text-wrap: balance;
}
.cta-desc { font-size: 16px; color: var(--c-text-60); margin: 0 0 28px 0; }

/* ===== 减少动效 ===== */
@media (prefers-reduced-motion: reduce) {
  .reveal, .hero-bg img { animation: none !important; opacity: 1 !important; transform: none !important; }
  .reveal-on-scroll { opacity: 1 !important; transform: none !important; transition: none !important; }
  .culture-img-wrap img { transition: none !important; }
}
</style>
