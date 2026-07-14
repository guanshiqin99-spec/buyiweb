<script setup>
import { onMounted, onUnmounted, ref, watch } from 'vue'
import { usePlayerStore } from '@/stores/player'

const props = defineProps({ active: Boolean })
const playerStore = usePlayerStore()
const canvasRef = ref(null)
const isReducedMotion = ref(false)
let animationFrame = 0
let resizeObserver = null
let analyser = null
let frequencyData = null

function setupCanvas() {
  const canvas = canvasRef.value
  if (!canvas) return null
  const rect = canvas.getBoundingClientRect()
  const ratio = Math.min(window.devicePixelRatio || 1, 2)
  canvas.width = Math.max(1, Math.floor(rect.width * ratio))
  canvas.height = Math.max(1, Math.floor(rect.height * ratio))
  const context = canvas.getContext('2d')
  context.setTransform(ratio, 0, 0, ratio, 0, 0)
  return { context, width: rect.width, height: rect.height }
}

function paint(values = []) {
  const frame = setupCanvas()
  if (!frame) return
  const { context, width, height } = frame
  context.clearRect(0, 0, width, height)
  const barCount = 32
  const gap = 3
  const barWidth = (width - gap * (barCount - 1)) / barCount
  for (let index = 0; index < barCount; index += 1) {
    const value = values.length ? values[index] / 255 : 0.06
    const barHeight = Math.max(4, value * height * 0.84)
    const x = index * (barWidth + gap)
    const y = height - barHeight
    context.fillStyle = index % 5 === 0 ? 'rgba(212, 136, 58, 0.92)' : 'rgba(107, 163, 190, 0.88)'
    context.fillRect(x, y, barWidth, barHeight)
  }
}

async function start() {
  cancelAnimationFrame(animationFrame)
  if (!props.active || isReducedMotion.value) {
    paint()
    return
  }
  analyser = await playerStore.getAnalyser()
  if (analyser) frequencyData = new Uint8Array(analyser.frequencyBinCount)
  const tick = () => {
    if (!props.active) return
    if (analyser && frequencyData) {
      analyser.getByteFrequencyData(frequencyData)
      paint(frequencyData)
    } else {
      paint()
    }
    animationFrame = requestAnimationFrame(tick)
  }
  tick()
}

function stop() {
  cancelAnimationFrame(animationFrame)
  animationFrame = 0
  paint()
}

watch(() => props.active, active => active ? start() : stop())

onMounted(() => {
  isReducedMotion.value = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  resizeObserver = new ResizeObserver(() => paint())
  resizeObserver.observe(canvasRef.value)
  paint()
  if (props.active) start()
})

onUnmounted(() => {
  stop()
  resizeObserver?.disconnect()
})
</script>

<template>
  <figure class="spectrum" :class="{ 'spectrum--active': active }" aria-label="民歌实时频谱">
    <canvas ref="canvasRef" role="img" :aria-label="active ? '正在随民歌变化的频谱' : '静态民歌频谱示意'"></canvas>
    <figcaption>{{ active ? '声场正在随真实音频变化' : '待播放：频谱将在真实音频开始后响应' }}</figcaption>
  </figure>
</template>

<style scoped>
.spectrum { width: min(320px, 74vw); margin: 22px 0 0; }
canvas { display: block; width: 100%; height: 72px; opacity: .72; }
figcaption { margin-top: 8px; color: var(--c-white-65); font-size: 12px; letter-spacing: .04em; }
.spectrum--active canvas { opacity: 1; }
@media (prefers-reduced-motion: reduce) { canvas { opacity: .74; } }
</style>
