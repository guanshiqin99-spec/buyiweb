import { apiBaseURL } from '@/utils/api'

export function formatDuration(seconds) {
  const value = Math.floor(Number(seconds) || 0)
  if (value <= 0) return '—'
  const minutes = Math.floor(value / 60)
  const secs = value % 60
  return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
}

// 后端可能返回相对路径（如 /uploads/...），需拼接后端域名以便浏览器直接访问
function resolveMediaUrl(url = '') {
  if (!url) return ''
  if (/^https?:\/\//i.test(url)) return url
  const base = (apiBaseURL || '').replace(/\/api\/?$/, '')
  return `${base}${url.startsWith('/') ? '' : '/'}${url}`
}

const LOCAL_AUDIO_FILES = new Set([
  'buyi-lulonghu.mp3',
  'buyi-wujian.mp3',
  'tuomie-buyi-lujiaxing.mp3',
  'xiaoamei-buyi-lujiaxing.mp3',
  'maliaolei-wangxingfei-wangyufan.mp3',
  'maliaolei-wangxingfei-others.mp3'
])

const fallbackMeta = [
  ['buyi-lulonghu.mp3', '布依', '陆龙华'],
  ['buyi-wujian.mp3', '布依', '吴建'],
  ['tuomie-buyi-lujiaxing.mp3', '托么（来咯魂）', '卢家兴'],
  ['xiaoamei-buyi-lujiaxing.mp3', '小阿妹（妹侬聂）', '卢家兴'],
  ['maliaolei-wangxingfei-wangyufan.mp3', '麻辽勒', '王兴飞、王玉芳'],
  ['maliaolei-wangxingfei-others.mp3', '麻辽勒（四人合唱版）', '王兴飞等']
]

function filenameFromUrl(url = '') {
  try {
    return decodeURIComponent(new URL(url, window.location.origin).pathname.split('/').pop() || '')
  } catch {
    return url.split('?')[0].split('/').pop() || ''
  }
}

function fallbackUrlFor(url) {
  const filename = filenameFromUrl(url)
  return LOCAL_AUDIO_FILES.has(filename) ? `/audio/${filename}` : ''
}

export function toPlayableSong(item, index = 0) {
  const audioUrl = resolveMediaUrl(item?.audioUrl || '')
  const fallbackAudioUrl = fallbackUrlFor(item?.audioUrl || '')
  if (!audioUrl && !fallbackAudioUrl) return null

  return {
    id: item.id ?? `song-${index}`,
    title: item.title || item.zhText || '未命名民歌',
    artist: item.artist || '布依民歌采集',
    genre: item.genre || item.zhText || item.description || '布依民歌',
    coverUrl: resolveMediaUrl(item.coverUrl || ''),
    duration: item.duration ?? null,
    lyrics: item.lyrics || '',
    audioUrl,
    fallbackAudioUrl,
    sourceTitle: item.sourceTitle || '线上曲库资料',
    sourceUrl: item.sourceUrl || '',
    rightsNote: item.rightsNote || '请以发布方提供的来源与授权说明为准。',
    playable: Boolean(audioUrl || fallbackAudioUrl)
  }
}

export function normalizePlayableSongs(items = []) {
  return items.map(toPlayableSong).filter(Boolean)
}

export const fallbackSongs = fallbackMeta.map(([filename, title, artist], index) => ({
  id: index + 1,
  title,
  artist,
  genre: '本地演示民歌',
  coverUrl: '',
  duration: null,
  lyrics: '',
  audioUrl: '',
  fallbackAudioUrl: `/audio/${filename}`,
  sourceTitle: '项目随包演示音源',
  sourceUrl: '',
  rightsNote: '仅限竞赛演示环境使用；公开传播前请核验素材授权。',
  playable: true
}))
