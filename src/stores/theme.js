import { defineStore } from 'pinia'

// 主题管理：light / dark / auto（跟随系统）
// 通过 documentElement data-theme 属性 + color-scheme 应用
const STORAGE_KEY = 'buyi_theme'

function getStored() {
  try {
    return localStorage.getItem(STORAGE_KEY) || 'light'
  } catch (e) {
    return 'light'
  }
}

function systemDark() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

function resolveTheme(mode) {
  return mode === 'auto' ? (systemDark() ? 'dark' : 'light') : mode
}

function applyTheme(resolved) {
  const el = document.documentElement
  el.setAttribute('data-theme', resolved)
  el.style.colorScheme = resolved
  // 同步浏览器 UI 主题色（地址栏/状态栏），覆盖手动切换场景
  const meta = document.querySelector('meta[name="theme-color"]')
  if (meta) meta.setAttribute('content', resolved === 'dark' ? '#0f1419' : '#F5F2EF')
}

export const useThemeStore = defineStore('theme', {
  state: () => ({
    mode: getStored(), // 'light' | 'dark' | 'auto'
    resolved: resolveTheme(getStored())
  }),
  actions: {
    init() {
      applyTheme(this.resolved)
      if (this.mode === 'auto') {
        const mql = window.matchMedia('(prefers-color-scheme: dark)')
        mql.addEventListener('change', this.onSystemChange)
      }
    },
    onSystemChange() {
      if (this.mode !== 'auto') return
      this.resolved = systemDark() ? 'dark' : 'light'
      applyTheme(this.resolved)
    },
    setMode(mode) {
      const prev = this.mode
      this.mode = mode
      this.resolved = resolveTheme(mode)
      applyTheme(this.resolved)
      try { localStorage.setItem(STORAGE_KEY, mode) } catch (e) { /* 静默忽略 */ }
      // 切换 auto 监听
      const mql = window.matchMedia('(prefers-color-scheme: dark)')
      if (mode === 'auto' && prev !== 'auto') {
        mql.addEventListener('change', this.onSystemChange)
      } else if (mode !== 'auto' && prev === 'auto') {
        mql.removeEventListener('change', this.onSystemChange)
      }
    }
  }
})
