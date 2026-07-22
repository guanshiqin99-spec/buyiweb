export async function onRequest() {
  try {
    const response = await fetch('http://39.96.81.132:80/api/health')
    const data = await response.text()
    return new Response(data, {
      headers: { 'content-type': 'application/json', 'access-control-allow-origin': '*' }
    })
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 502,
      headers: { 'content-type': 'application/json' }
    })
  }
}
