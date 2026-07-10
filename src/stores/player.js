import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const usePlayerStore = defineStore('player', () => {
  const currentSong = ref(null)
  const isPlaying = ref(false)
  const currentTime = ref(0)
  const duration = ref(0)
  const playlist = ref([])
  const currentIndex = ref(-1)
  // 拖动进度条期间暂停推进，避免与 seekTo 打架导致跳针
  const isSeeking = ref(false)
  // 展开/收起状态：true=药丸条展开态，false=右下角小圆盘收起态
  const isExpanded = ref(true)

  let rafId = null

  const progress = computed(() => {
    if (!duration.value) return 0
    return (currentTime.value / duration.value) * 100
  })

  const formattedCurrentTime = computed(() => formatTime(currentTime.value))
  const formattedDuration = computed(() => formatTime(duration.value))

  function formatTime(sec) {
    const m = Math.floor(sec / 60)
    const s = Math.floor(sec % 60)
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }

  function playSong(song) {
    if (currentSong.value?.id === song.id) {
      togglePlay()
      return
    }
    currentSong.value = song
    currentTime.value = 0
    // 优先使用歌曲真实时长，无值时回退到 3:42 占位
    duration.value = song.duration || 222
    isPlaying.value = true
    // 新歌默认展开，展示完整信息
    isExpanded.value = true
    startProgress()
  }

  function togglePlay() {
    if (!currentSong.value) return
    isPlaying.value = !isPlaying.value
    if (isPlaying.value) {
      startProgress()
    } else {
      stopProgress()
    }
  }

  function stop() {
    isPlaying.value = false
    currentSong.value = null
    currentTime.value = 0
    duration.value = 0
    stopProgress()
  }

  function seekTo(time) {
    currentTime.value = Math.max(0, Math.min(time, duration.value))
  }

  // 拖动开始/结束：暂停推进但保留 RAF 循环，松开后无缝续接
  function beginSeek() {
    isSeeking.value = true
  }

  function endSeek() {
    isSeeking.value = false
  }

  function toggleExpand() {
    isExpanded.value = !isExpanded.value
  }
  function expand() { isExpanded.value = true }
  function collapse() { isExpanded.value = false }

  // 模拟进度推进：requestAnimationFrame 避免后台标签页 CPU 浪费
  function startProgress() {
    stopProgress()
    let last = performance.now()
    const tick = (now) => {
      if (!isPlaying.value) return
      // 拖动期间不推进，但保持 RAF 循环以在松手后无缝续接
      if (isSeeking.value) {
        last = now
        rafId = requestAnimationFrame(tick)
        return
      }
      const delta = (now - last) / 1000
      last = now
      currentTime.value += delta
      if (currentTime.value >= duration.value) {
        currentTime.value = duration.value
        isPlaying.value = false
        return
      }
      rafId = requestAnimationFrame(tick)
    }
    rafId = requestAnimationFrame(tick)
  }

  function stopProgress() {
    if (rafId) {
      cancelAnimationFrame(rafId)
      rafId = null
    }
  }

  return {
    currentSong,
    isPlaying,
    currentTime,
    duration,
    playlist,
    currentIndex,
    isExpanded,
    progress,
    formattedCurrentTime,
    formattedDuration,
    playSong,
    togglePlay,
    stop,
    seekTo,
    beginSeek,
    endSeek,
    toggleExpand,
    expand,
    collapse
  }
})
