<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import PageShell from '@/components/common/PageShell.vue'
import { recordsApi } from '@/utils/api'
import imgBg from '@/assets/images/bg-phrases.jpg'

const router = useRouter()
const stats = ref({ todayCount: 0, totalCount: 0, streakDays: 0, typeCounts: {} })
const records = ref([])
const isLoading = ref(true)

const typeLabels = {
  dictionary: '词汇',
  phrase: '短语',
  proverb: '谚语',
  song: '民歌'
}

onMounted(async () => {
  try {
    const [statsRes, recordsRes] = await Promise.all([
      recordsApi.stats().catch(() => null),
      recordsApi.list({ page: 1, pageSize: 50 }).catch(() => ({ items: [] }))
    ])
    if (statsRes) stats.value = statsRes
    records.value = recordsRes?.items || recordsRes || []
  } catch (e) {
    console.error('加载学习记录失败', e)
  } finally {
    isLoading.value = false
  }
})

function formatDate(dateStr) {
  if (!dateStr) return ''
  try {
    return new Intl.DateTimeFormat('zh-CN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(dateStr))
  } catch {
    return dateStr
  }
}
</script>

<template>
  <PageShell
    :bg-image="imgBg"
    title="学习记录"
    subtitle="你的布依语学习足迹"
    overlay-style="cool"
    pattern-type="drum"
    :particle-density="8"
  >
    <div class="record-content">
      <!-- 统计概览 -->
      <section class="stats-grid">
        <div class="stat-card liquid-glass glow-card">
          <div class="glow-effect"></div>
          <p class="stat-num">{{ stats.todayCount || 0 }}</p>
          <p class="stat-label">今日已学</p>
        </div>
        <div class="stat-card liquid-glass glow-card">
          <div class="glow-effect"></div>
          <p class="stat-num">{{ stats.streakDays || 0 }}</p>
          <p class="stat-label">连续天数</p>
        </div>
        <div class="stat-card liquid-glass glow-card">
          <div class="glow-effect"></div>
          <p class="stat-num">{{ stats.totalCount || 0 }}</p>
          <p class="stat-label">累计学习</p>
        </div>
      </section>

      <!-- 类型分布 -->
      <section v-if="stats.typeCounts && Object.keys(stats.typeCounts).length" class="type-breakdown liquid-glass">
        <h2 class="section-title">类型分布</h2>
        <div class="type-list">
          <div v-for="(count, type) in stats.typeCounts" :key="type" class="type-row">
            <span class="type-name">{{ typeLabels[type] || type }}</span>
            <span class="type-count">{{ count }}</span>
          </div>
        </div>
      </section>

      <!-- 记录列表 -->
      <section v-if="isLoading" class="record-loading" aria-live="polite">
        <p>加载中…</p>
      </section>

      <section v-else-if="records.length === 0" class="record-empty liquid-glass">
        <p class="empty-text">还没有学习记录</p>
        <p class="empty-hint">去词典或学习页开始你的布依语之旅</p>
        <button class="cta-pill-outline" type="button" @click="router.push('/learn')">开始学习</button>
      </section>

      <section v-else class="record-list">
        <h2 class="section-title">最近记录</h2>
        <article
          v-for="record in records"
          :key="record.id"
          class="record-item liquid-glass"
        >
          <span class="record-type-tag">{{ typeLabels[record.contentType] || '内容' }}</span>
          <div class="record-info">
            <p class="record-title">{{ record.title || record.buyiText || `#${record.contentId}` }}</p>
            <p class="record-time">{{ formatDate(record.createdAt || record.learnedAt) }}</p>
          </div>
        </article>
      </section>
    </div>
  </PageShell>
</template>

<style scoped>
.record-content {
  max-width: 720px;
  margin: 0 auto;
  padding: 0 24px 80px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.stat-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px 12px;
}

.stat-num {
  font-family: var(--font-serif);
  font-size: 32px;
  font-weight: 700;
  color: var(--c-brand);
  margin: 0;
  font-variant-numeric: tabular-nums;
}

.stat-label {
  font-size: 12px;
  color: var(--c-text-60);
  margin: 4px 0 0 0;
}

.type-breakdown {
  padding: 24px 20px;
}

.section-title {
  font-family: var(--font-serif);
  font-size: 18px;
  font-weight: 600;
  color: var(--c-text);
  margin: 0 0 16px 0;
}

.type-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.type-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid var(--c-divider);
}

.type-row:last-child {
  border-bottom: none;
}

.type-name {
  font-size: 14px;
  color: var(--c-text-70);
}

.type-count {
  font-size: 16px;
  font-weight: 600;
  color: var(--c-brand);
  font-variant-numeric: tabular-nums;
}

.record-loading {
  text-align: center;
  padding: 48px 24px;
  color: var(--c-text-50);
}

.record-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 48px 24px;
  text-align: center;
  gap: 8px;
}

.empty-text {
  font-size: 18px;
  font-weight: 600;
  color: var(--c-text);
  margin: 0;
}

.empty-hint {
  font-size: 13px;
  color: var(--c-text-60);
  margin: 0 0 16px 0;
}

.cta-pill-outline {
  padding: 10px 24px;
  border: 1px solid var(--c-brand-25);
  border-radius: 999px;
  background: transparent;
  color: var(--c-brand);
  font: 500 14px var(--font-sans);
  cursor: pointer;
  transition: background 150ms ease, border-color 150ms ease;
}

.cta-pill-outline:hover {
  background: var(--c-brand-08);
  border-color: var(--c-brand-40);
}

.record-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.record-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 20px;
}

.record-type-tag {
  flex-shrink: 0;
  font-size: 11px;
  font-weight: 600;
  color: var(--c-white);
  background: var(--c-brand);
  padding: 3px 10px;
  border-radius: 999px;
  letter-spacing: 0.02em;
}

.record-info {
  min-width: 0;
  flex: 1;
}

.record-title {
  font-size: 15px;
  font-weight: 500;
  color: var(--c-text);
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.record-time {
  font-size: 12px;
  color: var(--c-text-50);
  margin: 2px 0 0 0;
  font-family: var(--font-mono);
}

@media (max-width: 640px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>
