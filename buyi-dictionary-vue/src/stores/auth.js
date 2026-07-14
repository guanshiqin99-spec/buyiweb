import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authApi, meApi } from '@/utils/api'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('token') || '')
  const refreshToken = ref(localStorage.getItem('refreshToken') || '')
  const userInfo = ref(JSON.parse(localStorage.getItem('userInfo') || 'null'))
  const isLoading = ref(false)

  const isLoggedIn = computed(() => !!token.value)
  const userName = computed(() => userInfo.value?.nickname || userInfo.value?.username || '未登录')

  async function login(credentials) {
    isLoading.value = true
    try {
      const response = await authApi.login(credentials)
      token.value = response.accessToken
      refreshToken.value = response.refreshToken
      userInfo.value = response.user

      localStorage.setItem('token', response.accessToken)
      localStorage.setItem('refreshToken', response.refreshToken)
      localStorage.setItem('userInfo', JSON.stringify(response.user))

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
      token.value = response.accessToken
      refreshToken.value = response.refreshToken
      userInfo.value = response.user

      localStorage.setItem('token', response.accessToken)
      localStorage.setItem('refreshToken', response.refreshToken)
      localStorage.setItem('userInfo', JSON.stringify(response.user))

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
      token.value = ''
      refreshToken.value = ''
      userInfo.value = null
      localStorage.removeItem('token')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('userInfo')
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
