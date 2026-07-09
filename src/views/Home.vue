<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import FloatingParticles from '@/components/common/FloatingParticles.vue'

const router = useRouter()
const searchQuery = ref('')
const isLoaded = ref(false)
const parallaxOffset = ref(0)
const counters = ref({ vocab: 0, phrases: 0, proverbs: 0, songs: 0 })
const statsVisible = ref(false)

const handleSearch = (query) => {
  if (query.trim()) {
    router.push({
      path: '/dictionary',
      query: { q: query }
    })
  }
}

const features = [
  { icon: '📖', title: '词典查询', description: '浏览完整词汇库，搜索布依语词条', link: '/dictionary', accent: false },
  { icon: '💬', title: '常用短语', description: '日常交流高频表达，掌握地道布依语', link: '/dictionary', accent: false },
  { icon: '💡', title: '智慧谚语', description: '布依族世代相传的智慧结晶', link: '/dictionary', accent: false },
  { icon: '🎵', title: '传统民歌', description: '聆听布依族天籁之音', link: '/songs', accent: true }
]

const stats = [
  { key: 'vocab', number: 646, suffix: '+', label: '收录词汇' },
  { key: 'phrases', number: 109, suffix: '+', label: '常用短语' },
  { key: 'proverbs', number: 39, suffix: '', label: '智慧谚语' },
  { key: 'songs', number: 3, suffix: '', label: '传统民歌' }
]

// Counter animation
const animateCounter = (key, target, duration = 2000) => {
  const start = Date.now()
  const animate = () => {
    const elapsed = Date.now() - start
    const progress = Math.min(elapsed / duration, 1)
    const eased = 1 - Math.pow(1 - progress, 3)
    counters.value[key] = Math.floor(eased * target)
    if (progress < 1) requestAnimationFrame(animate)
  }
  requestAnimationFrame(animate)
}

let scrollHandler = null

onMounted(() => {
  setTimeout(() => { isLoaded.value = true }, 100)

  scrollHandler = () => {
    parallaxOffset.value = window.scrollY * 0.3
  }
  window.addEventListener('scroll', scrollHandler, { passive: true })

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !statsVisible.value) {
        statsVisible.value = true
        stats.forEach((stat, i) => {
          setTimeout(() => animateCounter(stat.key, stat.number), i * 200)
        })
      }
    })
  }, { threshold: 0.3 })

  const statsEl = document.querySelector('.stats-section')
  if (statsEl) observer.observe(statsEl)
})

onUnmounted(() => {
  if (scrollHandler) {
    window.removeEventListener('scroll', scrollHandler)
  }
})
</script>

<template>
  <div class="home-page" :class="{ loaded: isLoaded }">
    <main id="main">
      <!-- Cinematic Hero -->
      <section class="hero">
        <div class="hero-bg" :style="{ transform: 	ranslateY(px) }">
          <img src="@/assets/images/bouyei-landscape.jpg" alt="布依族梯田风光" loading="eager"/>
        </div>
        <div class="hero-scrim"></div>
        <FloatingParticles pattern="batik" :count="16" />
        <div class="hero-content">
          <p class="hero-tag reveal">少数民族语言数字化保护</p>
          <h1 class="hero-title reveal title-breathe">布依族<br/>词典</h1>
          <p class="hero-desc reveal">传承布依文化，连接语言之美</p>
          <div class="search-wrapper liquid-glass search-glow reveal">
            <svg class="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="8" stroke="var(--c-brand)"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65" stroke="var(--c-brand)"/>
            </svg>
            <input type="text" v-model="searchQuery" autocomplete="off" spellcheck="false" aria-label="搜索布依语词汇" placeholder="搜索布依语词汇、短语…" @keydown.enter="handleSearch(searchQuery)"/>
            <button class="search-btn" @click="handleSearch(searchQuery)">搜索</button>
          </div>
          <p class="hero-stats reveal">646+ 词汇收录</p>
        </div>
      </section>

      <!-- 功能区域 -->
      <section class="features-section">
        <div class="container">
          <h2 class="section-title reveal">探索布依语</h2>
          <p class="section-subtitle reveal">词典、短语、谚语、民歌 —— 全方位体验布依族语言文化</p>
          <div class="features-grid stagger-enter">
            <a v-for="feature in features" :key="feature.title" :href="feature.link" class="feature-card liquid-glass card-interactive glow-card" :class="{ 'glow-accent': feature.accent }" @click.prevent="router.push(feature.link)">
              <div class="glow-effect"></div>
              <span class="feature-icon">{{ feature.icon }}</span>
              <h3 class="feature-title">{{ feature.title }}</h3>
              <p class="feature-description">{{ feature.description }}</p>
            </a>
          </div>
        </div>
      </section>

      <!-- 统计数据 -->
      <section class="stats-section">
        <div class="stats-grid stagger-enter">
          <div v-for="stat in stats" :key="stat.key" class="stat-item liquid-glass glow-card">
            <div class="glow-effect"></div>
            <p class="stat-number">{{ counters[stat.key] }}<span class="stat-suffix">{{ stat.suffix }}</span></p>
            <p class="stat-label">{{ stat.label }}</p>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<style scoped>
/* Hero 区域 */
.hero {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: flex-end;
  padding: 0 24px 80px;
  overflow: hidden;
}

.hero-bg {
  position: absolute;
  inset: -20%;
  z-index: -2;
  will-change: transform;
}

.hero-bg img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  animation: heroImgReveal 1.4s cubic-bezier(0.32, 0.72, 0, 1) both;
}

@keyframes heroImgReveal {
  from { opacity: 0; transform: scale(1.08); }
  to { opacity: 1; transform: scale(1); }
}

.hero-scrim {
  position: absolute;
  inset: 0;
  z-index: -1;
  background:
    linear-gradient(105deg, rgba(27,58,92,0.94) 0%, rgba(27,58,92,0.80) 28%, rgba(27,58,92,0.34) 58%, rgba(27,58,92,0.06) 100%),
    linear-gradient(to top, rgba(27,58,92,0.90) 0%, transparent 55%);
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
  margin: 0 0 24px 0;
}

.hero-title {
  font-family: var(--font-serif);
  font-size: clamp(64px, 12vw, 152px);
  font-weight: 600;
  line-height: 0.86;
  color: #fff;
  margin: 0 0 24px 0;
}

.hero-desc {
  font-size: clamp(16px, 2vw, 21px);
  font-weight: 400;
  line-height: 1.55;
  color: rgba(255,255,255,0.82);
  margin: 0 0 40px 0;
}

/* 搜索框 */
.search-wrapper {
  display: flex;
  align-items: center;
  width: 100%;
  max-width: 560px;
  height: 56px;
  padding: 0 8px 0 24px;
  border: 1px solid rgba(255,255,255,0.2);
  border-radius: 999px;
  background: rgba(255,255,255,0.15);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  transition: transform 0.3s cubic-bezier(0.32, 0.72, 0, 1);
}

.search-wrapper:focus-within {
  transform: scale(1.02);
}

.search-icon { flex-shrink: 0; }

.search-wrapper input {
  flex: 1;
  border: none;
  background: transparent;
  color: #fff;
  font: 400 16px var(--font-sans);
  padding: 0 16px;
  outline: none;
}

.search-wrapper input::placeholder { color: rgba(255,255,255,0.5); }

.search-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 40px;
  padding: 0 24px;
  border: none;
  border-radius: 999px;
  background: var(--c-brand);
  color: #fff;
  font: 600 14px var(--font-sans);
  cursor: pointer;
  transition: filter 150ms ease;
}

.search-btn:hover { filter: brightness(1.1); }

.hero-stats {
  font-size: 12px;
  color: rgba(255,255,255,0.6);
  margin: 24px 0 0 0;
}

/* 内容浮现动画 */
.reveal {
  opacity: 0;
  transform: translateY(28px);
  animation: heroFadeUp 0.8s cubic-bezier(0.32, 0.72, 0, 1) forwards;
}

@keyframes heroFadeUp {
  from { opacity: 0; transform: translateY(28px); }
  to { opacity: 1; transform: translateY(0); }
}

.loaded .hero-tag { animation-delay: 0.3s; }
.loaded .hero-title { animation-delay: 0.5s; }
.loaded .hero-desc { animation-delay: 0.7s; }
.loaded .search-wrapper { animation-delay: 0.9s; }
.loaded .hero-stats { animation-delay: 1.1s; }

/* 功能区域 */
.features-section {
  padding: 96px 24px;
  position: relative;
}

.container { max-width: 980px; margin: 0 auto; }

.section-title {
  font-size: clamp(28px, 4vw, 40px);
  font-weight: 600;
  letter-spacing: -0.02em;
  color: var(--c-text);
  margin: 0 0 12px 0;
  text-align: center;
}

.section-subtitle {
  font-size: 16px;
  color: var(--c-text-60);
  max-width: 480px;
  margin: 0 auto 48px;
  text-align: center;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 24px;
}

@media (max-width: 900px) { .features-grid { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 640px) { .features-grid { grid-template-columns: 1fr; } }

.feature-card {
  display: flex;
  flex-direction: column;
  padding: 32px;
  text-decoration: none;
  color: inherit;
  cursor: pointer;
}

.feature-icon { font-size: 28px; margin-bottom: 20px; flex-shrink: 0; }
.feature-title { font-size: 20px; font-weight: 600; color: var(--c-text); line-height: 1.2; margin: 0 0 8px 0; }
.feature-description { font-size: 14px; font-weight: 400; color: var(--c-text-60); line-height: 1.55; margin: 0; }

/* 统计数据 */
.stats-section { padding: 0 24px 96px; }

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
  max-width: 720px;
  margin: 0 auto;
}

@media (max-width: 640px) { .stats-grid { grid-template-columns: repeat(2, 1fr); } }

.stat-item {
  padding: 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-number { font-size: 36px; font-weight: 700; color: var(--c-text); margin: 0; letter-spacing: -0.02em; }
.stat-suffix { font-size: 20px; color: var(--c-brand); }
.stat-label { font-size: 13px; color: var(--c-text-60); margin: 4px 0 0 0; }

/* 减少动效 */
@media (prefers-reduced-motion: reduce) {
  .reveal, .hero-bg img { animation: none !important; opacity: 1 !important; transform: none !important; }
  .feature-card { transition: none !important; }
  .glow-effect { display: none !important; }
}
</style>
