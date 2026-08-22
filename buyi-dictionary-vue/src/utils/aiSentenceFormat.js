// AI 造句结果格式化：DeepSeek 流式返回有时带 Markdown 代码围栏，
// 需要先剥离围栏再尝试解析 JSON，映射为用户友好的多行文本

// 各字段兼容的键名集合（英文键 + 中文键及常见变体，依序匹配）
const SENTENCE_KEYS = ['sentence', '例句']
const TRANSLATION_KEYS = ['translation', '翻译']
const GRAMMAR_KEYS = ['grammar_note', 'grammarNote', 'grammar', '语法说明', '语法']

// 剥离 Markdown 代码围栏：开头的 ```json 或 ```，以及结尾的 ```
function stripCodeFence(text) {
  return text
    .replace(/^\s*```(?:json)?[^\S\n]*\n?/, '')
    .replace(/\n?[^\S\n]*```\s*$/, '')
}

// 依序取第一个值为非空字符串的键，找不到返回 null
function pickFirstString(obj, keys) {
  for (const key of keys) {
    const value = obj?.[key]
    if (typeof value === 'string' && value.trim()) return value.trim()
  }
  return null
}

// 格式化 AI 造句内容：
// 1) 空值/非字符串返回 ''，不抛错
// 2) 剥离围栏后若为合法 JSON 对象，提取例句/翻译/语法说明映射为多行文本
// 3) 解析失败或提取不到已知字段时，回退返回剥离围栏后的原文
export function formatAiSentence(content) {
  if (typeof content !== 'string' || !content.trim()) return ''

  const stripped = stripCodeFence(content).trim()

  let parsed = null
  try {
    parsed = JSON.parse(stripped)
  } catch {
    parsed = null
  }

  // 解析失败或非普通对象（数字/字符串/数组等）时回退原文
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    return stripped
  }

  const sentence = pickFirstString(parsed, SENTENCE_KEYS)
  const translation = pickFirstString(parsed, TRANSLATION_KEYS)
  const grammar = pickFirstString(parsed, GRAMMAR_KEYS)

  const parts = []
  if (sentence) parts.push(`例句：${sentence}`)
  if (translation) parts.push(`翻译：${translation}`)
  if (grammar) parts.push(`语法说明：${grammar}`)

  // 未知键对象提取不到任何已知字段时，同样回退原文
  return parts.length ? parts.join('\n') : stripped
}
