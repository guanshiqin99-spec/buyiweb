<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const searchQuery = ref('')

const handleSearch = (query) => {
  if (query.trim()) {
    router.push({
      path: '/dictionary',
      query: { q: query }
    })
  }
}

const features = [
  { icon: '📖', title: '词典查询', description: '浏览完整词词汇库，搜索布依语词条，查看释义与例句', link: '/dictionary' },
  { icon: '💬', title: '常用短语', description: '日常交流高频表达，掌握地道布依语对话', link: '/dictionary' },
  { icon: '💡', title: '智慧谚语', description: '布依族世代相传的智慧结晶，感悟民族哲学', link: '/dictionary' },
  { icon: '🎵', title: '传统民歌', description: '聆听布依族天籁之音，感受民族音乐魅力', link: '/songs' }
]

const stats = [
  { number: '646', suffix: '+', label: '收录词汇' },
  { number: '109', suffix: '+', label: '常用短语' },
  { number: '39', suffix: '', label: '智慧谚语' },
  { number: '3', suffix: '', label: '传统民歌' }
]
</script>

<template>
  <div class="home-page">
    <div class="background-layer"></div>
    <div class="overlay-layer"></div>
    <main id="main">
      <section class="hero-section">
        <div class="hero-content">
          <p class="hero-subtitle">少数民族语言数字化保护</p>
          <h1 class="hero-title title-breath">布依族词典</h1>
          <p class="hero-description">传承布依文化，连接语言之美</p>
          <div class="search-wrapper liquid-glass search-glow">
            <svg class="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="8" stroke="var(--c-brand)"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65" stroke="var(--c-brand)"/>
            </svg>
            <input type="text" v-model="searchQuery" autocomplete="off" spellcheck="false" aria-label="搜索布依语词汇" placeholder="搜索布依语词汇、短语…" @keydown.enter="handleSearch(searchQuery)"/>
            <button class="search-btn" @click="handleSearch(searchQuery)">搜索</button>
          </div>
          <p class="hero-stats">646+ 词汇收录</p>
        </div>
      </section>
      <section class="features-section">
        <div class="container">
          <h2 class="section-title">探索布依语</h2>
          <p class="section-subtitle">词典、短语、谚语、民歌 —— 全方位体验布依族语言文化</p>
          <div class="features-grid">
            <a v-for="feature in features" :key="feature.title" :href="feature.link" class="feature-card liquid-glass" @click.prevent="router.push(feature.link)">
              <span class="feature-icon">{{ feature.icon }}</span>
              <h3 class="feature-title">{{ feature.title }}</h3>
              <p class="feature-description">{{ feature.description }}</p>
            </a>
          </div>
        </div>
      </section>
      <section class="stats-section">
        <div class="container">
          <div class="stats-grid">
            <div v-for="stat in stats" :key="stat.label" class="stat-item liquid-glass">
              <p class="stat-number">{{ stat.number }}<span class="stat-suffix">{{ stat.suffix }}</span></p>
              <p class="stat-label">{{ stat.label }}</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<style scoped>
.home-page { min-height: 100vh; position: relative; }
.background-layer { position: fixed; inset: 0; z-index: -2; background: linear-gradient(160deg, var(--c-bg-warm), var(--c-bg-silver)); }
.overlay-layer { position: fixed; inset: 0; z-index: -1; background: var(--c-overlay); }
.hero-section { min-height: 90vh; display: flex; align-items: center; justify-content: center; padding: 64px 24px 96px; }
.hero-content { display: flex; flex-direction: column; align-items: center; text-align: center; max-width: 720px; }
.hero-subtitle { font-size: 12px; font-weight: 500; letter-spacing: 0.1em; text-transform: uppercase; color: var(--c-brand); margin: 0 0 24px 0; }
.hero-title { font-size: clamp(48px, 8vw, 80px); font-weight: 600; letter-spacing: -0.04em; line-height: 0.92; color: var(--c-text); margin: 0; }
.hero-description { font-size: clamp(16px, 2vw, 21px); font-weight: 400; line-height: 1.55; color: var(--c-text-70); max-width: 480px; margin: 16px 0 0 0; }
.search-wrapper { display: flex; align-items: center; width: 100%; max-width: 560px; height: 56px; margin-top: 40px; padding: 0 8px 0 24px; border: 1px solid var(--c-brand); border-radius: 999px; }
.search-icon { flex-shrink: 0; }
.search-wrapper input { flex: 1; border: none; background: transparent; color: var(--c-text); font: 400 16px var(--font-sans); padding: 0 16px; outline: none; }
.search-wrapper input::placeholder { color: var(--c-text-50); }
.search-btn { display: inline-flex; align-items: center; justify-content: center; height: 40px; padding: 0 24px; border: none; border-radius: 999px; background: var(--c-brand); color: var(--c-white); font: 600 14px var(--font-sans); cursor: pointer; transition: filter 150ms ease; }
.search-btn:hover { filter: brightness(1.1); }
.hero-stats { font-size: 12px; color: var(--c-text-50); margin: 24px 0 0 0; }
.features-section { padding: 0 24px 96px; }
.container { max-width: 980px; margin: 0 auto; }
.section-title { font-size: clamp(28px, 4vw, 40px); font-weight: 600; letter-spacing: -0.02em; color: var(--c-text); margin: 0 0 12px 0; text-align: center; }
.section-subtitle { font-size: 16px; color: var(--c-text-60); max-width: 480px; margin: 0 auto 48px; text-align: center; }
.features-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 24px; }
@media (max-width: 900px) { .features-grid { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 500px) { .features-grid { grid-template-columns: 1fr; } }
.feature-card { display: flex; flex-direction: column; padding: 32px; text-decoration: none; color: inherit; cursor: pointer; }
.feature-icon { font-size: 28px; margin-bottom: 20px; flex-shrink: 0; }
.feature-title { font-size: 20px; font-weight: 600; color: var(--c-text); line-height: 1.2; margin: 0 0 8px 0; }
.feature-description { font-size: 14px; font-weight: 400; color: var(--c-text-60); line-height: 1.55; margin: 0; }
.stats-section { padding: 0 24px 96px; }
.stats-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 16px; max-width: 720px; margin: 0 auto; }
@media (max-width: 600px) { .stats-grid { grid-template-columns: repeat(2, 1fr); } }
.stat-item { padding: 24px; display: flex; flex-direction: column; align-items: center; }
.stat-number { font-size: 36px; font-weight: 700; color: var(--c-text); margin: 0; letter-spacing: -0.02em; }
.stat-suffix { font-size: 20px; color: var(--c-brand); }
.stat-label { font-size: 13px; color: var(--c-text-60); margin: 4px 0 0 0; }
</style>