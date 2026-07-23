"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MiniappBadgesService = exports.BADGE_DEFINITIONS = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const content_type_enum_1 = require("../../common/enums/content-type.enum");
const badge_entity_1 = require("../../entities/badge.entity");
const favorite_entity_1 = require("../../entities/favorite.entity");
const learning_record_entity_1 = require("../../entities/learning-record.entity");
const learning_stats_1 = require("../miniapp-learning-records/learning-stats");
exports.BADGE_DEFINITIONS = {
    'first-word': { name: '初识布依', description: '查看了第一个布依语词条', pattern: 'batik' },
    'streak-7': { name: '七日不辍', description: '连续学习 7 天', pattern: 'drum' },
    'streak-30': { name: '月学不辍', description: '连续学习 30 天', pattern: 'drum' },
    'explorer': { name: '文化探索者', description: '浏览全部四类内容', pattern: 'weaving' },
    'collector': { name: '词汇收藏家', description: '收藏 10 个词条', pattern: 'batik' },
    'singer': { name: '天籁之音', description: '聆听 5 首民歌', pattern: 'weaving' },
};
let MiniappBadgesService = class MiniappBadgesService {
    constructor(badgeRepository, favoriteRepository, learningRecordRepository) {
        this.badgeRepository = badgeRepository;
        this.favoriteRepository = favoriteRepository;
        this.learningRecordRepository = learningRecordRepository;
    }
    async list(userId) {
        const badges = await this.syncProgressBadges(userId);
        const badgeByCode = new Map(badges.map((badge) => [badge.code, badge]));
        const all = Object.entries(exports.BADGE_DEFINITIONS).map(([code, def]) => {
            const unlocked = badgeByCode.get(code);
            const isUnlocked = Boolean(unlocked);
            return {
                id: unlocked?.id ?? code,
                code,
                name: def.name,
                description: def.description,
                pattern: def.pattern,
                locked: !isUnlocked,
                unlocked: isUnlocked,
                isUnlocked,
                unlockedAt: unlocked?.unlockedAt ?? null,
            };
        });
        return {
            items: all,
            total: all.length,
            unlockedCount: badgeByCode.size,
        };
    }
    async syncProgressBadges(userId) {
        const [badges, records, favoriteCount] = await Promise.all([
            this.badgeRepository.find({
                where: { userId },
                order: { unlockedAt: 'DESC' },
            }),
            this.learningRecordRepository.find({ where: { userId } }),
            this.favoriteRepository.count({ where: { userId } }),
        ]);
        const stats = (0, learning_stats_1.calculateLearningStats)(records);
        const contentTypes = new Set(records.map((record) => record.contentType));
        const listenedSongIds = new Set(records
            .filter((record) => record.contentType === content_type_enum_1.ContentType.SONG && record.actionType === 'play')
            .map((record) => record.contentId));
        const eligibleCodes = [
            records.some((record) => record.contentType === content_type_enum_1.ContentType.DICTIONARY) && 'first-word',
            stats.streakDays >= 7 && 'streak-7',
            stats.streakDays >= 30 && 'streak-30',
            Object.values(content_type_enum_1.ContentType).every((type) => contentTypes.has(type)) && 'explorer',
            favoriteCount >= 10 && 'collector',
            listenedSongIds.size >= 5 && 'singer',
        ].filter((code) => Boolean(code));
        const unlockedCodes = new Set(badges.map((badge) => badge.code));
        const missingCodes = eligibleCodes.filter((code) => !unlockedCodes.has(code));
        if (!missingCodes.length)
            return badges;
        const unlocked = await this.badgeRepository.save(missingCodes.map((code) => this.badgeRepository.create({ userId, code })));
        return [...unlocked, ...badges];
    }
    async unlock(userId, code) {
        const exists = await this.badgeRepository.findOne({ where: { userId, code } });
        if (exists)
            return exists;
        return this.badgeRepository.save(this.badgeRepository.create({ userId, code }));
    }
};
exports.MiniappBadgesService = MiniappBadgesService;
exports.MiniappBadgesService = MiniappBadgesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(badge_entity_1.Badge)),
    __param(1, (0, typeorm_1.InjectRepository)(favorite_entity_1.Favorite)),
    __param(2, (0, typeorm_1.InjectRepository)(learning_record_entity_1.LearningRecord)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], MiniappBadgesService);
//# sourceMappingURL=miniapp-badges.service.js.map