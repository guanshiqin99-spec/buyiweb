import { apiBaseURL } from './api'

// 智能体 SSE 流式问答：POST + fetch reader 解析 data: 分片
// agentStream 与 axios 实例解耦，需要自己从 localStorage 读取 token
export function askStream({ question, history, onDelta, onDone, onError }) {
  const controller = new AbortController()
  const token = localStorage.getItem('token')

  fetch(`${apiBaseURL}/miniapp/agent/ask`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: JSON.stringify({ question, history: history ?? [] }),
    signal: controller.signal
  })
    .then(async (resp) => {
      if (!resp.ok) {
        const text = await resp.text().catch(() => '')
        throw new Error(`智能体请求失败 (${resp.status}): ${text.slice(0, 120)}`)
      }
      if (!resp.body) {
        onDone?.()
        return
      }
      const reader = resp.body.getReader()
      const decoder = new TextDecoder('utf-8')
      let buffer = ''
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() ?? ''
        for (const line of lines) {
          const trimmed = line.trim()
          if (!trimmed || !trimmed.startsWith('data:')) continue
          const data = trimmed.slice(5).trim()
          if (!data) continue
          try {
            const payload = JSON.parse(data)
            if (payload.type === 'delta' && payload.content) {
              onDelta?.(payload.content)
            } else if (payload.type === 'done') {
              onDone?.()
              return
            } else if (payload.type === 'error') {
              onError?.(new Error(payload.message || '智能体错误'))
              return
            }
          } catch {
            /* 忽略无法解析的分片 */
          }
        }
      }
      onDone?.()
    })
    .catch((err) => {
      if (err?.name === 'AbortError') return
      onError?.(err instanceof Error ? err : new Error(String(err)))
    })

  return controller
}
