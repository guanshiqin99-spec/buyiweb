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
exports.MiniappFavoritesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const content_type_enum_1 = require("../../common/enums/content-type.enum");
const favorite_entity_1 = require("../../entities/favorite.entity");
const content_service_1 = require("../content/content.service");
let MiniappFavoritesService = class MiniappFavoritesService {
    constructor(favoriteRepository, contentService) {
        this.favoriteRepository = favoriteRepository;
        this.contentService = contentService;
    }
    async getFavoriteMap(userId) {
        const favorites = await this.favoriteRepository.find({ where: { userId } });
        return new Set(favorites.map((item) => `${item.contentType}:${item.contentId}`));
    }
    async list(userId) {
        const favorites = await this.favoriteRepository.find({
            where: { userId },
            order: { id: 'DESC' },
        });
        const grouped = favorites.reduce((acc, current) => {
            acc[current.contentType] = acc[current.contentType] || [];
            acc[current.contentType].push(current.contentId);
            return acc;
        }, {});
        const [dictionary, phrases, proverbs, songs] = await Promise.all([
            this.contentService.getByIds(content_type_enum_1.ContentType.DICTIONARY, grouped[content_type_enum_1.ContentType.DICTIONARY] ?? []),
            this.contentService.getByIds(content_type_enum_1.ContentType.PHRASE, grouped[content_type_enum_1.ContentType.PHRASE] ?? []),
            this.contentService.getByIds(content_type_enum_1.ContentType.PROVERB, grouped[content_type_enum_1.ContentType.PROVERB] ?? []),
            this.contentService.getByIds(content_type_enum_1.ContentType.SONG, grouped[content_type_enum_1.ContentType.SONG] ?? []),
        ]);
        return {
            dictionary: dictionary.map((item) => ({ ...this.contentService.serialize(item, content_type_enum_1.ContentType.DICTIONARY), isFavorited: true })),
            phrases: phrases.map((item) => ({ ...this.contentService.serialize(item, content_type_enum_1.ContentType.PHRASE), isFavorited: true })),
            proverbs: proverbs.map((item) => ({ ...this.contentService.serialize(item, content_type_enum_1.ContentType.PROVERB), isFavorited: true })),
            songs: songs.map((item) => ({ ...this.contentService.serialize(item, content_type_enum_1.ContentType.SONG), isFavorited: true })),
        };
    }
    async toggle(userId, contentType, contentId) {
        const existing = await this.favoriteRepository.findOne({
            where: { userId, contentType, contentId },
        });
        if (existing) {
            await this.favoriteRepository.remove(existing);
            return { isFavorited: false };
        }
        await this.favoriteRepository.save(this.favoriteRepository.create({
            userId,
            contentType,
            contentId,
        }));
        return { isFavorited: true };
    }
    async clear(userId) {
        const result = await this.favoriteRepository.delete({ userId });
        return {
            success: true,
            deletedCount: result.affected ?? 0,
            message: '\u5df2\u6e05\u7a7a\u6536\u85cf',
        };
    }
    async annotate(userId, contentType, items) {
        if (!items.length) {
            return [];
        }
        const favorites = await this.favoriteRepository.find({
            where: {
                userId,
                contentType,
                contentId: (0, typeorm_2.In)(items.map((item) => item.id)),
            },
        });
        const favoriteIds = new Set(favorites.map((item) => item.contentId));
        return items.map((item) => ({ ...item, isFavorited: favoriteIds.has(item.id) }));
    }
};
exports.MiniappFavoritesService = MiniappFavoritesService;
exports.MiniappFavoritesService = MiniappFavoritesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(favorite_entity_1.Favorite)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        content_service_1.ContentService])
], MiniappFavoritesService);
//# sourceMappingURL=miniapp-favorites.service.js.map