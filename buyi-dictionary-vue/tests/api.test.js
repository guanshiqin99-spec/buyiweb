import test from 'node:test'
import assert from 'node:assert/strict'
import { mock } from 'node:test'
import api, { contentApi, homeApi, quizApi, searchApi, settingsApi } from '../src/utils/api.js'
import { logApiError, logRenderError, logRouteChunkError } from '../src/utils/logger.js'

// 提供最小化的 localStorage 占位，请求拦截器从中读取 token
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

// 构造一个会进入响应成功分支的假响应
function okResponse(data, config) {
  return { data, status: 200, statusText: 'OK', headers: {}, config }
}

test('请求拦截器在存在 token 时附带 Authorization 头', async () => {
  const store = useLocalStorage()
  store.set('token', 'abc123')
  let captured = null
  api.defaults.adapter = (config) => {
    captured = config
    return Promise.resolve(okResponse({ ok: true }, config))
  }
  await homeApi.get()
  assert.equal(captured.headers.Authorization, 'Bearer abc123')
})

test('请求拦截器在未设置 token 时不附带 Authorization 头', async () => {
  useLocalStorage()
  let captured = null
  api.defaults.adapter = (config) => {
    captured = config
    return Promise.resolve(okResponse({ ok: true }, config))
  }
  await homeApi.get()
  assert.equal(captured.headers.Authorization, undefined)
})

test('响应拦截器对成功响应解包为 response.data', async () => {
  useLocalStorage()
  api.defaults.adapter = (config) => Promise.resolve(okResponse({ hello: 'world' }, config))
  const result = await homeApi.get()
  assert.deepEqual(result, { hello: 'world' })
})

test('未登录搜索使用公开接口，建议请求使用 suggest 接口', async () => {
  useLocalStorage()
  const captured = []
  api.defaults.adapter = (config) => {
    captured.push(config)
    return Promise.resolve(okResponse({ ok: true }, config))
  }

  await searchApi.search({ keyword: '布依' })
  await searchApi.suggest('布依')

  assert.equal(captured[0].url, '/miniapp/search')
  assert.deepEqual(captured[0].params, { keyword: '布依' })
  assert.equal(captured[1].url, '/miniapp/search/suggest')
  assert.deepEqual(captured[1].params, { keyword: '布依' })
})

test('登录后搜索和词汇列表使用 mine 接口', async () => {
  const store = useLocalStorage()
  store.set('token', 'abc123')
  const captured = []
  api.defaults.adapter = (config) => {
    captured.push(config)
    return Promise.resolve(okResponse({ ok: true }, config))
  }

  await searchApi.search({ keyword: '布依' })
  await contentApi.list('dictionary', { page: 1, pageSize: 20 })
  await contentApi.list('song', { page: 1, pageSize: 20 })

  assert.equal(captured[0].url, '/miniapp/search/mine')
  assert.equal(captured[1].url, '/miniapp/dictionary/mine')
  assert.equal(captured[2].url, '/miniapp/songs')
})

test('设置与答题成绩使用账号同步接口', async () => {
  const store = useLocalStorage()
  store.set('token', 'abc123')
  const captured = []
  api.defaults.adapter = (config) => {
    captured.push(config)
    return Promise.resolve(okResponse({ ok: true }, config))
  }

  await settingsApi.update({ notifications: true, autoplay: false })
  await quizApi.create({ score: 80, correctCount: 8, totalQuestions: 10, answers: [] })

  assert.equal(captured[0].url, '/miniapp/settings')
  assert.equal(captured[0].method, 'put')
  assert.equal(captured[1].url, '/miniapp/quiz-attempts')
  assert.equal(captured[1].method, 'post')
})

test('响应拦截器对失败响应调用 logApiError 并向外抛出', async () => {
  useLocalStorage()
  const error = { response: { status: 500, data: { message: 'boom' } }, config: {}, message: 'fail' }
  api.defaults.adapter = () => Promise.reject(error)
  const spy = mock.method(console, 'error', () => {})
  try {
    await assert.rejects(() => homeApi.get(), error)
    assert.ok(spy.mock.calls.length > 0, '应通过 logApiError 记录错误')
  } finally {
    spy.mock.restore()
  }
})

test('logApiError 对常见响应状态输出对应文案且不抛出', () => {
  const spy = mock.method(console, 'error', () => {})
  try {
    assert.doesNotThrow(() => logApiError({ response: { status: 403, data: { message: '无权限' } } }))
    assert.doesNotThrow(() => logApiError({ response: { status: 404, data: { error: '不存在' } } }))
    assert.doesNotThrow(() => logApiError({ response: { status: 500, data: {} } }))
    assert.doesNotThrow(() => logApiError({ response: { status: 422, data: { message: '校验失败' } } }))

    const texts = spy.mock.calls.map((c) => c.arguments[0])
    assert.match(texts[0], /没有权限/)
    assert.match(texts[1], /不存在/)
    assert.match(texts[2], /服务器内部错误/)
    assert.match(texts[3], /请求失败/)
  } finally {
    spy.mock.restore()
  }
})

test('logApiError 区分网络错误与请求配置错误', () => {
  const spy = mock.method(console, 'error', () => {})
  try {
    logApiError({ request: {}, message: 'network down' })
    assert.match(spy.mock.calls[0].arguments[0], /网络错误/)

    logApiError({ message: 'bad config' })
    assert.match(spy.mock.calls[1].arguments[0], /请求配置错误/)

    // 缺少 response 与 request 的最小错误对象也不应抛出
    assert.doesNotThrow(() => logApiError({}))
  } finally {
    spy.mock.restore()
  }
})

test('logRenderError 记录组件渲染错误信息', () => {
  const spy = mock.method(console, 'error', () => {})
  try {
    logRenderError(new Error('render boom'), 'stack info')
    assert.match(spy.mock.calls[0].arguments[0], /渲染错误/)
    assert.ok(spy.mock.calls[0].arguments.length >= 3, '应透传 err 与 info')
  } finally {
    spy.mock.restore()
  }
})

test('logRouteChunkError 记录路由懒加载失败', () => {
  const spy = mock.method(console, 'error', () => {})
  try {
    logRouteChunkError(new Error('chunk load fail'))
    assert.match(spy.mock.calls[0].arguments[0], /懒加载/)

    // 传入字符串而非 Error 对象也应安全处理
    assert.doesNotThrow(() => logRouteChunkError('加载失败'))
  } finally {
    spy.mock.restore()
  }
})
