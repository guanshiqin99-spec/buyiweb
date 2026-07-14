import test from 'node:test'
import assert from 'node:assert/strict'
import axios from 'axios'
import {
  installAuthInterceptor,
  AUTH_SESSION_CLEARED_EVENT
} from '../src/utils/authInterceptor.js'

// 组装测试所需的全局环境：localStorage + window（含 location 与事件派发）
function setupEnv() {
  const store = new Map()
  globalThis.localStorage = {
    getItem: (k) => (store.has(k) ? store.get(k) : null),
    setItem: (k, v) => store.set(k, String(v)),
    removeItem: (k) => store.delete(k),
    clear: () => store.clear()
  }

  const events = []
  const location = { pathname: '/home', href: '' }
  globalThis.window = {
    dispatchEvent: (event) => events.push(event),
    addEventListener: () => {},
    location
  }

  // Node 24 已内置 CustomEvent，这里做兜底以防运行环境差异
  if (typeof globalThis.CustomEvent === 'undefined') {
    globalThis.CustomEvent = class CustomEvent {
      constructor(type, options = {}) {
        this.type = type
        this.detail = options.detail
      }
    }
  }

  return { store, events, location }
}

function unauthorized(config) {
  return {
    config,
    response: { status: 401, data: {} },
    message: 'Request failed with status code 401'
  }
}

// 让微任务队列排空，便于在并发场景中等待拦截器进入刷新流程
function tick() {
  return new Promise((resolve) => setTimeout(resolve, 0))
}

test('401 且本地无 refreshToken 时清理会话并重定向登录页', async () => {
  const { store, events, location } = setupEnv()
  store.set('token', 'old')

  const instance = axios.create()
  const authStore = { tryRefresh: async () => { throw new Error('不应调用 tryRefresh') } }
  installAuthInterceptor(instance, authStore)

  instance.defaults.adapter = (config) => Promise.reject(unauthorized(config))
  await assert.rejects(() => instance.get('/miniapp/me'))

  assert.equal(localStorage.getItem('token'), null, '应清理本地 token')
  assert.equal(location.href, '/login', '应重定向到登录页')
  assert.ok(
    events.some((e) => e.type === AUTH_SESSION_CLEARED_EVENT),
    '应派发会话清理事件'
  )
})

test('401 且 tryRefresh 成功后用新 token 重放原请求', async () => {
  const { store } = setupEnv()
  store.set('refreshToken', 'rt')

  const instance = axios.create()
  const authStore = { tryRefresh: async () => 'newToken' }
  installAuthInterceptor(instance, authStore)

  let callCount = 0
  instance.defaults.adapter = (config) => {
    callCount += 1
    if (config._retry) {
      return Promise.resolve({ data: { ok: true }, status: 200, statusText: 'OK', headers: {}, config })
    }
    return Promise.reject(unauthorized(config))
  }

  const result = await instance.get('/miniapp/me')

  assert.equal(callCount, 2, '应触发原始请求与重放各一次')
  assert.deepEqual(result.data, { ok: true })
  assert.equal(result.config.headers.Authorization, 'Bearer newToken', '重放请求应携带新 token')
})

test('401 且 tryRefresh 失败时清理会话并以刷新错误向外抛出', async () => {
  const { store, location } = setupEnv()
  store.set('refreshToken', 'rt')
  store.set('token', 'old')

  const instance = axios.create()
  const refreshError = new Error('refresh failed')
  const authStore = { tryRefresh: async () => { throw refreshError } }
  installAuthInterceptor(instance, authStore)

  instance.defaults.adapter = (config) => Promise.reject(unauthorized(config))
  await assert.rejects(() => instance.get('/miniapp/me'), refreshError)

  assert.equal(localStorage.getItem('token'), null, '刷新失败也应清理本地 token')
  assert.equal(location.href, '/login', '刷新失败应重定向到登录页')
})

test('刷新进行中时并发的 401 请求挂起队列，刷新成功后一并重放', async () => {
  const { store } = setupEnv()
  store.set('refreshToken', 'rt')

  const instance = axios.create()
  let resolveRefresh
  const authStore = {
    tryRefresh: () => new Promise((resolve) => { resolveRefresh = resolve })
  }
  installAuthInterceptor(instance, authStore)

  let callCount = 0
  instance.defaults.adapter = (config) => {
    callCount += 1
    if (config._retry) {
      return Promise.resolve({ data: { ok: true }, status: 200, statusText: 'OK', headers: {}, config })
    }
    return Promise.reject(unauthorized(config))
  }

  // 第一个请求触发刷新并挂起
  const first = instance.get('/miniapp/me')
  await tick() // 等待首个请求进入刷新流程（isRefreshing 置位）

  // 第二个请求此时应进入待重放队列，而非再次发起刷新
  const second = instance.get('/miniapp/me')
  await tick()

  resolveRefresh('newToken')
  const [firstResult, secondResult] = await Promise.all([first, second])

  // 两次原始 401 + 两次重放，共 4 次适配器调用
  assert.equal(callCount, 4)
  assert.deepEqual(firstResult.data, { ok: true })
  assert.deepEqual(secondResult.data, { ok: true })
})

test('非 401 错误直接透传，不触发刷新或重定向', async () => {
  const { location } = setupEnv()

  const instance = axios.create()
  const authStore = { tryRefresh: async () => { throw new Error('不应调用 tryRefresh') } }
  installAuthInterceptor(instance, authStore)

  const error = { config: {}, response: { status: 500, data: {} }, message: 'server error' }
  instance.defaults.adapter = () => Promise.reject(error)

  await assert.rejects(() => instance.get('/miniapp/me'), error)
  assert.equal(location.href, '', '非鉴权错误不应重定向')
})
