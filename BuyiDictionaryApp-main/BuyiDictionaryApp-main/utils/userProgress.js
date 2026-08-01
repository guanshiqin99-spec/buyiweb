// 用户学习进度相关工具：今日类型计数、统计/徽章字段归一化、进度更新事件通知

// 每日类型计数的本地存储 key，以本地日期为分桶，跨天自动重置
const DAILY_TYPE_COUNTS_STORAGE_KEY = 'buyi:daily-type-counts';

// 用户进度更新事件名，配合 eventBus 在页面间同步
const USER_PROGRESS_UPDATED_EVENT = 'user-progress:updated';

function toCount(value) {
  const count = Number(value);
  return Number.isFinite(count) && count >= 0 ? count : 0;
}

// 获取本地时区下的日期 key，格式 YYYY-MM-DD
function getLocalDateKey(now = new Date()) {
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// 导出今日日期 key，供外部做跨天检测
function getTodayDateKey() {
  return getLocalDateKey();
}

// 读取本地今日类型计数；存储日期与今天不一致时视为跨天重置，返回空计数
function getTodayTypeCounts() {
  const todayKey = getLocalDateKey();
  try {
    const raw = wx.getStorageSync(DAILY_TYPE_COUNTS_STORAGE_KEY);
    if (!raw) return null;                              // 无存储返回 null（今日数据不存在，可回退）
    const parsed = JSON.parse(raw);
    if (parsed && parsed.date !== todayKey) return {};  // 跨天返回 {}（今日有效但为 0，不回退）
    return parsed && parsed.counts && typeof parsed.counts === 'object' ? parsed.counts : {};
  } catch (error) {
    return null;                                        // 异常返回 null
  }
}

// 递增某个内容类型的今日计数；contentType 缺省时仅刷新日期占位
function recordTodayActivity(contentType) {
  const todayKey = getLocalDateKey();
  // getTodayTypeCounts 可能返回 null（无存储/异常），这里兜底为 {} 避免字段写入报错
  const counts = getTodayTypeCounts() || {};
  if (contentType && typeof contentType === 'string') {
    counts[contentType] = toCount(counts[contentType]) + 1;
  }
  try {
    wx.setStorageSync(DAILY_TYPE_COUNTS_STORAGE_KEY, JSON.stringify({
      date: todayKey,
      counts,
    }));
  } catch (error) {
    // 存储异常时静默忽略，不影响主流程
  }
}

// 兼容后端历史字段（today / total / streak）与语义字段（todayCount / totalCount / streakDays）
function normalizeLearningStats(stats = {}) {
  const todayCount = toCount(stats.todayCount != null ? stats.todayCount : stats.today);
  const totalCount = toCount(stats.totalCount != null ? stats.totalCount : stats.total);
  const streakDays = toCount(stats.streakDays != null ? stats.streakDays : stats.streak);

  return {
    ...stats,
    todayCount,
    totalCount,
    streakDays,
    today: todayCount,
    total: totalCount,
    streak: streakDays,
    typeCounts: stats.typeCounts && typeof stats.typeCounts === 'object' ? stats.typeCounts : {},
  };
}

// 统一徽章字段：isUnlocked 优先，其次 unlocked，再次 locked === false，最后看 unlockedAt
function normalizeBadge(badge = {}) {
  let isUnlocked;
  if (badge.isUnlocked != null) {
    isUnlocked = badge.isUnlocked;
  } else if (badge.unlocked != null) {
    isUnlocked = badge.unlocked;
  } else if (typeof badge.locked === 'boolean') {
    isUnlocked = !badge.locked;
  } else {
    isUnlocked = Boolean(badge.unlockedAt);
  }

  return {
    ...badge,
    id: badge.id != null ? badge.id : (badge.code != null ? badge.code : badge.name),
    isUnlocked: Boolean(isUnlocked),
    unlocked: Boolean(isUnlocked),
    locked: !isUnlocked,
  };
}

// 处理徽章接口的三种返回形态（数组 / {items} / {list}），映射为统一结构
function normalizeBadgesResponse(response) {
  const source = Array.isArray(response) ? response : ((response && response.items) || (response && response.list) || []);
  const items = source.map(normalizeBadge);
  if (Array.isArray(response)) {
    return items;
  }

  return {
    ...(response || {}),
    items,
    total: (response && response.total != null) ? response.total : items.length,
    unlockedCount: items.filter((badge) => badge.isUnlocked).length,
  };
}

// 写操作成功后通知进度更新；可选传入 contentType，用于今日类型计数（按本地日期自动重置）
function notifyUserProgressUpdated(source, contentType) {
  if (contentType) {
    recordTodayActivity(contentType);
  }

  try {
    getApp().eventBus.emit(USER_PROGRESS_UPDATED_EVENT, {
      source,
      contentType,
      updatedAt: Date.now(),
    });
  } catch (error) {
    // getApp() 在部分生命周期可能不可用，此时静默跳过事件通知
  }
}

module.exports = {
  DAILY_TYPE_COUNTS_STORAGE_KEY,
  USER_PROGRESS_UPDATED_EVENT,
  getLocalDateKey,
  getTodayDateKey,
  getTodayTypeCounts,
  recordTodayActivity,
  normalizeLearningStats,
  normalizeBadge,
  normalizeBadgesResponse,
  notifyUserProgressUpdated,
};
