import { defineStore } from 'pinia'

// 主题管理：light / dark / auto（跟随系统）
// 通过 documentElement data-theme 属性 + color-scheme 应用
const STORAGE_KEY = 'buyi_theme'
const FONT_STORAGE_KEY = 'buyi-font-size'

// 字体大小档位：small / medium / large，映射到根元素 px 值
const FONT_SIZE_MAP = { small: '14px', medium: '16px', large: '18px' }

function getStored() {
  try {
    return localStorage.getItem(STORAGE_KEY) || 'light'
  } catch (e) {
    return 'light'
  }
}

function getStoredFontSize() {
  try {
    const stored = localStorage.getItem(FONT_STORAGE_KEY)
    return stored && FONT_SIZE_MAP[stored] ? stored : 'medium'
  } catch (e) {
    return 'medium'
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
  if (meta) meta.setAttribute('content', resolved === 'dark' ? '#0f1419' : '#F7F5F2')
}

function applyFontSize(size) {
  document.documentElement.style.fontSize = FONT_SIZE_MAP[size] || FONT_SIZE_MAP.medium
}

export const useThemeStore = defineStore('theme', {
  state: () => ({
    mode: getStored(), // 'light' | 'dark' | 'auto'
    resolved: resolveTheme(getStored()),
    fontSize: getStoredFontSize() // 'small' | 'medium' | 'large'
  }),
  actions: {
    init() {
      applyTheme(this.resolved)
      applyFontSize(this.fontSize)
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
    },
    setFontSize(size) {
      if (!FONT_SIZE_MAP[size]) return
      this.fontSize = size
      applyFontSize(size)
      try { localStorage.setItem(FONT_STORAGE_KEY, size) } catch (e) { /* 静默忽略 */ }
    }
  }
})
