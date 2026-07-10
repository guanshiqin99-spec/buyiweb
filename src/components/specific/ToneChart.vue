<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useThemeStore } from '@/stores/theme'

const props = defineProps({
  tones: {
    type: Array,
    default: () => [
      { name: '第一声', value: 55, description: '高平调' },
      { name: '第二声', value: 35, description: '中升调' },
      { name: '第三声', value: 214, description: '降升调' },
      { name: '第四声', value: 51, description: '全降调' },
      { name: '第五声', value: 21, description: '低降调' },
      { name: '第六声', value: 33, description: '中平调' }
    ]
  }
})

const canvasRef = ref(null)
const themeStore = useThemeStore()

const chartDescription = computed(() => {
  const list = props.tones.map(t => `${t.name}：${t.value}（${t.description}）`).join('；')
  return `布依语声调曲线图。${list}`
})

const drawToneCurve = () => {
  const canvas = canvasRef.value
  if (!canvas) return

  const ctx = canvas.getContext('2d')
  const width = canvas.width
  const height = canvas.height

  // 一次性读取主题令牌，避免 layout thrashing
  const rootStyle = getComputedStyle(document.documentElement)
  const brandColor = rootStyle.getPropertyValue('--c-brand').trim() || '#3A6B8C'
  const textColor = rootStyle.getPropertyValue('--c-text-70').trim() || 'rgba(27,58,92,0.7)'
  const gridColor = rootStyle.getPropertyValue('--c-brand-08').trim() || 'rgba(58,107,140,0.08)'

  // 清空画布
  ctx.clearRect(0, 0, width, height)

  // 绘制网格
  ctx.strokeStyle = gridColor
  ctx.lineWidth = 1
  for (let i = 1; i < 5; i++) {
    const y = (height / 5) * i
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(width, y)
    ctx.stroke()
  }

  // 绘制声调曲线
  ctx.strokeStyle = brandColor
  ctx.lineWidth = 3
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'

  const toneWidth = width / (props.tones.length + 1)

  props.tones.forEach((tone, index) => {
    const x = toneWidth * (index + 1)
    const normalizedValue = (tone.value - 20) / 80
    const y = height - (normalizedValue * height * 0.8) - height * 0.1

    // 绘制点
    ctx.fillStyle = brandColor
    ctx.beginPath()
    ctx.arc(x, y, 6, 0, Math.PI * 2)
    ctx.fill()

    // 绘制连接线
    if (index > 0) {
      const prevTone = props.tones[index - 1]
      const prevX = toneWidth * index
      const prevNormalizedValue = (prevTone.value - 20) / 80
      const prevY = height - (prevNormalizedValue * height * 0.8) - height * 0.1

      ctx.beginPath()
      ctx.moveTo(prevX, prevY)
      ctx.lineTo(x, y)
      ctx.stroke()
    }

    // 绘制标签
    ctx.fillStyle = textColor
    ctx.font = '12px DM Sans, sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(tone.name, x, height - 8)
  })
}

onMounted(() => {
  drawToneCurve()
})

// 主题切换后令牌已变化，等 DOM 应用完再重绘
watch(() => themeStore.resolved, () => {
  nextTick(drawToneCurve)
})
</script>

<template>
  <div class="tone-chart">
    <h3 class="chart-title">布依语声调系统</h3>
    
    <div class="chart-container">
      <canvas
        ref="canvasRef"
        width="400"
        height="200"
        role="img"
        :aria-label="chartDescription"
      ></canvas>
      <p class="sr-only">{{ chartDescription }}</p>
    </div>
    
    <div class="tone-legend">
      <div v-for="tone in tones" :key="tone.name" class="tone-item">
        <span class="tone-name">{{ tone.name }}</span>
        <span class="tone-value">{{ tone.value }}</span>
        <span class="tone-desc">{{ tone.description }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.tone-chart {
  padding: 24px;
}

.chart-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--c-text);
  margin: 0 0 24px 0;
  text-align: center;
}

.chart-container {
  display: flex;
  justify-content: center;
  margin-bottom: 24px;
}

canvas {
  max-width: 100%;
  height: auto;
}

.tone-legend {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

@media (max-width: 640px) {
  .tone-legend {
    grid-template-columns: repeat(2, 1fr);
  }
}

.tone-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px;
  background: var(--c-brand-06);
  border-radius: 8px;
}

.tone-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--c-text);
  margin-bottom: 4px;
}

.tone-value {
  font-size: 20px;
  font-weight: 700;
  color: var(--c-brand);
  margin-bottom: 4px;
}

.tone-desc {
  font-size: 12px;
  color: var(--c-text-60);
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
</style>
