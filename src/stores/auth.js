import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { userApi } from '@/utils/api'

export const useAuthStore = defineStore('auth', () => {
  // 状态
  const token = ref(localStorage.getItem('token') || '')
  const userInfo = ref(JSON.parse(localStorage.getItem('userInfo') || 'null'))
  const isLoading = ref(false)
  
  // 计算属性
  const isLoggedIn = computed(() => !!token.value)
  const userName = computed(() => userInfo.value?.name || '未登录')
  
  // 登录
  async function login(credentials) {
    isLoading.value = true
    try {
      const response = await userApi.login(credentials)
      token.value = response.token
      userInfo.value = response.user
      
      // 保存到localStorage
      localStorage.setItem('token', response.token)
      localStorage.setItem('userInfo', JSON.stringify(response.user))
      
      return response
    } catch (error) {
      throw error
    } finally {
      isLoading.value = false
    }
  }
  
  // 注册
  async function register(userData) {
    isLoading.value = true
    try {
      const response = await userApi.register(userData)
      token.value = response.token
      userInfo.value = response.user
      
      // 保存到localStorage
      localStorage.setItem('token', response.token)
      localStorage.setItem('userInfo', JSON.stringify(response.user))
      
      return response
    } catch (error) {
      throw error
    } finally {
      isLoading.value = false
    }
  }
  
  // 登出
  function logout() {
    token.value = ''
    userInfo.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('userInfo')
  }
  
  // 获取用户信息
  async function fetchUserProfile() {
    if (!token.value) return
    
    try {
      const response = await userApi.getProfile()
      userInfo.value = response
      localStorage.setItem('userInfo', JSON.stringify(response))
    } catch (error) {
      console.error('获取用户信息失败:', error)
      if (error.response?.status === 401) {
        logout()
      }
    }
  }
  
  return {
    token,
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
