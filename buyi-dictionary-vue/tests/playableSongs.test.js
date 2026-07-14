import test from 'node:test'
import assert from 'node:assert/strict'
import { fallbackSongs, normalizePlayableSongs, toPlayableSong } from '../src/data/playableSongs.js'

test('normalizes a backend song and supplies its local fallback', () => {
  const song = toPlayableSong({ id: 4, title: '布依', audioUrl: 'https://example.test/uploads/buyi_audio/buyi-lulonghu.mp3' })
  assert.equal(song.playable, true)
  assert.equal(song.fallbackAudioUrl, '/audio/buyi-lulonghu.mp3')
})

test('filters songs with no available audio source', () => {
  assert.deepEqual(normalizePlayableSongs([{ id: 1, title: '无音频', audioUrl: null }]), [])
})

test('ships a six-song offline catalogue', () => {
  assert.equal(fallbackSongs.length, 6)
  assert.ok(fallbackSongs.every(song => song.playable && song.fallbackAudioUrl.startsWith('/audio/')))
})
