export const AUTH_SESSION_UPDATED_EVENT = 'buyi:auth-session-updated'
export const AUTH_SESSION_CLEARED_EVENT = 'buyi:auth-session-cleared'

// 模块级私有状态：刷新锁与待重放队列（拦截器拥有 transport-layer 编排）
let isRefreshing = false
let pendingQueue = []

// TODO: 理想情况下 localStorage 应由 auth store 唯一写入；
// 此处在重定向前直接清理，确保页面刷新前状态已清除
function clearAuthAndRedirect() {
  localStorage.removeItem('token')
  localStorage.removeItem('refreshToken')
  localStorage.removeItem('userInfo')
  window.dispatchEvent(new CustomEvent(AUTH_SESSION_CLEARED_EVENT))
  if (window.location.pathname !== '/login') {
    window.location.href = '/login'
  }
}

// 安装鉴权响应拦截器：处理 401 自动刷新、队列重放、失败清理
export function installAuthInterceptor(axiosInstance, authStore) {
  function settlePendingRequests(error, accessToken = '') {
    pendingQueue.forEach(({ resolve, reject, request }) => {
      if (error) {
        reject(error)
        return
      }
      request.headers = request.headers || {}
      request.headers.Authorization = `Bearer ${accessToken}`
      resolve(axiosInstance.request(request))
    })
    pendingQueue = []
  }

  axiosInstance.interceptors.response.use(
    // 成功透传，由 api.js 拦截器统一解包 response.data
    (response) => response,
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
          originalRequest._retry = true
          return new Promise((resolve, reject) => {
            pendingQueue.push({ resolve, reject, request: originalRequest })
          })
        }

        originalRequest._retry = true
        isRefreshing = true
        try {
          const newToken = await authStore.tryRefresh()
          settlePendingRequests(null, newToken)

          originalRequest.headers = originalRequest.headers || {}
          originalRequest.headers.Authorization = `Bearer ${newToken}`
          return axiosInstance.request(originalRequest)
        } catch (refreshError) {
          settlePendingRequests(refreshError)
          clearAuthAndRedirect()
          return Promise.reject(refreshError)
        } finally {
          isRefreshing = false
        }
      }

      // 非 401 错误透传，由 api.js 拦截器记录日志
      return Promise.reject(error)
    }
  )
}
