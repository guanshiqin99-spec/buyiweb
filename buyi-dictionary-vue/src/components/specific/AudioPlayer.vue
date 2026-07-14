<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { usePlayerStore } from '@/stores/player'
import IconPause from '@/components/icons/IconPause.vue'
import IconPlay from '@/components/icons/IconPlay.vue'

const playerStore = usePlayerStore()
const audioRef = ref(null)
const currentSong = computed(() => playerStore.currentSong)
const isPlaying = computed(() => playerStore.isPlaying)
const isExpanded = computed(() => playerStore.isExpanded)
const progress = computed(() => playerStore.progress)

function seek(event) {
  playerStore.seekTo(Number(event.target.value))
}

function handleShortcut(event) {
  if (event.key === 'Escape' && playerStore.isExpanded) playerStore.collapse()
}

onMounted(() => {
  playerStore.attachAudioElement(audioRef.value)
  document.addEventListener('keydown', handleShortcut)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleShortcut)
  playerStore.destroy()
})
</script>

<template>
  <audio ref="audioRef" class="audio-element" preload="metadata" crossorigin="anonymous"></audio>

  <section v-if="currentSong" class="player" :class="{ 'player--collapsed': !isExpanded }" aria-label="民歌播放器">
    <template v-if="isExpanded">
      <button class="player__identity" type="button" :aria-expanded="true" aria-label="收起播放器" @click="playerStore.collapse()">
        <span class="player__cover" :class="{ 'player__cover--spinning': isPlaying }">
          <img v-if="currentSong.coverUrl" :src="currentSong.coverUrl" :alt="`${currentSong.title}封面`" width="48" height="48" />
          <span v-else aria-hidden="true">♪</span>
        </span>
        <span class="player__text">
          <strong>{{ currentSong.title }}</strong>
          <span>{{ currentSong.artist }}</span>
        </span>
      </button>

      <div class="player__transport">
        <button v-pointer-glow="{ tone: 'brand', size: 'md' }" class="player__play" type="button" :aria-label="isPlaying ? '暂停播放' : '播放'" @click="playerStore.togglePlay()">
          <IconPause v-if="isPlaying" :size="18" />
          <IconPlay v-else :size="18" />
        </button>
      </div>

      <label class="player__timeline">
        <span class="sr-only">播放进度</span>
        <time>{{ playerStore.formattedCurrentTime }}</time>
        <input
          type="range"
          min="0"
          :max="playerStore.duration || 0"
          :value="playerStore.currentTime"
          :aria-valuetext="`${playerStore.formattedCurrentTime}，共 ${playerStore.formattedDuration}`"
          @pointerdown="playerStore.beginSeek()"
          @pointerup="playerStore.endSeek()"
          @input="seek"
          @change="playerStore.endSeek()"
        />
        <time>{{ playerStore.formattedDuration }}</time>
      </label>
    </template>

    <template v-else>
      <button class="player__disc" type="button" aria-label="展开播放器" @click="playerStore.expand()">
        <img v-if="currentSong.coverUrl" :src="currentSong.coverUrl" :alt="`${currentSong.title}封面`" width="40" height="40" />
        <span v-else aria-hidden="true">♪</span>
      </button>
      <button class="player__disc-play" type="button" :aria-label="isPlaying ? '暂停播放' : '播放'" @click="playerStore.togglePlay()">
        {{ isPlaying ? 'Ⅱ' : '▶' }}
      </button>
    </template>

    <p class="player__status" :class="{ 'player__status--error': playerStore.status === 'error' }" aria-live="polite">
      {{ playerStore.message || (playerStore.isLoading ? '正在载入音频…' : '') }}
    </p>
  </section>
</template>

<style scoped>
.audio-element { display: none; }
.player {
  position: fixed;
  z-index: 50;
  left: 50%;
  bottom: calc(16px + env(safe-area-inset-bottom, 0px));
  transform: translateX(-50%);
  display: grid;
  grid-template-columns: minmax(170px, 1fr) auto minmax(220px, 1.35fr);
  align-items: center;
  gap: 18px;
  width: min(920px, calc(100% - 32px));
  padding: 10px 18px;
  color: var(--c-text);
  background: var(--background);
  border: 1px solid var(--c-divider);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
}
.player__identity { display: flex; align-items: center; min-width: 0; gap: 11px; padding: 0; border: 0; color: inherit; background: transparent; text-align: left; cursor: pointer; }
.player__identity:focus-visible, .player__disc:focus-visible, .player__disc-play:focus-visible, .player__play:focus-visible, input:focus-visible { outline: 2px solid var(--c-focus); outline-offset: 3px; }
.player__cover, .player__disc { display: grid; width: 48px; height: 48px; place-items: center; overflow: hidden; color: var(--c-brand); background: var(--c-brand-06); border: 0; border-radius: 50%; font: 700 22px var(--font-serif); }
.player__cover img, .player__disc img { width: 100%; height: 100%; object-fit: cover; }
.player__cover--spinning { animation: spin 9s linear infinite; }
.player__text { display: grid; min-width: 0; gap: 3px; }
.player__text strong, .player__text span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.player__text strong { font-size: 14px; }
.player__text span { color: var(--c-text-60); font-size: 12px; }
.player__transport { display: grid; place-items: center; }
.player__play { display: grid; width: 42px; height: 42px; place-items: center; border: 0; border-radius: 50%; color: var(--c-white); background: var(--c-brand); cursor: pointer; transition: transform 180ms ease, background 180ms ease; }
.player__play:hover { background: var(--c-brand-dark); transform: scale(1.05); }
.player__timeline { display: grid; grid-template-columns: 42px 1fr 42px; align-items: center; gap: 10px; color: var(--c-text-60); font: 12px var(--font-mono); font-variant-numeric: tabular-nums; }
.player__timeline time:last-child { text-align: right; }
.player__timeline input { width: 100%; accent-color: var(--c-brand); cursor: pointer; }
.player__status { position: absolute; left: 18px; right: 18px; bottom: calc(100% + 8px); min-height: 0; margin: 0; color: var(--c-text-70); font-size: 12px; text-align: center; pointer-events: none; }
.player__status:empty { display: none; }
.player__status--error { color: var(--c-danger); }
.player--collapsed { left: auto; right: calc(16px + env(safe-area-inset-right, 0px)); bottom: calc(16px + env(safe-area-inset-bottom, 0px)); transform: none; display: flex; width: 66px; height: 66px; padding: 5px; border-radius: 50%; }
.player--collapsed .player__disc { width: 56px; height: 56px; cursor: pointer; }
.player__disc-play { position: absolute; right: -3px; bottom: -3px; display: grid; width: 28px; height: 28px; place-items: center; padding: 0; border: 2px solid var(--background); border-radius: 50%; color: var(--c-white); background: var(--c-brand); cursor: pointer; font-size: 11px; }
.player--collapsed .player__status { left: auto; right: 0; width: 230px; bottom: 76px; text-align: right; }
.sr-only { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }
@keyframes spin { to { transform: rotate(360deg); } }
@media (max-width: 680px) {
  .player { grid-template-columns: 1fr auto; gap: 10px; padding: 10px 14px; }
  .player__timeline { grid-column: 1 / -1; grid-row: 1; }
  .player__identity { grid-column: 1; grid-row: 2; }
  .player__transport { grid-column: 2; grid-row: 2; }
}
@media (prefers-reduced-motion: reduce) { .player, .player__play { transition: none; } .player__cover--spinning { animation: none; } }
</style>
