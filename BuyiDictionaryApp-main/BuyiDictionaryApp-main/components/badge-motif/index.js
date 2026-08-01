// 徽章组件：复用 web 端 IconAchievementBadge 设计
// 布贴绣片框架（方形圆角 + 四角菱形点缀），而非西式勋章
// 6 种布依族非遗纹样：batik/brocade/drum/mountain/grain/song
// 主色调：深靛蓝 #1e2c60 + 浅靛蓝 #3a6b8c + 点缀金 #c9a96e

const PRIMARY = '#1e2c60';   // 深靛蓝
const ACCENT = '#c9a96e';    // 铜鼓金

// 布贴绣片框架（方形圆角 + 四角菱形点缀）
const FRAME_SVG =
  '<rect x="5.5" y="5.5" width="37" height="37" rx="8" fill="' + PRIMARY + '" fill-opacity="0.08"/>'
  + '<rect x="5.5" y="5.5" width="37" height="37" rx="8" fill="none" stroke="' + PRIMARY + '" stroke-width="1.65"/>'
  + '<path d="m10.5 14 2-2 2 2-2 2-2-2ZM33.5 14l2-2 2 2-2 2-2-2ZM10.5 34l2-2 2 2-2 2-2-2ZM33.5 34l2-2 2 2-2 2-2-2Z" fill="none" stroke="' + PRIMARY + '" stroke-width="1.2"/>';

// batik：蜡染旋花（初次解锁与通用成就）
const BATIK_SVG =
  '<circle cx="24" cy="24" r="10.5" fill="none" stroke="' + PRIMARY + '" stroke-width="1.65"/>'
  + '<path d="M24 15c3.3 0 5.8 2.4 5.8 5.3 0 2.5-1.7 4.3-3.9 4.3-1.8 0-3.2-1.3-3.2-3 0-1.3.9-2.4 2.1-2.4 1 0 1.8.8 1.8 1.7" fill="none" stroke="' + PRIMARY + '" stroke-width="1.65" stroke-linecap="round"/>'
  + '<path d="M24 33c-3.3 0-5.8-2.4-5.8-5.3 0-2.5 1.7-4.3 3.9-4.3 1.8 0 3.2 1.3 3.2 3 0 1.3-.9 2.4-2.1 2.4-1 0-1.8-.8-1.8-1.7" fill="none" stroke="' + PRIMARY + '" stroke-width="1.65" stroke-linecap="round"/>'
  + '<path d="M15.3 21.5c1.2-2.2 3.3-3.5 5.7-3.5M32.7 26.5c-1.2 2.2-3.3 3.5-5.7 3.5" fill="none" stroke="' + PRIMARY + '" stroke-width="1.65" stroke-linecap="round"/>';

// brocade：织锦菱格（词汇、学习与记录类）
const BROCADE_SVG =
  '<path d="m24 12 10 6-10 6-10-6 10-6ZM24 24l10 6-10 6-10-6 10-6Z" fill="none" stroke="' + PRIMARY + '" stroke-width="1.65" stroke-linejoin="round"/>'
  + '<path d="m14 18 10 6 10-6M14 30l10-6 10 6M24 12v18" fill="none" stroke="' + PRIMARY + '" stroke-width="1.65" stroke-linecap="round"/>'
  + '<circle cx="24" cy="24" r="1.8" fill="' + ACCENT + '"/>';

// drum：铜鼓同心纹（坚持、连续学习与里程碑）
const DRUM_SVG =
  '<circle cx="24" cy="24" r="10.5" fill="none" stroke="' + PRIMARY + '" stroke-width="1.65"/>'
  + '<circle cx="24" cy="24" r="5.5" fill="none" stroke="' + PRIMARY + '" stroke-width="1.65"/>'
  + '<path d="M24 11.8v3M24 33.2v3M11.8 24h3M33.2 24h3M15.4 15.4l2.1 2.1M30.5 30.5l2.1 2.1M32.6 15.4l-2.1 2.1M17.5 30.5l-2.1 2.1" fill="none" stroke="' + PRIMARY + '" stroke-width="1.65" stroke-linecap="round"/>'
  + '<path d="m24 20.8 1 2.2 2.4.2-1.8 1.6.5 2.4-2.1-1.2-2.1 1.2.5-2.4-1.8-1.6 2.4-.2 1-2.2Z" fill="' + ACCENT + '"/>';

// mountain：山水水纹（探索、词典浏览等自然意象类）
const MOUNTAIN_SVG =
  '<path d="m13.5 29 7-9 4.2 5 3.1-4 6.7 8" fill="none" stroke="' + PRIMARY + '" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round"/>'
  + '<path d="M13 32c2.2-1.4 4.4-1.4 6.6 0 2.2 1.4 4.4 1.4 6.6 0 2.2-1.4 4.4-1.4 6.6 0" fill="none" stroke="' + PRIMARY + '" stroke-width="1.65" stroke-linecap="round"/>'
  + '<path d="M16 35c1.8-1 3.6-1 5.4 0 1.8 1 3.6 1 5.4 0 1.8-1 3.6-1 5.4 0" fill="none" stroke="' + PRIMARY + '" stroke-width="1.25" stroke-linecap="round"/>'
  + '<circle cx="31.5" cy="15.5" r="2.3" fill="' + ACCENT + '"/>';

// grain：稻穗纹（收藏、积累与收集类）
const GRAIN_SVG =
  '<path d="M24 34V14" fill="none" stroke="' + PRIMARY + '" stroke-width="1.65" stroke-linecap="round"/>'
  + '<path d="M24 18c-3.9-.2-6.2-2.1-6.9-5.3 3.8.1 6.2 1.8 6.9 5.3ZM24 22c-4.2.1-6.6 2-7.3 5.4 4-.1 6.5-1.8 7.3-5.4ZM24 18c3.9-.2 6.2-2.1 6.9-5.3-3.8.1-6.2 1.8-6.9 5.3ZM24 22c4.2.1 6.6 2 7.3 5.4-4-.1-6.5-1.8-7.3-5.4Z" fill="none" stroke="' + PRIMARY + '" stroke-width="1.65" stroke-linejoin="round"/>'
  + '<path d="M20.5 32c1.1.8 2.3 1.2 3.5 1.2 1.2 0 2.4-.4 3.5-1.2" fill="none" stroke="' + PRIMARY + '" stroke-width="1.65" stroke-linecap="round"/>';

// song：民歌回纹（民歌、聆听与声音类）
const SONG_SVG =
  '<path d="M17 17.5c2-2.1 4.3-3.1 7-3.1 2.7 0 5 1 7 3.1" fill="none" stroke="' + PRIMARY + '" stroke-width="1.65" stroke-linecap="round"/>'
  + '<path d="M14.2 21.5c2.8-3.1 6-4.6 9.8-4.6 3.8 0 7 1.5 9.8 4.6" fill="none" stroke="' + PRIMARY + '" stroke-width="1.65" stroke-linecap="round"/>'
  + '<path d="M14.2 26.5c2.8 3.1 6 4.6 9.8 4.6 3.8 0 7-1.5 9.8-4.6" fill="none" stroke="' + PRIMARY + '" stroke-width="1.65" stroke-linecap="round"/>'
  + '<path d="M17 30.5c2 2.1 4.3 3.1 7 3.1 2.7 0 5-1 7-3.1" fill="none" stroke="' + PRIMARY + '" stroke-width="1.65" stroke-linecap="round"/>'
  + '<path d="M24 14.4v19.2M17 24h14" fill="none" stroke="' + PRIMARY + '" stroke-width="1.2" stroke-linecap="round"/>'
  + '<circle cx="24" cy="24" r="2.2" fill="' + ACCENT + '"/>';

// 将 SVG 字符串编码为 data URL
function buildSvgDataUrl(svg) {
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
}

// 根据 pattern 取纹样片段
function getMotifSvg(pattern) {
  switch (pattern) {
    case 'brocade': return BROCADE_SVG;
    case 'drum': return DRUM_SVG;
    case 'mountain': return MOUNTAIN_SVG;
    case 'grain': return GRAIN_SVG;
    case 'song': return SONG_SVG;
    case 'batik':
    default: return BATIK_SVG;
  }
}

Component({
  properties: {
    // 纹样类型：batik/brocade/drum/mountain/grain/song
    pattern: { type: String, value: 'batik' },
    // 是否未解锁（true 时灰度 + 半透明）
    locked: { type: Boolean, value: false },
    // 尺寸（rpx 单位）
    size: { type: Number, value: 44 },
  },
  data: {
    currentSrc: '',
  },
  observers: {
    pattern(pattern) {
      this.updateSrc(pattern);
    },
  },
  lifetimes: {
    attached() {
      this.updateSrc(this.data.pattern);
    },
  },
  methods: {
    // 拼接布贴绣片框架 + 纹样，生成 data URL
    updateSrc(pattern) {
      const motif = getMotifSvg(pattern);
      const fullSvg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">'
        + FRAME_SVG
        + motif
        + '</svg>';
      this.setData({ currentSrc: buildSvgDataUrl(fullSvg) });
    },
  },
});
