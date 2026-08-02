import test from 'node:test'
import assert from 'node:assert/strict'
import { getDailyTasks } from '../src/utils/dailyTasks.js'

test('今日计数优先于累计计数', () => {
  const tasks = getDailyTasks({
    todayTypeCounts: { dictionary: 2, song: 1, quiz: 0 },
    typeCounts: { dictionary: 50, song: 30, quiz: 10 }
  })
  assert.equal(tasks[0].current, 2)
  assert.equal(tasks[1].current, 1)
  assert.equal(tasks[2].current, 0)
})

test('今日计数缺失时回退到累计 typeCounts', () => {
  const tasks = getDailyTasks({
    typeCounts: { dictionary: 3, song: 2, quiz: 1 }
  })
  assert.equal(tasks[0].current, 3)
  assert.equal(tasks[1].current, 2)
  assert.equal(tasks[2].current, 1)
})

test('无任何数据时任务计数为 0 且未完成', () => {
  const tasks = getDailyTasks({})
  assert.deepEqual(tasks.map((t) => t.current), [0, 0, 0])
  assert.deepEqual(tasks.map((t) => t.completed), [false, false, false])
})

test('达到目标即标记完成（边界值）', () => {
  const tasks = getDailyTasks({
    todayTypeCounts: { dictionary: 3, song: 2, quiz: 1 }
  })
  assert.deepEqual(tasks.map((t) => t.completed), [true, true, true])
})

test('异常值钳制：负数与非数字按 0 处理', () => {
  const tasks = getDailyTasks({
    todayTypeCounts: { dictionary: -5, song: 'abc', quiz: Number.NaN }
  })
  assert.deepEqual(tasks.map((t) => t.current), [0, 0, 0])
})

test('任务文案与跳转链接固定', () => {
  const tasks = getDailyTasks({})
  assert.equal(tasks[0].title, '查 3 个词')
  assert.equal(tasks[0].target, 3)
  assert.equal(tasks[0].link, '/dictionary?type=word&focus=1')
  assert.equal(tasks[1].link, '/songs')
  assert.equal(tasks[2].link, '/quiz?start=1')
})
