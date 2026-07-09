<script setup>
import { ref, onMounted, computed } from 'vue'

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
  height: {
    type: Number,
    default: 300
  }
})

const maxValue = computed(() => {
  return Math.max(...props.data.map(item => item.count))
})

const barWidth = computed(() => {
  const totalBars = props.data.length
  const availableWidth = 100
  return (availableWidth / totalBars) * 0.6
})

const barGap = computed(() => {
  const totalBars = props.data.length
  const availableWidth = 100
  return (availableWidth / totalBars) * 0.4
})
</script>

<template>
  <div class="chart-container">
    <h3 class="chart-title">词汇分类分布</h3>
    
    <div class="chart-wrapper" :style="{ height: height + 'px' }">
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
    <div class="chart-legend">
      <div class="legend-item">
        <span class="legend-color" style="background: var(--c-brand)"></span>
        <span class="legend-text">词汇数量</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.chart-container {
  padding: 24px;
}

.chart-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--c-text);
  margin: 0 0 24px 0;
  text-align: center;
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
  from {
    transform: scaleY(0);
  }
  to {
    transform: scaleY(1);
  }
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
</style>
