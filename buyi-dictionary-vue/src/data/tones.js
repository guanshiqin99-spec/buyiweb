export const buyiTones = [
  { name: '第一调', value: 55, description: '高平调' },
  { name: '第二调', value: 11, description: '低平调' },
  { name: '第三调', value: 53, description: '高降调' },
  { name: '第四调', value: 31, description: '低降调' },
  { name: '第五调', value: 24, description: '中升调' },
  { name: '第六调', value: 33, description: '中平调' }
]

export function toneIndexFromKey(key, length = buyiTones.length) {
  if (!/^[1-6]$/.test(String(key))) return -1
  const index = Number(key) - 1
  return index < length ? index : -1
}
