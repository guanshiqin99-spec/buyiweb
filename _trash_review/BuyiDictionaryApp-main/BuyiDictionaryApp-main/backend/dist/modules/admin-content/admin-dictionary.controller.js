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
exports.AdminDictionaryController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const admin_jwt_guard_1 = require("../../common/guards/admin-jwt.guard");
const content_type_enum_1 = require("../../common/enums/content-type.enum");
const content_service_1 = require("../content/content.service");
const content_admin_dto_1 = require("../content/dto/content-admin.dto");
const search_query_dto_1 = require("../content/dto/search-query.dto");
let AdminDictionaryController = class AdminDictionaryController {
    constructor(contentService) {
        this.contentService = contentService;
    }
    list(query) {
        return this.contentService.getAdminList(content_type_enum_1.ContentType.DICTIONARY, query);
    }
    create(payload) {
        return this.contentService.createDictionary(payload);
    }
    template(res) {
        const template = this.contentService.getImportTemplate(content_type_enum_1.ContentType.DICTIONARY);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="${template.filename}"`);
        res.send(template.buffer);
    }
    preview(file, mode, skipDuplicates) {
        return this.contentService.previewImport(content_type_enum_1.ContentType.DICTIONARY, file, mode, skipDuplicates);
    }
    import(file, mode, skipDuplicates) {
        return this.contentService.importContent(content_type_enum_1.ContentType.DICTIONARY, file, mode, skipDuplicates);
    }
    update(id, payload) {
        return this.contentService.updateDictionary(id, payload);
    }
    remove(id) {
        return this.contentService.delete(content_type_enum_1.ContentType.DICTIONARY, id);
    }
};
exports.AdminDictionaryController = AdminDictionaryController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [search_query_dto_1.SearchQueryDto]),
    __metadata("design:returntype", void 0)
], AdminDictionaryController.prototype, "list", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [content_admin_dto_1.DictionaryAdminDto]),
    __metadata("design:returntype", void 0)
], AdminDictionaryController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('template'),
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AdminDictionaryController.prototype, "template", null);
__decorate([
    (0, common_1.Post)('import-preview'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', { storage: (0, multer_1.memoryStorage)() })),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Body)('mode')),
    __param(2, (0, common_1.Body)('skipDuplicates')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", void 0)
], AdminDictionaryController.prototype, "preview", null);
__decorate([
    (0, common_1.Post)('import'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', { storage: (0, multer_1.memoryStorage)() })),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Body)('mode')),
    __param(2, (0, common_1.Body)('skipDuplicates')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", void 0)
], AdminDictionaryController.prototype, "import", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, content_admin_dto_1.UpdateDictionaryAdminDto]),
    __metadata("design:returntype", void 0)
], AdminDictionaryController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], AdminDictionaryController.prototype, "remove", null);
exports.AdminDictionaryController = AdminDictionaryController = __decorate([
    (0, common_1.Controller)('admin/dictionary'),
    (0, common_1.UseGuards)(admin_jwt_guard_1.AdminJwtGuard),
    __metadata("design:paramtypes", [content_service_1.ContentService])
], AdminDictionaryController);
//# sourceMappingURL=admin-dictionary.controller.js.map