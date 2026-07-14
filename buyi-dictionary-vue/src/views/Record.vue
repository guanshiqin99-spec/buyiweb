<script setup>
import { ref, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import ToolPageShell from '@/components/common/ToolPageShell.vue'
import imgBg from '@/assets/images/generated/record-learning-tracker.png'
import { recordsApi } from '@/utils/api'
import { useAuthStore } from '@/stores/auth'
import { getContentLabel } from '@/utils/contentTypes'

const authStore = useAuthStore()
const createEmptyStats = () => ({ todayCount: 0, totalCount: 0, streakDays: 0, typeCounts: {} })
const stats = ref(createEmptyStats())
const records = ref([])
const isLoading = ref(true)
const isClearing = ref(false)
const toast = ref(null)
let toastTimer

onMounted(async () => {
  if (!authStore.isLoggedIn) {
    isLoading.value = false
    return
  }

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

// 统一展示轻量反馈，避免清空操作后用户没有状态感知。
function showToast(message, type = 'success') {
  toast.value = { message, type }
  window.clearTimeout(toastTimer)
  toastTimer = window.setTimeout(() => {
    toast.value = null
  }, 3200)
}

async function clearRecords() {
  if (!authStore.isLoggedIn) {
    showToast('请先登录后再管理学习记录', 'error')
    return
  }

  if (!window.confirm('确定要清空全部学习记录吗？此操作不可恢复。')) return

  isClearing.value = true
  try {
    await recordsApi.clear()
    // 接口成功后同步本地数据，立即保留统计骨架并切换为空状态。
    records.value = []
    stats.value = createEmptyStats()
    showToast('学习记录已全部清空')
  } catch (error) {
    console.error('清空学习记录失败', error)
    showToast('清空失败，请稍后重试', 'error')
  } finally {
    isClearing.value = false
  }
}

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
  <ToolPageShell title="学习记录" subtitle="你的布依语学习足迹" :bg-image="imgBg" :show-overlay="false" image-tone="light">
    <div class="record-content">
      <!-- 统计概览 -->
      <section class="stats-grid">
        <div class="stat-card liquid-glass liquid-glass-content">
          <p class="stat-num">{{ stats.todayCount || 0 }}</p>
          <p class="stat-label">今日已学</p>
        </div>
        <div class="stat-card liquid-glass liquid-glass-content">
          <p class="stat-num">{{ stats.streakDays || 0 }}</p>
          <p class="stat-label">连续天数</p>
        </div>
        <div class="stat-card liquid-glass liquid-glass-content">
          <p class="stat-num">{{ stats.totalCount || 0 }}</p>
          <p class="stat-label">累计学习</p>
        </div>
      </section>

      <!-- 危险操作置于统计卡片下方，避免干扰学习数据浏览。 -->
      <div class="record-actions">
        <button
          class="clear-records-btn"
          type="button"
          :disabled="isClearing"
          @click="clearRecords"
        >
          {{ isClearing ? '正在清空…' : '清空全部记录' }}
        </button>
      </div>

      <!-- 类型分布 -->
      <section v-if="stats.typeCounts && Object.keys(stats.typeCounts).length" class="type-breakdown liquid-glass-quiet">
        <h2 class="section-title">类型分布</h2>
        <div class="type-list">
          <div v-for="(count, type) in stats.typeCounts" :key="type" class="type-row">
            <span class="type-name">{{ getContentLabel(type) }}</span>
            <span class="type-count">{{ count }}</span>
          </div>
        </div>
      </section>

      <!-- 记录列表 -->
      <section v-if="isLoading" class="record-loading" aria-live="polite">
        <p>加载中…</p>
      </section>

      <section v-else-if="records.length === 0" class="record-empty liquid-glass-quiet">
        <p class="empty-text">还没有学习记录</p>
        <p class="empty-hint">去词典或学习页开始你的布依语之旅</p>
        <RouterLink class="cta-pill-outline" to="/learn">开始学习</RouterLink>
      </section>

      <section v-else class="record-list">
        <h2 class="section-title">最近记录</h2>
        <article
          v-for="record in records"
          :key="record.id"
          class="record-item liquid-glass-quiet"
        >
          <span class="record-type-tag">{{ getContentLabel(record.contentType) }}</span>
          <div class="record-info">
            <p class="record-title">{{ record.title || record.buyiText || `#${record.contentId}` }}</p>
            <p class="record-time">{{ formatDate(record.createdAt || record.learnedAt) }}</p>
          </div>
        </article>
      </section>

      <Transition name="toast">
        <p
          v-if="toast"
          class="record-toast"
          :class="`record-toast--${toast.type}`"
          :role="toast.type === 'error' ? 'alert' : 'status'"
          aria-live="polite"
        >
          {{ toast.message }}
        </p>
      </Transition>
    </div>
  </ToolPageShell>
</template>

<style scoped>
.record-content {
  max-width: 720px;
  margin: 0 auto;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.record-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: -8px;
}

.clear-records-btn {
  min-height: 38px;
  padding: 8px 16px;
  border: 1px solid var(--c-danger);
  border-radius: 999px;
  background: transparent;
  color: var(--c-danger);
  font: 600 13px var(--font-sans);
  cursor: pointer;
  transition: background 150ms ease, color 150ms ease, border-color 150ms ease;
}

.clear-records-btn:hover:not(:disabled) {
  background: var(--c-danger-08);
}

.clear-records-btn:focus-visible {
  outline: 2px solid var(--c-focus);
  outline-offset: 2px;
}

.clear-records-btn:disabled {
  cursor: wait;
  opacity: 0.65;
}

.stat-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px 12px;
}

.stat-num {
  font: 700 var(--stat-size-sm) var(--font-stat);
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
  transition: background 150ms ease, border-color 150ms ease, transform 200ms ease;
}

.cta-pill-outline:hover {
  background: var(--c-brand-08);
  border-color: var(--c-brand-40);
  transform: translateY(-2px);
}

.cta-pill-outline:focus-visible {
  outline: 2px solid var(--c-focus);
  outline-offset: 2px;
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
  color: var(--c-brand-foreground);
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

.record-toast {
  position: fixed;
  top: 76px;
  left: 50%;
  z-index: 50;
  max-width: min(360px, calc(100vw - 32px));
  margin: 0;
  padding: 10px 16px;
  border: 1px solid var(--c-brand-25);
  border-radius: 999px;
  background: var(--c-glass-nav);
  box-shadow: 0 8px 24px rgba(24, 31, 38, 0.16);
  color: var(--c-text);
  font-size: 14px;
  line-height: 1.4;
  text-align: center;
  transform: translateX(-50%);
}

.record-toast--error {
  border-color: var(--c-danger);
  color: var(--c-danger);
}

.toast-enter-active,
.toast-leave-active {
  transition: opacity 150ms ease, transform 150ms ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translate(-50%, -8px);
}

@media (max-width: 640px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }

  .record-actions {
    justify-content: stretch;
  }

  .clear-records-btn {
    width: 100%;
  }
}

@media (prefers-reduced-motion: reduce) {
  .clear-records-btn,
  .toast-enter-active,
  .toast-leave-active {
    transition: none;
  }
}
</style>
