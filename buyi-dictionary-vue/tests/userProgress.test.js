import test from 'node:test'
import assert from 'node:assert/strict'
import {
  getTodayDateKey,
  getTodayTypeCounts,
  recordTodayActivity,
  normalizeLearningStats,
  normalizeBadge,
  normalizeBadgesResponse,
  notifyUserProgressUpdated,
  DAILY_TYPE_COUNTS_STORAGE_KEY,
  USER_PROGRESS_UPDATED_EVENT,
  USER_PROGRESS_STORAGE_KEY
} from '../src/utils/userProgress.js'

function setupEnv() {
  const store = new Map()
  const dispatched = []
  const localStorage = {
    getItem: (k) => (store.has(k) ? store.get(k) : null),
    setItem: (k, v) => store.set(k, String(v)),
    removeItem: (k) => store.delete(k),
    clear: () => store.clear()
  }
  globalThis.localStorage = localStorage
  // userProgress 模块通过 window.localStorage 访问，需同步挂在 window 上
  globalThis.window = {
    localStorage,
    dispatchEvent: (event) => {
      dispatched.push(event)
      return true
    }
  }
  return { store, dispatched }
}

function writeRawCounts(store, date, counts) {
  store.set(DAILY_TYPE_COUNTS_STORAGE_KEY, JSON.stringify({ date, counts }))
}

test('getTodayDateKey 返回 YYYY-MM-DD 格式', () => {
  assert.match(getTodayDateKey(), /^\d{4}-\d{2}-\d{2}$/)
})

test('无本地存储时今日计数为空', () => {
  delete globalThis.window
  delete globalThis.localStorage
  assert.deepEqual(getTodayTypeCounts(), {})
})

test('今日计数跨天自动重置：昨天数据视为空', () => {
  setupEnv()
  // 构造一个昨天的日期 key
  const yesterday = new Date(Date.now() - 24 * 3600 * 1000)
  const yKey = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`
  const { store } = setupEnv()
  writeRawCounts(store, yKey, { dictionary: 9 })
  assert.deepEqual(getTodayTypeCounts(), {}, '昨日计数不应带入今天')
})

test('今日计数正常读取', () => {
  const { store } = setupEnv()
  writeRawCounts(store, getTodayDateKey(), { dictionary: 2 })
  assert.deepEqual(getTodayTypeCounts(), { dictionary: 2 })
})

test('recordTodayActivity 递增指定类型并落盘', () => {
  const { store } = setupEnv()
  recordTodayActivity('dictionary')
  recordTodayActivity('dictionary')
  recordTodayActivity('song')
  const raw = JSON.parse(store.get(DAILY_TYPE_COUNTS_STORAGE_KEY))
  assert.equal(raw.date, getTodayDateKey())
  assert.equal(raw.counts.dictionary, 2)
  assert.equal(raw.counts.song, 1)
})

test('recordTodayActivity 无 window 环境静默跳过', () => {
  delete globalThis.window
  delete globalThis.localStorage
  assert.doesNotThrow(() => recordTodayActivity('dictionary'))
})

test('normalizeLearningStats 兼容新旧字段并输出统一形态', () => {
  const legacy = normalizeLearningStats({ today: 2, total: 7, streak: 3 })
  assert.equal(legacy.todayCount, 2)
  assert.equal(legacy.totalCount, 7)
  assert.equal(legacy.streakDays, 3)

  const modern = normalizeLearningStats({ todayCount: 4, totalCount: 9, streakDays: 5 })
  assert.equal(modern.today, 4)
  assert.equal(modern.total, 9)
  assert.equal(modern.streak, 5)

  assert.deepEqual(normalizeLearningStats().typeCounts, {})
})

test('normalizeBadge 兼容 isUnlocked / unlocked / locked 三种形态', () => {
  assert.equal(normalizeBadge({ code: 'a', isUnlocked: true }).isUnlocked, true)
  assert.equal(normalizeBadge({ code: 'b', unlocked: true }).isUnlocked, true)
  assert.equal(normalizeBadge({ code: 'c', locked: false }).isUnlocked, true)
  assert.equal(normalizeBadge({ code: 'd', locked: true }).isUnlocked, false)
  assert.equal(normalizeBadge({ code: 'e', unlockedAt: '2026-01-01' }).isUnlocked, true)
  assert.equal(normalizeBadge({ code: 'f' }).isUnlocked, false)
})

test('normalizeBadge 补充 id 与 locked 反字段', () => {
  const badge = normalizeBadge({ code: 'first-word', unlocked: true })
  assert.equal(badge.id, 'first-word')
  assert.equal(badge.locked, false)
})

test('normalizeBadgesResponse 支持数组与分页对象', () => {
  const fromArray = normalizeBadgesResponse([
    { code: 'a', unlocked: true },
    { code: 'b', locked: true }
  ])
  assert.equal(fromArray.length, 2)
  assert.equal(fromArray[0].isUnlocked, true)

  const fromObject = normalizeBadgesResponse({
    items: [
      { code: 'a', isUnlocked: true },
      { code: 'b', isUnlocked: false }
    ]
  })
  assert.equal(fromObject.items.length, 2)
  assert.equal(fromObject.total, 2)
  assert.equal(fromObject.unlockedCount, 1)
})

test('notifyUserProgressUpdated 派发事件并写入时间戳', () => {
  const { store, dispatched } = setupEnv()
  notifyUserProgressUpdated('quiz')
  assert.equal(dispatched.length, 1)
  assert.equal(dispatched[0].type, USER_PROGRESS_UPDATED_EVENT)
  assert.equal(dispatched[0].detail.source, 'quiz')
  assert.ok(store.get(USER_PROGRESS_STORAGE_KEY))
})

test('notifyUserProgressUpdated 无 window 时安全返回', () => {
  delete globalThis.window
  delete globalThis.localStorage
  assert.doesNotThrow(() => notifyUserProgressUpdated('view'))
})
