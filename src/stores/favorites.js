import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { userApi } from '@/utils/api'

export const useFavoritesStore = defineStore('favorites', () => {
  // 状态
  const favorites = ref([])
  const isLoading = ref(false)
  
  // 计算属性
  const favoriteCount = computed(() => favorites.value.length)
  
  // 检查是否已收藏
  function isFavorite(id) {
    return favorites.value.some(item => item.id === id)
  }
  
  // 获取收藏列表
  async function fetchFavorites(params = {}) {
    isLoading.value = true
    try {
      const response = await userApi.getFavorites(params)
      favorites.value = response.data || response
      return response
    } catch (error) {
      console.error('获取收藏列表失败:', error)
      throw error
    } finally {
      isLoading.value = false
    }
  }
  
  // 添加收藏
  async function addFavorite(item) {
    try {
      await userApi.addFavorite(item)
      favorites.value.unshift(item)
      return true
    } catch (error) {
      console.error('添加收藏失败:', error)
      throw error
    }
  }
  
  // 删除收藏
  async function removeFavorite(id) {
    try {
      await userApi.removeFavorite(id)
      favorites.value = favorites.value.filter(item => item.id !== id)
      return true
    } catch (error) {
      console.error('删除收藏失败:', error)
      throw error
    }
  }
  
  // 切换收藏状态
  async function toggleFavorite(item) {
    if (isFavorite(item.id)) {
      return await removeFavorite(item.id)
    } else {
      return await addFavorite(item)
    }
  }
  
  // 清空收藏
  function clearFavorites() {
    favorites.value = []
  }
  
  return {
    favorites,
    isLoading,
    favoriteCount,
    isFavorite,
    fetchFavorites,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    clearFavorites
  }
})
