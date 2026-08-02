// 生成 PNG vs WebP 并排对比图（用于本地观感对比）
import sharp from 'sharp'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const base = fileURLToPath(new URL('../src/assets/images', import.meta.url))
const name = 'bouyei-batik-atmosphere'
const out = fileURLToPath(new URL('../../docs/QA/png-vs-webp-comparison.png', import.meta.url))

const W = 600
const GAP = 44
const H = 600

const left = await sharp(join(base, `${name}.png`)).resize({ width: W, height: H }).png().toBuffer()
const right = await sharp(join(base, `${name}.webp`)).resize({ width: W, height: H }).png().toBuffer()

const totalW = W * 2 + GAP
const canvas = await sharp({
  create: { width: totalW, height: H, channels: 4, background: { r: 255, g: 255, b: 255, alpha: 1 } },
})
  .composite([
    { input: left, left: 0, top: 0 },
    { input: right, left: W + GAP, top: 0 },
  ])
  .png()
  .toBuffer()

// 标注（用 SVG 避免字体依赖）
const svgLabel = Buffer.from(`
<svg width="${totalW}" height="60" xmlns="http://www.w3.org/2000/svg">
  <rect width="${totalW}" height="60" fill="white"/>
  <text x="${W / 2}" y="36" text-anchor="middle" font-size="22" fill="#333">PNG 原图 · 3.3MB</text>
  <text x="${W + GAP + W / 2}" y="36" text-anchor="middle" font-size="22" fill="#333">WebP q90 · 692KB</text>
</svg>`)

const labeled = await sharp(canvas)
  .composite([{ input: svgLabel, left: 0, top: H }])
  .png()
  .toFile(out)

console.log(`对比图已生成: ${out}`)
