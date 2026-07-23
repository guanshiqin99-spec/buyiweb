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
exports.MiniappDictionaryController = void 0;
const common_1 = require("@nestjs/common");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const public_decorator_1 = require("../../common/decorators/public.decorator");
const miniapp_jwt_guard_1 = require("../../common/guards/miniapp-jwt.guard");
const content_type_enum_1 = require("../../common/enums/content-type.enum");
const content_service_1 = require("../content/content.service");
const search_query_dto_1 = require("../content/dto/search-query.dto");
const miniapp_favorites_service_1 = require("../miniapp-favorites/miniapp-favorites.service");
let MiniappDictionaryController = class MiniappDictionaryController {
    constructor(contentService, favoritesService) {
        this.contentService = contentService;
        this.favoritesService = favoritesService;
    }
    async list(query) {
        const result = await this.contentService.listPublished(content_type_enum_1.ContentType.DICTIONARY, query);
        return {
            ...result,
            items: await Promise.all(result.items.map((item) => this.contentService.serializeWithRelatedExhibits(item, content_type_enum_1.ContentType.DICTIONARY))),
        };
    }
    async listMine(user, query) {
        const result = await this.contentService.listPublished(content_type_enum_1.ContentType.DICTIONARY, query);
        return {
            ...result,
            items: await this.favoritesService.annotate(user.sub, content_type_enum_1.ContentType.DICTIONARY, result.items.map((item) => this.contentService.serialize(item, content_type_enum_1.ContentType.DICTIONARY))),
        };
    }
    async detail(id) {
        const item = await this.contentService.getPublishedDetail(content_type_enum_1.ContentType.DICTIONARY, id);
        return this.contentService.serializeWithRelatedExhibits(item, content_type_enum_1.ContentType.DICTIONARY);
    }
};
exports.MiniappDictionaryController = MiniappDictionaryController;
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [search_query_dto_1.SearchQueryDto]),
    __metadata("design:returntype", Promise)
], MiniappDictionaryController.prototype, "list", null);
__decorate([
    (0, common_1.UseGuards)(miniapp_jwt_guard_1.MiniappJwtGuard),
    (0, common_1.Get)('mine'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, search_query_dto_1.SearchQueryDto]),
    __metadata("design:returntype", Promise)
], MiniappDictionaryController.prototype, "listMine", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], MiniappDictionaryController.prototype, "detail", null);
exports.MiniappDictionaryController = MiniappDictionaryController = __decorate([
    (0, common_1.Controller)('miniapp/dictionary'),
    __metadata("design:paramtypes", [content_service_1.ContentService,
        miniapp_favorites_service_1.MiniappFavoritesService])
], MiniappDictionaryController);
//# sourceMappingURL=miniapp-dictionary.controller.js.map