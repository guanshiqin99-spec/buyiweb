// 临时验证脚本：校验 RadarChart.vue / Profile.vue SFC
const path = require('path')
const { parse, compileScript, compileTemplate } = require(path.join(
  'D:/BuyiDictionaryWeb/buyi-dictionary-vue/node_modules/@vue/compiler-sfc'
))
const fs = require('fs')
for (const file of ['RadarChart.vue', 'Profile.vue']) {
  const p = 'D:/BuyiDictionaryWeb/buyi-dictionary-vue/src/' + (file === 'RadarChart.vue' ? 'components/specific/' : 'views/') + file
  const src = fs.readFileSync(p, 'utf8')
  const { descriptor, errors } = parse(src, { filename: file })
  if (errors.length) { console.error(file, 'PARSE_ERRORS:', errors); process.exit(1) }
  compileScript(descriptor, { id: 'verify' })
  const tpl = compileTemplate({ source: descriptor.template.content, filename: file, id: 'verify' })
  if (tpl.errors && tpl.errors.length) { console.error(file, 'TEMPLATE_ERRORS:', tpl.errors); process.exit(1) }
  console.log(file, 'SFC_OK')
}
