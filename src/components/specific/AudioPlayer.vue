<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { usePlayerStore } from '@/stores/player'

const playerStore = usePlayerStore()

const progressRef = ref(null)
const isDragging = ref(false)
const dragTime = ref(0)  // 拖动时实时显示的时间（秒），供气泡播报

const progress = computed(() => playerStore.progress)
const currentTime = computed(() => playerStore.formattedCurrentTime)
const duration = computed(() => playerStore.formattedDuration)
const isPlaying = computed(() => playerStore.isPlaying)
const currentSong = computed(() => playerStore.currentSong)
const isExpanded = computed(() => playerStore.isExpanded)

// 拖动气泡时间格式化（mm:ss）
const formattedDragTime = computed(() => {
  const m = Math.floor(dragTime.value / 60)
  const s = Math.floor(dragTime.value % 60)
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
})

const handlePlayPause = () => {
  playerStore.togglePlay()
}

const handleProgressClick = (event) => {
  if (!progressRef.value) return
  const rect = progressRef.value.getBoundingClientRect()
  const percent = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width))
  const time = percent * playerStore.duration
  playerStore.seekTo(time)
  // 同步拖动气泡的时间与位置
  dragTime.value = time
}

const handleProgressMouseDown = (event) => {
  isDragging.value = true
  // 拖动期间暂停推进，避免与 seekTo 打架跳针
  playerStore.beginSeek()
  handleProgressClick(event)
}

const handleProgressMouseMove = (event) => {
  if (!isDragging.value) return
  handleProgressClick(event)
}

const handleProgressMouseUp = () => {
  if (!isDragging.value) return
  isDragging.value = false
  playerStore.endSeek()
}

// 触屏拖动：把 TouchEvent 的 clientX 复用为鼠标坐标，统一走 handleProgressClick
const handleProgressTouchStart = (event) => {
  if (!event.touches[0]) return
  isDragging.value = true
  playerStore.beginSeek()
  handleProgressClick(event.touches[0])
  event.preventDefault()
}

const handleProgressTouchMove = (event) => {
  if (!isDragging.value || !event.touches[0]) return
  handleProgressClick(event.touches[0])
  event.preventDefault()
}

const handleProgressTouchEnd = () => {
  if (!isDragging.value) return
  isDragging.value = false
  playerStore.endSeek()
}

const handleProgressKey = (event) => {
  let v = playerStore.progress
  if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') {
    v = Math.max(0, v - 5)
    event.preventDefault()
  } else if (event.key === 'ArrowRight' || event.key === 'ArrowUp') {
    v = Math.min(100, v + 5)
    event.preventDefault()
  } else return
  const time = (v / 100) * playerStore.duration
  playerStore.seekTo(time)
  dragTime.value = time
}

// ESC 键收起播放条（展开态时）
const handleKeydown = (event) => {
  if (event.key === 'Escape' && playerStore.isExpanded && playerStore.currentSong) {
    playerStore.collapse()
  }
}

onMounted(() => {
  document.addEventListener('mousemove', handleProgressMouseMove)
  document.addEventListener('mouseup', handleProgressMouseUp)
  document.addEventListener('touchmove', handleProgressTouchMove, { passive: false })
  document.addEventListener('touchend', handleProgressTouchEnd)
  document.addEventListener('touchcancel', handleProgressTouchEnd)
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('mousemove', handleProgressMouseMove)
  document.removeEventListener('mouseup', handleProgressMouseUp)
  document.removeEventListener('touchmove', handleProgressTouchMove)
  document.removeEventListener('touchend', handleProgressTouchEnd)
  document.removeEventListener('touchcancel', handleProgressTouchEnd)
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <template v-if="currentSong">
    <Transition name="player-swap">
    <!-- 展开态：药丸条 -->
    <div
      v-if="isExpanded"
      key="expanded"
      class="audio-player liquid-glass liquid-glass-pill glow-card"
      role="region"
      aria-label="音乐播放器"
    >
      <div class="glow-effect"></div>
      <div class="player-inner">
        <!-- 歌曲信息：点击切换为收起态 -->
        <button
          type="button"
          class="song-info"
          :aria-expanded="true"
          aria-label="收起为迷你播放器"
          @click="playerStore.toggleExpand()"
        >
          <div class="song-cover">
            <img v-if="currentSong.coverUrl" :src="currentSong.coverUrl" :alt="currentSong.title" width="40" height="40" loading="lazy" />
            <svg v-else width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <circle cx="12" cy="12" r="10" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </div>
          <div class="song-details">
            <p class="song-title">{{ currentSong.title }}</p>
            <div class="song-meta-row">
              <p class="song-artist">{{ currentSong.artist || '布依族民歌' }}</p>
              <span v-if="currentSong.genre" class="song-genre">{{ currentSong.genre }}</span>
            </div>
          </div>
          <!-- 均衡器：播放时显示 -->
          <div v-if="isPlaying" class="eq-bars" aria-hidden="true">
            <span class="eq-bar"></span>
            <span class="eq-bar"></span>
            <span class="eq-bar"></span>
          </div>
        </button>

        <!-- 播放控制 -->
        <div class="player-controls">
          <button class="play-button" type="button" @click="handlePlayPause" :aria-label="isPlaying ? '暂停' : '播放'">
            <svg v-if="isPlaying" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <rect x="6" y="4" width="4" height="16" />
              <rect x="14" y="4" width="4" height="16" />
            </svg>
            <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
          </button>
        </div>

        <!-- 进度条 -->
        <div class="player-progress">
          <span class="time">{{ currentTime }}</span>
          <div
            ref="progressRef"
            class="progress-bar"
            role="slider"
            :aria-valuenow="Math.round(progress)"
            aria-valuemin="0"
            aria-valuemax="100"
            :aria-valuetext="isDragging ? formattedDragTime : currentTime"
            aria-label="播放进度"
            tabindex="0"
            @mousedown="handleProgressMouseDown"
            @touchstart="handleProgressTouchStart"
            @keydown="handleProgressKey"
          >
            <div class="progress-track">
              <div class="progress-fill" :style="{ width: progress + '%' }"></div>
              <div class="progress-thumb" :style="{ left: progress + '%' }"></div>
            </div>
            <!-- 拖动时间气泡：aria-live 供屏幕阅读器播报 -->
            <div v-if="isDragging" class="seek-tooltip" aria-live="polite" :style="{ left: progress + '%' }">
              {{ formattedDragTime }}
            </div>
          </div>
          <span class="time">{{ duration }}</span>
        </div>
      </div>
    </div>

    <!-- 收起态：右下角小圆盘 -->
    <div
      v-else
      key="collapsed"
      class="player-disc liquid-glass glow-card"
    >
      <div class="glow-effect"></div>
      <button
        type="button"
        class="disc-expand"
        aria-label="展开播放器"
        @click="playerStore.expand()"
      >
        <div class="disc-cover" :class="{ spinning: isPlaying }">
          <img v-if="currentSong.coverUrl" :src="currentSong.coverUrl" :alt="currentSong.title" width="36" height="36" loading="lazy" />
          <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <circle cx="12" cy="12" r="10" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </div>
      </button>
      <button
        type="button"
        class="disc-play"
        :aria-label="isPlaying ? '暂停' : '播放'"
        @click.stop="handlePlayPause"
      >
        <svg v-if="isPlaying" width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <rect x="6" y="4" width="4" height="16" />
          <rect x="14" y="4" width="4" height="16" />
        </svg>
        <svg v-else width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <polygon points="5 3 19 12 5 21 5 3" />
        </svg>
      </button>
    </div>
    </Transition>
  </template>
</template>

<style scoped>
.audio-player {
  position: fixed;
  /* 悬浮药丸：居中、限宽、离底边留距，漂浮于内容之上 */
  left: 50%;
  transform: translateX(-50%);
  bottom: calc(16px + env(safe-area-inset-bottom, 0px));
  width: min(980px, calc(100% - 32px));
  z-index: 50;
  /* 药丸圆角 + 悬浮投影 */
  --lg-radius: 20px;
  border-radius: 20px;
  box-shadow:
    0 12px 32px rgba(27, 58, 92, 0.18),
    0 4px 12px rgba(27, 58, 92, 0.10);
  animation: playerFloatIn 320ms cubic-bezier(0.22, 1, 0.36, 1);
}

@keyframes playerFloatIn {
  from { opacity: 0; transform: translate(-50%, 16px); }
  to   { opacity: 1; transform: translate(-50%, 0); }
}

/* 覆盖 .liquid-glass:hover 的 translateY(-4px)：
   播放条靠 translateX(-50%) 居中，hover 浮起会覆盖居中导致左右乱跳 */
.audio-player.liquid-glass:hover {
  transform: translateX(-50%);
}

@media (prefers-reduced-motion: reduce) {
  .audio-player { animation: none !important; }
}

.player-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 980px;
  width: 100%;
  min-height: 64px;
  margin: 0 auto;
  padding: 10px 24px;
  gap: 20px;
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
    flex: 1 1 100%;
  }
}

.song-info {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
  flex: 1;
  /* 可点击切换为圆盘态 */
  border: none;
  background: transparent;
  color: inherit;
  font: inherit;
  text-align: left;
  cursor: pointer;
  border-radius: 8px;
  padding: 4px 6px 4px 4px;
  margin-left: -6px;
  transition: background 180ms ease;
  outline: none;
}

.song-info:hover {
  background: rgba(27, 58, 92, 0.04);
}

.song-info:focus-visible {
  outline: 2px solid var(--c-brand);
  outline-offset: 2px;
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
  overflow: hidden;
}

/* 真实封面图填满 cover 容器 */
.song-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 8px;
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

/* 流派标签：展开态显示，与歌手同行 */
.song-meta-row {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.song-genre {
  display: inline-block;
  padding: 1px 8px;
  border-radius: 999px;
  background: var(--c-brand-08);
  color: var(--c-brand);
  font-size: 10px;
  font-weight: 500;
  letter-spacing: 0.02em;
  white-space: nowrap;
  flex-shrink: 0;
}

/* 均衡器：3 根条，播放时动画 */
.eq-bars {
  display: inline-flex;
  align-items: flex-end;
  gap: 3px;
  height: 16px;
  margin-left: 8px;
  flex-shrink: 0;
}

.player-controls {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
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
  transition: background 150ms ease, transform 150ms ease;
}

.play-button:hover {
  background: var(--c-brand-dark);
  transform: scale(1.05);
}

.play-button:active {
  transform: scale(0.96);
}

.play-button:focus-visible {
  outline: 2px solid var(--c-brand);
  outline-offset: 3px;
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
  font-variant-numeric: tabular-nums;
}

.progress-bar {
  flex: 1;
  height: 24px;
  display: flex;
  align-items: center;
  cursor: pointer;
  outline: none;
}

.progress-bar:focus-visible {
  outline: 2px solid var(--c-brand);
  outline-offset: 4px;
  border-radius: 4px;
}

.progress-track {
  width: 100%;
  height: 4px;
  background: rgba(27, 58, 92, 0.1);
  border-radius: 2px;
  position: relative;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--c-brand), var(--c-brand-light));
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

.progress-bar:hover .progress-thumb,
.progress-bar:focus-visible .progress-thumb {
  opacity: 1;
}

/* ===== 拖动时间气泡：跟随 thumb，aria-live 播报 ===== */
.seek-tooltip {
  position: absolute;
  top: -6px;
  transform: translate(-50%, -100%);
  padding: 4px 10px;
  background: var(--c-brand);
  color: var(--c-white);
  font-size: 11px;
  font-family: var(--font-mono);
  font-variant-numeric: tabular-nums;
  border-radius: 6px;
  white-space: nowrap;
  pointer-events: none;
  box-shadow: 0 2px 8px rgba(27, 58, 92, 0.25);
  z-index: 2;
}
/* 气泡小三角指向进度条 */
.seek-tooltip::after {
  content: '';
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  border: 4px solid transparent;
  border-top-color: var(--c-brand);
}

/* ===== 展开/收起过渡：交叉淡入 + 轻微缩放，不用位移避免定位打架 ===== */
.player-swap-enter-active,
.player-swap-leave-active {
  transition: opacity 240ms cubic-bezier(0.22, 1, 0.36, 1),
              transform 240ms cubic-bezier(0.22, 1, 0.36, 1);
}
.player-swap-enter-from {
  opacity: 0;
  transform: scale(0.94);
}
.player-swap-leave-to {
  opacity: 0;
  transform: scale(0.94);
}
/* 展开态药丸条本身用 translateX(-50%) 居中，过渡时保留居中 */
.audio-player.player-swap-enter-from,
.audio-player.player-swap-leave-to {
  transform: translateX(-50%) scale(0.94);
}

/* ===== 收起态：右下角小圆盘 ===== */
.player-disc {
  position: fixed;
  right: calc(16px + env(safe-area-inset-right, 0px));
  bottom: calc(16px + env(safe-area-inset-bottom, 0px));
  width: 56px;
  height: 56px;
  border-radius: 50%;
  --lg-radius: 50%;
  z-index: 50;
  box-shadow:
    0 8px 24px rgba(27, 58, 92, 0.20),
    0 2px 8px rgba(27, 58, 92, 0.12);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  outline: none;
  transition: box-shadow 200ms ease;
}

/* 覆盖 .liquid-glass:hover 的 translateY，避免圆盘跳动 */
.player-disc.liquid-glass:hover {
  transform: none;
  box-shadow:
    0 12px 32px rgba(27, 58, 92, 0.24),
    0 4px 12px rgba(27, 58, 92, 0.14);
}

.disc-expand {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  border: none;
  border-radius: 50%;
  background: transparent;
  padding: 0;
  cursor: pointer;
}

.disc-expand:focus-visible {
  outline: 2px solid var(--c-brand);
  outline-offset: 3px;
}

.disc-cover {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--c-brand-08);
  color: var(--c-brand);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  overflow: hidden;
}

/* 真实封面图填满圆盘容器 */
.disc-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}

/* 播放时黑胶旋转 */
.disc-cover.spinning {
  animation: discSpin 8s linear infinite;
}

@keyframes discSpin {
  to { transform: rotate(360deg); }
}

.disc-play {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 28px;
  height: 28px;
  border: none;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.88);
  color: var(--c-brand);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  box-shadow: 0 2px 6px rgba(27, 58, 92, 0.18);
  transition: background 150ms ease, transform 150ms ease;
}

.disc-play:hover {
  background: rgba(255, 255, 255, 1);
  transform: translate(-50%, -50%) scale(1.08);
}

.disc-play:focus-visible {
  outline: 2px solid var(--c-brand);
  outline-offset: 3px;
}

/* 移动端圆盘加大，便于点触 */
@media (max-width: 768px) {
  .player-disc {
    width: 64px;
    height: 64px;
    right: calc(12px + env(safe-area-inset-right, 0px));
    bottom: calc(12px + env(safe-area-inset-bottom, 0px));
  }
  .disc-cover {
    width: 42px;
    height: 42px;
  }
  .disc-play {
    width: 32px;
    height: 32px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .eq-bar { animation: none !important; }
  .play-button { transition: none !important; }
  .player-swap-enter-active,
  .player-swap-leave-active { transition: opacity 200ms ease !important; }
  .player-swap-enter-from,
  .player-swap-leave-to { transform: none !important; }
  .audio-player.player-swap-enter-from,
  .audio-player.player-swap-leave-to { transform: translateX(-50%) !important; }
  .disc-cover.spinning { animation: none !important; }
  .player-disc { transition: none !important; }
}
</style>
