import test from 'node:test'
import assert from 'node:assert/strict'
import {
  getContentLabel,
  getContentRoute,
  getContentApiPath,
  isKnownContentType,
  CONTENT_TYPE_KEYS
} from '../src/utils/contentTypes.js'

test('getContentLabel 返回各内容类型的中文标签', () => {
  assert.equal(getContentLabel('dictionary'), '词汇')
  assert.equal(getContentLabel('phrase'), '短语')
  assert.equal(getContentLabel('proverb'), '谚语')
  assert.equal(getContentLabel('song'), '民歌')
})

test('getContentLabel 对未注册的类型兜底返回默认标签', () => {
  // 'word' 在 Dictionary.vue 的视图层被映射为 'dictionary'，不会进入此模块
  assert.equal(getContentLabel('word'), '内容')
  assert.equal(getContentLabel('unknown'), '内容')
  assert.equal(getContentLabel(undefined), '内容')
  assert.equal(getContentLabel(''), '内容')
})

test('getContentRoute 返回各类型对应的路由路径', () => {
  assert.equal(getContentRoute('dictionary'), '/dictionary')
  assert.equal(getContentRoute('phrase'), '/dictionary')
  assert.equal(getContentRoute('proverb'), '/dictionary')
  assert.equal(getContentRoute('song'), '/songs')
})

test('getContentRoute 对未注册的类型兜底返回词典路由', () => {
  assert.equal(getContentRoute('unknown'), '/dictionary')
})

test('getContentApiPath 返回各类型对应的 API 路径段', () => {
  assert.equal(getContentApiPath('dictionary'), 'dictionary')
  assert.equal(getContentApiPath('phrase'), 'phrases')
  assert.equal(getContentApiPath('proverb'), 'proverbs')
  assert.equal(getContentApiPath('song'), 'songs')
})

test('getContentApiPath 对未注册的类型兜底返回 dictionary', () => {
  assert.equal(getContentApiPath('unknown'), 'dictionary')
})

test('isKnownContentType 仅对已注册类型返回 true', () => {
  assert.equal(isKnownContentType('dictionary'), true)
  assert.equal(isKnownContentType('phrase'), true)
  assert.equal(isKnownContentType('proverb'), true)
  assert.equal(isKnownContentType('song'), true)
  assert.equal(isKnownContentType('word'), false)
  assert.equal(isKnownContentType('unknown'), false)
  assert.equal(isKnownContentType(undefined), false)
})

test('CONTENT_TYPE_KEYS 包含全部预期类型且顺序稳定', () => {
  assert.deepEqual(CONTENT_TYPE_KEYS, ['dictionary', 'phrase', 'proverb', 'song'])
})
