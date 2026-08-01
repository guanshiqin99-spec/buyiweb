const { getTypeLabel } = require('./content-mapper')

function toCount(value) {
  const count = Number(value)
  return Number.isFinite(count) && count > 0 ? count : 0
}

// 小程序端 content-mapper 未导出 isKnownContentType，这里维护一份与建议引擎相关的类型集合
function isKnownContentType(type) {
  return ['dictionary', 'phrase', 'proverb', 'song', 'quiz'].includes(type)
}

// 类型 → 基础元信息：label 用于文案，link 用于兜底跳转
function getTypeMeta(type) {
  if (type === 'quiz') return { label: '答题', link: '/pages/quiz/index' }
  return {
    label: getTypeLabel(type),
    link: preciseLinkForType(type)
  }
}

// 已知内容类型 + 答题，作为弱项分析的候选集合
function collectTypeCounts(typeCounts = {}) {
  return Object.entries(typeCounts || {})
    .filter(([type]) => isKnownContentType(type) || type === 'quiz')
    .map(([type, count]) => ({ type, count: toCount(count) }))
}

// 一天中不同时段的建议倾向
function getTimeOfDayContext(now = new Date()) {
  const hour = now.getHours()
  if (hour >= 5 && hour < 11) return { slot: 'morning', hint: '清晨' }
  if (hour >= 11 && hour < 14) return { slot: 'noon', hint: '午间' }
  if (hour >= 14 && hour < 18) return { slot: 'afternoon', hint: '午后' }
  if (hour >= 18 && hour < 23) return { slot: 'evening', hint: '晚间' }
  return { slot: 'night', hint: '夜深' }
}

function isWeekend(now = new Date()) {
  const day = now.getDay()
  return day === 0 || day === 6
}

// 学习分布主导类型（占比 > 60% 视为失衡）
function getDominantType(typeEntries) {
  if (!typeEntries.length) return null
  const total = typeEntries.reduce((sum, item) => sum + item.count, 0)
  if (total === 0) return null
  const dominant = typeEntries.reduce((max, item) => (
    item.count > max.count ? item : max
  ), typeEntries[0])
  if (dominant.count / total < 0.6) return null
  return dominant
}

// 累计最少学习的类型作为弱项
function getWeakestType(typeEntries) {
  if (!typeEntries.length) return null
  return typeEntries.reduce((min, item) => (
    item.count < min.count ? item : min
  ), typeEntries[0])
}

// 最爱的类型（累计最多）
function getFavoriteType(typeEntries) {
  if (!typeEntries.length) return null
  return typeEntries.reduce((max, item) => (
    item.count > max.count ? item : max
  ), typeEntries[0])
}

// 类型 → 精确跳转路径
// 词典/短语/谚语支持 focus 自动聚焦；答题支持 start 自动开始
function preciseLinkForType(type, action = 'view') {
  if (type === 'quiz') return '/pages/quiz/index?start=1'
  if (type === 'song') return '/pages/song/index'
  if (type === 'dictionary') return '/pages/query/index?focus=1'
  if (type === 'phrase') return '/pages/phrases/index?focus=1'
  if (type === 'proverb') return '/pages/proverbs/index?focus=1'
  // 兜底：通用路由 + 聚焦
  const meta = getTypeMeta(type)
  return `${meta.link}?focus=1`
}

// 单条建议工厂：附带优先级与唯一 key，便于排序去重
function buildSuggestion({ text, link, icon, priority = 50, key }) {
  return { text, link, icon, priority, key: key || `${link}-${text}` }
}

// 学习阶段：基于累计学习量划分，影响推荐基调
function getLearningStage(totalCount) {
  if (totalCount === 0) return 'newcomer'
  if (totalCount < 10) return 'beginner'
  if (totalCount < 50) return 'intermediate'
  if (totalCount < 200) return 'advanced'
  return 'master'
}

function generateSuggestions(stats = {}) {
  const totalCount = toCount(stats.totalCount)
  const todayCount = toCount(stats.todayCount)
  const streakDays = toCount(stats.streakDays)
  const typeEntries = collectTypeCounts(stats.typeCounts)
  const todayTypeEntries = collectTypeCounts(stats.todayTypeCounts)
  const todayLearnedTypes = new Set(todayTypeEntries.filter((item) => item.count > 0).map((item) => item.type))
  const todayTotalByType = todayTypeEntries.reduce((sum, item) => sum + item.count, 0)

  // 今日任务完成度：查3词+听2歌+答题1轮 = 3 个达标单位
  const todayDictionary = toCount(stats.todayTypeCounts?.dictionary)
  const todaySong = toCount(stats.todayTypeCounts?.song)
  const todayQuiz = toCount(stats.todayTypeCounts?.quiz)
  const dailyGoalProgress = Math.min(todayDictionary / 3, 1) + Math.min(todaySong / 2, 1) + Math.min(todayQuiz / 1, 1)
  const dailyGoalCompleted = dailyGoalProgress >= 3

  const stage = getLearningStage(totalCount)
  const favorite = getFavoriteType(typeEntries)
  const now = new Date()
  const { slot, hint } = getTimeOfDayContext(now)
  const weekend = isWeekend(now)

  const suggestions = []

  // 1) 全新用户：仅给出一条最强引导，跳转后自动聚焦搜索框
  if (totalCount === 0) {
    return [buildSuggestion({
      text: '从一个布依语词开始你的第一次学习',
      link: '/pages/query/index?focus=1',
      icon: '🌱',
      priority: 100,
      key: 'first-word'
    })]
  }

  // 2) 今日任务全部完成：奖励性推荐，引导进阶或文化探索
  if (dailyGoalCompleted) {
    suggestions.push(buildSuggestion({
      text: '今日任务已全部完成，走进布依文化拓展视野',
      link: '/pages/culture/index',
      icon: '🏆',
      priority: 96,
      key: 'daily-complete'
    }))
  }

  // 3) 今日尚未学习：当日唤醒，最高优先级；周末倾向听歌
  if (todayCount === 0) {
    const link = weekend ? '/pages/song/index' : '/pages/query/index?focus=1'
    const verb = weekend ? '听一首民歌唤醒学习节奏' : '复习一个词开启今日学习'
    suggestions.push(buildSuggestion({
      text: `${hint}好，${verb}`,
      link,
      icon: '☀️',
      priority: 95,
      key: 'today-kickoff'
    }))
  }

  // 4) 连续打卡中断：streak=0 但有历史学习 — 提醒重启节奏
  if (streakDays === 0 && totalCount > 0) {
    suggestions.push(buildSuggestion({
      text: '打卡中断了一天，今天学一条恢复连续记录',
      link: '/pages/query/index?focus=1',
      icon: '🔁',
      priority: 90,
      key: 'streak-recover'
    }))
  }

  // 5) 学习强度感知：今日学习量超 5 条，鼓励挑战答题巩固记忆
  if (todayTotalByType >= 5 && !todayLearnedTypes.has('quiz')) {
    suggestions.push(buildSuggestion({
      text: `今天已学 ${todayTotalByType} 条，来一轮答题巩固记忆`,
      link: '/pages/quiz/index?start=1',
      icon: '💪',
      priority: 85,
      key: 'intensity-quiz'
    }))
  }

  // 6) 学习分布均衡性：主导类型 > 60% 时建议补足最弱维度
  const dominant = getDominantType(typeEntries)
  if (dominant) {
    const others = typeEntries.filter((item) => item.type !== dominant.type)
    const target = others.reduce((min, item) => (
      item.count < min.count ? item : min
    ), others[0])
    if (target) {
      const meta = getTypeMeta(target.type)
      suggestions.push(buildSuggestion({
        text: `${getTypeMeta(dominant.type).label}偏多，补一点${meta.label}更均衡`,
        link: preciseLinkForType(target.type),
        icon: '⚖️',
        priority: 82,
        key: `balance-${target.type}`
      }))
    }
  }

  // 7) 学习弱项：累计最少类型，且当日尚未练习时主动推荐
  const weakest = getWeakestType(typeEntries)
  if (weakest && !todayLearnedTypes.has(weakest.type)) {
    const meta = getTypeMeta(weakest.type)
    const verbMap = {
      dictionary: '查一个生词',
      phrase: '学一句短语',
      proverb: '读一条谚语',
      song: '听一首民歌',
      quiz: '做一轮答题'
    }
    const verb = verbMap[weakest.type] || `练习${meta.label}`
    suggestions.push(buildSuggestion({
      text: `${meta.label}练得最少，今天${verb}`,
      link: preciseLinkForType(weakest.type),
      icon: '🧭',
      priority: 78,
      key: `weakest-${weakest.type}`
    }))
  }

  // 8) 阶段化推荐：基于累计学习量给出对应难度的建议
  if (stage === 'beginner' && !todayLearnedTypes.has('phrase')) {
    // 初学者：引导拓展到短语
    suggestions.push(buildSuggestion({
      text: '词汇初有积累，试试短句更地道',
      link: '/pages/phrases/index?focus=1',
      icon: '📝',
      priority: 76,
      key: 'stage-phrase'
    }))
  } else if (stage === 'intermediate' && !todayLearnedTypes.has('proverb')) {
    // 进阶者：引导学习谚语
    suggestions.push(buildSuggestion({
      text: '进阶阶段，布依谚语承载民族智慧',
      link: '/pages/proverbs/index?focus=1',
      icon: '📜',
      priority: 76,
      key: 'stage-proverb'
    }))
  } else if (stage === 'advanced' || stage === 'master') {
    // 高级/达人：引导文化深度探索
    suggestions.push(buildSuggestion({
      text: stage === 'master' ? '布依达人，深挖文化根源' : '学习深厚，探索布依文化脉络',
      link: '/pages/culture/index',
      icon: '🏛️',
      priority: 74,
      key: 'stage-culture'
    }))
  }

  // 9) 兴趣延伸：基于最爱的类型推荐相邻类型
  if (favorite && favorite.count >= 5) {
    const adjacency = {
      dictionary: { type: 'phrase', text: '从词汇进阶到短语' },
      phrase: { type: 'proverb', text: '从短语上升到谚语' },
      proverb: { type: 'song', text: '从谚语聆听布依歌声' },
      song: { type: 'dictionary', text: '从民歌回到词汇积累' },
      quiz: { type: 'dictionary', text: '从答题回到词汇巩固' }
    }
    const next = adjacency[favorite.type]
    if (next && !todayLearnedTypes.has(next.type)) {
      suggestions.push(buildSuggestion({
        text: next.text,
        link: preciseLinkForType(next.type),
        icon: '🔗',
        priority: 70,
        key: `interest-${next.type}`
      }))
    }
  }

  // 10) 时段化推荐：晚间/夜间倾向听力，午间适合短答题
  if (!todayLearnedTypes.has('song') && (slot === 'evening' || slot === 'night')) {
    suggestions.push(buildSuggestion({
      text: `${hint}适合聆听，听一首布依民歌放松一下`,
      link: '/pages/song/index',
      icon: '🌙',
      priority: 68,
      key: 'time-song'
    }))
  } else if (!todayLearnedTypes.has('quiz') && slot === 'noon') {
    suggestions.push(buildSuggestion({
      text: `${hint}碎片时间，来一轮快速答题`,
      link: '/pages/quiz/index?start=1',
      icon: '⚡',
      priority: 66,
      key: 'time-quiz'
    }))
  }

  // 11) 周末文化探索
  if (weekend) {
    suggestions.push(buildSuggestion({
      text: '周末走进布依文化，了解蜡染与节庆故事',
      link: '/pages/culture/index',
      icon: '🎨',
      priority: 60,
      key: 'weekend-culture'
    }))
  }

  // 12) 连续坚持奖励：streak>=7 解锁 AI 挑战
  if (streakDays >= 7 && !todayLearnedTypes.has('quiz')) {
    suggestions.push(buildSuggestion({
      text: `已坚持 ${streakDays} 天，试试 AI 出题挑战自己`,
      link: '/pages/quiz/index?start=1',
      icon: '✨',
      priority: 64,
      key: 'streak-quiz'
    }))
  }

  // 13) 学习达人成就引导
  if (stage === 'master') {
    suggestions.push(buildSuggestion({
      text: '学习达人，导出你的专属学习报告',
      link: '/pages/mine/index',
      icon: '🧵',
      priority: 52,
      key: 'export-report'
    }))
  }

  // 按优先级降序排序，去重后最多保留 3 条
  const seen = new Set()
  return suggestions
    .sort((left, right) => right.priority - left.priority)
    .filter((item) => {
      if (seen.has(item.key)) return false
      seen.add(item.key)
      return true
    })
    .slice(0, 3)
}

module.exports = {
  generateSuggestions
}
