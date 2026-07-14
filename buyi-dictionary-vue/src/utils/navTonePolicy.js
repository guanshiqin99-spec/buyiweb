/**
 * P0 navigation contrast invariants.
 *
 * These values are part of the accepted product behavior. AppHeader consumes
 * this object directly and the regression suite locks the exact contract.
 * Change only with explicit product-owner approval.
 */
export const NAV_TONE_POLICY = Object.freeze({
  markerAttribute: 'data-nav-tone',
  sampleRatios: Object.freeze([0.14, 0.5, 0.86]),
  requiredVotes: 2,
  switchDelayMs: 96,
  probeInsetPx: 8,
  busySelector: 'h1,h2,h3,h4,p,a,button,img,picture,video,canvas,svg'
})

export function isNavTone(value) {
  return value === 'dark' || value === 'light'
}

export function toneFromContrast(contrast) {
  return contrast === 'on-dark' ? 'dark' : 'light'
}

export function resolveNavToneDecision({ samples, fallbackTone, lastReliableTone = null }) {
  const votes = samples.filter(isNavTone)
  const darkVotes = votes.filter((tone) => tone === 'dark').length
  const lightVotes = votes.filter((tone) => tone === 'light').length

  if (darkVotes >= NAV_TONE_POLICY.requiredVotes) {
    return { tone: 'dark', confidence: 'high', source: 'semantic-samples' }
  }
  if (lightVotes >= NAV_TONE_POLICY.requiredVotes) {
    return { tone: 'light', confidence: 'high', source: 'semantic-samples' }
  }
  if (!votes.length) {
    return { tone: fallbackTone, confidence: 'high', source: 'route-fallback' }
  }

  return {
    tone: isNavTone(lastReliableTone) ? lastReliableTone : fallbackTone,
    confidence: 'low',
    source: 'uncertain'
  }
}
