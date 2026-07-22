export async function onRequest() {
  return new Response('pong from CF Function', {
    headers: { 'content-type': 'text/plain' }
  })
}
