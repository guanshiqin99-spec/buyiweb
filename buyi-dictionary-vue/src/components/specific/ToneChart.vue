<script setup>
import { nextTick, onMounted, ref, watch } from 'vue'
import { useThemeStore } from '@/stores/theme'

const props = defineProps({
  tones: { type: Array, required: true },
  selectedIndex: { type: Number, default: 0 }
})

const canvasRef = ref(null)
const themeStore = useThemeStore()

function toneHeight(value) {
  const digits = String(value).split('').map(Number)
  return digits.reduce((total, digit) => total + digit, 0) / digits.length
}

function drawToneCurve() {
  const canvas = canvasRef.value
  if (!canvas) return
  const context = canvas.getContext('2d')
  const width = canvas.width
  const height = canvas.height
  const styles = getComputedStyle(canvas)
  const brand = styles.getPropertyValue('--c-brand').trim() || '#3A6B8C'
  const accent = styles.getPropertyValue('--c-accent').trim() || '#D4883A'
  const grid = styles.getPropertyValue('--c-brand-08').trim() || 'rgba(58, 107, 140, .08)'
  const text = styles.getPropertyValue('--c-text-70').trim() || 'rgba(27, 58, 92, .7)'
  const padding = { top: 24, right: 28, bottom: 36, left: 28 }
  const innerWidth = width - padding.left - padding.right
  const innerHeight = height - padding.top - padding.bottom

  context.clearRect(0, 0, width, height)
  context.strokeStyle = grid
  context.lineWidth = 1
  for (let index = 0; index <= 4; index += 1) {
    const y = padding.top + (innerHeight / 4) * index
    context.beginPath()
    context.moveTo(padding.left, y)
    context.lineTo(width - padding.right, y)
    context.stroke()
  }

  const points = props.tones.map((tone, index) => {
    const x = padding.left + (innerWidth / Math.max(1, props.tones.length - 1)) * index
    const y = padding.top + innerHeight * (1 - (toneHeight(tone.value) - 1) / 4)
    return { x, y, tone }
  })

  context.strokeStyle = brand
  context.lineWidth = 3
  context.lineCap = 'round'
  context.lineJoin = 'round'
  context.beginPath()
  points.forEach((point, index) => index ? context.lineTo(point.x, point.y) : context.moveTo(point.x, point.y))
  context.stroke()

  context.font = '12px sans-serif'
  context.textAlign = 'center'
  points.forEach((point, index) => {
    const selected = index === props.selectedIndex
    context.fillStyle = selected ? accent : brand
    context.beginPath()
    context.arc(point.x, point.y, selected ? 8 : 5, 0, Math.PI * 2)
    context.fill()
    context.fillStyle = text
    context.fillText(point.tone.name, point.x, height - 13)
  })
}

onMounted(drawToneCurve)
watch([() => props.tones, () => props.selectedIndex, () => themeStore.resolved], () => nextTick(drawToneCurve), { deep: true })
</script>

<template>
  <section class="tone-chart" aria-label="布依语声调曲线图">
    <div class="tone-chart__heading">
      <p>调值观察</p>
      <h3>六个舒声调</h3>
    </div>
    <canvas ref="canvasRef" width="620" height="250" role="img" aria-label="六个布依语舒声调的示意曲线"></canvas>
  </section>
</template>

<style scoped>
.tone-chart { padding: 6px 0 0; }
.tone-chart__heading p, .tone-chart__heading h3 { margin: 0; }
.tone-chart__heading p { color: var(--c-accent); font-size: 12px; font-weight: 700; }
.tone-chart__heading h3 { margin-top: 4px; color: var(--c-text); font: 600 24px var(--font-serif); }
canvas { display: block; width: 100%; height: auto; margin-top: 14px; }
</style>
