// 布依词典权威数据种子脚本（修正旧数据 + 灌入全量数据）
// 数据来源与参考文献见 docs/数据来源与参考文献.md
// 运行：npm run seed:verified（backend 目录下）
// 说明：
//   1. 数据与 backend/scripts/buyi-data-*.cjs 共用同一数据源（Excel 导出亦用该数据）
//   2. 旧库中混入的壮语拼写/错误标注词条将被修正或下线
//   3. 按 buyiText + zhText 组合键幂等 upsert，可重复执行
import { DataSource } from 'typeorm';
import { pinyin } from 'pinyin-pro';
import dataSource from '../typeorm-cli.config';
import { DictionaryEntry } from '../entities/dictionary-entry.entity';
import { Phrase } from '../entities/phrase.entity';
import { Proverb } from '../entities/proverb.entity';
import { Song } from '../entities/song.entity';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { dictClean } = require('../../scripts/buyi-data-dict.cjs');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { dict2, dictFixes2 } = require('../../scripts/buyi-data-dict2.cjs');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { phrases, proverbs } = require('../../scripts/buyi-data-phrases.cjs');

// 全量词条 = 第一批（修正后的基础集）+ 第二批（布依汉词典/基础教程扩充）
const allDict = [...dictClean, ...dict2];

type ContentRepo = DataSource['manager'] extends never ? never : import('typeorm').Repository<any>;

function buildZhSortKey(text?: string | null): string {
  const value = (text || '').trim();
  if (!value) return '';
  const result = pinyin(value, { toneType: 'none', type: 'array', nonZh: 'consecutive', v: false });
  const normalized = Array.isArray(result) ? result.join(' ') : String(result);
  return normalized.toLowerCase().replace(/\s+/g, ' ').trim();
}

// ============ 旧数据修正清单 ============
// to 为空表示按 buyiText+expectZh 匹配后删除（壮语混入/无法验证的拼写）
// expectZh 缺省时按 buyiText 匹配第一条
type Fix = {
  buyi: string;
  expectZh?: string;
  to?: { buyiText: string; zhText: string; enText?: string; description?: string };
};

const dictFixes: Fix[] = [
  // —— seed-data.ts 旧词条：拼写不规范 ——
  { buyi: 'na', to: { buyiText: 'naz', zhText: '田；水田', enText: 'paddy field', description: '自然｜D1/D2/D4' } },
  { buyi: 'bya', expectZh: '山', to: { buyiText: 'bol', zhText: '山；山坡', enText: 'mountain; hillside', description: '自然｜D1' } },
  { buyi: 'bya', expectZh: '鱼' },
  { buyi: 're' },
  { buyi: 'ndwen' },
  { buyi: 'nam', to: { buyiText: 'ramx', zhText: '水', enText: 'water', description: '自然｜D1' } },
  { buyi: 'fa' },
  { buyi: 'mok' },
  { buyi: 'va', to: { buyiText: 'wal', zhText: '花', enText: 'flower', description: '植物｜D1' } },
  { buyi: 'ran', to: { buyiText: 'raanz', zhText: '房子；家', enText: 'house; home', description: '场所｜D1/D2/D4' } },
  { buyi: 'ngenz', to: { buyiText: 'xeenz', zhText: '钱', enText: 'money', description: '器物｜D2/D4' } },
  { buyi: 'ma', to: { buyiText: 'max', zhText: '马', enText: 'horse', description: '动物｜D1/D2/D4' } },
  { buyi: 'gai' },
  { buyi: 'moo', to: { buyiText: 'mul', zhText: '猪', enText: 'pig', description: '动物｜D2/D4' } },
  { buyi: 'be', to: { buyiText: 'waaiz', zhText: '水牛', enText: 'water buffalo', description: '动物｜D1/D2' } },
  { buyi: 'duz', expectZh: '狗' },
  { buyi: 'duz', expectZh: '只' },
  { buyi: 'byo' },
  { buyi: 'roog' },
  { buyi: 'ga', to: { buyiText: 'gal', zhText: '腿', enText: 'leg', description: '身体｜D2/D4' } },
  { buyi: 'mue', to: { buyiText: 'mbenl', zhText: '天；天空', enText: 'sky', description: '自然｜D1/D4' } },
  { buyi: 'dieg', to: { buyiText: 'rih', zhText: '旱地；田地', enText: 'dry field', description: '自然｜D2' } },
  { buyi: 'ban', to: { buyiText: 'mbaanx', zhText: '寨子；村子', enText: 'village', description: '场所｜D2' } },
  { buyi: 'gou', to: { buyiText: 'gul', zhText: '我', enText: 'I; me', description: '人称｜D2/D4' } },
  { buyi: 'mouz', to: { buyiText: 'mengz', zhText: '你', enText: 'you', description: '人称｜D2/D4' } },
  { buyi: 'te', to: { buyiText: 'deel', zhText: '他；她', enText: 'he; she', description: '人称｜D2/D4' } },

  // —— seed-more-data.ts 旧词条 ——
  { buyi: 'lumz' },
  { buyi: 'fwngz', expectZh: '云' },
  { buyi: 'fwngz', expectZh: '手' },
  { buyi: 'fwn', expectZh: '雨' },
  { buyi: 'bin', to: { buyiText: 'rinl', zhText: '石头', enText: 'stone', description: '自然｜D1/D2' } },
  { buyi: 'ruz', to: { buyiText: 'ronl', zhText: '路', enText: 'road', description: '自然｜D3' } },
  { buyi: 'nyaz', to: { buyiText: 'nyal', zhText: '草', enText: 'grass', description: '植物｜D1/D4' } },
  { buyi: 'hauz', to: { buyiText: 'haux', zhText: '饭；稻米', enText: 'rice; meal', description: '饮食｜D2/D4' } },
  { buyi: 'gyae', to: { buyiText: 'guel', zhText: '盐', enText: 'salt', description: '饮食｜D1/D10' } },
  { buyi: 'mwngz', to: { buyiText: 'fengz', zhText: '手', enText: 'hand', description: '身体｜D2/D4' } },
  { buyi: 'gyo', to: { buyiText: 'jauc', zhText: '头', enText: 'head', description: '身体｜D2' } },
  { buyi: 'da', to: { buyiText: 'dal', zhText: '眼睛', enText: 'eye', description: '身体｜D1/D2/D4' } },
  { buyi: 'bae', expectZh: '去' },
  { buyi: 'gan', expectZh: '吃' },
  { buyi: 'ndwot', to: { buyiText: 'ndodt', zhText: '喝', enText: 'drink', description: '动作｜D3' } },
  { buyi: 'nong' },

  // —— seed-custom-data.ts 旧词条 ——
  { buyi: 'ndau', to: { buyiText: 'ndaaul', zhText: '星', enText: 'star', description: '自然｜D1' } },
  { buyi: 'byal', expectZh: '山', to: { buyiText: 'byal', zhText: '鱼', enText: 'fish', description: '动物｜D1/D2/D4' } },
  { buyi: 'rog', expectZh: '鸟' },
  { buyi: 'bit', to: { buyiText: 'bidt', zhText: '鸭', enText: 'duck', description: '动物｜D2/D4/D9' } },
  { buyi: 'mou', expectZh: '猪' },
  { buyi: 'fai', expectZh: '树' },
  { buyi: 'riu', expectZh: '笑' },

  // —— seed-batch3.ts 旧词条（个别错误）——
  { buyi: 'hingz', to: { buyiText: 'ndingl', zhText: '红', enText: 'red', description: '颜色｜D1/D4' } },
  { buyi: 'ndaamz', to: { buyiText: 'foonx', zhText: '黑', enText: 'black', description: '颜色｜D2' } },
  { buyi: 'nees', to: { buyiText: 'nis', zhText: '小', enText: 'small', description: '状态｜D2/D4' } },
  { buyi: 'raez', to: { buyiText: 'raiz', zhText: '长', enText: 'long', description: '状态｜D2/D4' } },
  { buyi: 'dinl', expectZh: '短', to: { buyiText: 'dinl', zhText: '脚', enText: 'foot', description: '身体｜D2/D4' } },
  { buyi: 'maux' },
  { buyi: 'ringz' },
  { buyi: 'fiz', expectZh: '醉', to: { buyiText: 'fiz', zhText: '火', enText: 'fire', description: '自然｜D1' } },

  // —— seed-batch4.ts 旧词条：壮语拼写批量下线 ——
  { buyi: 'mbwn' }, { buyi: 'naengz' }, { buyi: 'fuh' }, { buyi: 'daengngoenz' },
  { buyi: 'lac' }, { buyi: 'byaj' }, { buyi: 'loengz' }, { buyi: 'nae' },
  { buyi: 'nwix' }, { buyi: 'rongz' }, { buyi: 'meuz' }, { buyi: 'vaiz' },
  { buyi: 'ciez' }, { buyi: 'gaeq' }, { buyi: 'yiuh' }, { buyi: 'roeg' },
  { buyi: 'nengz' }, { buyi: 'rwi' }, { buyi: 'nengzndaem' }, { buyi: 'duzwiz' },
  { buyi: 'guk' }, { buyi: 'mak', expectZh: '果子' }, { buyi: 'makbug' },
  { buyi: 'makmoed' }, { buyi: 'makmaenj' }, { buyi: 'maknganx' }, { buyi: 'makdaeq' },
  { buyi: 'oij' }, { buyi: 'haeux' }, { buyi: 'haeuxnaz' }, { buyi: 'haeuxyangz' },
  { buyi: 'legbyaek' }, { buyi: 'byaekhau' }, { buyi: 'byaekgat' }, { buyi: 'lwgraz' },
  { buyi: 'gyaeuj' }, { buyi: 'naj' }, { buyi: 'ndaeng' }, { buyi: 'bak', expectZh: '嘴' },
  { buyi: 'rwz' }, { buyi: 'din' }, { buyi: 'naeng' }, { buyi: 'ndok' },
  { buyi: 'lwed' }, { buyi: 'sim' }, { buyi: 'wunz' }, { buyi: 'baeuq' },
  { buyi: 'lungz' }, { buyi: 'daeg' }, { buyi: 'lwg' }, { buyi: 'lwgmbwk' },
  { buyi: 'gwnz' }, { buyi: 'laj' }, { buyi: 'ndaw' }, { buyi: 'rog', expectZh: '外' },
  { buyi: 'laeng' }, { buyi: 'ngoenzcog' }, { buyi: 'ngoenzrawz' }, { buyi: 'ngoenzbonz' },
  { buyi: 'haemhneix' }, { buyi: 'haemhlwenz' }, { buyi: 'song' }, { buyi: 'sam' },
  { buyi: 'seiq' }, { buyi: 'haj' }, { buyi: 'roek' }, { buyi: 'caet' },
  { buyi: 'bet' }, { buyi: 'gouj' }, { buyi: 'cib' }, { buyi: 'aen' },
  { buyi: 'ndei' }, { buyi: 'rwix' }, { buyi: 'hung' }, { buyi: 'iq' },
  { buyi: 'dinj' }, { buyi: 'mbaeu' }, { buyi: 'goz' }, { buyi: 'gwn' },
  { buyi: 'buet' }, { buyi: 'daej' }, { buyi: 'ngeix' }, { buyi: 'ndaej' },
  { buyi: 'hawj' }, { buyi: 'daeuq' }, { buyi: 'bae' }, { buyi: 'lawz' },
  { buyi: 'baenzlawz' }, { buyi: 'mbouj' }, { buyi: 'ndi' }, { buyi: 'lij' },
  // 壮语词条改写为标准布依文
  { buyi: 'bak', expectZh: '百', to: { buyiText: 'bas', zhText: '百', enText: 'hundred', description: '数词｜D2/D4' } },
  { buyi: 'cien', to: { buyiText: 'xianl', zhText: '千', enText: 'thousand', description: '数词｜D2' } },
  { buyi: 'fanh', to: { buyiText: 'faanh', zhText: '万', enText: 'ten thousand', description: '数词｜D2' } },
  { buyi: 'go', to: { buyiText: 'gol', zhText: '棵（量词）', enText: 'classifier (plants)', description: '量词｜D1/D2' } },
  { buyi: 'boux', to: { buyiText: 'bux', zhText: '个（人量词）', enText: 'classifier (people)', description: '量词｜D2' } },
  { buyi: 'sang', to: { buyiText: 'saangl', zhText: '高', enText: 'tall; high', description: '状态｜D1/D4' } },
  { buyi: 'daemq', to: { buyiText: 'daix', zhText: '矮小', enText: 'short (stature)', description: '状态｜D1' } },
  { buyi: 'lai', to: { buyiText: 'laail', zhText: '多', enText: 'many; much', description: '状态｜D2/D4' } },
  { buyi: 'noix', to: { buyiText: 'seeuc', zhText: '少', enText: 'few', description: '状态｜D1' } },
  { buyi: 'naek', to: { buyiText: 'nagt', zhText: '重', enText: 'heavy', description: '状态｜D9' } },
  { buyi: 'ndeu', to: { buyiText: 'ndeeul', zhText: '一', enText: 'one', description: '数词｜D1/D2/D4' } },
  { buyi: 'ndoj', to: { buyiText: 'ndodt', zhText: '喝', enText: 'drink', description: '动作｜D3' } },
  { buyi: 'byaij', to: { buyiText: 'byaaic', zhText: '走', enText: 'walk', description: '动作｜D2/D4' } },
  { buyi: 'naengh', to: { buyiText: 'nangh', zhText: '坐', enText: 'sit', description: '动作｜D2/D4' } },
  { buyi: 'ndwn', to: { buyiText: 'ndunl', zhText: '站', enText: 'stand', description: '动作｜D3' } },
  { buyi: 'caux', to: { buyiText: 'xaaux', zhText: '造；生（火）', enText: 'make', description: '动作｜D1/D10' } },
  { buyi: 'soengq', to: { buyiText: 'songs', zhText: '送；赠', enText: 'give; send', description: '动作｜D2' } },
  { buyi: 'nda', to: { buyiText: 'dez', zhText: '带；挑', enText: 'carry', description: '动作｜D1/D3' } },
  { buyi: 'dam', to: { buyiText: 'damc', zhText: '织（布）', enText: 'weave', description: '动作｜D1' } },
  { buyi: 'ndaem', to: { buyiText: 'ndaml', zhText: '种（植）', enText: 'plant', description: '动作｜D1/D4' } },
  { buyi: 'yawj', to: { buyiText: 'ximl', zhText: '看', enText: 'look', description: '动作｜D2/D7' } },
  { buyi: 'dingq', to: { buyiText: 'nyiel', zhText: '听', enText: 'listen', description: '动作｜D2/D4' } },
  { buyi: 'naeuz', to: { buyiText: 'nauz', zhText: '说', enText: 'say', description: '动作｜D2/D4' } },
  { buyi: 'ra', to: { buyiText: 'ral', zhText: '找', enText: 'look for', description: '动作｜D3/D4' } },
  { buyi: 'daeuj', to: { buyiText: 'dauc', zhText: '来；生', enText: 'come', description: '动作｜D1/D2' } },
  { buyi: 'gijmaz', to: { buyiText: 'gecmaz', zhText: '什么', enText: 'what', description: '疑问｜D2' } },
  { buyi: 'bouxlawz', to: { buyiText: 'buxlaez', zhText: '谁', enText: 'who', description: '疑问｜D4' } },
  { buyi: 'geijlai', to: { buyiText: 'saauhlaez', zhText: '多少', enText: 'how much', description: '疑问｜D2' } },
  { buyi: 'gizlawz', to: { buyiText: 'jiezlaez', zhText: '哪里', enText: 'where', description: '疑问｜D2/D4' } },
  { buyi: 'caeux', to: { buyiText: 'riangz', zhText: '和；跟', enText: 'and; with', description: '虚词｜D2' } },
  { buyi: 'caemh', to: { buyiText: 'xamh', zhText: '共；同', enText: 'together', description: '动作｜D1/D3' } },
  { buyi: 'ngoenzneix', to: { buyiText: 'ngonznix', zhText: '今天', enText: 'today', description: '时间｜D2' } },
  { buyi: 'ngoenzlwenz', to: { buyiText: 'ngonzlianz', zhText: '昨天', enText: 'yesterday', description: '时间｜D1' } },
  { buyi: 'swix', to: { buyiText: 'soix', zhText: '左', enText: 'left', description: '方位｜D1/D4' } },
  { buyi: 'baj', to: { buyiText: 'bac', zhText: '伯母', enText: 'aunt', description: '亲属｜D1' } },
  { buyi: 'nuengx', to: { buyiText: 'nuangx', zhText: '弟弟；妹妹', enText: 'younger sibling', description: '亲属｜D2/D4' } },
  { buyi: 'daez', to: { buyiText: 'daez', zhText: '守', enText: 'guard', description: '动作｜D1' } },
  { buyi: 'miz', expectZh: '有；不' },
];

// 旧短语清理（壮语混入/臆造拼写）
const phraseDeletions = [
  'mang bai rux', 'gan cau', 'nong ngau', 'yo xiong reih', 'noi diu gvai',
  'gop zai', 'zai gen', 'gij lai ngenz', 'gou mbou rox', 'gou bae ranz',
  'nang bux', 'yo bux', 'Dungx ies.', 'Hannh bai.', 'Xac gul dic mal!',
  'Mengz lix ganc miz?',
  // batch4 壮语短语
  'Mwngz ndei!', 'Ngoenzneix ndei!', 'Gwn haeux fih?', 'Gwn ndei ninz ndei.',
  'Baez ndei byaij.', 'Docih mwngz.', 'Mbouj yungh cih.', 'Ngoenzcog raen.',
  'Mwngz dwg boux gizlawz?', 'Gou dwg boux Gveicouh.', 'Mwngz singq maz?',
  'Gou singq Lij.', 'Mwngz miz geijlai bi?', 'Gou miz 20 bi.',
  'Neix dwg gijmaz?', 'Haenx dwg saw Bouxyaej.', 'Gou bae ranz.',
  'Mwngz bae gizlawz?', 'Gou bae ndaw haw.', 'Cingj naengh.', 'Cingj gwn caz.',
  'Song aen haeuxgok neix baenz geijlai ngaenz?', 'Gou mbouj rox.',
  'Mwngz gangj manh di.',
];

// 旧谚语清理（壮语混入/无法验证）
const proverbDeletions = [
  'vunz laai reengz hung', 'roog rwaek miz noh gan', 'nae raemx ndaem na',
  'Lix haux miz luanh gwnl, lix xeenz miz luanh yungh.',
  'Ramx laaux ndaix nangh ruz.',
  'Bail roh daaus hoongl, gueh wenz aul ndil.',
  'Bya sang miz laaul fwn laaux.',
  'Rog mbin gvaq jaangl mbwn, duezbyal ndaix gvaq dah laaux.',
  'Miz lix laaul naanz, danh aul reengz.',
  'Aul ramx soongl dah, gah nyangh soongl ronl.',
  // batch4 壮语谚语
  'Raeuj sim raeuj dungx.', 'Miz sim miz dungx.',
  'Baez daeuj hoj, baez bae ndei.', 'Ndaej haeux mbouj lumz naz.',
  'Guh hong miz rengz, gwn haeux miz gwn.', 'Raeuj nae raemx, raemx ndaej ndei.',
  'Rengz lai vunz lai, ndaej gvaq dah.', 'Bya sang miz raemx, dah laeg miz bya.',
  'Ngoenz ndeu hong ndeu, sam bi baenz faexhung.', 'Lwgsae mbouj lau fwnhung.',
  'Aeu sim bae dingq, aeu dungx bae ngeix.', 'Miz nae miz fwn, miz rengz miz gwn.',
  'Vunz lai sim lai, baenz gijmaz cungj ndei.',
  'Guh vunz mbouj lau hoj, lau mbouj guh hong.',
  'Ndei ndaej song bak, rwix ndaej song din.',
];

// 「说话像唱歌」旧谚语（文化展项引用其 id）修正为真实谚语，保留 id 不变
const proverbCorrection = {
  from: 'nga zi ni ma',
  to: {
    buyiText: 'Joongl ndil mizxac ros nagt, wenz gvaail mizxac nauz leeux.',
    zhText: '响鼓不用重锤敲，智者不用话挑明。',
    enText: 'A good drum needs no heavy beat; the wise need no plain words.',
    description: '智慧｜D3',
  },
};

// ============ 民歌（带布依文歌词）============
const songs = [
  {
    title: '好花红（布依语版）',
    artist: '布依族民歌 · 布依文译文：罗中富',
    buyiText: 'Guz ndaais ndingl',
    zhText: '好花红',
    enText: 'Red Flowers (Buyi version)',
    description: '布依族最具代表性的民歌，流传于贵州惠水。布依文歌词由罗中富翻译。',
    isPublished: true,
    sortOrder: 20,
    lyrics: [
      'Guz ndaais ndingl a gul ndaais ndingl, guz ndaais haail ius onl gangz jings.',
      '（好花红来好花红，好花生在茨梨蓬。）',
      'Guz ndaais haail ius jings onl gangz, guz laez dangs ndidt guz deel ndingl.',
      '（好花生在茨梨树，哪朵向阳哪朵红。）',
      'Xadt xib ngih guc lungh gue xooml, ndiabt dangz guz laez fengz dadtdings.',
      '（七十二朵做一把，想着哪朵摘哪朵。）',
      'Genz bol lac bol rumc bol ndingl.',
      '（山上山下艳山红。）',
      'Laail bil miz dangz bol ndaais dauc, baiz guz ndaais ndingl baangx dah hail.',
      '（多年不到花坡来，朵朵好花在河岸。）',
      'Goongs dah iox ranl ndaais ndagt ndongl, xagt xib ngih guz rumc xooml ndaais.',
      '（河岸望见艳山红，七十二朵做一把。）',
      'Laic aul guz laez dadt guz laez, genz bol lac bol bol ndinglraais.',
      '（想着哪朵摘哪朵，山上山下艳山红。）',
      'Ndaais jiml jaail leeux lix rox daaus, bixnuangx longl bail miz daaus raaix.',
      '（金花凋了还会来，贝侬丢去不再来。）',
    ].join('\n'),
  },
  {
    title: '月亮星星歌（Roonghndianl hee roonghndaaul）',
    artist: '布依族童谣 · 《贵州少数民族基础语音双语读本》',
    buyiText: 'Roonghndianl hee roonghndaaul',
    zhText: '月亮啊星星（节选）',
    enText: 'Moon and Stars (Buyi nursery rhyme)',
    description: '布依族童谣，出自《贵州少数民族基础语音双语读本》布依族短文部分。',
    isPublished: true,
    sortOrder: 21,
    lyrics: [
      'Roonghndianl hee roonghndaaul，',
      '（月亮啊星星，）',
      'Roongh haec saaul dazwaais，',
      '（为姑娘纺纱照明，）',
      'Dazwaais ius lac eeux，',
      '（在屋檐下纺纱，）',
      'Dazwaais ius lac lauz.',
      '（在楼下纺纱。）',
    ].join('\n'),
  },
  {
    title: '高寨家（Raanz daanz saangl）',
    artist: '布依族童谣 · 《贵州少数民族基础语音双语读本》',
    buyiText: 'Raanz daanz saangl',
    zhText: '高寨家',
    enText: 'The House on the High Village (Buyi nursery rhyme)',
    description: '布依族童谣，出自《贵州少数民族基础语音双语读本》布依族短文部分。',
    isPublished: true,
    sortOrder: 22,
    lyrics: [
      'Raanz daanzsaangl，（高寨家，）',
      'Raangl hauxbox，（炒米花，）',
      'Lox duezngeaz，（哄老蛇，）',
      'Ez duezgveec.（背青蛙。）',
      'Leez hanznaz，（跑田埂，）',
      'Daz rianglhaux，（拖谷穗，）',
      'Xaauh rianglmul.（拽猪尾。）',
      'Os hoongh bail raiz mul，（出院去唤猪，）',
      'Os dul bail raiz gais.（出门去唤鸡。）',
    ].join('\n'),
  },
  {
    title: '布依迎客歌',
    artist: '布依文化采集',
    buyiText: 'raanz gais gvaangl',
    zhText: '欢迎远方客人的民歌',
    enText: 'Welcome song of Buyi people',
    description: '首页轮播与民歌列表示例数据',
    isPublished: true,
    sortOrder: 1,
  },
  {
    title: '山歌对唱',
    artist: '黔南山歌队',
    buyiText: 'weanl beangz',
    zhText: '山谷之间的对唱',
    enText: 'Valley antiphonal singing',
    description: '用于首页展示布依语韵律与文化气质',
    isPublished: true,
    sortOrder: 2,
  },
  {
    title: '田间节奏',
    artist: '布依青年合唱',
    buyiText: 'weanl gueh hoongl',
    zhText: '田间劳作时的节奏民歌',
    enText: 'Rhythm of farming folk song',
    description: '作为小程序首页精选民歌示例',
    isPublished: true,
    sortOrder: 3,
  },
];

// ============ 主流程 ============
async function applyFixes(repo: ContentRepo, fixes: Fix[]) {
  let fixed = 0;
  let removed = 0;
  for (const fix of fixes) {
    const where: any = { buyiText: fix.buyi };
    if (fix.expectZh) {
      where.zhText = fix.expectZh;
    }
    const existing = await repo.findOne({ where });
    if (!existing) continue;

    if (!fix.to) {
      await repo.remove(existing);
      removed++;
      continue;
    }

    const target = await repo.findOne({ where: { buyiText: fix.to.buyiText } });
    if (target && target.id !== existing.id) {
      await repo.update(target.id, { ...fix.to, zhSortKey: buildZhSortKey(fix.to.zhText) });
      await repo.remove(existing);
      removed++;
    } else {
      await repo.update(existing.id, { ...fix.to, zhSortKey: buildZhSortKey(fix.to.zhText) });
      fixed++;
    }
  }
  return { fixed, removed };
}

async function upsertAll(
  repo: ContentRepo,
  rows: Array<[string, string, string, string, number]>,
) {
  let added = 0;
  let updated = 0;
  for (const [buyiText, zhText, enText, description, sortOrder] of rows) {
    const existing = await repo.findOne({ where: { buyiText, zhText } });
    const payload = {
      buyiText,
      zhText,
      enText: enText || null,
      description,
      sortOrder,
      isPublished: true,
      zhSortKey: buildZhSortKey(zhText),
    };
    if (existing) {
      await repo.update(existing.id, payload);
      updated++;
    } else {
      await repo.save(repo.create(payload));
      added++;
    }
  }
  return { added, updated };
}

async function deleteByBuyiText(repo: ContentRepo, buyiTexts: string[]) {
  let removed = 0;
  for (const buyiText of buyiTexts) {
    const existing = await repo.findOne({ where: { buyiText } });
    if (existing) {
      await repo.remove(existing);
      removed++;
    }
  }
  return removed;
}

// 清除不在权威数据集中的遗留条目（旧样例数据/臆造拼写），保证库内内容全部可溯源
async function purgeUnverified(repo: ContentRepo, verified: Set<string>) {
  const all = await repo.find();
  const removed: string[] = [];
  for (const item of all) {
    if (!verified.has(`${item.buyiText}||${item.zhText}`)) {
      await repo.remove(item);
      removed.push(`${item.buyiText}(${item.zhText})`);
    }
  }
  return removed;
}

async function main() {
  await dataSource.initialize();
  console.log('DataSource initialized.');

  const dictRepo = dataSource.getRepository(DictionaryEntry) as unknown as ContentRepo;
  const phraseRepo = dataSource.getRepository(Phrase) as unknown as ContentRepo;
  const proverbRepo = dataSource.getRepository(Proverb) as unknown as ContentRepo;
  const songRepo = dataSource.getRepository(Song);

  // 1. 修正/下线旧错误数据
  const dictFixResult = await applyFixes(dictRepo, dictFixes);
  console.log(`词条修正: ${dictFixResult.fixed} 条更新, ${dictFixResult.removed} 条下线`);

  // 1.5 第二批修正（joic橘子→芭蕉、jux橘子→暴风雨、waail岩→坝、doongl一起→腌）
  const fixes2 = (dictFixes2 as Array<{ from: string; fromZh: string; to: { buyiText: string; zhText: string; enText?: string; description?: string } }>)
    .map(f => ({ buyi: f.from, expectZh: f.fromZh, to: f.to }));
  const dictFixResult2 = await applyFixes(dictRepo, fixes2);
  console.log(`词条修正(第二批): ${dictFixResult2.fixed} 条更新, ${dictFixResult2.removed} 条下线`);

  const phraseRemoved = await deleteByBuyiText(phraseRepo, phraseDeletions);
  console.log(`短语下线: ${phraseRemoved} 条`);

  const proverbRemoved = await deleteByBuyiText(proverbRepo, proverbDeletions);
  console.log(`谚语下线: ${proverbRemoved} 条`);

  // 「说话像唱歌」→ 真实谚语（保留 id，文化展项链接不变）
  const oldProverb = await proverbRepo.findOne({ where: { buyiText: proverbCorrection.from } });
  if (oldProverb) {
    await proverbRepo.update(oldProverb.id, {
      ...proverbCorrection.to,
      zhSortKey: buildZhSortKey(proverbCorrection.to.zhText),
    });
    console.log('旧谚语「nga zi ni ma」已修正为真实谚语（保留原 id）');
  }

  // 2. 灌入权威数据
  const dictResult = await upsertAll(dictRepo, allDict);
  console.log(`词条灌入: 新增 ${dictResult.added}, 更新 ${dictResult.updated}`);

  const phraseResult = await upsertAll(phraseRepo, phrases);
  console.log(`短语灌入: 新增 ${phraseResult.added}, 更新 ${phraseResult.updated}`);

  const proverbResult = await upsertAll(proverbRepo, proverbs);
  console.log(`谚语灌入: 新增 ${proverbResult.added}, 更新 ${proverbResult.updated}`);

  // 2.5 清除不在权威数据集中的遗留条目（旧样例/臆造拼写），保证内容全部可溯源
  const dictPurged = await purgeUnverified(dictRepo, new Set(allDict.map((r: string[]) => `${r[0]}||${r[1]}`)));
  console.log(`词条清理: 移除未验证条目 ${dictPurged.length} 条${dictPurged.length ? ' -> ' + dictPurged.join(', ') : ''}`);

  const phrasePurged = await purgeUnverified(phraseRepo, new Set(phrases.map((r: string[]) => `${r[0]}||${r[1]}`)));
  console.log(`短语清理: 移除未验证条目 ${phrasePurged.length} 条${phrasePurged.length ? ' -> ' + phrasePurged.join(', ') : ''}`);

  const proverbPurged = await purgeUnverified(proverbRepo, new Set(proverbs.map((r: string[]) => `${r[0]}||${r[1]}`)));
  console.log(`谚语清理: 移除未验证条目 ${proverbPurged.length} 条${proverbPurged.length ? ' -> ' + proverbPurged.join(', ') : ''}`);

  // 3. 民歌（按标题幂等）
  for (const s of songs) {
    const existing = await songRepo.findOne({ where: { title: s.title } });
    const payload = { ...s, zhSortKey: buildZhSortKey(s.zhText) };
    if (existing) {
      await songRepo.update(existing.id, payload);
    } else {
      await songRepo.save(songRepo.create(payload));
    }
  }
  console.log(`民歌灌入: ${songs.length} 首`);

  // 4. 统计
  const [dictCount, phraseCount, proverbCount, songCount] = await Promise.all([
    dataSource.getRepository(DictionaryEntry).count(),
    dataSource.getRepository(Phrase).count(),
    dataSource.getRepository(Proverb).count(),
    dataSource.getRepository(Song).count(),
  ]);
  console.log(`\n当前总量: 词条 ${dictCount} / 短语 ${phraseCount} / 谚语 ${proverbCount} / 民歌 ${songCount}`);
  console.log('数据已写入主库 buyi-local.sqlite；通过 启动后端.bat/启动竞赛包.bat 启动时会自动刷新 buyi-runtime.sqlite 运行时副本。');

  await dataSource.destroy();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
