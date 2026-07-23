<script setup>
import { computed } from 'vue'

const props = defineProps({
  data: {
    type: Object,
    default: () => ({})
  }
})

const dimensions = [
  { key: 'dictionary', label: '词汇' },
  { key: 'phrase', label: '短语' },
  { key: 'proverb', label: '谚语' },
  { key: 'song', label: '民歌' },
  { key: 'quiz', label: '答题' }
]
const center = { x: 180, y: 150 }
const radius = 98

const values = computed(() => dimensions.map(({ key }) => {
  const value = Number(props.data?.[key] ?? 0)
  return Number.isFinite(value) && value > 0 ? value : 0
}))
const maxValue = computed(() => Math.max(0, ...values.value))
const hasData = computed(() => maxValue.value > 0)

function point(index, ratio, pointRadius = radius) {
  const angle = -Math.PI / 2 + (Math.PI * 2 * index) / dimensions.length
  return {
    x: center.x + Math.cos(angle) * pointRadius * ratio,
    y: center.y + Math.sin(angle) * pointRadius * ratio
  }
}

function pointsForRatio(ratio) {
  return dimensions.map((_, index) => {
    const current = point(index, ratio)
    return `${current.x.toFixed(2)},${current.y.toFixed(2)}`
  }).join(' ')
}

const gridPolygons = computed(() => [0.2, 0.4, 0.6, 0.8, 1].map(pointsForRatio))
const axes = computed(() => dimensions.map((dimension, index) => ({
  ...dimension,
  end: point(index, 1),
  labelPoint: point(index, 1, radius + 30)
})))
const valuePolygon = computed(() => dimensions.map((_, index) => {
  const ratio = maxValue.value ? values.value[index] / maxValue.value : 0
  const current = point(index, ratio)
  return `${current.x.toFixed(2)},${current.y.toFixed(2)}`
}).join(' '))

function labelAnchor(x) {
  if (x < center.x - 10) return 'end'
  if (x > center.x + 10) return 'start'
  return 'middle'
}
</script>

<template>
  <section class="radar-chart" aria-labelledby="radar-chart-title">
    <header>
      <p>五维分布</p>
      <h3 id="radar-chart-title">学习侧重</h3>
    </header>

    <p v-if="!hasData" class="radar-chart__empty">暂无学习分布</p>
    <svg v-else viewBox="0 0 360 310" role="img" aria-label="词汇、短语、谚语、民歌和答题五维学习雷达图">
      <polygon
        v-for="(polygon, index) in gridPolygons"
        :key="index"
        :points="polygon"
        class="radar-chart__grid"
      />
      <line
        v-for="axis in axes"
        :key="axis.key"
        :x1="center.x"
        :y1="center.y"
        :x2="axis.end.x"
        :y2="axis.end.y"
        class="radar-chart__axis"
      />
      <polygon :points="valuePolygon" class="radar-chart__value" />
      <circle
        v-for="(axis, index) in axes"
        :key="`point-${axis.key}`"
        :cx="point(index, values[index] / maxValue).x"
        :cy="point(index, values[index] / maxValue).y"
        r="3.5"
        class="radar-chart__point"
      />
      <text
        v-for="(axis, index) in axes"
        :key="`label-${axis.key}`"
        :x="axis.labelPoint.x"
        :y="axis.labelPoint.y"
        :text-anchor="labelAnchor(axis.labelPoint.x)"
        dominant-baseline="middle"
        class="radar-chart__label"
      >{{ axis.label }} {{ values[index] }}</text>
    </svg>
  </section>
</template>

<style scoped>
.radar-chart {
  min-width: 0;
  padding: 22px;
}

.radar-chart header p,
.radar-chart header h3 {
  margin: 0;
}

.radar-chart header p {
  color: var(--c-accent-text);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: .08em;
}

.radar-chart header h3 {
  margin-top: 4px;
  color: var(--c-text);
  font: 600 18px var(--font-serif);
}

.radar-chart svg {
  display: block;
  width: 100%;
  height: auto;
  margin-top: 8px;
  overflow: visible;
}

.radar-chart__empty {
  display: grid;
  min-height: 160px;
  margin: 0;
  place-items: center;
  color: var(--c-text-60);
  font-size: 11px;
}

.radar-chart__grid {
  fill: none;
  stroke: var(--c-divider);
  stroke-width: 1;
}

.radar-chart__axis {
  stroke: var(--c-divider);
  stroke-width: 1;
}

.radar-chart__value {
  fill: color-mix(in srgb, var(--c-brand) 22%, transparent);
  stroke: var(--c-brand);
  stroke-width: 2.5;
  stroke-linejoin: round;
}

.radar-chart__point {
  fill: var(--c-accent);
  stroke: var(--background);
  stroke-width: 2;
}

.radar-chart__label {
  fill: var(--c-text-70);
  font: 11px var(--font-sans);
}
</style>
