<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'

const props = defineProps({
  data: {
    type: Array,
    default: () => [
      { category: '自然', count: 156 },
      { category: '动物', count: 89 },
      { category: '植物', count: 67 },
      { category: '人物', count: 112 },
      { category: '动作', count: 98 },
      { category: '形容', count: 76 },
      { category: '其他', count: 48 }
    ]
  },
  title: {
    type: String,
    default: '词汇分类分布'
  },
  height: {
    type: Number,
    default: 300
  }
})

const isExpanded = ref(false)
const hasData = computed(() => Array.isArray(props.data) && props.data.length > 0)

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

// 弹层打开时锁定背景滚动
watch(isExpanded, (open) => {
  if (typeof document === 'undefined' || !document.body) return
  document.body.style.overflow = open ? 'hidden' : ''
})

const maxValue = computed(() => {
  if (!hasData.value) return 0
  return Math.max(...props.data.map(item => item.count))
})

const totalCount = computed(() => {
  if (!hasData.value) return 0
  return props.data.reduce((sum, item) => sum + item.count, 0)
})

// 放大视图使用更大的高度
const expandedHeight = computed(() => Math.max(props.height, 380))
</script>

<template>
  <div
    class="chart-container"
    :class="{ 'is-interactive': hasData }"
    :role="hasData ? 'button' : undefined"
    :tabindex="hasData ? 0 : undefined"
    :aria-expanded="hasData ? isExpanded : undefined"
    :aria-label="hasData ? `点击放大查看${title}图表` : `${title}（暂无数据）`"
    :aria-disabled="!hasData"
    @click="openExpanded"
    @keydown.enter.prevent="openExpanded"
    @keydown.space.prevent="openExpanded"
  >
    <h3 class="chart-title">{{ title }}</h3>

    <p v-if="!hasData" class="chart-empty">暂无学习分布数据</p>
    <div
      v-else
      class="chart-wrapper"
      aria-hidden="true"
      :style="{ height: height + 'px' }"
    >
      <!-- Y轴标签 -->
      <div class="y-axis">
        <span v-for="i in 5" :key="i" class="y-label">
          {{ Math.round(maxValue * (6 - i) / 5) }}
        </span>
      </div>

      <!-- 图表区域 -->
      <div class="chart-area">
        <!-- 网格线 -->
        <div class="grid-lines">
          <div v-for="i in 5" :key="i" class="grid-line"></div>
        </div>

        <!-- 柱状图 -->
        <div class="bars-container">
          <div
            v-for="(item, index) in data"
            :key="index"
            class="bar-group"
          >
            <div class="bar-wrapper">
              <div
                class="bar"
                :style="{
                  height: (item.count / maxValue * 100) + '%',
                  animationDelay: (index * 0.1) + 's'
                }"
              >
                <span class="bar-value">{{ item.count }}</span>
              </div>
            </div>
            <span class="bar-label">{{ item.category }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 图例 -->
    <div v-if="hasData" class="chart-legend">
      <div class="legend-item">
        <span class="legend-color" style="background: var(--c-brand)"></span>
        <span class="legend-text">共 {{ totalCount }} 条</span>
      </div>
    </div>

    <!-- 放大弹层 -->
    <Teleport to="body">
      <div
        v-if="isExpanded"
        class="chart-overlay"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="`chart-expanded-title-${title}`"
        @click.self="closeExpanded"
      >
        <div class="chart-modal liquid-glass liquid-glass-content">
          <header class="chart-modal-header">
            <h3 :id="`chart-expanded-title-${title}`" class="chart-modal-title">{{ title }}</h3>
            <button
              type="button"
              class="chart-close"
              aria-label="关闭放大视图"
              @click="closeExpanded"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </header>

          <div
            class="chart-wrapper chart-wrapper--lg"
            :style="{ height: expandedHeight + 'px' }"
          >
            <div class="y-axis">
              <span v-for="i in 5" :key="i" class="y-label y-label--lg">
                {{ Math.round(maxValue * (6 - i) / 5) }}
              </span>
            </div>
            <div class="chart-area">
              <div class="grid-lines">
                <div v-for="i in 5" :key="i" class="grid-line"></div>
              </div>
              <div class="bars-container">
                <div
                  v-for="(item, index) in data"
                  :key="index"
                  class="bar-group bar-group--lg"
                >
                  <div class="bar-wrapper">
                    <div
                      class="bar"
                      :style="{
                        height: (item.count / maxValue * 100) + '%',
                        animationDelay: (index * 0.1) + 's'
                      }"
                    >
                      <span class="bar-value bar-value--lg">{{ item.count }}</span>
                    </div>
                  </div>
                  <span class="bar-label bar-label--lg">{{ item.category }}</span>
                </div>
              </div>
            </div>
          </div>

          <ul class="chart-detail">
            <li v-for="item in data" :key="item.category">
              <span class="chart-detail__label">{{ item.category }}</span>
              <span class="chart-detail__value">{{ item.count }}</span>
              <span class="chart-detail__ratio">{{ totalCount ? Math.round(item.count / totalCount * 100) : 0 }}%</span>
            </li>
          </ul>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.chart-container {
  padding: 24px;
  border-radius: inherit;
  transition: box-shadow 200ms ease, transform 200ms ease;
}

/* 有数据时整张卡片可点击 */
.chart-container.is-interactive {
  cursor: zoom-in;
}

.chart-container.is-interactive:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(58, 107, 140, 0.15);
}

.chart-container.is-interactive:focus-visible {
  outline: 2px solid var(--c-focus);
  outline-offset: 2px;
}

.chart-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--c-text);
  margin: 0 0 24px 0;
  text-align: center;
  transition: color 150ms ease;
}

.chart-container.is-interactive:hover .chart-title {
  color: var(--c-brand);
}

.chart-empty {
  display: grid;
  min-height: 160px;
  margin: 0;
  place-items: center;
  color: var(--c-text-60);
  font-size: 12px;
}

.chart-wrapper {
  display: flex;
  gap: 12px;
  position: relative;
}

.y-axis {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 0 8px 24px 0;
  min-width: 40px;
}

.y-label {
  font-size: 11px;
  color: var(--c-text-50);
  text-align: right;
}

.chart-area {
  flex: 1;
  position: relative;
  border-left: 1px solid var(--c-divider);
  border-bottom: 1px solid var(--c-divider);
}

.grid-lines {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  pointer-events: none;
}

.grid-line {
  height: 1px;
  background: var(--c-divider);
  opacity: 0.5;
}

.bars-container {
  display: flex;
  justify-content: space-around;
  align-items: flex-end;
  height: 100%;
  padding: 0 8px;
}

.bar-group {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  max-width: 60px;
}

.bar-wrapper {
  flex: 1;
  width: 100%;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

.bar {
  width: 70%;
  background: linear-gradient(to top, var(--c-brand), var(--c-brand-light));
  border-radius: 4px 4px 0 0;
  position: relative;
  min-height: 4px;
  animation: barGrow 0.6s ease-out forwards;
  transform-origin: bottom;
}

@keyframes barGrow {
  from { transform: scaleY(0); }
  to { transform: scaleY(1); }
}

.bar-value {
  position: absolute;
  top: -20px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 11px;
  font-weight: 600;
  color: var(--c-brand);
  white-space: nowrap;
}

.bar-label {
  font-size: 12px;
  color: var(--c-text-70);
  margin-top: 8px;
  text-align: center;
  white-space: nowrap;
}

.chart-legend {
  display: flex;
  justify-content: center;
  margin-top: 16px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.legend-color {
  width: 12px;
  height: 12px;
  border-radius: 2px;
}

.legend-text {
  font-size: 12px;
  color: var(--c-text-60);
}

/* ===== 放大弹层 ===== */
.chart-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: grid;
  place-items: center;
  padding: 24px;
  background: rgba(15, 28, 38, 0.55);
  backdrop-filter: blur(8px);
  animation: chart-fade-in 200ms ease;
}

.chart-modal {
  width: min(720px, 100%);
  max-height: 90vh;
  overflow: auto;
  padding: 24px 28px 28px;
  border-radius: 20px;
  animation: chart-pop-in 220ms cubic-bezier(0.2, 0.7, 0.3, 1);
}

.chart-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.chart-modal-title {
  margin: 0;
  color: var(--c-text);
  font: 600 22px var(--font-serif);
}

.chart-close {
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

.chart-close:hover {
  color: var(--c-brand);
  border-color: var(--c-brand);
}

.chart-close:focus-visible {
  outline: 2px solid var(--c-focus);
  outline-offset: 2px;
}

.chart-wrapper--lg .y-label--lg {
  font-size: 14px;
}

.chart-wrapper--lg .bar-group--lg {
  max-width: 90px;
}

.chart-wrapper--lg .bar-value--lg {
  font-size: 14px;
  top: -24px;
}

.chart-wrapper--lg .bar-label--lg {
  font-size: 14px;
  margin-top: 12px;
}

.chart-detail {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 8px;
  margin: 20px 0 0;
  padding: 0;
  list-style: none;
}

.chart-detail li {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto auto;
  align-items: baseline;
  gap: 8px;
  padding: 10px 14px;
  border-radius: 10px;
  background: var(--c-brand-08);
  font-size: 13px;
}

.chart-detail__label {
  color: var(--c-text);
  font-weight: 600;
}

.chart-detail__value {
  color: var(--c-brand);
  font-variant-numeric: tabular-nums;
  font-weight: 700;
}

.chart-detail__ratio {
  color: var(--c-text-60);
  font-size: 11px;
  font-variant-numeric: tabular-nums;
}

@keyframes chart-fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes chart-pop-in {
  from { opacity: 0; transform: scale(0.92); }
  to { opacity: 1; transform: scale(1); }
}

@media (prefers-reduced-motion: reduce) {
  .chart-overlay,
  .chart-modal {
    animation: none;
  }
  .bar { animation: none !important; }
}
</style>
