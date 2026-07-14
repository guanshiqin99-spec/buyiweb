const states = new WeakMap()

function supportsPointerGlow() {
  if (typeof window === 'undefined' || !window.matchMedia) return false
  return window.matchMedia('(hover: hover) and (pointer: fine)').matches
    && !window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function normalizeOptions(value) {
  const options = value && typeof value === 'object' ? value : {}
  return {
    tone: options.tone === 'accent' ? 'accent' : 'brand',
    size: ['sm', 'md', 'lg'].includes(options.size) ? options.size : 'md'
  }
}

function applyOptions(element, value) {
  const { tone, size } = normalizeOptions(value)
  element.dataset.pointerGlow = ''
  element.style.setProperty('--pointer-glow-rgb', `var(--pointer-glow-${tone}-rgb)`)
  element.style.setProperty('--pointer-glow-size', `var(--pointer-glow-size-${size})`)
}

export const pointerGlow = {
  mounted(element, binding) {
    if (
      !supportsPointerGlow()
      || element.classList.contains('liquid-glass')
      || element.closest('[data-motion-surface="tool"]')
    ) return

    const state = { frameId: null, move: null, leave: null }
    let lastEvent = null

    const render = () => {
      state.frameId = null
      if (!lastEvent) return
      const rect = element.getBoundingClientRect()
      const x = Math.min(100, Math.max(0, ((lastEvent.clientX - rect.left) / rect.width) * 100))
      const y = Math.min(100, Math.max(0, ((lastEvent.clientY - rect.top) / rect.height) * 100))
      element.style.setProperty('--pointer-glow-x', `${x.toFixed(2)}%`)
      element.style.setProperty('--pointer-glow-y', `${y.toFixed(2)}%`)
      element.style.setProperty('--pointer-glow-opacity', '1')
    }

    const move = (event) => {
      lastEvent = event
      if (!state.frameId) state.frameId = window.requestAnimationFrame(render)
    }
    const leave = () => {
      lastEvent = null
      element.style.setProperty('--pointer-glow-opacity', '0')
    }

    applyOptions(element, binding.value)
    element.addEventListener('pointermove', move, { passive: true })
    element.addEventListener('pointerleave', leave, { passive: true })
    state.move = move
    state.leave = leave
    states.set(element, state)
  },
  updated(element, binding) {
    if (states.has(element)) applyOptions(element, binding.value)
  },
  beforeUnmount(element) {
    const state = states.get(element)
    if (!state) return
    element.removeEventListener('pointermove', state.move)
    element.removeEventListener('pointerleave', state.leave)
    if (state.frameId) window.cancelAnimationFrame(state.frameId)
    states.delete(element)
  }
}
