export const USER_PROGRESS_UPDATED_EVENT = 'buyi:user-progress-updated'
export const USER_PROGRESS_STORAGE_KEY = 'buyi:user-progress-updated-at'

// 每日学习计数：以本地日期为 key，跨天自动重置，用于"学习任务"当日进度
export const DAILY_TYPE_COUNTS_STORAGE_KEY = 'buyi:daily-type-counts'

function toCount(value) {
  const count = Number(value)
  return Number.isFinite(count) && count >= 0 ? count : 0
}

function getLocalDateKey(now = new Date()) {
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// 导出今日日期 key，供外部做跨天检测
export function getTodayDateKey() {
  return getLocalDateKey()
}

// 读取本地今日类型计数；若存储中的日期与今天不一致，则视为跨天重置返回空计数
export function getTodayTypeCounts() {
  if (typeof window === 'undefined' || !window.localStorage) return {}
  const todayKey = getLocalDateKey()
  try {
    const raw = window.localStorage.getItem(DAILY_TYPE_COUNTS_STORAGE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw)
    if (parsed?.date !== todayKey) return {}
    return parsed?.counts && typeof parsed.counts === 'object' ? parsed.counts : {}
  } catch {
    return {}
  }
}

// 递增某个内容类型的今日计数；contentType 缺省时仅刷新日期占位
export function recordTodayActivity(contentType) {
  if (typeof window === 'undefined' || !window.localStorage) return
  const todayKey = getLocalDateKey()
  const counts = getTodayTypeCounts()
  if (contentType && typeof contentType === 'string') {
    counts[contentType] = toCount(counts[contentType]) + 1
  }
  try {
    window.localStorage.setItem(DAILY_TYPE_COUNTS_STORAGE_KEY, JSON.stringify({
      date: todayKey,
      counts
    }))
  } catch {
    // 隐私模式或配额耗尽时静默忽略，不影响主流程
  }
}

// 兼容后端历史字段（today / total / streak）与 Web 端语义字段。
export function normalizeLearningStats(stats = {}) {
  const todayCount = toCount(stats.todayCount ?? stats.today)
  const totalCount = toCount(stats.totalCount ?? stats.total)
  const streakDays = toCount(stats.streakDays ?? stats.streak)

  return {
    ...stats,
    todayCount,
    totalCount,
    streakDays,
    today: todayCount,
    total: totalCount,
    streak: streakDays,
    typeCounts: stats.typeCounts && typeof stats.typeCounts === 'object' ? stats.typeCounts : {}
  }
}

export function normalizeBadge(badge = {}) {
  const isUnlocked = badge.isUnlocked ?? badge.unlocked ?? (
    typeof badge.locked === 'boolean' ? !badge.locked : Boolean(badge.unlockedAt)
  )

  return {
    ...badge,
    id: badge.id ?? badge.code ?? badge.name,
    isUnlocked: Boolean(isUnlocked),
    unlocked: Boolean(isUnlocked),
    locked: !isUnlocked
  }
}

export function normalizeBadgesResponse(response) {
  const source = Array.isArray(response) ? response : (response?.items || response?.list || [])
  const items = source.map(normalizeBadge)
  if (Array.isArray(response)) return items

  return {
    ...(response || {}),
    items,
    total: response?.total ?? items.length,
    unlockedCount: items.filter((badge) => badge.isUnlocked).length
  }
}

// 写操作成功后通知当前标签页，并通过 storage 事件同步其他标签页。
// 可选传入 contentType，用于"学习任务"每日计数（按本地日期自动重置）。
export function notifyUserProgressUpdated(source, contentType) {
  if (typeof window === 'undefined') return

  if (contentType) recordTodayActivity(contentType)

  window.dispatchEvent(new CustomEvent(USER_PROGRESS_UPDATED_EVENT, {
    detail: { source, contentType, updatedAt: Date.now() }
  }))

  try {
    window.localStorage?.setItem(USER_PROGRESS_STORAGE_KEY, `${Date.now()}:${Math.random()}`)
  } catch {
    // 隐私模式下 localStorage 可能不可写；同标签页事件仍然有效。
  }
}
