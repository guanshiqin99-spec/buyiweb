import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' }
})

// 请求拦截器：附带 token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
}, (error) => Promise.reject(error))

// 响应拦截器：统一解包 + 401 自动刷新 token（队列重放）
let isRefreshing = false
let pendingQueue = []

api.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      const refreshToken = localStorage.getItem('refreshToken')
      if (!refreshToken) {
        clearAuthAndRedirect()
        return Promise.reject(error)
      }

      // 刷新进行中则挂起当前请求
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          pendingQueue.push({ resolve, reject, request: originalRequest })
        })
      }

      originalRequest._retry = true
      isRefreshing = true
      try {
        const res = await axios.post('/api/miniapp/auth/refresh', { refreshToken })
        const newToken = res.data.accessToken
        const newRefresh = res.data.refreshToken
        localStorage.setItem('token', newToken)
        localStorage.setItem('refreshToken', newRefresh)

        pendingQueue.forEach(({ resolve, request }) => {
          request.headers.Authorization = `Bearer ${newToken}`
          resolve(api.request(request))
        })
        pendingQueue = []

        originalRequest.headers.Authorization = `Bearer ${newToken}`
        return api.request(originalRequest)
      } catch (refreshError) {
        pendingQueue = []
        clearAuthAndRedirect()
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    if (error.response) {
      const msg = error.response.data?.message || error.response.data?.error
      switch (error.response.status) {
        case 403:
          console.error('没有权限访问', msg)
          break
        case 404:
          console.error('请求的资源不存在', msg)
          break
        case 500:
          console.error('服务器内部错误', msg)
          break
        default:
          console.error('请求失败:', error.response.status, msg)
      }
    } else if (error.request) {
      console.error('网络错误，请检查网络连接或后端服务是否启动')
    } else {
      console.error('请求配置错误:', error.message)
    }
    return Promise.reject(error)
  }
)

function clearAuthAndRedirect() {
  localStorage.removeItem('token')
  localStorage.removeItem('refreshToken')
  localStorage.removeItem('userInfo')
  if (window.location.pathname !== '/login') {
    window.location.href = '/login'
  }
}

export const authApi = {
  login(data) { return api.post('/miniapp/auth/web-login', data) },
  register(data) { return api.post('/miniapp/auth/web-register', data) },
  logout() { return api.post('/miniapp/auth/logout', {}) }
}

export const homeApi = {
  get() { return api.get('/miniapp/home') }
}

export const meApi = {
  get() { return api.get('/miniapp/me') }
}

export const settingsApi = {
  get() { return api.get('/miniapp/settings') },
  update(data) { return api.put('/miniapp/settings', data) }
}

export const searchApi = {
  search(params) { return api.get('/miniapp/search', { params }) },
  hot() { return api.get('/miniapp/search/hot') }
}

const CONTENT_PATHS = {
  dictionary: 'dictionary',
  phrase: 'phrases',
  proverb: 'proverbs',
  song: 'songs'
}

export const contentApi = {
  list(type, params) {
    const path = CONTENT_PATHS[type] || CONTENT_PATHS.dictionary
    return api.get(`/miniapp/${path}`, { params })
  }
}

export const favoritesApi = {
  list() { return api.get('/miniapp/favorites') },
  toggle(contentType, contentId) { return api.post('/miniapp/favorites/toggle', { contentType, contentId }) },
  clear() { return api.delete('/miniapp/favorites') }
}

export const recordsApi = {
  list(params) { return api.get('/miniapp/learning-records', { params }) },
  stats() { return api.get('/miniapp/learning-records/stats') },
  create(data) { return api.post('/miniapp/learning-records', data) }
}

export const badgesApi = {
  list() { return api.get('/miniapp/badges') }
}

// 智能体 SSE 流式问答：POST + fetch reader 解析 data: 分片
export const agentApi = {
  askStream({ question, history, onDelta, onDone, onError }) {
    const controller = new AbortController()
    const token = localStorage.getItem('token')

    fetch('/api/miniapp/agent/ask', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: JSON.stringify({ question, history: history ?? [] }),
      signal: controller.signal
    })
      .then(async (resp) => {
        if (!resp.ok) {
          const text = await resp.text().catch(() => '')
          throw new Error(`智能体请求失败 (${resp.status}): ${text.slice(0, 120)}`)
        }
        if (!resp.body) {
          onDone?.()
          return
        }
        const reader = resp.body.getReader()
        const decoder = new TextDecoder('utf-8')
        let buffer = ''
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split('\n')
          buffer = lines.pop() ?? ''
          for (const line of lines) {
            const trimmed = line.trim()
            if (!trimmed || !trimmed.startsWith('data:')) continue
            const data = trimmed.slice(5).trim()
            if (!data) continue
            try {
              const payload = JSON.parse(data)
              if (payload.type === 'delta' && payload.content) {
                onDelta?.(payload.content)
              } else if (payload.type === 'done') {
                onDone?.()
                return
              } else if (payload.type === 'error') {
                onError?.(new Error(payload.message || '智能体错误'))
                return
              }
            } catch {
              /* 忽略无法解析的分片 */
            }
          }
        }
        onDone?.()
      })
      .catch((err) => {
        if (err?.name === 'AbortError') return
        onError?.(err instanceof Error ? err : new Error(String(err)))
      })

    return controller
  }
}

export default api
