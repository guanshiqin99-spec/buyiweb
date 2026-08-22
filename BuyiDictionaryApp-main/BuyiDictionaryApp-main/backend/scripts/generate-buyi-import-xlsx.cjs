// 主脚本：生成布依词典批量导入 Excel（词条/短语/谚语）
// 用法：node scripts/generate-buyi-import-xlsx.cjs（在 backend 目录下）
// 输出：项目根 data-import/ 目录下三个 xlsx，通过 admin 后台「内容管理-导入」批量灌入
const path = require('path');
const fs = require('fs');
const XLSX = require('xlsx');

const { dictClean } = require('./buyi-data-dict.cjs');
const { dict2 } = require('./buyi-data-dict2.cjs');
const { phrases, proverbs } = require('./buyi-data-phrases.cjs');

const allDict = [...dictClean, ...dict2];

const OUT_DIR = path.join(__dirname, '..', '..', '..', '..', 'data-import');
fs.mkdirSync(OUT_DIR, { recursive: true });

function writeSheet(rows, headers, filename) {
  const data = rows.map(r => Object.fromEntries(headers.map((h, i) => [h, r[i]])));
  const ws = XLSX.utils.json_to_sheet(data, { header: headers });
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
  const out = path.join(OUT_DIR, filename);
  XLSX.writeFile(wb, out);
  return out;
}

const headers = ['布依语', '中文释义', '英文释义', '说明', '排序值', '发布状态'];

const dictRows = allDict.map(([b, zh, en, desc, sort]) => [b, zh, en, desc, sort, '是']);
console.log(`词条: ${allDict.length} 条 -> ${writeSheet(dictRows, headers, '词条导入.xlsx')}`);

const phraseRows = phrases.map(([b, zh, en, desc, sort]) => [b, zh, en, desc, sort, '是']);
console.log(`短语: ${phrases.length} 条 -> ${writeSheet(phraseRows, headers, '短语导入.xlsx')}`);

const proverbRows = proverbs.map(([b, zh, en, desc, sort]) => [b, zh, en, desc, sort, '是']);
console.log(`谚语: ${proverbs.length} 条 -> ${writeSheet(proverbRows, headers, '谚语导入.xlsx')}`);

console.log('\n全部生成完成。导入方式：admin 后台 -> 内容管理 -> 对应类型 -> 导入（建议 upsert 模式）。');
