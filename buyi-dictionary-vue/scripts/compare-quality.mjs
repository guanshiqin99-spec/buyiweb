// 一次性脚本：对比 PNG 原图与 WebP 的像素差异（MSE / PSNR / 尺寸变化）
import sharp from 'sharp'
import { statSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const base = fileURLToPath(new URL('../src/assets/images', import.meta.url))

const pairs = [
  ['bouyei-batik-atmosphere', ''],
  ['bg-culture-batik-indigo', ''],
  ['record-learning-tracker', 'generated'],
  ['profile-learning-journal', 'generated'],
  ['dictionary-archive-study', 'generated'],
  ['favorites-archive-shelf', 'generated'],
  ['login-river-bridge', 'generated'],
]

async function loadRgb(file) {
  const { data, info } = await sharp(file).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
  return { data: Buffer.from(data), width: info.width, height: info.height }
}

function mse(a, b) {
  const n = a.length
  let sum = 0
  for (let i = 0; i < n; i++) {
    const d = a[i] - b[i]
    sum += d * d
  }
  return sum / n
}

console.log('文件                       PNG大小    WebP大小    MSE        PSNR(dB)')
console.log('-'.repeat(72))

for (const [name, dir] of pairs) {
  const png = join(base, dir, `${name}.png`)
  const webp = join(base, dir, `${name}.webp`)
  const a = await loadRgb(png)
  const b = await loadRgb(webp)
  const m = mse(a.data, b.data)
  const psnr = 10 * Math.log10(255 * 255 / m)
  const kbPng = (statSync(png).size / 1024).toFixed(0)
  const kbWebp = (statSync(webp).size / 1024).toFixed(0)
  console.log(
    `${name.padEnd(30)} ${kbPng.padStart(6)}KB    ${kbWebp.padStart(6)}KB    ${m.toFixed(1).padStart(7)}   ${psnr.toFixed(1).padStart(6)}`
  )
}

console.log('\n参考：PSNR > 40dB 人眼几乎无法区分；35-40dB 细微差异需仔细对比；30-35dB 有可见差异')
