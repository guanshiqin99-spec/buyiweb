import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { favoritesApi } from '@/utils/api'

export const useFavoritesStore = defineStore('favorites', () => {
  const favorites = ref([])
  const isLoading = ref(false)

  const favoriteCount = computed(() => favorites.value.length)

  function isFavorite(contentType, contentId) {
    return favorites.value.some(
      (item) => item.contentType === contentType && item.contentId === contentId
    )
  }

  async function fetchFavorites() {
    isLoading.value = true
    try {
      const response = await favoritesApi.list()
      favorites.value = Array.isArray(response) ? response : (response.items || [])
      return response
    } catch (error) {
      console.error('获取收藏列表失败:', error)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  // 切换收藏状态（后端为 toggle 模式）
  async function toggleFavorite(contentType, contentId) {
    try {
      const result = await favoritesApi.toggle(contentType, contentId)
      // 后端返回 { favorited } 据此同步本地列表
      if (result.favorited) {
        if (!isFavorite(contentType, contentId)) {
          favorites.value.unshift({ contentType, contentId })
        }
      } else {
        favorites.value = favorites.value.filter(
          (item) => !(item.contentType === contentType && item.contentId === contentId)
        )
      }
      return result
    } catch (error) {
      console.error('切换收藏失败:', error)
      throw error
    }
  }

  async function clearFavorites() {
    try {
      await favoritesApi.clear()
      favorites.value = []
    } catch (error) {
      console.error('清空收藏失败:', error)
      throw error
    }
  }

  return {
    favorites,
    isLoading,
    favoriteCount,
    isFavorite,
    fetchFavorites,
    toggleFavorite,
    clearFavorites
  }
})
