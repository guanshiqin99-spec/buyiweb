<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'

const props = defineProps({
  records: {
    type: Array,
    default: () => []
  }
})

const weekdayNames = ['一', '二', '三', '四', '五', '六', '日']

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

watch(isExpanded, (open) => {
  if (typeof document === 'undefined' || !document.body) return
  document.body.style.overflow = open ? 'hidden' : ''
})

function dateKey(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const validRecordDates = computed(() => props.records
  .map((record) => new Date(record?.createdAt || record?.learnedAt || ''))
  .filter((date) => !Number.isNaN(date.getTime())))

const visibleRecordDates = computed(() => {
  const today = new Date()
  today.setHours(23, 59, 59, 999)
  const earliest = new Date(today)
  earliest.setHours(0, 0, 0, 0)
  earliest.setDate(earliest.getDate() - 34)
  return validRecordDates.value.filter((date) => date >= earliest && date <= today)
})

const weekdayLabels = computed(() => {
  const firstDay = new Date()
  firstDay.setDate(firstDay.getDate() - 34)
  const firstIndex = (firstDay.getDay() + 6) % 7
  return Array.from({ length: 7 }, (_, index) => weekdayNames[(firstIndex + index) % 7])
})

const days = computed(() => {
  const counts = new Map()
  visibleRecordDates.value.forEach((date) => {
    const key = dateKey(date)
    counts.set(key, (counts.get(key) || 0) + 1)
  })
  const maxCount = Math.max(0, ...counts.values())
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  return Array.from({ length: 35 }, (_, index) => {
    const date = new Date(today)
    date.setDate(today.getDate() - (34 - index))
    const key = dateKey(date)
    const count = counts.get(key) || 0
    const level = count === 0 || maxCount === 0
      ? 0
      : Math.min(4, Math.max(1, Math.ceil((count / maxCount) * 4)))
    return {
      key,
      count,
      level,
      label: `${date.getMonth() + 1}月${date.getDate()}日，学习 ${count} 次`
    }
  })
})

const hasData = computed(() => visibleRecordDates.value.length > 0)

// 汇总统计：用于放大弹层下方的明细
const summary = computed(() => {
  const total = days.value.reduce((sum, day) => sum + day.count, 0)
  const activeDays = days.value.filter((day) => day.count > 0).length
  const maxDay = days.value.reduce((max, day) => (day.count > max.count ? day : max), { count: 0, key: '' })
  return {
    total,
    activeDays,
    maxCount: maxDay.count,
    avgPerActive: activeDays > 0 ? Math.round(total / activeDays) : 0
  }
})
</script>

<template>
  <section
    class="heat-map"
    :class="{ 'is-interactive': hasData }"
    :role="hasData ? 'button' : undefined"
    :tabindex="hasData ? 0 : undefined"
    :aria-expanded="hasData ? isExpanded : undefined"
    :aria-label="hasData ? '点击放大查看学习热力图' : '学习热力（暂无数据）'"
    :aria-disabled="!hasData"
    aria-labelledby="heat-map-title"
    @click="openExpanded"
    @keydown.enter.prevent="openExpanded"
    @keydown.space.prevent="openExpanded"
  >
    <header>
      <div>
        <p>近 35 天</p>
        <h3 id="heat-map-title">学习热力</h3>
      </div>
      <span v-if="hasData">颜色越深，学习越集中</span>
    </header>

    <p v-if="!hasData" class="heat-map__empty">暂无学习记录</p>
    <template v-else>
      <div class="heat-map__weekdays" aria-hidden="true">
        <span v-for="label in weekdayLabels" :key="label">{{ label }}</span>
      </div>
      <div class="heat-map__grid" role="img" aria-label="最近三十五天学习次数热力图">
        <span
          v-for="day in days"
          :key="day.key"
          class="heat-map__cell"
          :style="{ '--level': day.level }"
          :title="day.label"
          :aria-label="day.label"
        ></span>
      </div>
      <div class="heat-map__legend" aria-hidden="true">
        <span>少</span>
        <i v-for="level in 5" :key="level" :style="{ '--level': level - 1 }"></i>
        <span>多</span>
      </div>
    </template>

    <!-- 放大弹层 -->
    <Teleport to="body">
      <div
        v-if="isExpanded"
        class="heat-overlay"
        role="dialog"
        aria-modal="true"
        aria-labelledby="heat-expanded-title"
        @click.self="closeExpanded"
      >
        <div class="heat-modal liquid-glass liquid-glass-content">
          <header class="heat-modal-header">
            <div>
              <p class="heat-modal-subtitle">近 35 天</p>
              <h3 id="heat-expanded-title" class="heat-modal-title">学习热力</h3>
            </div>
            <button
              type="button"
              class="heat-close"
              aria-label="关闭放大视图"
              @click="closeExpanded"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </header>

          <div class="heat-modal__weekdays" aria-hidden="true">
            <span v-for="label in weekdayLabels" :key="label">{{ label }}</span>
          </div>
          <div class="heat-modal__grid" role="img" aria-label="最近三十五天学习次数热力图">
            <span
              v-for="day in days"
              :key="day.key"
              class="heat-modal__cell"
              :style="{ '--level': day.level }"
              :title="day.label"
            >
              <span class="heat-modal__count">{{ day.count }}</span>
            </span>
          </div>
          <div class="heat-modal__legend" aria-hidden="true">
            <span>少</span>
            <i v-for="level in 5" :key="level" :style="{ '--level': level - 1 }"></i>
            <span>多</span>
          </div>

          <ul class="heat-modal__stats">
            <li>
              <span class="heat-stat__label">35 天总学习</span>
              <span class="heat-stat__value">{{ summary.total }} 次</span>
            </li>
            <li>
              <span class="heat-stat__label">活跃天数</span>
              <span class="heat-stat__value">{{ summary.activeDays }} / 35</span>
            </li>
            <li>
              <span class="heat-stat__label">单日最高</span>
              <span class="heat-stat__value">{{ summary.maxCount }} 次</span>
            </li>
            <li>
              <span class="heat-stat__label">日均（活跃）</span>
              <span class="heat-stat__value">{{ summary.avgPerActive }} 次</span>
            </li>
          </ul>
        </div>
      </div>
    </Teleport>
  </section>
</template>

<style scoped>
.heat-map {
  min-width: 0;
  padding: 22px;
  border-radius: inherit;
  transition: box-shadow 200ms ease, transform 200ms ease;
}

.heat-map.is-interactive {
  cursor: zoom-in;
}

.heat-map.is-interactive:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(58, 107, 140, 0.15);
}

.heat-map.is-interactive:focus-visible {
  outline: 2px solid var(--c-focus);
  outline-offset: 2px;
}

.heat-map header {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 18px;
}

.heat-map header p,
.heat-map header h3 {
  margin: 0;
}

.heat-map header p {
  color: var(--c-accent-text);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: .08em;
}

.heat-map header h3 {
  margin-top: 4px;
  color: var(--c-text);
  font: 600 18px var(--font-serif);
  transition: color 150ms ease;
}

.heat-map.is-interactive:hover header h3 {
  color: var(--c-brand);
}

.heat-map header > span,
.heat-map__empty {
  color: var(--c-text-60);
  font-size: 11px;
}

.heat-map__empty {
  display: grid;
  min-height: 160px;
  margin: 0;
  place-items: center;
}

.heat-map__weekdays,
.heat-map__grid {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 7px;
}

.heat-map__weekdays {
  margin-bottom: 7px;
  color: var(--c-text-50);
  font-size: 10px;
  text-align: center;
}

.heat-map__cell {
  aspect-ratio: 1;
  min-width: 0;
  border: 1px solid color-mix(in srgb, var(--c-brand) 12%, transparent);
  border-radius: 5px;
  background: color-mix(in srgb, var(--c-brand) calc(var(--level) * 22%), var(--c-bg-silver));
}

.heat-map__legend {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 5px;
  margin-top: 12px;
  color: var(--c-text-50);
  font-size: 10px;
}

.heat-map__legend i {
  width: 10px;
  height: 10px;
  border: 1px solid color-mix(in srgb, var(--c-brand) 12%, transparent);
  border-radius: 3px;
  background: color-mix(in srgb, var(--c-brand) calc(var(--level) * 22%), var(--c-bg-silver));
}

/* ===== 放大弹层 ===== */
.heat-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: grid;
  place-items: center;
  padding: 24px;
  background: rgba(15, 28, 38, 0.55);
  backdrop-filter: blur(8px);
  animation: heat-fade-in 200ms ease;
}

.heat-modal {
  width: min(680px, 100%);
  max-height: 90vh;
  overflow: auto;
  padding: 24px 28px 28px;
  border-radius: 20px;
  animation: heat-pop-in 220ms cubic-bezier(0.2, 0.7, 0.3, 1);
}

.heat-modal-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 18px;
}

.heat-modal-subtitle {
  margin: 0;
  color: var(--c-accent-text);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: .08em;
}

.heat-modal-title {
  margin: 4px 0 0;
  color: var(--c-text);
  font: 600 22px var(--font-serif);
}

.heat-close {
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

.heat-close:hover {
  color: var(--c-brand);
  border-color: var(--c-brand);
}

.heat-close:focus-visible {
  outline: 2px solid var(--c-focus);
  outline-offset: 2px;
}

.heat-modal__weekdays,
.heat-modal__grid {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 10px;
}

.heat-modal__weekdays {
  margin-bottom: 10px;
  color: var(--c-text-60);
  font-size: 14px;
  text-align: center;
}

.heat-modal__cell {
  position: relative;
  aspect-ratio: 1;
  min-width: 0;
  border: 1px solid color-mix(in srgb, var(--c-brand) 14%, transparent);
  border-radius: 8px;
  background: color-mix(in srgb, var(--c-brand) calc(var(--level) * 22%), var(--c-bg-silver));
  display: grid;
  place-items: center;
}

.heat-modal__count {
  font-size: 14px;
  font-weight: 600;
  color: var(--c-text);
  font-variant-numeric: tabular-nums;
}

/* 无记录的日子隐藏数字，避免视觉噪点 */
.heat-modal__cell[style*="--level:0"] .heat-modal__count {
  opacity: 0;
}

.heat-modal__legend {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 7px;
  margin-top: 16px;
  color: var(--c-text-60);
  font-size: 12px;
}

.heat-modal__legend i {
  width: 14px;
  height: 14px;
  border: 1px solid color-mix(in srgb, var(--c-brand) 14%, transparent);
  border-radius: 4px;
  background: color-mix(in srgb, var(--c-brand) calc(var(--level) * 22%), var(--c-bg-silver));
}

.heat-modal__stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 10px;
  margin: 20px 0 0;
  padding: 0;
  list-style: none;
}

.heat-modal__stats li {
  display: grid;
  gap: 4px;
  padding: 12px 14px;
  border-radius: 12px;
  background: var(--c-brand-08);
}

.heat-stat__label {
  color: var(--c-text-60);
  font-size: 11px;
}

.heat-stat__value {
  color: var(--c-brand);
  font-size: 16px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}

@keyframes heat-fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes heat-pop-in {
  from { opacity: 0; transform: scale(0.92); }
  to { opacity: 1; transform: scale(1); }
}

@media (prefers-reduced-motion: reduce) {
  .heat-overlay,
  .heat-modal {
    animation: none;
  }
}
</style>
