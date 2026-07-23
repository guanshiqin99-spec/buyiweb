"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.migrations = exports.entities = void 0;
exports.buildTypeOrmOptions = buildTypeOrmOptions;
exports.typeOrmConfigFactory = typeOrmConfigFactory;
const sql_js_1 = require("sql.js");
const admin_entity_1 = require("../entities/admin.entity");
const agent_cache_entity_1 = require("../entities/agent-cache.entity");
const auth_session_entity_1 = require("../entities/auth-session.entity");
const badge_entity_1 = require("../entities/badge.entity");
const content_culture_link_entity_1 = require("../entities/content-culture-link.entity");
const culture_exhibit_entity_1 = require("../entities/culture-exhibit.entity");
const dictionary_entry_entity_1 = require("../entities/dictionary-entry.entity");
const favorite_entity_1 = require("../entities/favorite.entity");
const learning_record_entity_1 = require("../entities/learning-record.entity");
const media_asset_entity_1 = require("../entities/media-asset.entity");
const phrase_entity_1 = require("../entities/phrase.entity");
const proverb_entity_1 = require("../entities/proverb.entity");
const quiz_attempt_entity_1 = require("../entities/quiz-attempt.entity");
const song_entity_1 = require("../entities/song.entity");
const user_setting_entity_1 = require("../entities/user-setting.entity");
const user_entity_1 = require("../entities/user.entity");
const wechat_account_entity_1 = require("../entities/wechat-account.entity");
const _1710000000000_baseline_schema_1 = require("../migrations/1710000000000-baseline-schema");
const _1721000000000_add_culture_exhibits_1 = require("../migrations/1721000000000-add-culture-exhibits");
const _1722000000000_add_quiz_attempts_1 = require("../migrations/1722000000000-add-quiz-attempts");
exports.entities = [
    admin_entity_1.Admin,
    agent_cache_entity_1.AgentCache,
    auth_session_entity_1.AuthSession,
    user_entity_1.User,
    wechat_account_entity_1.WechatAccount,
    user_setting_entity_1.UserSetting,
    media_asset_entity_1.MediaAsset,
    dictionary_entry_entity_1.DictionaryEntry,
    phrase_entity_1.Phrase,
    proverb_entity_1.Proverb,
    song_entity_1.Song,
    favorite_entity_1.Favorite,
    learning_record_entity_1.LearningRecord,
    quiz_attempt_entity_1.QuizAttempt,
    badge_entity_1.Badge,
    culture_exhibit_entity_1.CultureExhibit,
    content_culture_link_entity_1.ContentCultureLink,
];
exports.migrations = [_1710000000000_baseline_schema_1.BaselineSchema1710000000000, _1721000000000_add_culture_exhibits_1.AddCultureExhibits1721000000000, _1722000000000_add_quiz_attempts_1.AddQuizAttempts1722000000000];
function buildTypeOrmOptions(config) {
    const { db } = config;
    const synchronize = db.synchronize;
    const logging = db.logging;
    if (db.type === 'mysql') {
        return {
            type: 'mysql',
            host: db.host,
            port: db.port,
            username: db.username,
            password: db.password,
            database: db.database,
            entities: exports.entities,
            migrations: exports.migrations,
            migrationsTableName: 'migrations',
            synchronize,
            logging,
            charset: 'utf8mb4',
            connectTimeout: 30000,
            timezone: '+08:00',
        };
    }
    const isVercel = process.env.VERCEL === '1';
    const dbLocation = isVercel ? `/tmp/${db.database}` : db.database;
    return {
        type: 'sqljs',
        location: dbLocation,
        autoSave: true,
        driver: sql_js_1.default,
        entities: exports.entities,
        migrations: exports.migrations,
        migrationsTableName: 'migrations',
        synchronize,
        logging,
    };
}
function typeOrmConfigFactory(configService) {
    return buildTypeOrmOptions({
        db: {
            type: configService.get('db.type', 'sqljs'),
            host: configService.get('db.host', '127.0.0.1'),
            port: configService.get('db.port', 3306),
            username: configService.get('db.username', 'root'),
            password: configService.get('db.password', ''),
            database: configService.get('db.database', 'buyi_dictionary'),
            synchronize: configService.get('db.synchronize', true),
            logging: configService.get('db.logging', false),
        },
    });
}
//# sourceMappingURL=database.config.js.map