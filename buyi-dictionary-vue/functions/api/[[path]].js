const BACKEND_URL = 'https://casting-object-link-hide.trycloudflare.com/api'

export async function onRequest(context) {
  // Debug: return simple response to verify function runs
  const { request } = context
  const url = new URL(request.url)
  const path = url.pathname.replace(/^\/api/, '') || '/'
  const targetUrl = BACKEND_URL + path + url.search

  // 处理 CORS 预检
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'access-control-allow-origin': '*',
        'access-control-allow-methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'access-control-allow-headers': 'Authorization, Content-Type, Accept'
      }
    })
  }

  try {
    const response = await fetch(targetUrl, {
      method: request.method,
      headers: { 'accept': 'application/json' },
      redirect: 'follow'
    })
    const body = await response.text()
    return new Response(body, {
      status: response.status,
      headers: {
        'content-type': 'application/json',
        'access-control-allow-origin': '*'
      }
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Proxy error', message: error.message, target: targetUrl }), {
      status: 502,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}
