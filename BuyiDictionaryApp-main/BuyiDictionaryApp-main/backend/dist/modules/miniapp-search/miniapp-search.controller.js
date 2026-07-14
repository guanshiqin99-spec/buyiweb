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
exports.MiniappSearchController = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const public_decorator_1 = require("../../common/decorators/public.decorator");
const miniapp_jwt_guard_1 = require("../../common/guards/miniapp-jwt.guard");
const content_type_enum_1 = require("../../common/enums/content-type.enum");
const learning_record_entity_1 = require("../../entities/learning-record.entity");
const content_service_1 = require("../content/content.service");
const search_query_dto_1 = require("../content/dto/search-query.dto");
const miniapp_favorites_service_1 = require("../miniapp-favorites/miniapp-favorites.service");
let MiniappSearchController = class MiniappSearchController {
    constructor(contentService, favoritesService, learningRecordRepository) {
        this.contentService = contentService;
        this.favoritesService = favoritesService;
        this.learningRecordRepository = learningRecordRepository;
    }
    searchPublic(query) {
        return this.contentService.searchAll(query);
    }
    suggestPublic(keyword) {
        return this.contentService.suggestAll(keyword);
    }
    async hot() {
        const rows = await this.learningRecordRepository
            .createQueryBuilder('r')
            .select(['r.contentId AS contentId', 'r.contentType AS contentType', 'COUNT(*) AS cnt'])
            .where('r.actionType = :action', { action: 'view' })
            .groupBy('r.contentId, r.contentType')
            .orderBy('cnt', 'DESC')
            .limit(8)
            .getRawMany();
        const items = await Promise.all(rows.map(async (row) => {
            try {
                const content = await this.contentService.getPublishedDetail(row.contentType, row.contentId);
                const serialized = this.contentService.serialize(content, row.contentType);
                return {
                    keyword: serialized.zhText || serialized.buyiText || '',
                    contentType: row.contentType,
                    contentId: row.contentId,
                    count: Number(row.cnt),
                };
            }
            catch {
                return null;
            }
        }));
        return { items: items.filter((item) => item && item.keyword) };
    }
    async searchMine(user, query) {
        const result = await this.contentService.searchAll(query);
        return {
            dictionary: await this.favoritesService.annotate(user.sub, content_type_enum_1.ContentType.DICTIONARY, result.dictionary),
            phrases: await this.favoritesService.annotate(user.sub, content_type_enum_1.ContentType.PHRASE, result.phrases),
            proverbs: await this.favoritesService.annotate(user.sub, content_type_enum_1.ContentType.PROVERB, result.proverbs),
            songs: await this.favoritesService.annotate(user.sub, content_type_enum_1.ContentType.SONG, result.songs),
            pagination: result.pagination,
        };
    }
};
exports.MiniappSearchController = MiniappSearchController;
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [search_query_dto_1.SearchQueryDto]),
    __metadata("design:returntype", void 0)
], MiniappSearchController.prototype, "searchPublic", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)('suggest'),
    __param(0, (0, common_1.Query)('keyword')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], MiniappSearchController.prototype, "suggestPublic", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)('hot'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], MiniappSearchController.prototype, "hot", null);
__decorate([
    (0, common_1.UseGuards)(miniapp_jwt_guard_1.MiniappJwtGuard),
    (0, common_1.Get)('mine'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, search_query_dto_1.SearchQueryDto]),
    __metadata("design:returntype", Promise)
], MiniappSearchController.prototype, "searchMine", null);
exports.MiniappSearchController = MiniappSearchController = __decorate([
    (0, common_1.Controller)('miniapp/search'),
    __param(2, (0, typeorm_1.InjectRepository)(learning_record_entity_1.LearningRecord)),
    __metadata("design:paramtypes", [content_service_1.ContentService,
        miniapp_favorites_service_1.MiniappFavoritesService,
        typeorm_2.Repository])
], MiniappSearchController);
//# sourceMappingURL=miniapp-search.controller.js.map