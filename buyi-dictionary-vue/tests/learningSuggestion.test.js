import test from 'node:test'
import assert from 'node:assert/strict'
import { generateSuggestions } from '../src/utils/learningSuggestion.js'

test('全新用户只给一条最强引导', () => {
  const suggestions = generateSuggestions({ totalCount: 0 })
  assert.equal(suggestions.length, 1)
  assert.equal(suggestions[0].key, 'first-word')
  assert.equal(suggestions[0].link, '/dictionary?type=word&focus=1')
})

test('今日任务全部完成时输出奖励性推荐', () => {
  const suggestions = generateSuggestions({
    totalCount: 50,
    todayCount: 6,
    streakDays: 3,
    todayTypeCounts: { dictionary: 3, song: 2, quiz: 1 }
  })
  assert.ok(suggestions.some((s) => s.key === 'daily-complete'))
  assert.ok(suggestions.some((s) => s.link === '/culture'))
})

test('今日尚未学习时输出唤醒建议', () => {
  const suggestions = generateSuggestions({
    totalCount: 10,
    todayCount: 0,
    streakDays: 1,
    typeCounts: { dictionary: 10 }
  })
  assert.ok(suggestions.some((s) => s.key === 'today-kickoff'))
})

test('打卡中断（streak=0 但有历史）输出恢复建议', () => {
  const suggestions = generateSuggestions({
    totalCount: 10,
    todayCount: 2,
    streakDays: 0,
    todayTypeCounts: { dictionary: 1 }
  })
  assert.ok(suggestions.some((s) => s.key === 'streak-recover'))
})

test('学习分布失衡时建议补足最弱维度', () => {
  const suggestions = generateSuggestions({
    totalCount: 50,
    todayCount: 5,
    streakDays: 3,
    typeCounts: { dictionary: 40, phrase: 3, song: 5, quiz: 2 },
    todayTypeCounts: { dictionary: 3 }
  })
  // dictionary 占 40/50=80% 为主导，其余中最弱为 quiz(2)
  assert.ok(suggestions.some((s) => s.key === 'balance-quiz'))
})

test('弱项未在今日练习时给出弱项推荐', () => {
  const suggestions = generateSuggestions({
    totalCount: 30,
    todayCount: 4,
    streakDays: 2,
    typeCounts: { dictionary: 20, song: 9, quiz: 1 },
    todayTypeCounts: { dictionary: 3 }
  })
  assert.ok(suggestions.some((s) => s.key === 'weakest-quiz'))
})

test('初学者阶段推荐短语', () => {
  const suggestions = generateSuggestions({
    totalCount: 5,
    todayCount: 2,
    streakDays: 1,
    typeCounts: { dictionary: 5 },
    todayTypeCounts: { dictionary: 1 }
  })
  assert.ok(suggestions.some((s) => s.key === 'stage-phrase'))
})

test('高级阶段推荐文化探索', () => {
  const suggestions = generateSuggestions({
    totalCount: 100,
    todayCount: 3,
    streakDays: 5,
    typeCounts: { dictionary: 100 },
    todayTypeCounts: { dictionary: 2 }
  })
  assert.ok(suggestions.some((s) => s.key === 'stage-culture'))
})

test('连续坚持 7 天以上解锁 AI 挑战推荐', () => {
  const suggestions = generateSuggestions({
    totalCount: 60,
    todayCount: 5,
    streakDays: 9,
    typeCounts: { dictionary: 60 },
    // 今日已学过短语，避免 interest-phrase 挤占名额；今日不做 quiz 以触发 streak-quiz
    todayTypeCounts: { dictionary: 3, phrase: 1 }
  })
  assert.ok(suggestions.some((s) => s.key === 'streak-quiz'))
})

test('结果按优先级降序、key 唯一且最多 3 条', () => {
  const suggestions = generateSuggestions({
    totalCount: 50,
    todayCount: 6,
    streakDays: 8,
    typeCounts: { dictionary: 30, song: 8, phrase: 5, quiz: 3 },
    todayTypeCounts: { dictionary: 3, song: 2, quiz: 1 }
  })
  assert.ok(suggestions.length <= 3)
  assert.ok(suggestions.length > 0)
  for (let i = 1; i < suggestions.length; i++) {
    assert.ok(suggestions[i - 1].priority >= suggestions[i].priority, '应按优先级降序')
  }
  const keys = new Set(suggestions.map((s) => s.key))
  assert.equal(keys.size, suggestions.length, 'key 不得重复')
})

test('异常输入不抛出且安全降级', () => {
  assert.doesNotThrow(() => generateSuggestions())
  assert.doesNotThrow(() => generateSuggestions({ totalCount: 'abc', typeCounts: null }))
  const fallback = generateSuggestions({ totalCount: 0, typeCounts: 'not-object' })
  assert.equal(fallback.length, 1)
})
