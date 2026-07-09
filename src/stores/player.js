import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const usePlayerStore = defineStore('player', () => {
  // 状态
  const currentSong = ref(null)
  const isPlaying = ref(false)
  const currentTime = ref(0)
  const duration = ref(0)
  const volume = ref(1)
  const playlist = ref([])
  const currentIndex = ref(-1)
  
  // 音频对象
  let audio = null
  
  // 计算属性
  const progress = computed(() => {
    if (duration.value === 0) return 0
    return (currentTime.value / duration.value) * 100
  })
  
  const formattedCurrentTime = computed(() => formatTime(currentTime.value))
  const formattedDuration = computed(() => formatTime(duration.value))
  
  // 初始化音频
  function initAudio() {
    if (audio) return
    
    audio = new Audio()
    audio.volume = volume.value
    
    audio.addEventListener('timeupdate', () => {
      currentTime.value = audio.currentTime
    })
    
    audio.addEventListener('loadedmetadata', () => {
      duration.value = audio.duration
    })
    
    audio.addEventListener('ended', () => {
      playNext()
    })
    
    audio.addEventListener('error', (e) => {
      console.error('音频播放错误:', e)
      isPlaying.value = false
    })
  }
  
  // 播放歌曲
  function play(song, list = []) {
    initAudio()
    
    if (list.length > 0) {
      playlist.value = list
      currentIndex.value = list.findIndex(item => item.id === song.id)
    }
    
    currentSong.value = song
    audio.src = song.url
    audio.play()
    isPlaying.value = true
  }
  
  // 暂停
  function pause() {
    if (!audio) return
    audio.pause()
    isPlaying.value = false
  }
  
  // 继续播放
  function resume() {
    if (!audio) return
    audio.play()
    isPlaying.value = true
  }
  
  // 切换播放状态
  function togglePlay() {
    if (isPlaying.value) {
      pause()
    } else {
      resume()
    }
  }
  
  // 播放下一首
  function playNext() {
    if (playlist.value.length === 0) return
    
    currentIndex.value = (currentIndex.value + 1) % playlist.value.length
    play(playlist.value[currentIndex.value])
  }
  
  // 播放上一首
  function playPrev() {
    if (playlist.value.length === 0) return
    
    currentIndex.value = (currentIndex.value - 1 + playlist.value.length) % playlist.value.length
    play(playlist.value[currentIndex.value])
  }
  
  // 跳转到指定时间
  function seekTo(time) {
    if (!audio) return
    audio.currentTime = time
    currentTime.value = time
  }
  
  // 设置音量
  function setVolume(vol) {
    volume.value = vol
    if (audio) {
      audio.volume = vol
    }
  }
  
  // 格式化时间
  function formatTime(seconds) {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return ${mins.toString().padStart(2, '0')}:
  }
  
  // 停止播放
  function stop() {
    if (audio) {
      audio.pause()
      audio.currentTime = 0
    }
    isPlaying.value = false
    currentTime.value = 0
  }
  
  return {
    currentSong,
    isPlaying,
    currentTime,
    duration,
    volume,
    playlist,
    currentIndex,
    progress,
    formattedCurrentTime,
    formattedDuration,
    play,
    pause,
    resume,
    togglePlay,
    playNext,
    playPrev,
    seekTo,
    setVolume,
    stop
  }
})
