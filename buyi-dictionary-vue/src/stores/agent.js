import { defineStore } from 'pinia'
import { agentApi } from '@/utils/api'

// 布依文化导览员：角色定义 + 上下文读取 + DeepSeek 流式问答
const AGENT_ROLE = {
  name: '布依文化导览员',
  intro: '我是布依文化导览员，可以为你讲解布依语词汇、声调、民歌、谚语、纹样与民俗。'
}

// 各页面的场景化快捷提问模板
const CONTEXT_TEMPLATES = {
  '/dictionary': ['这个词的来源是什么？', '布依语声调怎么读？', '举一个布依语例句'],
  '/culture': ['讲解这个纹样的含义', '蜡染工艺的步骤有哪些？', '铜鼓纹象征什么？'],
  '/songs': ['这首歌的背景是什么？', '布依族有哪些民歌类型？'],
  '/learn': ['这个词汇怎么记？', '布依语语法有什么特点？'],
  '/': ['布依族主要分布在哪里？', '布依语有多少个声调？', '布依族有什么节日？']
}

export const useAgentStore = defineStore('agent', {
  state: () => ({
    isOpen: false,
    messages: [{ role: 'agent', text: AGENT_ROLE.intro }],
    contextPath: '/',
    loading: false,
    _controller: null
  }),
  getters: {
    quickQuestions(state) {
      return CONTEXT_TEMPLATES[state.contextPath] || CONTEXT_TEMPLATES['/']
    }
  },
  actions: {
    open(path) {
      if (path) this.contextPath = path
      this.isOpen = true
    },
    close() {
      this.isOpen = false
    },
    setContext(path) {
      this.contextPath = path || '/'
    },
    ask(question, path) {
      // 页面级场景化入口：打开面板并直接提问
      if (path) this.contextPath = path
      this.isOpen = true
      this.send(question)
    },
    send(question) {
      const text = (question || '').trim()
      if (!text || this.loading) return

      this.messages.push({ role: 'user', text })
      this.messages.push({ role: 'agent', text: '' })
      const agentIndex = this.messages.length - 1
      this.loading = true

      // 取最近 6 条非空消息作为历史（不含当前占位）
      const history = this.messages
        .slice(0, -1)
        .filter((m) => m.text)
        .slice(-6)
        .map((m) => ({
          role: m.role === 'user' ? 'user' : 'assistant',
          content: m.text
        }))

      this._controller = agentApi.askStream({
        question: text,
        history,
        onDelta: (chunk) => {
          this.messages[agentIndex].text += chunk
        },
        onDone: () => {
          this.loading = false
          this._controller = null
          if (!this.messages[agentIndex].text) {
            this.messages[agentIndex].text = '（未收到回复）'
          }
        },
        onError: (err) => {
          this.loading = false
          this._controller = null
          if (!this.messages[agentIndex].text) {
            this.messages[agentIndex].text = '抱歉，智能体响应失败，请稍后重试。'
          } else {
            this.messages[agentIndex].text += '\n\n[响应中断]'
          }
          console.error('[agent] 响应失败:', err)
        }
      })
    },
    stop() {
      if (this._controller) {
        this._controller.abort()
        this._controller = null
        this.loading = false
      }
    },
    reset() {
      this.stop()
      this.messages = [{ role: 'agent', text: AGENT_ROLE.intro }]
    }
  }
})
