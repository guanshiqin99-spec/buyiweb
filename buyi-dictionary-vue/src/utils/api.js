import axios from 'axios'
import { logApiError } from './logger'
import { getContentApiPath } from './contentTypes'

export const apiBaseURL = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/$/, '')

const api = axios.create({
  baseURL: apiBaseURL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' }
})

function hasAuthenticatedSession() {
  return Boolean(localStorage.getItem('token'))
}

// 请求拦截器：附带 token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
}, (error) => Promise.reject(error))

// 响应拦截器：统一解包（鉴权 401 刷新由 authInterceptor 处理）
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    logApiError(error)
    return Promise.reject(error)
  }
)

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
  search(params) {
    const path = hasAuthenticatedSession() ? '/miniapp/search/mine' : '/miniapp/search'
    return api.get(path, { params })
  },
  suggest(keyword) { return api.get('/miniapp/search/suggest', { params: { keyword } }) },
  hot() { return api.get('/miniapp/search/hot') }
}

export const contentApi = {
  list(type, params) {
    const path = getContentApiPath(type)
    const endpoint = type === 'dictionary' && hasAuthenticatedSession()
      ? `/miniapp/${path}/mine`
      : `/miniapp/${path}`
    return api.get(endpoint, { params })
  }
}

export const cultureExhibitsApi = {
  detail(slug) { return api.get(`/miniapp/culture-exhibits/${encodeURIComponent(slug)}`) }
}

export const healthApi = {
  ready() { return api.get('/ready') }
}

export const favoritesApi = {
  list() { return api.get('/miniapp/favorites') },
  toggle(contentType, contentId) { return api.post('/miniapp/favorites/toggle', { contentType, contentId }) },
  clear() { return api.delete('/miniapp/favorites') }
}

export const recordsApi = {
  list(params) { return api.get('/miniapp/learning-records', { params }) },
  stats() { return api.get('/miniapp/learning-records/stats') },
  create(data) { return api.post('/miniapp/learning-records', data) },
  clear() { return api.delete('/miniapp/learning-records') }
}

export const quizApi = {
  list(params) { return api.get('/miniapp/quiz-attempts', { params }) },
  create(data) { return api.post('/miniapp/quiz-attempts', data) }
}

export const badgesApi = {
  list() { return api.get('/miniapp/badges') }
}

export default api
