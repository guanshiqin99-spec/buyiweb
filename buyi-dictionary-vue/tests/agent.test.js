import test from 'node:test'
import assert from 'node:assert/strict'
import { createPinia, setActivePinia } from 'pinia'
import { useAgentStore } from '../src/stores/agent.js'

// agent store 走真实 askStream（fetch + SSE 解析），这里只 mock 全局 fetch 与 localStorage

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

// chunks: SSE 文本分片数组；hang=true 时挂起请求，可手动 release 或 abort
function installFetch(chunks, { status = 200, hang = false } = {}) {
  const calls = []
  let release
  const gate = new Promise((resolve) => { release = resolve })

  globalThis.fetch = async (url, options) => {
    calls.push({ url, options })
    if (hang) {
      // 挂起请求：尊重 AbortSignal，中止时 reject AbortError（与真实 fetch 一致）
      return new Promise((resolve, reject) => {
        options?.signal?.addEventListener('abort', () => {
          const err = new Error('The operation was aborted')
          err.name = 'AbortError'
          reject(err)
        })
        gate.then(() => resolve(new Response(null, { status })))
      })
    }
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
  return { calls, release }
}

function tick(ms = 0) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function freshStore() {
  setActivePinia(createPinia())
  return useAgentStore()
}

test('初始状态包含导览员自我介绍', () => {
  useLocalStorage()
  const store = freshStore()
  assert.equal(store.isOpen, false)
  assert.equal(store.messages.length, 1)
  assert.equal(store.messages[0].role, 'agent')
  assert.match(store.messages[0].text, /布依文化导览员/)
})

test('quickQuestions 按上下文路径返回对应模板，未知路径回退首页', () => {
  useLocalStorage()
  const store = freshStore()
  store.setContext('/dictionary')
  assert.match(store.quickQuestions[0], /来源/)
  store.setContext('/culture')
  assert.match(store.quickQuestions[0], /纹样/)
  store.setContext('/unknown-path')
  assert.match(store.quickQuestions[0], /分布/)
})

test('open 携带路径时更新上下文并展开面板', () => {
  useLocalStorage()
  const store = freshStore()
  store.open('/songs')
  assert.equal(store.isOpen, true)
  assert.equal(store.contextPath, '/songs')
})

test('ask 打开面板并发送问题（真实请求体校验）', async () => {
  useLocalStorage()
  const { calls } = installFetch(['data: {"type":"done"}\n\n'])
  const store = freshStore()

  store.ask('布依语有多少个声调', '/learn')
  await tick()

  assert.equal(store.isOpen, true)
  assert.equal(store.contextPath, '/learn')
  assert.equal(calls.length, 1)
  const body = JSON.parse(calls[0].options.body)
  assert.equal(body.question, '布依语有多少个声调')
  // 历史包含自我介绍与当前提问（角色映射为 assistant/user）
  assert.equal(body.history.length, 2)
  assert.equal(body.history[0].role, 'assistant')
  assert.equal(body.history[1].role, 'user')
  assert.equal(body.history[1].content, '布依语有多少个声调')
})

test('send 空白问题被忽略', async () => {
  useLocalStorage()
  const { calls } = installFetch(['data: {"type":"done"}\n\n'])
  const store = freshStore()

  store.send('   ')
  await tick()

  assert.equal(calls.length, 0)
  assert.equal(store.messages.length, 1, '不应追加消息')
})

test('send 时历史截取最近 6 条且角色映射正确', async () => {
  useLocalStorage()
  const { calls } = installFetch(['data: {"type":"done"}\n\n'])
  const store = freshStore()

  for (let i = 1; i <= 8; i++) {
    store.send(`问题${i}`)
    await tick()
  }

  assert.equal(calls.length, 8)
  const last = JSON.parse(calls[7].options.body)
  assert.equal(last.history.length, 6, '历史应限制最近 6 条')
  assert.equal(last.history[5].content, '问题8')
  assert.equal(last.history[5].role, 'user')
  assert.equal(last.history[0].role, 'assistant', 'agent 消息应映射为 assistant')
})

test('loading 期间重复 send 被忽略（防重入）', async () => {
  useLocalStorage()
  const { calls, release } = installFetch([], { hang: true })
  const store = freshStore()

  store.send('问题A')
  await tick()
  assert.equal(calls.length, 1)
  store.send('问题B')
  await tick()
  assert.equal(calls.length, 1, 'loading 中不应发起第二次请求')

  release()
  await tick()
  assert.equal(store.loading, false)
})

test('onDelta 流式累积渲染并规范 markdown 项目符号', async () => {
  useLocalStorage()
  installFetch([
    'data: {"type":"delta","content":"* 第一点\\n"}\n\n',
    'data: {"type":"delta","content":"- 第二点\\n"}\n\n',
    'data: {"type":"delta","content":"普通文本"}\n\n',
    'data: {"type":"done"}\n\n'
  ])
  const store = freshStore()

  store.send('讲一下声调')
  await tick()

  const agentText = store.messages[store.messages.length - 1].text
  assert.match(agentText, /• 第一点/)
  assert.match(agentText, /• 第二点/)
  assert.match(agentText, /普通文本/)
  assert.equal(store.loading, false)
})

test('onDone 时空回复写入占位文案', async () => {
  useLocalStorage()
  installFetch(['data: {"type":"done"}\n\n'])
  const store = freshStore()

  store.send('提问')
  await tick()

  assert.match(store.messages[store.messages.length - 1].text, /未收到回复/)
  assert.equal(store.loading, false)
})

test('onError 时写入失败提示并解除 loading', async () => {
  useLocalStorage()
  installFetch(['data: {"type":"error","message":"上游失败"}\n\n'])
  const store = freshStore()

  store.send('提问')
  await tick()

  assert.match(store.messages[store.messages.length - 1].text, /智能体响应失败/)
  assert.equal(store.loading, false)
})

test('stop 中止当前流并解除 loading', async () => {
  useLocalStorage()
  const { release } = installFetch([], { hang: true })
  const store = freshStore()

  store.send('提问')
  await tick()
  assert.equal(store.loading, true)

  store.stop()
  await tick()
  assert.equal(store.loading, false)
  // AbortError 被 askStream 静默处理，不覆盖已有点位文案
  assert.equal(store.messages[store.messages.length - 1].text, '')
  release()
  await tick()
})

test('reset 清空消息回到初始状态', async () => {
  useLocalStorage()
  const { release } = installFetch([], { hang: true })
  const store = freshStore()

  store.send('提问')
  await tick()
  store.reset()
  await tick()

  assert.equal(store.messages.length, 1)
  assert.equal(store.messages[0].role, 'agent')
  assert.equal(store.loading, false)
  release()
  await tick()
})
