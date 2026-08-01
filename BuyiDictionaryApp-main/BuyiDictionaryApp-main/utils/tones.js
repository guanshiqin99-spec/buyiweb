// 布依语六个舒声调静态数据：调值数字与起止频率可参考 toneSynth.js
const buyiTones = [
  { name: '第一调', value: 55, description: '高平调' },
  { name: '第二调', value: 11, description: '低平调' },
  { name: '第三调', value: 53, description: '高降调' },
  { name: '第四调', value: 31, description: '低降调' },
  { name: '第五调', value: 24, description: '中升调' },
  { name: '第六调', value: 33, description: '中平调' }
];

// 按数字键 1-6 解析为声调索引，越界或非法返回 -1
function toneIndexFromKey(key, length = buyiTones.length) {
  if (!/^[1-6]$/.test(String(key))) return -1;
  const index = Number(key) - 1;
  return index < length ? index : -1;
}

module.exports = {
  buyiTones,
  toneIndexFromKey,
};
