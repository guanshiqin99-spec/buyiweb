import test from 'node:test'
import assert from 'node:assert/strict'
import { buyiTones, toneIndexFromKey } from '../src/data/tones.js'

test('offers the six tone contours used by the interactive piano', () => {
  assert.equal(buyiTones.length, 6)
  assert.deepEqual(buyiTones.map(tone => tone.value), [55, 11, 53, 31, 24, 33])
})

test('maps keyboard 1–6 to selectable tone indexes only', () => {
  assert.equal(toneIndexFromKey('1'), 0)
  assert.equal(toneIndexFromKey('6'), 5)
  assert.equal(toneIndexFromKey('7'), -1)
  assert.equal(toneIndexFromKey('q'), -1)
  assert.equal(toneIndexFromKey('6', 5), -1)
})
