import { defineStore } from 'pinia'

// 全局搜索 Modal 状态：供 App.vue 全局挂载 + "/" 热键 + Home 触发器共享
export const useSearchStore = defineStore('search', {
  state: () => ({ isOpen: false }),
  actions: {
    open() { this.isOpen = true },
    close() { this.isOpen = false }
  }
})
