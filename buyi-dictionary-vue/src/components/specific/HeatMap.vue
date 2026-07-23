<script setup>
import { computed } from 'vue'

const props = defineProps({
  records: {
    type: Array,
    default: () => []
  }
})

const weekdayNames = ['一', '二', '三', '四', '五', '六', '日']

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
</script>

<template>
  <section class="heat-map" aria-labelledby="heat-map-title">
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
  </section>
</template>

<style scoped>
.heat-map {
  min-width: 0;
  padding: 22px;
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
</style>
