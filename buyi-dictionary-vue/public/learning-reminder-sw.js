self.addEventListener('push', (event) => {
  let payload = {}
  try { payload = event.data?.json() || {} } catch { payload = { body: event.data?.text() || '' } }
  event.waitUntil(self.registration.showNotification(payload.title || '今天也来学一点布依语吧', {
    body: payload.body || '打开布依词典，复习几个词或完成一轮文化答题。',
    tag: 'buyi-daily-learning-reminder',
    data: { url: payload.url || '/learn' }
  }))
})

self.addEventListener('periodicsync', (event) => {
  if (event.tag !== 'buyi-daily-learning-reminder') return
  event.waitUntil(self.registration.showNotification('今天也来学一点布依语吧', {
    body: '打开布依词典，复习几个词或完成一轮文化答题。',
    tag: 'buyi-daily-learning-reminder',
    data: { url: '/learn' }
  }))
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const targetUrl = event.notification.data?.url || '/learn'
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      const existing = clients.find((client) => 'focus' in client)
      if (existing) {
        existing.navigate(targetUrl)
        return existing.focus()
      }
      return self.clients.openWindow(targetUrl)
    })
  )
})

const API_CACHE_NAME = 'buyi-miniapp-api-v1'

async function getApiCacheKey(request) {
  const authorization = request.headers.get('Authorization')
  if (!authorization) return request
  if (!self.crypto?.subtle) return null

  const digest = await self.crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(authorization)
  )
  const userKey = Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('')
  const cacheUrl = new URL(request.url)
  cacheUrl.searchParams.set('__buyi_user', userKey)
  return new Request(cacheUrl.toString(), { method: 'GET' })
}

async function networkFirstApi(request) {
  const cacheKey = await getApiCacheKey(request)

  try {
    const response = await fetch(request)
    if (response.ok && cacheKey) {
      const cache = await caches.open(API_CACHE_NAME)
      await cache.put(cacheKey, response.clone())
    }

    if (response.status >= 500 && cacheKey) {
      return (await caches.match(cacheKey)) || response
    }
    return response
  } catch (error) {
    if (cacheKey) {
      const cached = await caches.match(cacheKey)
      if (cached) return cached
    }
    throw error
  }
}

self.addEventListener('fetch', (event) => {
  const request = event.request
  const url = new URL(request.url)
  if (request.method !== 'GET' || !url.pathname.startsWith('/api/miniapp/')) return
  event.respondWith(networkFirstApi(request))
})
