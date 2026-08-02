import test from 'node:test'
import assert from 'node:assert/strict'
import { askStream, generateStream } from '../src/utils/agentStream.js'

// —— 工具：mock localStorage（agentStream 从其中读取 token）——
function useLocalStorage() {
  const store = new Map()
  globalThis.localStorage = {
    getItem: (k) => (store.has(k) ? store.get(k) : null),
    setItem: (k, v) => store.set(k, String(v)),
    removeItem: (k) => store.delete(k),
    clear: () => store.clear()
  }
  return store
}

// —— 工具：mock fetch 返回 SSE 分片流 ——
function installFetch(chunks, { status = 200, error = null } = {}) {
  const calls = []
  globalThis.fetch = async (url, options) => {
    calls.push({ url, options })
    if (error) throw error
    if (!chunks || chunks.length === 0) {
      return new Response(null, { status })
    }
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      start(controller) {
        for (const chunk of chunks) {
          controller.enqueue(encoder.encode(chunk))
        }
        controller.close()
      }
    })
    return new Response(stream, { status })
  }
  return calls
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// 运行一次 askStream 并收集全部事件，直到 onDone/onError
function runAsk(chunks, options = {}) {
  const events = { deltas: [], done: false, error: null }
  const finished = new Promise((resolve) => {
    askStream({
      question: options.question ?? '测试问题',
      history: options.history,
      onDelta: (c) => events.deltas.push(c),
      onDone: () => {
        events.done = true
        resolve()
      },
      onError: (e) => {
        events.error = e
        resolve()
      }
    })
  })
  return { events, finished }
}

test('askStream 跨 chunk 拼接解析 delta 分片', async () => {
  useLocalStorage()
  installFetch([
    'data: {"type":"delta","content":"你"}',
    '\n\ndata: {"type":"delta","content":"好"}\n\n'
  ])
  const { events, finished } = runAsk()
  await finished
  assert.deepEqual(events.deltas, ['你', '好'])
  assert.equal(events.done, true)
  assert.equal(events.error, null)
})

test('askStream 单个 chunk 内多个事件按序触发', async () => {
  useLocalStorage()
  installFetch([
    'data: {"type":"delta","content":"第1段"}\n\ndata: {"type":"delta","content":"第2段"}\n\ndata: {"type":"done"}\n\n'
  ])
  const { events, finished } = runAsk()
  await finished
  assert.deepEqual(events.deltas, ['第1段', '第2段'])
  assert.equal(events.done, true)
})

test('askStream 收到 error 事件时调用 onError 且不再 done', async () => {
  useLocalStorage()
  installFetch(['data: {"type":"error","message":"服务不可用"}\n\n'])
  const { events, finished } = runAsk()
  await finished
  assert.equal(events.error.message, '服务不可用')
  assert.equal(events.done, false)
})

test('askStream HTTP 非 200 时调用 onError 并携带状态码', async () => {
  useLocalStorage()
  installFetch([], { status: 500 })
  const { events, finished } = runAsk()
  await finished
  assert.match(events.error.message, /500/)
  assert.equal(events.done, false)
})

test('askStream 响应无 body 时直接 onDone', async () => {
  useLocalStorage()
  globalThis.fetch = async () => new Response(null, { status: 200 })
  const { events, finished } = runAsk()
  await finished
  assert.equal(events.done, true)
  assert.deepEqual(events.deltas, [])
})

test('askStream 携带 localStorage 中的 token', async () => {
  const store = useLocalStorage()
  store.set('token', 'sse-token-123')
  const calls = installFetch(['data: {"type":"done"}\n\n'])
  const { finished } = runAsk()
  await finished
  assert.equal(calls[0].options.headers.Authorization, 'Bearer sse-token-123')
  assert.equal(calls[0].options.method, 'POST')
  const body = JSON.parse(calls[0].options.body)
  assert.equal(body.question, '测试问题')
  assert.deepEqual(body.history, [])
})

test('askStream 无 token 时不带 Authorization 头', async () => {
  useLocalStorage()
  const calls = installFetch(['data: {"type":"done"}\n\n'])
  const { finished } = runAsk()
  await finished
  assert.equal(calls[0].options.headers.Authorization, undefined)
})

test('askStream 忽略无法解析的分片不中断后续事件', async () => {
  useLocalStorage()
  installFetch([
    'data: {broken json}\n\n',
    'not-an-sse-line\n\n',
    'data: {"type":"delta","content":"正常"}\n\n',
    'data: {"type":"done"}\n\n'
  ])
  const { events, finished } = runAsk()
  await finished
  assert.deepEqual(events.deltas, ['正常'])
  assert.equal(events.done, true)
  assert.equal(events.error, null)
})

test('askStream 遇到 AbortError 不触发 onError', async () => {
  useLocalStorage()
  const abortError = new Error('The operation was aborted')
  abortError.name = 'AbortError'
  installFetch([], { error: abortError })
  const { events, finished } = runAsk()
  // 超时保护：若错误路径出错导致 promise 不 resolve，由断言兜底
  await Promise.race([finished, sleep(200).then(() => {})])
  assert.equal(events.done, false)
  assert.equal(events.error, null)
})

test('askStream 返回 AbortController，abort 后不再收到事件', async () => {
  useLocalStorage()
  // 挂起请求并尊重 AbortSignal：中止时 reject AbortError（与真实 fetch 行为一致）
  let release
  const gate = new Promise((resolve) => { release = resolve })
  globalThis.fetch = (_url, options) =>
    new Promise((resolve, reject) => {
      options?.signal?.addEventListener('abort', () => {
        const err = new Error('The operation was aborted')
        err.name = 'AbortError'
        reject(err)
      })
      gate.then(() => resolve(new Response(null, { status: 200 })))
    })
  const events = { error: null }
  const ctrl = askStream({
    question: 'x',
    onDelta: () => {},
    onDone: () => {},
    onError: (e) => { events.error = e }
  })
  ctrl.abort()
  release()
  await sleep(30)
  assert.equal(events.error, null)
})

test('generateStream 复用 SSE 协议并传递 type/word', async () => {
  useLocalStorage()
  const calls = installFetch([
    'data: {"type":"delta","content":"造句结果"}\n\ndata: {"type":"done"}\n\n'
  ])
  const deltas = []
  const finished = new Promise((resolve) => {
    generateStream({
      type: 'sentence',
      word: '布依',
      onDelta: (c) => deltas.push(c),
      onDone: resolve
    })
  })
  await finished
  assert.deepEqual(deltas, ['造句结果'])
  const body = JSON.parse(calls[0].options.body)
  assert.equal(body.type, 'sentence')
  assert.equal(body.word, '布依')
})
