// Vite 兼容垫片：让纯 Node（node:test）也能直接 import 业务模块
// 1) resolve 钩子：为无扩展名的相对路径补 .js，并把 @/ 别名映射到 src/，对齐 Vite 的解析行为
// 2) load 钩子：把 import.meta.env 改写为全局占位对象，避免访问报错

// @/ 别名目标：vite.config.js 中 '@' -> ./src，垫片从 tests/ 目录定位到 src/
const srcBase = new URL('../src/', import.meta.url)

export async function resolve(specifier, context, nextResolve) {
  // @/ 别名：'@/utils/api' -> src/utils/api.js（无扩展名时补 .js）
  if (specifier.startsWith('@/')) {
    const rest = specifier.slice(2)
    const slashIndex = rest.lastIndexOf('/')
    const lastSegment = slashIndex >= 0 ? rest.slice(slashIndex + 1) : rest
    const hasExtension = lastSegment.includes('.')
    const target = hasExtension ? rest : rest + '.js'
    return nextResolve(new URL(target, srcBase).href, context)
  }

  const isRelative = specifier.startsWith('./') || specifier.startsWith('../')
  const slashIndex = specifier.lastIndexOf('/')
  const lastSegment = slashIndex >= 0 ? specifier.slice(slashIndex + 1) : specifier
  const hasExtension = lastSegment.includes('.')
  if (isRelative && !hasExtension) {
    try {
      return await nextResolve(specifier + '.js', context)
    } catch {
      // 落到默认解析，交由 Node 抛出原始错误
    }
  }
  return nextResolve(specifier, context)
}

export async function load(url, context, nextLoad) {
  const result = await nextLoad(url, context)
  // 仅处理项目内文件，避免无谓地读取 node_modules 源码
  if (typeof url === 'string' && (url.includes('/src/') || url.includes('/tests/'))) {
    if (result.source != null && typeof result.source !== 'string') {
      // Node 默认 loader 返回 Buffer/Uint8Array，转成字符串便于改写
      result.source = Buffer.from(result.source).toString('utf8')
    }
    if (typeof result.source === 'string' && result.source.includes('import.meta.env')) {
      result.source = result.source.replaceAll('import.meta.env', 'globalThis.__VITE_ENV__')
    }
  }
  return result
}
