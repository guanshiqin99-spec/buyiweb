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
exports.AdminMediaController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const admin_jwt_guard_1 = require("../../common/guards/admin-jwt.guard");
const media_service_1 = require("../media/media.service");
const upload_media_dto_1 = require("../media/dto/upload-media.dto");
let AdminMediaController = class AdminMediaController {
    constructor(mediaService) {
        this.mediaService = mediaService;
    }
    list() {
        return this.mediaService.list();
    }
    upload(file, payload) {
        return this.mediaService.upload(file, payload);
    }
    remove(id) {
        return this.mediaService.remove(id);
    }
};
exports.AdminMediaController = AdminMediaController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdminMediaController.prototype, "list", null);
__decorate([
    (0, common_1.Post)('upload'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', {
        limits: {
            fileSize: Number(process.env.MEDIA_MAX_FILE_SIZE ?? 10 * 1024 * 1024),
        },
    })),
    __param(0, (0, common_1.UploadedFile)(new common_1.ParseFilePipeBuilder()
        .build({
        fileIsRequired: true,
        errorHttpStatusCode: 400,
    }))),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, upload_media_dto_1.UploadMediaDto]),
    __metadata("design:returntype", void 0)
], AdminMediaController.prototype, "upload", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], AdminMediaController.prototype, "remove", null);
exports.AdminMediaController = AdminMediaController = __decorate([
    (0, common_1.Controller)('admin/media'),
    (0, common_1.UseGuards)(admin_jwt_guard_1.AdminJwtGuard),
    __metadata("design:paramtypes", [media_service_1.MediaService])
], AdminMediaController);
//# sourceMappingURL=admin-media.controller.js.map