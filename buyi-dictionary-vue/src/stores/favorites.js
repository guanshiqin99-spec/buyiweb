import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { favoritesApi } from '@/utils/api'

export const useFavoritesStore = defineStore('favorites', () => {
  const favorites = ref([])
  const isLoading = ref(false)

  const favoriteCount = computed(() => favorites.value.length)

  function isFavorite(contentType, contentId) {
    return favorites.value.some(
      (item) => item.contentType === contentType && String(item.contentId) === String(contentId)
    )
  }

  function normalizeFavorite(item = {}, fallbackType = 'dictionary', fallbackId = null) {
    const contentType = item.contentType || fallbackType
    const contentId = item.contentId ?? item.id ?? fallbackId
    return {
      ...item,
      contentType,
      contentId,
      title: item.title || item.buyiText || item.zhText || '',
      buyiText: item.buyiText || item.bouyei || '',
      zhText: item.zhText || item.chinese || '',
      subtitle: item.subtitle || item.artist || item.description || '',
      chinese: item.chinese || item.zhText || ''
    }
  }

  function normalizeFavoriteList(response) {
    if (Array.isArray(response)) return response.map((item) => normalizeFavorite(item))

    const flatList = response?.items || response?.list
    if (Array.isArray(flatList)) return flatList.map((item) => normalizeFavorite(item))

    const groups = [
      ['dictionary', 'dictionary'],
      ['phrases', 'phrase'],
      ['proverbs', 'proverb'],
      ['songs', 'song']
    ]
    return groups.flatMap(([key, contentType]) =>
      (response?.[key] || []).map((item) => normalizeFavorite(item, contentType))
    )
  }

  async function fetchFavorites() {
    isLoading.value = true
    try {
      const response = await favoritesApi.list()
      favorites.value = normalizeFavoriteList(response)
      return response
    } catch (error) {
      console.error('获取收藏列表失败:', error)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  // 切换收藏状态（后端为 toggle 模式）
  async function toggleFavorite(contentType, contentId, content = {}) {
    try {
      const result = await favoritesApi.toggle(contentType, contentId)
      // 兼容当前 NestJS 的 isFavorited 与旧接口的 favorited 字段。
      const favorited = result?.isFavorited ?? result?.favorited ?? result?.data?.isFavorited ?? result?.data?.favorited
      if (favorited) {
        favorites.value = favorites.value.filter(
          (item) => !(item.contentType === contentType && String(item.contentId) === String(contentId))
        )
        favorites.value.unshift(normalizeFavorite(content, contentType, contentId))
      } else {
        favorites.value = favorites.value.filter(
          (item) => !(item.contentType === contentType && String(item.contentId) === String(contentId))
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
