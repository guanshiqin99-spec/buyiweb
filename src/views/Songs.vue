<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { contentApi } from '@/utils/api'
import { usePlayerStore } from '@/stores/player'
import imgAmbient from '@/assets/images/music-ambient.jpg'
import imgBg from '@/assets/images/folk-song-bg.jpg'

// Observer 提升到模块级，便于卸载时断开
let scrollObserver = null

const playerStore = usePlayerStore()
const songs = ref([])
const isLoading = ref(false)

// 沉浸 Hero 展示的歌曲：优先当前播放，否则第一首
const heroSong = computed(() => {
  if (playerStore.currentSong) {
    return playerStore.currentSong
  }
  return songs.value[0] || null
})

const heroCover = computed(() => heroSong.value?.coverUrl || imgAmbient)
const isHeroPlaying = computed(() =>
  heroSong.value && playerStore.currentSong?.id === heroSong.value.id && playerStore.isPlaying
)

const togglePlay = (song) => {
  playerStore.playSong(song)
}

const playHero = () => {
  if (heroSong.value) togglePlay(heroSong.value)
}

onMounted(async () => {
  isLoading.value = true
  try {
    const res = await contentApi.list('song', { page: 1, pageSize: 50 })
    songs.value = (res.items || []).map(item => ({
      id: item.id,
      title: item.title || item.zhText || '未命名',
      artist: item.artist || '布依族民歌传承人',
      duration: '--',
      genre: item.zhText || item.description || '民歌',
      coverUrl: item.coverUrl || imgAmbient,
      lyrics: item.lyrics || ''
    }))
  } catch (e) {
    console.error('民歌加载失败', e)
    songs.value = []
  } finally {
    isLoading.value = false
  }

  // 滚动入场
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
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' })
    document.querySelectorAll('.reveal-on-scroll').forEach(el => scrollObserver.observe(el))
  } else {
    document.querySelectorAll('.reveal-on-scroll').forEach(el => el.classList.add('is-visible'))
  }
})

onUnmounted(() => {
  if (scrollObserver) scrollObserver.disconnect()
})
</script>

<template>
  <div class="songs-page">
    <main id="main">
      <!-- 沉浸式 Hero 歌曲卡 70vh -->
      <section class="song-hero" :style="{ '--hero-cover': `url(${imgBg})` }">
        <div class="hero-blur-bg" :style="{ backgroundImage: `url(${heroCover})` }"></div>
        <div class="hero-scrim"></div>
        <div class="hero-inner">
          <div class="hero-cover-wrap" :class="{ playing: isHeroPlaying }">
            <img :src="heroCover" :alt="heroSong?.title || '布依族民歌'" width="320" height="320" loading="eager" fetchpriority="high"/>
            <button
              v-if="heroSong"
              class="hero-play-btn"
              type="button"
              :aria-label="isHeroPlaying ? '暂停' : '播放'"
              @click="playHero"
            >
              <svg v-if="isHeroPlaying" width="28" height="28" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>
              </svg>
              <svg v-else width="28" height="28" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <polygon points="5 3 19 12 5 21 5 3"/>
              </svg>
            </button>
            <!-- 播放波纹 -->
            <span v-if="isHeroPlaying" class="ripple" aria-hidden="true">
              <span class="ripple-ring"></span>
              <span class="ripple-ring"></span>
              <span class="ripple-ring"></span>
            </span>
          </div>
          <div class="hero-text">
            <p class="hero-eyebrow">布依族民歌</p>
            <h1 class="hero-title">{{ heroSong?.title || '聆听布依天籁' }}</h1>
            <p class="hero-artist">{{ heroSong?.artist || '布依族民歌传承人' }}</p>
            <p v-if="heroSong?.genre" class="hero-genre">{{ heroSong.genre }}</p>
          </div>
        </div>
      </section>

      <!-- 歌单列表 -->
      <section class="songs-section reveal-on-scroll">
        <div class="section-inner">
          <div class="songs-head">
            <h2 class="section-title-serif">民歌曲库</h2>
            <p class="section-lead">山歌、情歌、酒歌——布依族世代传唱的声音。</p>
          </div>
          <p v-if="isLoading" class="loading-hint">加载中…</p>
          <p v-else-if="songs.length === 0" class="loading-hint">暂无民歌</p>
          <ul v-else class="songs-list">
            <li
              v-for="song in songs"
              :key="song.id"
              class="song-row"
              :class="{ playing: playerStore.currentSong?.id === song.id && playerStore.isPlaying }"
            >
              <button class="song-row-main" type="button" @click="togglePlay(song)">
                <span class="song-cover-mini">
                  <img :src="song.coverUrl" :alt="song.title" width="72" height="72" loading="lazy"/>
                  <span class="cover-overlay">
                    <svg v-if="playerStore.currentSong?.id === song.id && playerStore.isPlaying" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>
                    </svg>
                    <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <polygon points="5 3 19 12 5 21 5 3"/>
                    </svg>
                  </span>
                </span>
                <span class="song-body">
                  <span class="song-title-row">
                    <span class="song-title">{{ song.title }}</span>
                    <span v-if="song.genre" class="song-genre-tag">{{ song.genre }}</span>
                  </span>
                  <span class="song-artist">{{ song.artist }}</span>
                  <span v-if="song.lyrics" class="song-lyrics-preview">{{ song.lyrics }}</span>
                </span>
              </button>
              <span class="song-duration">{{ song.duration }}</span>
            </li>
          </ul>
        </div>
      </section>

      <!-- 文化介绍 -->
      <section class="culture-section reveal-on-scroll">
        <div class="section-inner">
          <div class="culture-panel liquid-glass">
            <h2 class="section-title-serif">布依族音乐文化</h2>
            <p class="culture-text">布依族民歌是布依族文化的重要组成部分，包括山歌、情歌、酒歌等多种类型。这些歌曲承载着布依族的历史记忆和情感表达，是国家级非物质文化遗产。</p>
            <div class="culture-tags">
              <span class="tag">山歌</span>
              <span class="tag">情歌</span>
              <span class="tag">酒歌</span>
              <span class="tag">祭祀歌</span>
            </div>
          </div>
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
.section-title-serif {
  font-family: var(--font-serif);
  font-size: clamp(28px, 4.5vw, 40px);
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

.reveal-on-scroll {
  opacity: 0;
  transform: translateY(32px);
  transition: opacity 0.7s cubic-bezier(0.32, 0.72, 0, 1), transform 0.7s cubic-bezier(0.32, 0.72, 0, 1);
}
.reveal-on-scroll.is-visible {
  opacity: 1;
  transform: translateY(0);
}

/* ===== 沉浸式 Hero ===== */
.song-hero {
  position: relative;
  min-height: 70vh;
  display: flex;
  align-items: flex-end;
  padding: 0 24px 56px;
  overflow: hidden;
}
.hero-blur-bg {
  position: absolute;
  inset: -10%;
  z-index: -2;
  background-size: cover;
  background-position: center;
  filter: blur(40px) saturate(1.2);
  transform: scale(1.15);
}
.hero-scrim {
  position: absolute;
  inset: 0;
  z-index: -1;
  background: linear-gradient(180deg, rgba(27,58,92,0.55) 0%, rgba(27,58,92,0.35) 40%, rgba(27,58,92,0.92) 100%);
}
.hero-inner {
  display: flex;
  align-items: flex-end;
  gap: 40px;
  width: 100%;
  max-width: 1080px;
  margin: 0 auto;
  color: #fff;
}
@media (max-width: 768px) {
  .hero-inner { flex-direction: column; align-items: flex-start; gap: 24px; }
}
.hero-cover-wrap {
  position: relative;
  width: clamp(180px, 22vw, 280px);
  height: clamp(180px, 22vw, 280px);
  flex-shrink: 0;
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: 0 24px 60px rgba(0,0,0,0.4);
}
.hero-cover-wrap img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.hero-cover-wrap.playing { animation: coverBreathe 4s ease-in-out infinite; }
@keyframes coverBreathe {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.02); }
}
.hero-play-btn {
  position: absolute;
  right: 16px;
  bottom: 16px;
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
  box-shadow: 0 8px 24px rgba(212,136,58,0.4);
  transition: transform 220ms cubic-bezier(0.32, 0.72, 0, 1);
}
.hero-play-btn:hover { transform: scale(1.08); }
.hero-play-btn:focus-visible { outline: 2px solid #fff; outline-offset: 3px; }

/* 播放波纹 */
.ripple {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 1px;
  height: 1px;
  pointer-events: none;
}
.ripple-ring {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 100px;
  height: 100px;
  margin: -50px 0 0 -50px;
  border: 2px solid rgba(212,136,58,0.5);
  border-radius: 50%;
  animation: rippleOut 2.4s ease-out infinite;
}
.ripple-ring:nth-child(2) { animation-delay: 0.8s; }
.ripple-ring:nth-child(3) { animation-delay: 1.6s; }
@keyframes rippleOut {
  0% { transform: scale(0.8); opacity: 0.8; }
  100% { transform: scale(2.6); opacity: 0; }
}

.hero-text { min-width: 0; padding-bottom: 8px; }
.hero-eyebrow {
  font: 500 12px var(--font-mono);
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--c-accent-300);
  margin: 0 0 12px 0;
}
.hero-title {
  font-family: var(--font-serif);
  font-size: clamp(32px, 5vw, 56px);
  font-weight: 600;
  line-height: 1.05;
  margin: 0 0 10px 0;
  text-wrap: balance;
}
.hero-artist { font-size: 16px; color: rgba(255,255,255,0.78); margin: 0 0 8px 0; }
.hero-genre {
  display: inline-block;
  padding: 3px 12px;
  border-radius: 999px;
  background: rgba(255,255,255,0.15);
  color: rgba(255,255,255,0.85);
  font-size: 12px;
  font-weight: 500;
}

/* ===== 歌单列表 ===== */
.songs-section { padding: 80px 0; }
.songs-head { margin-bottom: 40px; }
.loading-hint { text-align: center; color: var(--c-text-60); font-size: 14px; padding: 32px; }
.songs-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 8px; }
.song-row {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px;
  border-radius: var(--radius-md);
  transition: background 200ms ease;
}
.song-row:hover { background: var(--c-brand-06); }
.song-row.playing { background: var(--c-accent-04); }
.song-row-main {
  display: flex;
  align-items: center;
  gap: 16px;
  flex: 1;
  min-width: 0;
  border: none;
  background: transparent;
  color: inherit;
  cursor: pointer;
  text-align: left;
  padding: 0;
}
.song-row-main:focus-visible { outline: 2px solid var(--c-brand); outline-offset: 2px; border-radius: var(--radius-md); }
.song-cover-mini {
  position: relative;
  width: 72px;
  height: 72px;
  border-radius: var(--radius-sm);
  overflow: hidden;
  flex-shrink: 0;
}
.song-cover-mini img { width: 100%; height: 100%; object-fit: cover; }
.cover-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(27,58,92,0.55);
  color: #fff;
  opacity: 0;
  transition: opacity 200ms ease;
}
.song-row:hover .cover-overlay,
.song-row.playing .cover-overlay { opacity: 1; }
.song-body { display: flex; flex-direction: column; gap: 3px; min-width: 0; flex: 1; }
.song-title-row { display: flex; align-items: center; gap: 8px; min-width: 0; }
.song-title { font: 600 16px var(--font-sans); color: var(--c-text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; min-width: 0; }
.song-genre-tag {
  flex-shrink: 0;
  padding: 2px 8px;
  border-radius: 999px;
  background: var(--c-brand-08);
  color: var(--c-brand);
  font-size: 11px;
  font-weight: 500;
}
.song-artist { font-size: 13px; color: var(--c-text-60); }
.song-lyrics-preview {
  font-size: 12px;
  color: var(--c-text-50);
  font-style: italic;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.song-duration {
  font: 400 13px var(--font-mono);
  color: var(--c-text-50);
  flex-shrink: 0;
  font-variant-numeric: tabular-nums;
}

/* ===== 文化介绍 ===== */
.culture-section { padding: 0 0 96px; }
.culture-panel { padding: 40px; }
.culture-text {
  font-size: 15px;
  line-height: 1.7;
  color: var(--c-text-70);
  margin: 0 0 24px 0;
  text-wrap: pretty;
}
.culture-tags { display: flex; gap: 10px; flex-wrap: wrap; }
.tag {
  padding: 6px 16px;
  border-radius: 999px;
  background: var(--c-brand-08);
  color: var(--c-brand);
  font-size: 13px;
  font-weight: 500;
}

/* ===== 减少动效 ===== */
@media (prefers-reduced-motion: reduce) {
  .reveal-on-scroll { opacity: 1 !important; transform: none !important; transition: none !important; }
  .hero-cover-wrap.playing { animation: none !important; }
  .ripple-ring { animation: none !important; opacity: 0 !important; }
}
</style>
