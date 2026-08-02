import test from 'node:test'
import assert from 'node:assert/strict'
import { createPinia, setActivePinia } from 'pinia'
import { favoritesApi } from '../src/utils/api.js'
import { AUTH_SESSION_CLEARED_EVENT } from '../src/utils/authInterceptor.js'
import { useFavoritesStore } from '../src/stores/favorites.js'

// —— mock 浏览器环境：localStorage + window 事件 ——
function setupEnv() {
  const store = new Map()
  globalThis.localStorage = {
    getItem: (k) => (store.has(k) ? store.get(k) : null),
    setItem: (k, v) => store.set(k, String(v)),
    removeItem: (k) => store.delete(k),
    clear: () => store.clear()
  }

  const listeners = new Map()
  const dispatched = []
  globalThis.window = {
    addEventListener: (type, fn) => listeners.set(type, fn),
    removeEventListener: (type) => listeners.delete(type),
    dispatchEvent: (event) => {
      dispatched.push(event)
      listeners.get(event.type)?.(event)
    }
  }
  return { listeners, dispatched }
}

function stubApi() {
  const original = { ...favoritesApi }
  const calls = []
  favoritesApi.list = async () => {
    calls.push('list')
    return { dictionary: [], phrases: [], proverbs: [], songs: [] }
  }
  favoritesApi.toggle = async (contentType, contentId) => {
    calls.push(['toggle', contentType, contentId])
    return { isFavorited: true }
  }
  favoritesApi.clear = async () => {
    calls.push('clear')
    return { success: true }
  }
  return { calls, restore: () => Object.assign(favoritesApi, original) }
}

test('toggleFavorite 插入时归一化多端字段形态', async () => {
  setupEnv()
  setActivePinia(createPinia())
  const stub = stubApi()

  const store = useFavoritesStore()
  // Web 端字段形态
  await store.toggleFavorite('dictionary', 7, { buyiText: 'byac', zhText: '鱼' })
  assert.equal(store.favorites[0].title, 'byac')
  assert.equal(store.favorites[0].buyiText, 'byac')
  assert.equal(store.favorites[0].zhText, '鱼')
  assert.equal(store.favorites[0].contentId, 7)

  // 小程序端字段形态（bouyei / chinese）
  await store.toggleFavorite('dictionary', 3, { bouyei: 'xib', chinese: '十' })
  assert.equal(store.favorites[0].buyiText, 'xib')
  assert.equal(store.favorites[0].zhText, '十')
  assert.equal(store.favorites[0].contentId, 3)
  stub.restore()
})

test('fetchFavorites 归一化数组、items 与四分组响应', async () => {
  setupEnv()
  setActivePinia(createPinia())
  const stub = stubApi()

  // 四分组响应
  favoritesApi.list = async () => ({
    dictionary: [{ id: 1 }],
    phrases: [{ id: 2 }],
    proverbs: [{ id: 3 }],
    songs: [{ id: 4, title: '歌' }]
  })
  let store = useFavoritesStore()
  await store.fetchFavorites()
  assert.equal(store.favorites.length, 4)
  assert.equal(store.favorites[0].contentType, 'dictionary')
  assert.equal(store.favorites[1].contentType, 'phrase')
  assert.equal(store.favorites[2].contentType, 'proverb')
  assert.equal(store.favorites[3].contentType, 'song')
  assert.equal(store.favorites[3].title, '歌')

  // items 形态
  favoritesApi.list = async () => ({ items: [{ id: 9, buyiText: 'c' }] })
  store = useFavoritesStore()
  await store.fetchFavorites()
  assert.equal(store.favorites.length, 1)
  assert.equal(store.favorites[0].buyiText, 'c')

  // 裸数组形态
  favoritesApi.list = async () => [{ id: 5, buyiText: 'a' }, { id: 6, buyiText: 'b' }]
  store = useFavoritesStore()
  await store.fetchFavorites()
  assert.equal(store.favorites.length, 2)
  stub.restore()
})

test('fetchFavorites 拉取并归一化收藏列表', async () => {
  setupEnv()
  setActivePinia(createPinia())
  const stub = stubApi()
  favoritesApi.list = async () => ({
    dictionary: [{ id: 1, buyiText: 'mbauq', zhText: '人' }]
  })

  const store = useFavoritesStore()
  await store.fetchFavorites()
  assert.equal(store.favorites.length, 1)
  assert.equal(store.favorites[0].contentType, 'dictionary')
  assert.equal(store.favoriteCount, 1)
  assert.equal(store.isFavorite('dictionary', 1), true)
  assert.equal(store.isFavorite('dictionary', '1'), true, '字符串与数字 id 应等价')
  assert.equal(store.isFavorite('song', 1), false)
  stub.restore()
})

test('fetchFavorites 失败抛出且不留下 loading 态', async () => {
  setupEnv()
  setActivePinia(createPinia())
  const stub = stubApi()
  favoritesApi.list = async () => {
    throw new Error('network')
  }

  const store = useFavoritesStore()
  await assert.rejects(() => store.fetchFavorites())
  assert.equal(store.isLoading, false)
  stub.restore()
})

test('toggleFavorite 收藏成功时置顶插入', async () => {
  setupEnv()
  setActivePinia(createPinia())
  const stub = stubApi()

  const store = useFavoritesStore()
  await store.toggleFavorite('dictionary', 9, { buyiText: 'daz', zhText: '写' })
  assert.equal(store.favorites.length, 1)
  assert.equal(store.favorites[0].contentType, 'dictionary')
  assert.equal(store.favorites[0].contentId, 9)
  stub.restore()
})

test('toggleFavorite 取消收藏时移除', async () => {
  setupEnv()
  setActivePinia(createPinia())
  const stub = stubApi()
  favoritesApi.toggle = async () => ({ isFavorited: false })

  const store = useFavoritesStore()
  store.favorites = [{ contentType: 'dictionary', contentId: 5, title: 'x' }]
  await store.toggleFavorite('dictionary', 5)
  assert.equal(store.favorites.length, 0)
  stub.restore()
})

test('toggleFavorite 响应缺字段时回退全量拉取', async () => {
  setupEnv()
  setActivePinia(createPinia())
  const stub = stubApi()
  favoritesApi.toggle = async () => ({})
  favoritesApi.list = async () => ({ dictionary: [{ id: 1, buyiText: 'noix', zhText: '肉' }] })

  const store = useFavoritesStore()
  await store.toggleFavorite('dictionary', 1)
  assert.equal(store.favorites.length, 1)
  assert.equal(store.favorites[0].buyiText, 'noix')
  stub.restore()
})

test('clearFavorites 清空列表', async () => {
  setupEnv()
  setActivePinia(createPinia())
  const stub = stubApi()

  const store = useFavoritesStore()
  store.favorites = [{ contentType: 'dictionary', contentId: 1 }]
  await store.clearFavorites()
  assert.equal(store.favorites.length, 0)
  assert.ok(stub.calls.includes('clear'))
  stub.restore()
})

test('会话清除事件（登出/401）清空收藏，避免跨账号残留', () => {
  setupEnv()
  setActivePinia(createPinia())
  const stub = stubApi()

  const store = useFavoritesStore()
  store.favorites = [{ contentType: 'song', contentId: 1 }]
  window.dispatchEvent(new Event(AUTH_SESSION_CLEARED_EVENT))
  assert.equal(store.favorites.length, 0)
  stub.restore()
})
