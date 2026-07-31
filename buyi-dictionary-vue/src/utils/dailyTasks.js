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
// 当今日数据不可用（如服务端 SSR 或老客户端）时回退到累计 typeCounts
export function getDailyTasks(stats = {}) {
  const todayTypeCounts = stats?.todayTypeCounts && typeof stats.todayTypeCounts === 'object'
    ? stats.todayTypeCounts
    : null
  const fallbackTypeCounts = stats?.typeCounts && typeof stats.typeCounts === 'object'
    ? stats.typeCounts
    : {}

  // 取今日计数；若无今日数据则回退到累计计数（保证旧逻辑不退化）
  const dictionaryCount = todayTypeCounts?.dictionary ?? fallbackTypeCounts.dictionary ?? 0
  const songCount = todayTypeCounts?.song ?? fallbackTypeCounts.song ?? 0
  const quizCount = todayTypeCounts?.quiz ?? fallbackTypeCounts.quiz ?? 0

  return [
    // 跳转带上精确参数：词典自动聚焦搜索框、答题自动开始一轮
    createTask('查 3 个词', 3, dictionaryCount, '/dictionary?type=word&focus=1'),
    createTask('听 2 首歌', 2, songCount, '/songs'),
    createTask('完成 1 轮答题', 1, quizCount, '/quiz?start=1')
  ]
}
