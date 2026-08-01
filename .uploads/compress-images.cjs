// 临时脚本：压缩三张文化馆图片到 pages/culture/images/
const sharp = require('D:/BuyiDictionaryWeb/node_modules/sharp')
const src = 'D:/BuyiDictionaryWeb/BuyiDictionaryApp-main/BuyiDictionaryApp-main/assets/images'
const out = 'D:/BuyiDictionaryWeb/BuyiDictionaryApp-main/BuyiDictionaryApp-main/pages/culture/images'

async function main() {
  const jobs = [
    ['bouyei-batik-atmosphere.png', 'batik.jpg'],
    ['bouyei-craft.jpg', 'craft.jpg'],
    ['bouyei-nature.jpg', 'nature.jpg'],
  ]
  for (const [s, d] of jobs) {
    await sharp(src + '/' + s)
      .jpeg({ quality: 80, mozjpeg: true })
      .toFile(out + '/' + d)
    const m = await sharp(out + '/' + d).metadata()
    console.log(d, m.format, m.width + 'x' + m.height, (m.size / 1024).toFixed(0) + 'KB')
  }
}

main().catch((e) => { console.error('FAIL:', e.message); process.exit(1) })
