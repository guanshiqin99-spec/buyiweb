// 内容类型映射单一来源
// 所有视图与工具应通过此模块查询内容类型的中文标签、路由路径与 API 路径段

const CONTENT_TYPES = [
  { key: 'dictionary', label: '词汇', route: '/dictionary', apiPath: 'dictionary' },
  { key: 'phrase', label: '短语', route: '/dictionary', apiPath: 'phrases' },
  { key: 'proverb', label: '谚语', route: '/dictionary', apiPath: 'proverbs' },
  { key: 'song', label: '民歌', route: '/songs', apiPath: 'songs' }
]

const byKey = Object.fromEntries(CONTENT_TYPES.map(c => [c.key, c]))

export function getContentLabel(type) {
  return byKey[type]?.label ?? '内容'
}

export function getContentRoute(type) {
  return byKey[type]?.route ?? '/dictionary'
}

export function getContentApiPath(type) {
  return byKey[type]?.apiPath ?? 'dictionary'
}

export function isKnownContentType(type) {
  return Object.prototype.hasOwnProperty.call(byKey, type)
}

export const CONTENT_TYPE_KEYS = CONTENT_TYPES.map(c => c.key)
