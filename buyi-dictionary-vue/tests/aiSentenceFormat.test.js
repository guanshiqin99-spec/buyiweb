import test from 'node:test'
import assert from 'node:assert/strict'
import { formatAiSentence } from '../src/utils/aiSentenceFormat.js'

test('带围栏 JSON（英文键）格式化为多行文本', () => {
  const content = '```json\n{"sentence":"ndaelo ndanx miz ruax","translation":"这个小孩很聪明","grammar_note":"miz 作否定前缀"}\n```'
  const result = formatAiSentence(content)
  assert.equal(result, '例句：ndaelo ndanx miz ruax\n翻译：这个小孩很聪明\n语法说明：miz 作否定前缀')
})

test('带围栏 JSON（中文键）格式化为多行文本', () => {
  const content = '```\n{"例句":"ndaelo ndanx","翻译":"小孩","语法说明":"ndanx 泛指孩子"}\n```'
  const result = formatAiSentence(content)
  assert.equal(result, '例句：ndaelo ndanx\n翻译：小孩\n语法说明：ndanx 泛指孩子')
})

test('无围栏纯 JSON 也能格式化', () => {
  const content = '{"sentence":"hoz ndil","translation":"你好","grammar_note":"问候语"}'
  const result = formatAiSentence(content)
  assert.equal(result, '例句：hoz ndil\n翻译：你好\n语法说明：问候语')
})

test('纯文本原文返回并保留换行', () => {
  const content = 'ndaelo ndanx 表示"小孩"。\n常用于日常口语。'
  assert.equal(formatAiSentence(content), content)
})

test('流式中不完整 JSON 不抛错并回退原文', () => {
  const content = '{"sentence":"ndaelo'
  assert.doesNotThrow(() => formatAiSentence(content))
  assert.equal(formatAiSentence(content), content)
})

test('空值与非字符串返回空串', () => {
  assert.equal(formatAiSentence(''), '')
  assert.equal(formatAiSentence('   '), '')
  assert.equal(formatAiSentence(null), '')
  assert.equal(formatAiSentence(undefined), '')
  assert.equal(formatAiSentence(123), '')
})

test('grammarNote 与 grammar 变体键均能识别', () => {
  const camel = formatAiSentence('{"sentence":"hoz","grammarNote":"语气词"}')
  assert.equal(camel, '例句：hoz\n语法说明：语气词')
  const short = formatAiSentence('{"sentence":"hoz","grammar":"省略主语"}')
  assert.equal(short, '例句：hoz\n语法说明：省略主语')
})

test('部分字段缺失时仅输出存在的字段', () => {
  const content = '{"sentence":"hoz ndil","translation":"你好"}'
  const result = formatAiSentence(content)
  assert.equal(result, '例句：hoz ndil\n翻译：你好')
})

test('未知键对象提取不到字段时回退原文', () => {
  const content = '{"example":"hoz","note":"你好"}'
  assert.equal(formatAiSentence(content), content)
})
