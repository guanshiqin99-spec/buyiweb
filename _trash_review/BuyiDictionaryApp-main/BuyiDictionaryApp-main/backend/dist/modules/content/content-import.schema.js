"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CONTENT_IMPORT_SCHEMAS = exports.IMPORT_FIELD_LABELS = void 0;
exports.getContentImportSchema = getContentImportSchema;
exports.normalizeImportHeaderName = normalizeImportHeaderName;
const content_type_enum_1 = require("../../common/enums/content-type.enum");
exports.IMPORT_FIELD_LABELS = {
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
const COMMON_ALIASES = {
    buyiText: ['布依语', 'buyiText', '布依文', '词目'],
    zhText: ['中文', '中文释义', 'zhText', '汉语'],
    enText: ['英文', '英文释义', 'enText'],
    description: ['说明', '备注', 'description'],
    sortOrder: ['排序值', 'sortOrder'],
    isPublished: ['发布状态', 'isPublished', '是否发布'],
};
function buildTextKey(parts) {
    return parts.map((part) => String(part || '').trim()).join('::');
}
exports.CONTENT_IMPORT_SCHEMAS = {
    [content_type_enum_1.ContentType.DICTIONARY]: {
        type: content_type_enum_1.ContentType.DICTIONARY,
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
            key: buildTextKey([row.buyiText, row.zhText]),
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
    [content_type_enum_1.ContentType.PHRASE]: {
        type: content_type_enum_1.ContentType.PHRASE,
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
            key: buildTextKey([row.buyiText, row.zhText]),
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
    [content_type_enum_1.ContentType.PROVERB]: {
        type: content_type_enum_1.ContentType.PROVERB,
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
            key: buildTextKey([row.buyiText, row.zhText]),
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
    [content_type_enum_1.ContentType.SONG]: {
        type: content_type_enum_1.ContentType.SONG,
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
function getContentImportSchema(type) {
    return exports.CONTENT_IMPORT_SCHEMAS[type];
}
function normalizeImportHeaderName(value) {
    return String(value || '')
        .replace(/^\uFEFF/, '')
        .trim()
        .toLowerCase()
        .replace(/\s+/g, '')
        .replace(/[：:]/g, '');
}
//# sourceMappingURL=content-import.schema.js.map