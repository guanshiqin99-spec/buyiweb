function toCount(value) {
  const count = Number(value)
  return Number.isFinite(count) && count > 0 ? Math.floor(count) : 0
}

function createTask(title, target, current, link) {
  const normalizedCurrent = toCount(current)
  return {
    title,
    target,
    current: normalizedCurrent,
    completed: normalizedCurrent >= target,
    link
  }
}

// 学习任务每日重置：优先使用本地维护的"今日类型计数"
// 当今日数据不可用（如老客户端）时回退到累计 typeCounts
function getDailyTasks(stats = {}) {
  // todayTypeCounts 为 null/undefined 时视为无今日数据（老客户端兼容，可回退）
  // 为 {}（空对象）时视为跨天有效空计数，不回退
  const todayTypeCounts = stats && stats.todayTypeCounts != null && typeof stats.todayTypeCounts === 'object'
    ? stats.todayTypeCounts
    : null
  const fallbackTypeCounts = stats && stats.typeCounts && typeof stats.typeCounts === 'object'
    ? stats.typeCounts
    : {}

  // 有今日数据（todayTypeCounts 非 null）时用今日计数，缺失字段当 0；无今日数据时回退到累计计数
  const dictionaryCount = todayTypeCounts
    ? (todayTypeCounts.dictionary ?? 0)
    : (fallbackTypeCounts.dictionary ?? 0)
  const songCount = todayTypeCounts
    ? (todayTypeCounts.song ?? 0)
    : (fallbackTypeCounts.song ?? 0)
  const quizCount = todayTypeCounts
    ? (todayTypeCounts.quiz ?? 0)
    : (fallbackTypeCounts.quiz ?? 0)

  return [
    // 跳转带上精确参数：词典自动聚焦搜索框、答题自动开始一轮
    createTask('查 3 个词', 3, dictionaryCount, '/pages/query/index?focus=1'),
    createTask('听 2 首歌', 2, songCount, '/pages/song/index'),
    createTask('完成 1 轮答题', 1, quizCount, '/pages/quiz/index?start=1')
  ]
}

module.exports = {
  getDailyTasks
}
