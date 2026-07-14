export const USER_PROGRESS_UPDATED_EVENT = 'buyi:user-progress-updated'
export const USER_PROGRESS_STORAGE_KEY = 'buyi:user-progress-updated-at'

function toCount(value) {
  const count = Number(value)
  return Number.isFinite(count) && count >= 0 ? count : 0
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
export function notifyUserProgressUpdated(source) {
  if (typeof window === 'undefined') return

  window.dispatchEvent(new CustomEvent(USER_PROGRESS_UPDATED_EVENT, {
    detail: { source, updatedAt: Date.now() }
  }))

  try {
    window.localStorage?.setItem(USER_PROGRESS_STORAGE_KEY, `${Date.now()}:${Math.random()}`)
  } catch {
    // 隐私模式下 localStorage 可能不可写；同标签页事件仍然有效。
  }
}
