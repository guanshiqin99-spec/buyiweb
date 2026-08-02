// 背景图优化脚本：把 src/assets/images 下的大图（>500KB）转成 WebP
// 产物为同名 .webp，保留原文件；CSS/组件改引用 .webp 后构建即可生效。
//
// 用法：node scripts/optimize-images.mjs [--quality 82]
import sharp from 'sharp'
import { readdirSync, statSync, existsSync } from 'node:fs'
import { join, extname } from 'node:path'
import { fileURLToPath } from 'node:url'

const imagesDir = fileURLToPath(new URL('../src/assets/images', import.meta.url))
const quality = Number(process.argv.find((a) => a.startsWith('--quality='))?.split('=')[1] ?? 82)
const lossless = process.argv.includes('--lossless')
const MIN_SIZE = 500 * 1024 // 500KB 以上才处理
const SUPPORTED = new Set(['.png', '.jpg', '.jpeg'])

function walk(dir, files = []) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name)
    if (statSync(full).isDirectory()) {
      walk(full, files)
    } else {
      files.push(full)
    }
  }
  return files
}

async function main() {
  const files = walk(imagesDir)
  const candidates = files.filter(
    (f) => SUPPORTED.has(extname(f).toLowerCase()) && statSync(f).size > MIN_SIZE
  )
  console.log(`候选大图 ${candidates.length} 个（>${MIN_SIZE / 1024}KB）`)

  let saved = 0
  let totalBefore = 0
  let totalAfter = 0

  for (const file of candidates) {
    const out = file.replace(extname(file), '.webp')
    if (existsSync(out)) {
      console.log(`跳过（已存在）: ${file.split('images' + '\\')[1] ?? file}`)
      continue
    }
    const before = statSync(file).size
    await sharp(file)
      .webp(lossless ? { lossless: true, effort: 4 } : { quality, effort: 4 })
      .toFile(out)
    const after = statSync(out).size
    totalBefore += before
    totalAfter += after
    saved++
    const tag = lossless ? 'lossless' : `q${quality}`
    console.log(
      `${tag.padEnd(9)} ${(before / 1024).toFixed(0)}KB → ${(after / 1024).toFixed(0)}KB  (${(100 - (after / before) * 100).toFixed(0)}%↓)  ${file.split(imagesDir)[1]}`
    )
  }

  if (saved) {
    console.log(`\n完成：${saved} 个，${(totalBefore / 1024 / 1024).toFixed(2)}MB → ${(totalAfter / 1024 / 1024).toFixed(2)}MB`)
  } else {
    console.log('无可转换文件（均已存在 .webp 或小于阈值）')
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
