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

export function getDailyTasks(stats = {}) {
  const typeCounts = stats?.typeCounts && typeof stats.typeCounts === 'object'
    ? stats.typeCounts
    : {}

  return [
    createTask('查 3 个词', 3, typeCounts.dictionary, '/dictionary'),
    createTask('听 2 首歌', 2, typeCounts.song, '/songs'),
    createTask('完成 1 轮答题', 1, typeCounts.quiz, '/quiz')
  ]
}
