import test from 'node:test'
import assert from 'node:assert/strict'
import { createPinia, setActivePinia } from 'pinia'
import { usePlayerStore } from '../src/stores/player.js'

class FakeAudioElement {
  constructor() {
    this.listeners = new Map()
    this.src = ''
    this.currentTime = 0
    this.duration = Number.NaN
  }

  addEventListener(name, handler) {
    this.listeners.set(name, handler)
  }

  removeEventListener(name) {
    this.listeners.delete(name)
  }

  emit(name) {
    this.listeners.get(name)?.()
  }

  load() {}

  async play() {
    this.emit('play')
  }

  pause() {
    this.emit('pause')
  }

  removeAttribute(name) {
    if (name === 'src') this.src = ''
  }
}

test('player state follows real media events and falls back to a bundled source', async () => {
  setActivePinia(createPinia())
  const player = usePlayerStore()
  const audio = new FakeAudioElement()
  player.attachAudioElement(audio)

  await player.playSong({
    id: 'song-1',
    title: '测试民歌',
    playable: true,
    audioUrl: 'https://media.example/song.mp3',
    fallbackAudioUrl: '/audio/song.mp3'
  })

  assert.equal(audio.src, 'https://media.example/song.mp3')
  assert.equal(player.isPlaying, true)
  audio.duration = 187
  audio.currentTime = 31
  audio.emit('loadedmetadata')
  audio.emit('timeupdate')
  assert.equal(player.duration, 187)
  assert.equal(player.currentTime, 31)

  audio.emit('error')
  assert.equal(audio.src, '/audio/song.mp3')
  assert.equal(player.sourceMode, 'fallback')

  audio.currentTime = 187
  audio.emit('ended')
  assert.equal(player.isPlaying, false)
  assert.equal(player.status, 'ended')
})
