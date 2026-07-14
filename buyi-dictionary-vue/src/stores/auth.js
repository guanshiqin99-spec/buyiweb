import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  AUTH_SESSION_CLEARED_EVENT,
  AUTH_SESSION_UPDATED_EVENT,
  authApi,
  meApi
} from '@/utils/api'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('token') || '')
  const refreshToken = ref(localStorage.getItem('refreshToken') || '')
  const userInfo = ref(JSON.parse(localStorage.getItem('userInfo') || 'null'))
  const isLoading = ref(false)

  const isLoggedIn = computed(() => !!token.value)
  const userName = computed(() => userInfo.value?.nickname || userInfo.value?.username || '未登录')

  function setSession(accessToken, nextRefreshToken, user = userInfo.value) {
    token.value = accessToken || ''
    refreshToken.value = nextRefreshToken || ''
    userInfo.value = user || null

    if (token.value) localStorage.setItem('token', token.value)
    else localStorage.removeItem('token')
    if (refreshToken.value) localStorage.setItem('refreshToken', refreshToken.value)
    else localStorage.removeItem('refreshToken')
    if (userInfo.value) localStorage.setItem('userInfo', JSON.stringify(userInfo.value))
    else localStorage.removeItem('userInfo')
  }

  window.addEventListener(AUTH_SESSION_UPDATED_EVENT, (event) => {
    setSession(event.detail?.accessToken, event.detail?.refreshToken)
  })
  window.addEventListener(AUTH_SESSION_CLEARED_EVENT, () => {
    setSession('', '', null)
  })

  async function login(credentials) {
    isLoading.value = true
    try {
      const response = await authApi.login(credentials)
      setSession(response.accessToken, response.refreshToken, response.user)

      return response
    } finally {
      isLoading.value = false
    }
  }

  // 注册
  async function register(userData) {
    isLoading.value = true
    try {
      const response = await authApi.register(userData)
      setSession(response.accessToken, response.refreshToken, response.user)

      return response
    } finally {
      isLoading.value = false
    }
  }

  // 登出
  async function logout() {
    try {
      if (token.value) await authApi.logout()
    } catch (e) {
      // 忽略登出请求失败，前端仍然要清理本地状态
    } finally {
      setSession('', '', null)
    }
  }

  async function fetchUserProfile() {
    if (!token.value) return
    try {
      const response = await meApi.get()
      userInfo.value = response.user
      localStorage.setItem('userInfo', JSON.stringify(response.user))
      return response
    } catch (error) {
      console.error('获取用户信息失败:', error)
    }
  }

  return {
    token,
    refreshToken,
    userInfo,
    isLoading,
    isLoggedIn,
    userName,
    login,
    register,
    logout,
    fetchUserProfile
  }
})
