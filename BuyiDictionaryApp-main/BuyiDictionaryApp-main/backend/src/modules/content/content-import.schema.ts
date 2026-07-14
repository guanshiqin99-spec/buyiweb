import { ContentType } from '../../common/enums/content-type.enum';

export type CanonicalField =
  | 'buyiText'
  | 'zhText'
  | 'enText'
  | 'description'
  | 'sortOrder'
  | 'isPublished'
  | 'audioUrl'
  | 'audioMediaId'
  | 'title'
  | 'artist'
  | 'coverUrl'
  | 'coverMediaId';

export type ImportIdentity = {
  key: string;
  buyiText?: string;
  zhText?: string;
  title?: string;
  artist?: string | null;
};

export type ImportSchema = {
  type: ContentType;
  sheetName: string;
  filename: string;
  orderedFields: CanonicalField[];
  requiredFields: CanonicalField[];
  aliases: Record<CanonicalField, string[]>;
  buildIdentity: (row: Partial<Record<CanonicalField, string | number | boolean | null>>) => ImportIdentity;
  exampleRow: Record<CanonicalField, string | number>;
};

export const IMPORT_FIELD_LABELS: Record<CanonicalField, string> = {
  buyiText: '布依语',
  zhText: '中文释义',
  enText: '英文释义',
  description: '说明',
  sortOrder: '排序值',
  isPublished: '发布状态',
  audioUrl: '音频地址',
  audioMediaId: '音频媒体ID',
  title: '标题',
  artist: '歌手/来源',
  coverUrl: '封面地址',
  coverMediaId: '封面媒体ID',
};

const COMMON_ALIASES: Record<'buyiText' | 'zhText' | 'enText' | 'description' | 'sortOrder' | 'isPublished', string[]> = {
  buyiText: ['布依语', 'buyiText', '布依文', '词目'],
  zhText: ['中文', '中文释义', 'zhText', '汉语'],
  enText: ['英文', '英文释义', 'enText'],
  description: ['说明', '备注', 'description'],
  sortOrder: ['排序值', 'sortOrder'],
  isPublished: ['发布状态', 'isPublished', '是否发布'],
};

function buildTextKey(parts: Array<string | null | undefined>) {
  return parts.map((part) => String(part || '').trim()).join('::');
}

export const CONTENT_IMPORT_SCHEMAS: Record<ContentType, ImportSchema> = {
  [ContentType.DICTIONARY]: {
    type: ContentType.DICTIONARY,
    sheetName: 'Dictionary',
    filename: 'dictionary-import-template.xlsx',
    orderedFields: ['buyiText', 'zhText', 'enText', 'audioUrl', 'description', 'sortOrder', 'isPublished'],
    requiredFields: ['buyiText', 'zhText'],
    aliases: {
      ...COMMON_ALIASES,
      audioUrl: ['音频地址', 'audioUrl', '发音地址', '歌曲地址'],
      audioMediaId: ['音频媒体ID', 'audioMediaId'],
      title: ['标题', 'title'],
      artist: ['歌手/来源', 'artist', '歌手', '来源'],
      coverUrl: ['封面地址', 'coverUrl', '封面'],
      coverMediaId: ['封面媒体ID', 'coverMediaId'],
    },
    buildIdentity: (row) => ({
      key: buildTextKey([row.buyiText as string, row.zhText as string]),
      buyiText: String(row.buyiText || ''),
      zhText: String(row.zhText || ''),
    }),
    exampleRow: {
      buyiText: 'noi',
      zhText: '你好',
      enText: 'hello',
      audioUrl: 'https://example.com/noi.mp3',
      description: '基础词条',
      sortOrder: 0,
      isPublished: '已发布',
      audioMediaId: '',
      title: '',
      artist: '',
      coverUrl: '',
      coverMediaId: '',
    },
  },
  [ContentType.PHRASE]: {
    type: ContentType.PHRASE,
    sheetName: 'Phrases',
    filename: 'phrases-import-template.xlsx',
    orderedFields: ['buyiText', 'zhText', 'enText', 'description', 'sortOrder', 'isPublished'],
    requiredFields: ['buyiText', 'zhText'],
    aliases: {
      ...COMMON_ALIASES,
      audioUrl: ['音频地址', 'audioUrl'],
      audioMediaId: ['音频媒体ID', 'audioMediaId'],
      title: ['标题', 'title'],
      artist: ['歌手/来源', 'artist', '歌手', '来源'],
      coverUrl: ['封面地址', 'coverUrl', '封面'],
      coverMediaId: ['封面媒体ID', 'coverMediaId'],
    },
    buildIdentity: (row) => ({
      key: buildTextKey([row.buyiText as string, row.zhText as string]),
      buyiText: String(row.buyiText || ''),
      zhText: String(row.zhText || ''),
    }),
    exampleRow: {
      buyiText: 'mbou xong',
      zhText: '一起去',
      enText: 'go together',
      description: '常用短语',
      sortOrder: 0,
      isPublished: '已发布',
      audioUrl: '',
      audioMediaId: '',
      title: '',
      artist: '',
      coverUrl: '',
      coverMediaId: '',
    },
  },
  [ContentType.PROVERB]: {
    type: ContentType.PROVERB,
    sheetName: 'Proverbs',
    filename: 'proverbs-import-template.xlsx',
    orderedFields: ['buyiText', 'zhText', 'enText', 'description', 'sortOrder', 'isPublished'],
    requiredFields: ['buyiText', 'zhText'],
    aliases: {
      ...COMMON_ALIASES,
      audioUrl: ['音频地址', 'audioUrl'],
      audioMediaId: ['音频媒体ID', 'audioMediaId'],
      title: ['标题', 'title'],
      artist: ['歌手/来源', 'artist', '歌手', '来源'],
      coverUrl: ['封面地址', 'coverUrl', '封面'],
      coverMediaId: ['封面媒体ID', 'coverMediaId'],
    },
    buildIdentity: (row) => ({
      key: buildTextKey([row.buyiText as string, row.zhText as string]),
      buyiText: String(row.buyiText || ''),
      zhText: String(row.zhText || ''),
    }),
    exampleRow: {
      buyiText: 'gaen nax',
      zhText: '勤劳有收获',
      enText: 'diligence pays',
      description: '示例谚语',
      sortOrder: 0,
      isPublished: '已发布',
      audioUrl: '',
      audioMediaId: '',
      title: '',
      artist: '',
      coverUrl: '',
      coverMediaId: '',
    },
  },
  [ContentType.SONG]: {
    type: ContentType.SONG,
    sheetName: 'Songs',
    filename: 'songs-import-template.xlsx',
    orderedFields: ['title', 'artist', 'buyiText', 'zhText', 'enText', 'coverUrl', 'audioUrl', 'description', 'sortOrder', 'isPublished'],
    requiredFields: ['title', 'buyiText', 'zhText'],
    aliases: {
      ...COMMON_ALIASES,
      audioUrl: ['音频地址', 'audioUrl', '歌曲地址'],
      audioMediaId: ['音频媒体ID', 'audioMediaId'],
      title: ['标题', 'title', '歌曲标题'],
      artist: ['歌手/来源', 'artist', '歌手', '来源'],
      coverUrl: ['封面地址', 'coverUrl', '封面'],
      coverMediaId: ['封面媒体ID', 'coverMediaId'],
    },
    buildIdentity: (row) => {
      const title = String(row.title || '').trim();
      const artist = String(row.artist || '').trim();
      return {
        key: buildTextKey([title, artist]),
        title,
        artist: artist || null,
        buyiText: String(row.buyiText || ''),
        zhText: String(row.zhText || ''),
      };
    },
    exampleRow: {
      title: '布依迎客歌',
      artist: '布依山歌集',
      buyiText: 'hau mbou',
      zhText: '欢迎的民歌',
      enText: 'Welcome folk song',
      coverUrl: 'https://example.com/cover.jpg',
      audioUrl: 'https://example.com/song.mp3',
      description: '示例歌曲',
      sortOrder: 0,
      isPublished: '已发布',
      audioMediaId: '',
      coverMediaId: '',
    },
  },
};

export function getContentImportSchema(type: ContentType) {
  return CONTENT_IMPORT_SCHEMAS[type];
}

export function normalizeImportHeaderName(value: string) {
  return String(value || '')
    .replace(/^\uFEFF/, '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/[：:]/g, '');
}
