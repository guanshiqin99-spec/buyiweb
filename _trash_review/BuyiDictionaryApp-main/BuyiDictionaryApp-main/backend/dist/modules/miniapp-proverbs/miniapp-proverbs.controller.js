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
exports.MiniappProverbsController = void 0;
const common_1 = require("@nestjs/common");
const public_decorator_1 = require("../../common/decorators/public.decorator");
const content_type_enum_1 = require("../../common/enums/content-type.enum");
const content_service_1 = require("../content/content.service");
const search_query_dto_1 = require("../content/dto/search-query.dto");
let MiniappProverbsController = class MiniappProverbsController {
    constructor(contentService) {
        this.contentService = contentService;
    }
    list(query) {
        return this.contentService.listPublished(content_type_enum_1.ContentType.PROVERB, query);
    }
    async detail(id) {
        const item = await this.contentService.getPublishedDetail(content_type_enum_1.ContentType.PROVERB, id);
        return this.contentService.serialize(item, content_type_enum_1.ContentType.PROVERB);
    }
};
exports.MiniappProverbsController = MiniappProverbsController;
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [search_query_dto_1.SearchQueryDto]),
    __metadata("design:returntype", void 0)
], MiniappProverbsController.prototype, "list", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], MiniappProverbsController.prototype, "detail", null);
exports.MiniappProverbsController = MiniappProverbsController = __decorate([
    (0, common_1.Controller)('miniapp/proverbs'),
    __metadata("design:paramtypes", [content_service_1.ContentService])
], MiniappProverbsController);
//# sourceMappingURL=miniapp-proverbs.controller.js.map