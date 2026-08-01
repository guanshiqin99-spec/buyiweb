// 临时脚本：检查可用的图像处理库
const fs = require('fs')
const path = require('path')
const base = 'D:/BuyiDictionaryWeb/buyi-dictionary-vue/node_modules'
const names = ['sharp', 'jpeg-js', 'pngjs', 'canvas', 'image-size', '@napi-rs/canvas']
names.forEach((n) => {
  try {
    const p = require.resolve(n + '/package.json', { paths: [base] })
    const v = JSON.parse(fs.readFileSync(p, 'utf8')).version
    console.log(n, v)
  } catch (e) {
    console.log(n, 'NOT_FOUND')
  }
})
