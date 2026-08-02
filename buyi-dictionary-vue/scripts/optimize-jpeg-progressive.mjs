// 将 src/assets/images 下所有 JPEG 原地重写为渐进式编码（progressive）
// 画质用 quality 95 保持；baseline → progressive 仅改变编码顺序，不损失内容
import sharp from 'sharp'
import { readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const base = fileURLToPath(new URL('../src/assets/images', import.meta.url))

function walk(dir) {
  return readdirSync(dir).flatMap((f) => {
    const p = join(dir, f)
    return statSync(p).isDirectory() ? walk(p) : [p]
  })
}

const files = walk(base).filter((f) => /\.(jpe?g)$/i.test(f))
let done = 0
let saved = 0

for (const f of files) {
  const before = statSync(f).size
  const meta = await sharp(f).metadata()
  if (meta.progressive) {
    console.log(`跳过（已渐进）: ${f.split(base)[1]}`)
    continue
  }
  await sharp(f).jpeg({ quality: 95, progressive: true, mozjpeg: false }).toFile(f + '.tmp')
  const tmp = f + '.tmp'
  const { renameSync } = await import('node:fs')
  renameSync(tmp, f)
  const after = statSync(f).size
  done++
  saved += before - after
  console.log(
    `progressive ✓ ${(before / 1024).toFixed(0)}KB → ${(after / 1024).toFixed(0)}KB  ${f.split(base)[1]}`
  )
}

console.log(`\n完成：${done} 个转渐进式，共减少 ${(saved / 1024).toFixed(0)}KB`)
