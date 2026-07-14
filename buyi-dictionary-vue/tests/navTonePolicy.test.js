import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import {
  NAV_TONE_POLICY,
  resolveNavToneDecision
} from '../src/utils/navTonePolicy.js'

test('locks the accepted P0 navigation tone constants', () => {
  assert.equal(Object.isFrozen(NAV_TONE_POLICY), true)
  assert.equal(Object.isFrozen(NAV_TONE_POLICY.sampleRatios), true)
  assert.deepEqual(NAV_TONE_POLICY.sampleRatios, [0.14, 0.5, 0.86])
  assert.equal(NAV_TONE_POLICY.requiredVotes, 2)
  assert.equal(NAV_TONE_POLICY.switchDelayMs, 96)
  assert.equal(NAV_TONE_POLICY.probeInsetPx, 8)
  assert.match(NAV_TONE_POLICY.busySelector, /h1/)
  assert.match(NAV_TONE_POLICY.busySelector, /img/)
})

test('uses a two-of-three semantic majority', () => {
  assert.deepEqual(
    resolveNavToneDecision({
      samples: ['light', 'dark', 'light'],
      fallbackTone: 'dark',
      lastReliableTone: 'dark'
    }),
    { tone: 'light', confidence: 'high', source: 'semantic-samples' }
  )
})

test('retains the last reliable tone when semantic evidence is uncertain', () => {
  assert.deepEqual(
    resolveNavToneDecision({
      samples: ['light', null, 'dark'],
      fallbackTone: 'light',
      lastReliableTone: 'dark'
    }),
    { tone: 'dark', confidence: 'low', source: 'uncertain' }
  )
})

test('uses route contrast only when no semantic sample is available', () => {
  assert.deepEqual(
    resolveNavToneDecision({
      samples: [null, null, null],
      fallbackTone: 'light',
      lastReliableTone: 'dark'
    }),
    { tone: 'light', confidence: 'high', source: 'route-fallback' }
  )
})

test('locks the immersive, fixed and footer contrast hooks in the SFCs', async () => {
  const [header, home, footer] = await Promise.all([
    readFile(new URL('../src/components/layout/AppHeader.vue', import.meta.url), 'utf8'),
    readFile(new URL('../src/views/Home.vue', import.meta.url), 'utf8'),
    readFile(new URL('../src/components/layout/AppFooter.vue', import.meta.url), 'utf8')
  ])

  assert.match(header, /position:\s*fixed;\s*top:\s*0;[\s\S]*?z-index:\s*40;/)
  assert.match(header, /\.nav-immersive\.scrolled\s*{[^}]*background:\s*transparent;/)
  assert.match(header, /nav-immersive--tone-uncertain/)
  assert.match(header, /\.nav-immersive:not\(\.nav-immersive--light\)\.nav-immersive--tone-uncertain\.nav-immersive--on-dark/)
  assert.match(header, /\.nav-immersive:not\(\.nav-immersive--light\)\.nav-immersive--tone-uncertain\.nav-immersive--on-light/)
  assert.match(home, /<main[^>]*data-nav-tone="light"/)
  assert.match(footer, /<footer[^>]*data-nav-tone="dark"/)
})
