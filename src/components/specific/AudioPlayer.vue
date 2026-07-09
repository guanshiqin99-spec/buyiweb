<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { usePlayerStore } from '@/stores/player'

const playerStore = usePlayerStore()

const progressRef = ref(null)
const isDragging = ref(false)

const progress = computed(() => playerStore.progress)
const currentTime = computed(() => playerStore.formattedCurrentTime)
const duration = computed(() => playerStore.formattedDuration)
const isPlaying = computed(() => playerStore.isPlaying)
const currentSong = computed(() => playerStore.currentSong)

const handlePlayPause = () => {
  playerStore.togglePlay()
}

const handlePrev = () => {
  playerStore.playPrev()
}

const handleNext = () => {
  playerStore.playNext()
}

const handleProgressClick = (event) => {
  if (!progressRef.value) return
  const rect = progressRef.value.getBoundingClientRect()
  const percent = (event.clientX - rect.left) / rect.width
  const time = percent * playerStore.duration
  playerStore.seekTo(time)
}

const handleProgressMouseDown = (event) => {
  isDragging.value = true
  handleProgressClick(event)
}

const handleProgressMouseMove = (event) => {
  if (!isDragging.value) return
  handleProgressClick(event)
}

const handleProgressMouseUp = () => {
  isDragging.value = false
}

onMounted(() => {
  document.addEventListener('mousemove', handleProgressMouseMove)
  document.addEventListener('mouseup', handleProgressMouseUp)
})

onUnmounted(() => {
  document.removeEventListener('mousemove', handleProgressMouseMove)
  document.removeEventListener('mouseup', handleProgressMouseUp)
})
</script>

<template>
  <div class="audio-player liquid-glass-nav" v-if="currentSong">
    <div class="player-inner">
      <!-- 歌曲信息 -->
      <div class="song-info">
        <div class="song-cover">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        </div>
        <div class="song-details">
          <p class="song-title">{{ currentSong.title }}</p>
          <p class="song-artist">{{ currentSong.artist || '布依族民歌' }}</p>
        </div>
      </div>

      <!-- 播放控制 -->
      <div class="player-controls">
        <button class="control-button" @click="handlePrev" aria-label="上一首">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <polygon points="19 20 9 12 19 4 19 20" />
            <line x1="5" y1="19" x2="5" y2="5" stroke="currentColor" stroke-width="2" />
          </svg>
        </button>

        <button class="play-button" @click="handlePlayPause" :aria-label="isPlaying ? '暂停' : '播放'">
          <svg v-if="isPlaying" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <rect x="6" y="4" width="4" height="16" />
            <rect x="14" y="4" width="4" height="16" />
          </svg>
          <svg v-else width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <polygon points="5 3 19 12 5 21 5 3" />
          </svg>
        </button>

        <button class="control-button" @click="handleNext" aria-label="下一首">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <polygon points="5 4 15 12 5 20 5 4" />
            <line x1="19" y1="5" x2="19" y2="19" stroke="currentColor" stroke-width="2" />
          </svg>
        </button>
      </div>

      <!-- 进度条 -->
      <div class="player-progress">
        <span class="time">{{ currentTime }}</span>
        <div
          ref="progressRef"
          class="progress-bar"
          @mousedown="handleProgressMouseDown"
        >
          <div class="progress-track">
            <div class="progress-fill" :style="{ width: progress + '%' }"></div>
            <div class="progress-thumb" :style="{ left: progress + '%' }"></div>
          </div>
        </div>
        <span class="time">{{ duration }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.audio-player {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 50;
  height: 72px;
  border-top: 1px solid var(--c-white-60);
}

.player-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 980px;
  width: 100%;
  height: 100%;
  margin: 0 auto;
  padding: 0 24px;
  gap: 24px;
}

@media (max-width: 768px) {
  .player-inner {
    flex-wrap: wrap;
    padding: 8px 16px;
    gap: 8px;
  }
  
  .player-progress {
    order: -1;
    width: 100%;
  }
}

.song-info {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
  flex: 1;
}

.song-cover {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: var(--c-brand-08);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--c-brand);
  flex-shrink: 0;
}

.song-details {
  min-width: 0;
}

.song-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--c-text);
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.song-artist {
  font-size: 12px;
  color: var(--c-text-60);
  margin: 2px 0 0 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.player-controls {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-shrink: 0;
}

.control-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 999px;
  background: transparent;
  color: var(--c-text-70);
  cursor: pointer;
  transition: all 150ms ease;
}

.control-button:hover {
  background: var(--c-brand-08);
  color: var(--c-brand);
}

.play-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border: none;
  border-radius: 999px;
  background: var(--c-brand);
  color: var(--c-white);
  cursor: pointer;
  transition: all 150ms ease;
}

.play-button:hover {
  background: var(--c-brand-dark);
  transform: scale(1.05);
}

.player-progress {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 2;
  max-width: 400px;
}

@media (max-width: 768px) {
  .player-progress {
    max-width: 100%;
    flex: 1 1 100%;
  }
}

.time {
  font-size: 12px;
  color: var(--c-text-50);
  font-family: var(--font-mono);
  min-width: 40px;
  text-align: center;
}

.progress-bar {
  flex: 1;
  height: 24px;
  display: flex;
  align-items: center;
  cursor: pointer;
}

.progress-track {
  width: 100%;
  height: 4px;
  background: var(--c-brand-08);
  border-radius: 2px;
  position: relative;
}

.progress-fill {
  height: 100%;
  background: var(--c-brand);
  border-radius: 2px;
  transition: width 100ms linear;
}

.progress-thumb {
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 12px;
  height: 12px;
  background: var(--c-brand);
  border-radius: 999px;
  opacity: 0;
  transition: opacity 150ms ease;
}

.progress-bar:hover .progress-thumb {
  opacity: 1;
}
</style>
