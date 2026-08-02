// 检查图片编码类型与体积（progressive 或 baseline）
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

const files = walk(base).filter((f) => /\.(jpg|jpeg|png|webp)$/i.test(f))
console.log('格式   渐进式    大小      路径')
console.log('-'.repeat(64))
for (const f of files) {
  const m = await sharp(f).metadata()
  const kb = Math.round(statSync(f).size / 1024)
  if (kb > 100) {
    console.log(
      `${m.format.padEnd(6)} ${String(m.progressive ?? 'n/a').padEnd(5)} ${String(kb).padStart(6)}KB  ${f.split(base)[1]}`
    )
  }
}
