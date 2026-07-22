<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { contentApi, recordsApi } from '@/utils/api'
import { useAuthStore } from '@/stores/auth'
import { usePlayerStore } from '@/stores/player'
import AudioSpectrum from '@/components/specific/AudioSpectrum.vue'
import { fallbackSongs, formatDuration, normalizePlayableSongs } from '@/data/playableSongs'
import imgAmbient from '@/assets/images/music-ambient.jpg'
import imgBg from '@/assets/images/folk-song-bg.jpg'
import IconPause from '@/components/icons/IconPause.vue'
import IconPlay from '@/components/icons/IconPlay.vue'

const playerStore = usePlayerStore()
const authStore = useAuthStore()
const route = useRoute()
const songs = ref(fallbackSongs)
const isLoading = ref(false)
const sourceNotice = ref('')
const songsPageRef = ref(null)
const heroParallax = ref(0)
let revealObserver = null
let scrollHandler = null
const recordedSongIds = new Set()

const requestedSong = computed(() => songs.value.find((song) => String(song.id) === String(route.query.song || '')) || null)
const heroSong = computed(() => playerStore.currentSong || requestedSong.value || songs.value[0] || null)
const heroCover = computed(() => heroSong.value?.coverUrl || imgAmbient)
const isHeroPlaying = computed(() => Boolean(heroSong.value && playerStore.currentSong?.id === heroSong.value.id && playerStore.isPlaying))

async function loadSongs() {
  isLoading.value = true
  try {
    const response = await contentApi.list('song', { page: 1, pageSize: 50 })
    const playable = normalizePlayableSongs(response.items || [])
    songs.value = playable.length ? playable : fallbackSongs
    if (!playable.length) sourceNotice.value = '线上曲库暂不可用，正在使用随包音源；每首曲目的来源与授权状态均已标注。'
  } catch {
    songs.value = fallbackSongs
    sourceNotice.value = '线上曲库暂不可用，正在使用随包音源；每首曲目的来源与授权状态均已标注。'
  } finally {
    isLoading.value = false
  }
}

function playSong(song) {
  playerStore.playSong(song)
}

async function recordSongPlay(song) {
  const contentId = Number(song?.id)
  if (!authStore.isLoggedIn || !Number.isSafeInteger(contentId) || contentId < 1 || recordedSongIds.has(contentId)) return

  recordedSongIds.add(contentId)
  try {
    await recordsApi.create({ contentType: 'song', contentId, actionType: 'play' })
  } catch (error) {
    recordedSongIds.delete(contentId)
    console.error('民歌播放记录保存失败', error)
  }
}

// 等到媒体真正进入播放态后再计入学习记录，避免把加载失败的点击算作聆听。
watch(
  () => [playerStore.currentSong, playerStore.status],
  ([song, status]) => {
    if (status === 'playing') recordSongPlay(song)
  }
)

function initRevealObserver() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

  const isMobile = window.matchMedia('(max-width: 768px)').matches
  const coefficient = isMobile ? 0.06 : 0.12

  scrollHandler = () => {
    heroParallax.value = Math.min(window.scrollY * coefficient, 80)
  }
  window.addEventListener('scroll', scrollHandler, { passive: true })

  nextTick(() => {
    const root = songsPageRef.value
    if (!root) return

    const targets = [...root.querySelectorAll('.reveal-target')]
    root.classList.add('motion-ready')
    revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return
        entry.target.classList.add('is-revealed')
        revealObserver?.unobserve(entry.target)
      })
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.08 })

    targets.forEach((target) => revealObserver.observe(target))
  })
}

onMounted(() => {
  loadSongs()
  initRevealObserver()
})

onUnmounted(() => {
  revealObserver?.disconnect()
  if (scrollHandler) window.removeEventListener('scroll', scrollHandler)
})
</script>

<template>
  <main id="main" ref="songsPageRef" class="songs-page">
    <section class="songs-hero" data-nav-tone="dark" :style="{ '--hero-image': `url(${imgBg})`, '--hero-parallax': `${heroParallax}px` }">
      <div class="songs-hero__cover hero-cover-anim" :class="{ 'is-playing': isHeroPlaying }">
        <img :src="heroCover" :alt="heroSong ? `${heroSong.title}封面` : '布依民歌封面'" width="360" height="360" fetchpriority="high" />
        <button v-if="heroSong" v-pointer-glow="{ tone: 'brand', size: 'lg' }" type="button" :aria-label="isHeroPlaying ? '暂停播放' : '播放民歌'" @click="playSong(heroSong)">
          <IconPause v-if="isHeroPlaying" :size="28" />
          <IconPlay v-else :size="28" />
        </button>
      </div>
      <div class="songs-hero__copy">
        <p class="hero-kicker-anim">民歌声场</p>
        <h1 class="hero-title-anim">{{ heroSong?.title || '聆听布依天籁' }}</h1>
        <span class="hero-subtitle-anim">{{ heroSong?.artist || '正在准备民歌实录' }}</span>
        <AudioSpectrum :active="isHeroPlaying" class="hero-spectrum-anim" />
        <p v-if="playerStore.message" class="songs-hero__status hero-status-anim" role="status">{{ playerStore.message }}</p>
      </div>
    </section>

    <section class="song-library liquid-glass-quiet reveal-target" data-nav-tone="dark" aria-labelledby="song-library-title">
      <header class="song-library__heading">
        <div>
          <p>可播放曲目</p>
          <h2 id="song-library-title">民歌曲库</h2>
        </div>
        <span>{{ songs.length }} 首实录</span>
      </header>

      <p v-if="isLoading" class="song-library__state">正在整理声音档案…</p>
      <p v-if="sourceNotice" class="song-library__notice" role="status">{{ sourceNotice }}</p>
      <p v-if="!isLoading && !songs.length" class="song-library__state" role="status">暂未找到可播放的民歌，请稍后再试。</p>
      <ul v-if="songs.length" class="song-list">
        <li v-for="(song, index) in songs" :key="song.id" :class="{ 'is-playing': playerStore.currentSong?.id === song.id && playerStore.isPlaying }">
          <button type="button" class="song-row" @click="playSong(song)">
            <span class="song-row__index">{{ String(index + 1).padStart(2, '0') }}</span>
            <span class="song-row__cover">
              <img :src="song.coverUrl || imgAmbient" :alt="`${song.title}封面`" width="64" height="64" loading="lazy" />
            </span>
              <span class="song-row__copy">
                <strong>{{ song.title }}</strong>
                <span>{{ song.artist }}</span>
              <small>{{ song.genre }} · {{ song.sourceTitle }}</small>
            </span>
            <span class="song-row__status">{{ playerStore.currentSong?.id === song.id ? playerStore.formattedDuration : formatDuration(song.duration) }}</span>
            <span class="song-row__action" aria-hidden="true">
              <IconPause v-if="playerStore.currentSong?.id === song.id && playerStore.isPlaying" :size="14" />
              <IconPlay v-else :size="14" />
            </span>
          </button>
        </li>
      </ul>
    </section>

    <section class="song-note reveal-target" data-nav-tone="dark">
      <div>
        <p>声音不是背景</p>
        <h2>在频谱中看见民歌的呼吸</h2>
      </div>
      <p>播放真实音频时，声场会实时响应；网络不可用时，播放器会自动回退至随应用发布的本地演示音源。</p>
    </section>

    <section class="song-provenance reveal-target" data-nav-tone="dark" aria-labelledby="song-provenance-title">
      <div>
        <p>来源与授权</p>
        <h2 id="song-provenance-title">每一段声音都标明来处</h2>
      </div>
      <ul>
        <li v-for="song in songs" :key="`source-${song.id}`">
          <strong>{{ song.title }}</strong>
          <span>演唱：{{ song.artist }} · 来源：{{ song.sourceTitle }}</span>
          <small>{{ song.rightsNote }}</small>
        </li>
      </ul>
    </section>
  </main>
</template>

<style scoped>
.songs-page {
  /* 页面级语义令牌：仅用于本页深色沉浸氛围，不 shadow 全局 --c-* 令牌 */
  --page-surface: rgba(8, 28, 44, .72);
  --page-surface-strong: rgba(5, 20, 33, .88);
  --page-surface-soft: rgba(15, 42, 62, .55);
  --page-ink: #f4f9fb;
  --page-muted: #c5dbe2;
  --page-muted-strong: #9bbfc9;
  --page-accent: #f2bd70;
  --page-border: rgba(183, 220, 227, .22);
  --page-brand-light: #8ac7d3;
  min-height: 100vh;
  padding-bottom: 140px;
  /* 页面背景渐变：直接设置 background，不通过 token */
  background: linear-gradient(180deg, #0a1f33 0%, #0d2842 30%, #0f2d4a 100%);
  color: var(--page-ink);
}
.songs-hero { position: relative; display: grid; grid-template-columns: minmax(220px, 360px) minmax(0, 1fr); align-items: center; gap: clamp(34px, 8vw, 110px); min-height: min(780px, 82vh); padding: 132px max(24px, calc((100vw - 1100px) / 2)) 90px; overflow: hidden; color: var(--c-white); }
.songs-hero::before { position: absolute; inset: -10% 0; z-index: 0; background: linear-gradient(90deg, rgba(14, 31, 48, .94), rgba(27, 58, 92, .8) 46%, rgba(27, 58, 92, .48)), var(--hero-image) center / cover; content: ''; will-change: transform; transform: translate3d(0, var(--hero-parallax, 0px), 0); }
.songs-hero::after { position: absolute; right: -12vw; bottom: -40vw; width: 62vw; aspect-ratio: 1; border: 1px solid rgba(255,255,255,.18); border-radius: 50%; content: ''; }
.songs-hero__cover, .songs-hero__copy { position: relative; z-index: 1; }
.songs-hero__cover { width: min(100%, 360px); aspect-ratio: 1; overflow: hidden; box-shadow: 0 32px 80px rgba(0,0,0,.34); }
.songs-hero__cover img { width: 100%; height: 100%; object-fit: cover; }
.songs-hero__cover::after { position: absolute; inset: 0; border: 1px solid rgba(255,255,255,.35); content: ''; pointer-events: none; }
.songs-hero__cover button { position: absolute; inset: 0; display: grid; place-items: center; border: 0; color: var(--c-white); background: rgba(12, 31, 48, .28); cursor: pointer; opacity: 0; transition: opacity 180ms ease; }
.songs-hero__cover:hover button, .songs-hero__cover:focus-within button, .songs-hero__cover.is-playing button { opacity: 1; }
.songs-hero__cover button::before { position: absolute; width: 68px; height: 68px; border: 1px solid rgba(255,255,255,.82); border-radius: 50%; background: rgba(27, 58, 92, .72); content: ''; }
.songs-hero__cover button svg { position: relative; z-index: 1; }
.songs-hero__copy > p, .song-library__heading p, .song-note p:first-child, .song-provenance p { margin: 0; color: var(--page-accent); font-size: 12px; font-weight: 700; letter-spacing: .1em; }
.songs-hero__copy h1 { max-width: 650px; margin: 10px 0 14px; font: 600 clamp(44px, 7vw, 82px) / .98 var(--font-serif); letter-spacing: -.03em; text-wrap: balance; }
.songs-hero__copy > span { color: var(--c-white-78); font-size: 16px; }.songs-hero__status { max-width: 42ch; margin: 14px 0 0; color: var(--c-white-78); font-size: 13px; line-height: 1.6; }

.song-library {
  position: relative;
  width: min(980px, calc(100% - 48px));
  margin: 20px auto 84px;
  padding: clamp(28px, 4vw, 44px);
  /* 覆写 liquid-glass-quiet 的浅色玻璃，匹配本页深色沉浸氛围 */
  --lg-tint: 8, 28, 44;
  --lg-tint-a: 0.82;
  border-radius: var(--radius-lg);
}
.song-library__heading { display: flex; align-items: end; justify-content: space-between; gap: 24px; padding-bottom: 20px; border-bottom: 1px solid var(--page-border); position: relative; z-index: 1; }
.song-library__heading h2, .song-note h2, .song-provenance h2 { margin: 6px 0 0; color: var(--page-ink); font: 600 clamp(30px, 4vw, 48px) / 1.1 var(--font-serif); text-wrap: balance; }
.song-library__heading > span { color: var(--page-muted-strong); font: 12px var(--font-mono); }
.song-library__state, .song-library__notice { margin: 28px 0; color: var(--page-muted); position: relative; z-index: 1; }
.song-library__notice { padding: 14px 16px; border: 1px solid rgba(242, 189, 112, .35); color: var(--page-ink); background: rgba(54, 37, 15, .55); }
.song-list { margin: 0; padding: 0; list-style: none; position: relative; z-index: 1; }
.song-list li { border-bottom: 1px solid var(--page-border); }
.song-list li:last-child { border-bottom: 0; }
.song-row { display: grid; grid-template-columns: 44px 64px minmax(0, 1fr) auto 34px; align-items: center; gap: 18px; width: 100%; padding: 16px 4px; border: 0; color: inherit; background: transparent; cursor: pointer; text-align: left; transition: background 180ms ease, padding 180ms ease; }
.song-row:hover, .song-list li.is-playing .song-row { padding-right: 14px; padding-left: 14px; background: rgba(107, 163, 190, .12); }
.song-row:focus-visible { outline: 2px solid var(--page-accent); outline-offset: -2px; }
.song-row__index { color: var(--page-muted-strong); font: 13px var(--font-mono); }
.song-row__cover { display: grid; width: 64px; height: 64px; place-items: center; overflow: hidden; color: var(--page-brand-light); background: rgba(107, 163, 190, .14); }
.song-row__cover img { width: 100%; height: 100%; object-fit: cover; }
.song-row__copy { display: grid; min-width: 0; gap: 4px; }
.song-row__copy strong, .song-row__copy span, .song-row__copy small { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.song-row__copy strong { color: var(--page-ink); font-size: 16px; }
.song-row__copy span { color: var(--page-muted); font-size: 13px; }
.song-row__copy small { color: var(--page-brand-light); font-size: 12px; }
.song-row__status { color: var(--page-muted-strong); font: 12px var(--font-mono); }
.song-row__action { display: grid; width: 28px; height: 28px; place-items: center; border-radius: 50%; color: var(--page-brand-light); background: rgba(107, 163, 190, .18); }

.song-note {
  display: grid;
  grid-template-columns: minmax(0, .9fr) minmax(0, 1fr);
  gap: clamp(32px, 8vw, 100px);
  align-items: end;
  width: min(980px, calc(100% - 48px));
  margin: 0 auto;
  padding: 52px 0;
  border-top: 1px solid var(--page-border);
  border-bottom: 1px solid var(--page-border);
}
.song-note p:last-child { max-width: 52ch; margin: 0; color: var(--page-muted); font-size: 15px; line-height: 1.8; }

.song-provenance {
  display: grid;
  grid-template-columns: minmax(0, .9fr) minmax(0, 1fr);
  gap: clamp(32px, 8vw, 100px);
  width: min(980px, calc(100% - 48px));
  margin: 0 auto;
  padding: 52px 0;
}
.song-provenance ul { display: grid; gap: 14px; margin: 0; padding: 0; list-style: none; }
.song-provenance li { display: grid; gap: 5px; padding-bottom: 14px; border-bottom: 1px solid var(--page-border); }
.song-provenance li:last-child { border-bottom: 0; }
.song-provenance strong { color: var(--page-ink); font-size: 14px; }
.song-provenance span { color: var(--page-muted); font-size: 13px; line-height: 1.65; }
.song-provenance small { color: var(--page-muted-strong); font-size: 13px; line-height: 1.65; }

@media (max-width: 720px) {
  .songs-hero { grid-template-columns: 1fr; min-height: auto; padding-top: 120px; }
  .songs-hero__cover { width: min(78vw, 320px); }
  .song-library { padding: 22px 18px; }
  .song-row { grid-template-columns: 34px 54px minmax(0, 1fr) 28px; gap: 12px; }
  .song-row__cover { width: 54px; height: 54px; }
  .song-row__status { display: none; }
  .song-note, .song-provenance { grid-template-columns: 1fr; }
}

.motion-ready .hero-cover-anim {
  opacity: 0;
  transform: translateY(24px) scale(0.96);
  animation: heroCoverIn 650ms var(--ease-out-expo) 80ms forwards;
}

@keyframes heroCoverIn {
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.motion-ready .hero-kicker-anim {
  opacity: 0;
  transform: translateY(14px);
  animation: heroTextIn 480ms var(--ease-out-quint) 180ms forwards;
}

.motion-ready .hero-title-anim {
  opacity: 0;
  transform: translateY(20px);
  filter: blur(4px);
  animation: heroTitleIn 580ms var(--ease-out-expo) 240ms forwards;
}

@keyframes heroTitleIn {
  to {
    opacity: 1;
    transform: translateY(0);
    filter: blur(0);
  }
}

.motion-ready .hero-subtitle-anim {
  opacity: 0;
  transform: translateY(16px);
  animation: heroTextIn 500ms var(--ease-out-quint) 340ms forwards;
}

.motion-ready .hero-spectrum-anim {
  opacity: 0;
  transform: translateY(12px);
  animation: heroTextIn 480ms var(--ease-out-quint) 420ms forwards;
}

.motion-ready .hero-status-anim {
  opacity: 0;
  transform: translateY(10px);
  animation: heroTextIn 450ms var(--ease-out-quint) 480ms forwards;
}

@keyframes heroTextIn {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.reveal-target {
  opacity: 1;
  transform: none;
}

.motion-ready .reveal-target {
  opacity: 0;
  transform: translateY(28px);
}

.motion-ready .reveal-target.is-revealed {
  animation: sectionReveal 560ms var(--ease-out-quint) both;
}

@keyframes sectionReveal {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .songs-hero__cover button, .song-row { transition: none; }
  .songs-hero::before { transform: none !important; }
  .hero-cover-anim, .hero-kicker-anim, .hero-title-anim,
  .hero-subtitle-anim, .hero-spectrum-anim, .hero-status-anim {
    animation: none !important;
    opacity: 1 !important;
    transform: none !important;
    filter: none !important;
  }
  .reveal-target { opacity: 1 !important; transform: none !important; }
}
</style>
