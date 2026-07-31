<script setup>
import { computed, ref, onMounted, onUnmounted, watch } from 'vue'

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
// 内嵌视图（默认）与放大视图共用中心点；放大视图使用更大的半径与画布
const center = { x: 180, y: 150 }
const radius = 98
const expandedCenter = { x: 300, y: 260 }
const expandedRadius = 180

const isExpanded = ref(false)

function openExpanded() {
  if (!hasData.value) return
  isExpanded.value = true
}

function closeExpanded() {
  isExpanded.value = false
}

function onKeydown(event) {
  if (event.key === 'Escape' && isExpanded.value) closeExpanded()
}

onMounted(() => {
  window.addEventListener('keydown', onKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', onKeydown)
  if (typeof document !== 'undefined' && document.body) {
    document.body.style.overflow = ''
  }
})

// 弹层打开时锁定背景滚动；在 setup 顶层注册以便组件卸载时自动停止
watch(isExpanded, (open) => {
  if (typeof document === 'undefined' || !document.body) return
  document.body.style.overflow = open ? 'hidden' : ''
})

const values = computed(() => dimensions.map(({ key }) => {
  const value = Number(props.data?.[key] ?? 0)
  return Number.isFinite(value) && value > 0 ? value : 0
}))
const maxValue = computed(() => Math.max(0, ...values.value))
const hasData = computed(() => maxValue.value > 0)

// 计算总和用于占比展示
const totalValue = computed(() => values.value.reduce((sum, v) => sum + v, 0))
const dimensionStats = computed(() => dimensions.map((dim, index) => {
  const v = values.value[index]
  return {
    ...dim,
    value: v,
    ratio: totalValue.value > 0 ? Math.round((v / totalValue.value) * 100) : 0
  }
}))

function makePoint(centerPt, pointRadius, index, ratio, dimCount = dimensions.length) {
  const angle = -Math.PI / 2 + (Math.PI * 2 * index) / dimCount
  return {
    x: centerPt.x + Math.cos(angle) * pointRadius * ratio,
    y: centerPt.y + Math.sin(angle) * pointRadius * ratio
  }
}

function pointsForRatio(centerPt, pointRadius, ratio) {
  return dimensions.map((_, index) => {
    const current = makePoint(centerPt, pointRadius, index, ratio)
    return `${current.x.toFixed(2)},${current.y.toFixed(2)}`
  }).join(' ')
}

const gridPolygons = computed(() => [0.2, 0.4, 0.6, 0.8, 1].map((r) => pointsForRatio(center, radius, r)))
const expandedGridPolygons = computed(() => [0.2, 0.4, 0.6, 0.8, 1].map((r) => pointsForRatio(expandedCenter, expandedRadius, r)))

const axes = computed(() => dimensions.map((dimension, index) => ({
  ...dimension,
  end: makePoint(center, radius, index, 1),
  labelPoint: makePoint(center, radius + 30, index, 1)
})))
const expandedAxes = computed(() => dimensions.map((dimension, index) => ({
  ...dimension,
  end: makePoint(expandedCenter, expandedRadius, index, 1),
  labelPoint: makePoint(expandedCenter, expandedRadius + 38, index, 1)
})))

const valuePolygon = computed(() => dimensions.map((_, index) => {
  const ratio = maxValue.value ? values.value[index] / maxValue.value : 0
  const current = makePoint(center, radius, index, ratio)
  return `${current.x.toFixed(2)},${current.y.toFixed(2)}`
}).join(' '))
const expandedValuePolygon = computed(() => dimensions.map((_, index) => {
  const ratio = maxValue.value ? values.value[index] / maxValue.value : 0
  const current = makePoint(expandedCenter, expandedRadius, index, ratio)
  return `${current.x.toFixed(2)},${current.y.toFixed(2)}`
}).join(' '))

function labelAnchor(x, cx = center.x) {
  if (x < cx - 10) return 'end'
  if (x > cx + 10) return 'start'
  return 'middle'
}
</script>

<template>
  <section
    class="radar-chart"
    :class="{ 'is-interactive': hasData }"
    :role="hasData ? 'button' : undefined"
    :tabindex="hasData ? 0 : undefined"
    :aria-expanded="hasData ? isExpanded : undefined"
    :aria-label="hasData ? '点击放大查看学习侧重五维分布' : '学习侧重（暂无数据）'"
    :aria-disabled="!hasData"
    @click="openExpanded"
    @keydown.enter.prevent="openExpanded"
    @keydown.space.prevent="openExpanded"
  >
    <header>
      <p>五维分布</p>
      <h3 id="radar-chart-title" class="radar-chart__title">学习侧重</h3>
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
        :cx="makePoint(center, radius, index, values[index] / maxValue).x"
        :cy="makePoint(center, radius, index, values[index] / maxValue).y"
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

    <!-- 放大弹层：Teleport 到 body 避免父级裁切 -->
    <Teleport to="body">
      <div
        v-if="isExpanded"
        class="radar-chart__overlay"
        role="dialog"
        aria-modal="true"
        aria-labelledby="radar-chart-expanded-title"
        @click.self="closeExpanded"
      >
        <div class="radar-chart__modal liquid-glass liquid-glass-content">
          <header class="radar-chart__modal-header">
            <div>
              <p>五维分布</p>
              <h3 id="radar-chart-expanded-title">学习侧重</h3>
            </div>
            <button
              type="button"
              class="radar-chart__close"
              aria-label="关闭放大视图"
              @click="closeExpanded"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </header>

          <svg viewBox="0 0 600 540" role="img" aria-label="放大版五维学习雷达图">
            <polygon
              v-for="(polygon, index) in expandedGridPolygons"
              :key="`grid-${index}`"
              :points="polygon"
              class="radar-chart__grid"
            />
            <line
              v-for="axis in expandedAxes"
              :key="`axis-${axis.key}`"
              :x1="expandedCenter.x"
              :y1="expandedCenter.y"
              :x2="axis.end.x"
              :y2="axis.end.y"
              class="radar-chart__axis"
            />
            <polygon :points="expandedValuePolygon" class="radar-chart__value" />
            <circle
              v-for="(axis, index) in expandedAxes"
              :key="`pt-${axis.key}`"
              :cx="makePoint(expandedCenter, expandedRadius, index, values[index] / maxValue).x"
              :cy="makePoint(expandedCenter, expandedRadius, index, values[index] / maxValue).y"
              r="5"
              class="radar-chart__point"
            />
            <text
              v-for="(axis, index) in expandedAxes"
              :key="`lbl-${axis.key}`"
              :x="axis.labelPoint.x"
              :y="axis.labelPoint.y"
              :text-anchor="labelAnchor(axis.labelPoint.x, expandedCenter.x)"
              dominant-baseline="middle"
              class="radar-chart__label radar-chart__label--lg"
            >{{ axis.label }} {{ values[index] }}</text>
          </svg>

          <ul class="radar-chart__legend">
            <li v-for="dim in dimensionStats" :key="dim.key">
              <span class="radar-chart__legend-label">{{ dim.label }}</span>
              <span class="radar-chart__legend-value">{{ dim.value }}</span>
              <span class="radar-chart__legend-ratio">{{ dim.ratio }}%</span>
            </li>
          </ul>
        </div>
      </div>
    </Teleport>
  </section>
</template>

<style scoped>
.radar-chart {
  min-width: 0;
  padding: 22px;
  border-radius: inherit;
  transition: box-shadow 200ms ease, transform 200ms ease;
}

/* 有数据时整张卡片可点击：给出 hover / focus 视觉提示 */
.radar-chart.is-interactive {
  cursor: zoom-in;
}

.radar-chart.is-interactive:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(58, 107, 140, 0.15);
}

.radar-chart.is-interactive:focus-visible {
  outline: 2px solid var(--c-focus);
  outline-offset: 2px;
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

.radar-chart__title {
  margin-top: 4px;
  color: var(--c-text);
  font: 600 18px var(--font-serif);
  transition: color 150ms ease;
}

.radar-chart.is-interactive:hover .radar-chart__title {
  color: var(--c-brand);
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

.radar-chart__label--lg {
  font-size: 15px;
  font-weight: 600;
}

/* ===== 放大弹层 ===== */
.radar-chart__overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: grid;
  place-items: center;
  padding: 24px;
  background: rgba(15, 28, 38, 0.55);
  backdrop-filter: blur(8px);
  animation: radar-fade-in 200ms ease;
}

.radar-chart__modal {
  width: min(620px, 100%);
  max-height: 90vh;
  overflow: auto;
  padding: 24px 28px 28px;
  border-radius: 20px;
  animation: radar-pop-in 220ms cubic-bezier(0.2, 0.7, 0.3, 1);
}

.radar-chart__modal-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 8px;
}

.radar-chart__modal-header p {
  margin: 0;
  color: var(--c-accent-text);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: .08em;
}

.radar-chart__modal-header h3 {
  margin: 4px 0 0;
  color: var(--c-text);
  font: 600 22px var(--font-serif);
}

.radar-chart__close {
  display: grid;
  place-items: center;
  width: 36px;
  height: 36px;
  border: 1px solid var(--c-divider);
  border-radius: 999px;
  background: var(--c-glass);
  color: var(--c-text-70);
  cursor: pointer;
  transition: color 150ms ease, border-color 150ms ease;
}

.radar-chart__close:hover {
  color: var(--c-brand);
  border-color: var(--c-brand);
}

.radar-chart__close:focus-visible {
  outline: 2px solid var(--c-focus);
  outline-offset: 2px;
}

.radar-chart__modal svg {
  width: 100%;
  height: auto;
}

.radar-chart__legend {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(110px, 1fr));
  gap: 8px;
  margin: 16px 0 0;
  padding: 0;
  list-style: none;
}

.radar-chart__legend li {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto auto;
  align-items: baseline;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 10px;
  background: var(--c-brand-08);
  font-size: 13px;
}

.radar-chart__legend-label {
  color: var(--c-text);
  font-weight: 600;
}

.radar-chart__legend-value {
  color: var(--c-brand);
  font-variant-numeric: tabular-nums;
  font-weight: 700;
}

.radar-chart__legend-ratio {
  color: var(--c-text-60);
  font-size: 11px;
  font-variant-numeric: tabular-nums;
}

@keyframes radar-fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes radar-pop-in {
  from { opacity: 0; transform: scale(0.92); }
  to { opacity: 1; transform: scale(1); }
}

@media (prefers-reduced-motion: reduce) {
  .radar-chart__overlay,
  .radar-chart__modal {
    animation: none;
  }
}
</style>
