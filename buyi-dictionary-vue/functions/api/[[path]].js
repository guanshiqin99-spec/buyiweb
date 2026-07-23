const FORWARDED_REQUEST_HEADERS = ['Authorization', 'Content-Type', 'Accept']

export async function onRequest(context) {
  const { request } = context

  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Methods': 'GET, HEAD, POST, PUT, PATCH, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': FORWARDED_REQUEST_HEADERS.join(', ')
      }
    })
  }

  const backendUrl = context.env?.BACKEND_URL?.trim()
  if (!backendUrl) {
    return Response.json(
      {
        error: 'Backend unavailable',
        message: 'Cloudflare Pages environment variable BACKEND_URL is not configured.'
      },
      { status: 503 }
    )
  }

  const requestUrl = new URL(request.url)
  const path = requestUrl.pathname.replace(/^\/api(?=\/|$)/, '') || '/'
  const targetUrl = `${backendUrl.replace(/\/+$/, '')}${path}${requestUrl.search}`
  const headers = new Headers()

  for (const name of FORWARDED_REQUEST_HEADERS) {
    const value = request.headers.get(name)
    if (value !== null) headers.set(name, value)
  }

  try {
    const upstream = await fetch(targetUrl, {
      method: request.method,
      headers,
      body: request.method === 'GET' || request.method === 'HEAD' ? undefined : request.body
    })
    const responseHeaders = new Headers(upstream.headers)

    return new Response(upstream.body, {
      status: upstream.status,
      headers: responseHeaders
    })
  } catch (error) {
    return Response.json(
      {
        error: 'Proxy error',
        message: error instanceof Error ? error.message : String(error)
      },
      { status: 502 }
    )
  }
}
