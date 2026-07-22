const TYPE_LABELS = {
  dictionary: '词条',
  phrase: '常用语',
  proverb: '谚语',
  song: '民歌',
};

const GROUP_TYPE_MAP = {
  dictionary: 'dictionary',
  phrases: 'phrase',
  proverbs: 'proverb',
  songs: 'song',
};

function normalizeType(type) {
  if (type === 'phrases' || type === 'phrase') {
    return 'phrase';
  }
  if (type === 'proverbs' || type === 'proverb') {
    return 'proverb';
  }
  if (type === 'songs' || type === 'song') {
    return 'song';
  }
  return 'dictionary';
}

function getTypeLabel(type) {
  return TYPE_LABELS[normalizeType(type)] || TYPE_LABELS.dictionary;
}

function formatDuration(seconds) {
  const value = Math.floor(Number(seconds) || 0);
  if (value <= 0) return '';
  const minutes = Math.floor(value / 60);
  const secs = value % 60;
  return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

// 把相对路径补全为完整 URL，避免小程序 InnerAudioContext 无法播放
function resolveMediaUrl(url) {
  if (!url) return '';
  if (/^https?:\/\//i.test(url)) return url;
  let base = '';
  try {
    const app = getApp();
    base = (app && typeof app.getApiBase === 'function' ? app.getApiBase() : '') || '';
  } catch (error) {}
  if (!base) return url;
  const origin = String(base).replace(/\/+$/, '').replace(/\/api$/i, '');
  const path = String(url).startsWith('/') ? url : `/${url}`;
  return `${origin}${path}`;
}

function mapContent(item = {}, forcedType) {
  const contentType = normalizeType(forcedType || item.type);
  const buyiText = item.buyiText || item.buyi || '';
  const zhText = item.zhText || item.zh || item.ch || '';
  const enText = item.enText || item.en || '';
  const audioUrl = resolveMediaUrl(item.audioUrl || item.audio || '');
  const coverUrl = resolveMediaUrl(item.coverUrl || item.image || '');
  const title = item.title || zhText || buyiText || '未命名内容';

  const duration = item.duration != null ? Number(item.duration) : null;
  return {
    ...item,
    id: item.id,
    contentId: item.contentId || item.id,
    contentType,
    type: contentType,
    typeLabel: getTypeLabel(contentType),
    buyiText,
    zhText,
    enText,
    description: item.description || '',
    audioUrl,
    coverUrl,
    title,
    artist: item.artist || '',
    duration,
    durationText: formatDuration(duration),
    isFavorited: !!item.isFavorited || !!item.fav,
    buyi: buyiText,
    zh: zhText,
    ch: zhText,
    en: enText,
    audio: audioUrl,
    image: coverUrl,
    fav: !!item.isFavorited || !!item.fav,
  };
}

function mapContentList(list = [], forcedType) {
  return (list || []).map((item) => mapContent(item, forcedType));
}

function getFavoriteKey(item = {}) {
  const type = normalizeType(item.contentType || item.type);
  const id = item.contentId || item.id;
  return id ? `${type}:${id}` : '';
}

function buildFavoriteLookup(groups = {}) {
  const entries = [];
  Object.keys(groups || {}).forEach((key) => {
    const items = groups[key] || [];
    items.forEach((item) => {
      const mapped = mapContent(item, GROUP_TYPE_MAP[key] || key);
      const favoriteKey = getFavoriteKey(mapped);
      if (favoriteKey) {
        entries.push(favoriteKey);
      }
    });
  });
  return new Set(entries);
}

function applyFavoriteLookup(list = [], favoriteLookup) {
  const lookup = favoriteLookup || new Set();
  return mapContentList(list).map((item) => ({
    ...item,
    fav: lookup.has(getFavoriteKey(item)),
    isFavorited: lookup.has(getFavoriteKey(item)),
  }));
}

function flattenSearchResults(payload = {}) {
  return []
    .concat(mapContentList(payload.dictionary || [], 'dictionary'))
    .concat(mapContentList(payload.phrases || [], 'phrase'))
    .concat(mapContentList(payload.proverbs || [], 'proverb'))
    .concat(mapContentList(payload.songs || [], 'song'));
}

function mapFavoriteGroups(payload = {}) {
  return {
    dictionary: mapContentList(payload.dictionary || [], 'dictionary'),
    phrases: mapContentList(payload.phrases || [], 'phrase'),
    proverbs: mapContentList(payload.proverbs || [], 'proverb'),
    songs: mapContentList(payload.songs || [], 'song'),
  };
}

function formatDateTime(value) {
  if (!value) {
    return '';
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '';
  }
  // 纯 UTC 偏移算法：+8 小时得到北京时间，不依赖 toLocaleString 输出格式
  // 在所有 JS 引擎（Node.js / 微信小程序 / 浏览器）行为完全一致
  const beijing = new Date(date.getTime() + 8 * 60 * 60 * 1000);
  const m = beijing.getUTCMonth() + 1;
  const d = beijing.getUTCDate();
  const h = String(beijing.getUTCHours()).padStart(2, '0');
  const min = String(beijing.getUTCMinutes()).padStart(2, '0');
  return `${m}月${d}日 ${h}:${min}`;
}

function mapLearningRecordsResponse(payload = {}) {
  const records = (payload.items || [])
    .filter((item) => item && item.content)
    .map((item) => {
      const content = mapContent(item.content, item.content.type);
      return {
        ...content,
        recordId: item.id,
        actionType: item.actionType || 'view',
        createdAt: item.createdAt,
        displayTime: formatDateTime(item.createdAt),
        actionLabel: item.actionType === 'play' ? '播放' : '查看',
      };
    });

  return {
    records,
    recent: records.slice(0, 10),
    total: Number(payload.total || records.length || 0),
    page: Number(payload.page || 1),
    pageSize: Number(payload.pageSize || records.length || 10),
    stats: {
      today: Number((payload.stats && payload.stats.today) || 0),
      total: Number((payload.stats && payload.stats.total) || 0),
      streak: Number((payload.stats && payload.stats.streak) || 0),
    },
  };
}

module.exports = {
  mapContent,
  mapContentList,
  flattenSearchResults,
  mapFavoriteGroups,
  buildFavoriteLookup,
  applyFavoriteLookup,
  mapLearningRecordsResponse,
  getFavoriteKey,
  getTypeLabel,
};
