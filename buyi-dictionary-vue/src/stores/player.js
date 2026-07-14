import { computed, ref, shallowRef } from 'vue'
import { defineStore } from 'pinia'

export function formatTime(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) return '00:00'
  const minutes = Math.floor(seconds / 60)
  const remainder = Math.floor(seconds % 60)
  return `${String(minutes).padStart(2, '0')}:${String(remainder).padStart(2, '0')}`
}

export const usePlayerStore = defineStore('player', () => {
  const currentSong = ref(null)
  const isPlaying = ref(false)
  const currentTime = ref(0)
  const duration = ref(0)
  const isSeeking = ref(false)
  const isExpanded = ref(true)
  const status = ref('idle')
  const message = ref('')
  const sourceMode = ref('')
  const audioElement = shallowRef(null)

  let analyser = null
  let audioContext = null
  let mediaSource = null
  let hasTriedFallback = false
  let shouldResumeAfterLoad = false

  const progress = computed(() => duration.value ? Math.min(100, (currentTime.value / duration.value) * 100) : 0)
  const formattedCurrentTime = computed(() => formatTime(currentTime.value))
  const formattedDuration = computed(() => formatTime(duration.value))
  const isLoading = computed(() => status.value === 'loading')

  function syncFromAudio() {
    const audio = audioElement.value
    if (!audio) return
    currentTime.value = Number.isFinite(audio.currentTime) ? audio.currentTime : 0
    duration.value = Number.isFinite(audio.duration) ? audio.duration : 0
  }

  function onLoadedMetadata() {
    syncFromAudio()
    if (status.value !== 'error') status.value = isPlaying.value ? 'playing' : 'ready'
  }

  function onTimeUpdate() {
    if (!isSeeking.value) syncFromAudio()
  }

  function onPlay() {
    isPlaying.value = true
    status.value = 'playing'
    message.value = sourceMode.value === 'fallback' ? '正在播放本地演示音源' : ''
  }

  function onPause() {
    isPlaying.value = false
    if (status.value !== 'ended' && status.value !== 'error') status.value = 'paused'
  }

  function onEnded() {
    const audio = audioElement.value
    isPlaying.value = false
    status.value = 'ended'
    currentTime.value = duration.value || audio?.duration || 0
    message.value = '本曲播放完毕'
  }

  function onWaiting() {
    if (!isSeeking.value) status.value = 'loading'
  }

  function onCanPlay() {
    if (status.value === 'loading' && !isPlaying.value) status.value = 'ready'
  }

  function onError() {
    if (sourceMode.value === 'remote' && currentSong.value?.fallbackAudioUrl && !hasTriedFallback) {
      hasTriedFallback = true
      message.value = '网络音源不可用，已切换到本地演示音源'
      loadSource(currentSong.value.fallbackAudioUrl, 'fallback', shouldResumeAfterLoad)
      return
    }
    isPlaying.value = false
    status.value = 'error'
    message.value = '该音频暂时无法播放，请稍后再试。'
  }

  function attachAudioElement(element) {
    if (!element || audioElement.value === element) return
    detachAudioElement()
    audioElement.value = element
    element.addEventListener('loadedmetadata', onLoadedMetadata)
    element.addEventListener('durationchange', onLoadedMetadata)
    element.addEventListener('timeupdate', onTimeUpdate)
    element.addEventListener('play', onPlay)
    element.addEventListener('pause', onPause)
    element.addEventListener('ended', onEnded)
    element.addEventListener('waiting', onWaiting)
    element.addEventListener('canplay', onCanPlay)
    element.addEventListener('error', onError)
  }

  function detachAudioElement() {
    const audio = audioElement.value
    if (!audio) return
    audio.removeEventListener('loadedmetadata', onLoadedMetadata)
    audio.removeEventListener('durationchange', onLoadedMetadata)
    audio.removeEventListener('timeupdate', onTimeUpdate)
    audio.removeEventListener('play', onPlay)
    audio.removeEventListener('pause', onPause)
    audio.removeEventListener('ended', onEnded)
    audio.removeEventListener('waiting', onWaiting)
    audio.removeEventListener('canplay', onCanPlay)
    audio.removeEventListener('error', onError)
    audioElement.value = null
  }

  async function loadSource(source, mode, autoplay = false) {
    const audio = audioElement.value
    if (!audio || !source) {
      status.value = 'error'
      message.value = '未找到可播放的音频文件。'
      return
    }
    sourceMode.value = mode
    shouldResumeAfterLoad = autoplay
    status.value = 'loading'
    currentTime.value = 0
    duration.value = 0
    audio.src = source
    audio.load()
    if (autoplay) await play()
  }

  async function playSong(song, autoplay = true) {
    if (!song?.playable) {
      message.value = '该曲目暂未收录可播放的音频。'
      return
    }
    const isSameSong = currentSong.value?.id === song.id
    if (isSameSong && audioElement.value?.src) {
      await togglePlay()
      return
    }

    currentSong.value = song
    isExpanded.value = true
    hasTriedFallback = false
    message.value = ''
    await loadSource(song.audioUrl || song.fallbackAudioUrl, song.audioUrl ? 'remote' : 'fallback', autoplay)
  }

  async function play() {
    const audio = audioElement.value
    if (!audio || !currentSong.value) return
    shouldResumeAfterLoad = true
    try {
      await audio.play()
      await resumeAudioContext()
    } catch (error) {
      isPlaying.value = false
      if (error?.name === 'NotAllowedError') {
        status.value = 'ready'
        message.value = '请再次点击播放按钮以启用声音。'
      } else if (sourceMode.value === 'remote' && currentSong.value.fallbackAudioUrl && !hasTriedFallback) {
        onError()
      } else {
        status.value = 'error'
        message.value = '浏览器无法开始播放该音频。'
      }
    }
  }

  function pause() {
    shouldResumeAfterLoad = false
    audioElement.value?.pause()
  }

  async function togglePlay() {
    if (isPlaying.value) pause()
    else await play()
  }

  function seekTo(time) {
    const audio = audioElement.value
    if (!audio || !Number.isFinite(time)) return
    const nextTime = Math.max(0, Math.min(time, duration.value || audio.duration || 0))
    audio.currentTime = nextTime
    currentTime.value = nextTime
  }

  function beginSeek() { isSeeking.value = true }
  function endSeek() { isSeeking.value = false; syncFromAudio() }
  function toggleExpand() { isExpanded.value = !isExpanded.value }
  function expand() { isExpanded.value = true }
  function collapse() { isExpanded.value = false }

  async function resumeAudioContext() {
    if (audioContext?.state === 'suspended') await audioContext.resume()
  }

  async function getAnalyser() {
    const audio = audioElement.value
    if (!audio) return null
    const Context = window.AudioContext || window.webkitAudioContext
    if (!Context) return null
    try {
      if (!audioContext) {
        audioContext = new Context()
        mediaSource = audioContext.createMediaElementSource(audio)
        analyser = audioContext.createAnalyser()
        analyser.fftSize = 128
        analyser.smoothingTimeConstant = 0.82
        mediaSource.connect(analyser)
        analyser.connect(audioContext.destination)
      }
      await resumeAudioContext()
      return analyser
    } catch {
      if (sourceMode.value === 'remote' && currentSong.value?.fallbackAudioUrl && !hasTriedFallback) {
        hasTriedFallback = true
        message.value = '远程媒体无法用于频谱分析，已切换本地演示音频。'
        loadSource(currentSong.value.fallbackAudioUrl, 'fallback', isPlaying.value)
      }
      return null
    }
  }

  function stop() {
    pause()
    const audio = audioElement.value
    if (audio) {
      audio.removeAttribute('src')
      audio.load()
    }
    currentSong.value = null
    currentTime.value = 0
    duration.value = 0
    status.value = 'idle'
    message.value = ''
  }

  function destroy() {
    stop()
    detachAudioElement()
    mediaSource?.disconnect()
    analyser?.disconnect()
    audioContext?.close()
    mediaSource = null
    analyser = null
    audioContext = null
  }

  return {
    currentSong, isPlaying, currentTime, duration, isExpanded, status, message, sourceMode, progress,
    formattedCurrentTime, formattedDuration, isLoading,
    attachAudioElement, detachAudioElement, playSong, play, pause, togglePlay, seekTo, beginSeek, endSeek,
    toggleExpand, expand, collapse, getAnalyser, stop, destroy
  }
})
