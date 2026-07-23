import { getContentLabel, getContentRoute, isKnownContentType } from './contentTypes.js'

function toCount(value) {
  const count = Number(value)
  return Number.isFinite(count) && count > 0 ? count : 0
}

function getLeastPractisedType(typeCounts) {
  return Object.entries(typeCounts || {})
    .filter(([type]) => isKnownContentType(type) || type === 'quiz')
    .map(([type, count]) => ({ type, count: toCount(count) }))
    .sort((left, right) => left.count - right.count)[0]
}

function getTypeMeta(type) {
  if (type === 'quiz') return { label: '答题', link: '/quiz' }
  return {
    label: getContentLabel(type),
    link: getContentRoute(type)
  }
}

export function generateSuggestions(stats = {}) {
  const totalCount = toCount(stats.totalCount)
  const streakDays = toCount(stats.streakDays)
  const suggestions = []

  if (streakDays === 0) {
    suggestions.push({
      text: '今天还没学习，从一个词开始吧',
      link: '/dictionary',
      icon: '📖'
    })
  }

  if (totalCount < 10) {
    suggestions.push({
      text: '刚开始探索，先收藏 5 个词',
      link: '/dictionary',
      icon: '🌱'
    })
  }

  const leastPractised = getLeastPractisedType(stats.typeCounts)
  if (leastPractised) {
    const typeMeta = getTypeMeta(leastPractised.type)
    suggestions.push({
      text: `建议多练习${typeMeta.label}类内容`,
      link: typeMeta.link,
      icon: '🧭'
    })
  }

  if (streakDays >= 7) {
    suggestions.push({
      text: `已坚持 ${streakDays} 天，试试 AI 挑战`,
      link: '/quiz',
      icon: '✨'
    })
  }

  if (totalCount >= 50) {
    suggestions.push({
      text: '学习达人！导出你的学习报告',
      link: '/profile',
      icon: '🧵'
    })
  }

  return suggestions
}
