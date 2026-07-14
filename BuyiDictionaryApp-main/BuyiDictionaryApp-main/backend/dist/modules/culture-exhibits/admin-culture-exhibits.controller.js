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
exports.AdminCultureExhibitsController = void 0;
const common_1 = require("@nestjs/common");
const admin_jwt_guard_1 = require("../../common/guards/admin-jwt.guard");
const culture_exhibits_service_1 = require("./culture-exhibits.service");
const culture_exhibit_dto_1 = require("./dto/culture-exhibit.dto");
let AdminCultureExhibitsController = class AdminCultureExhibitsController {
    constructor(cultureExhibitsService) {
        this.cultureExhibitsService = cultureExhibitsService;
    }
    list() { return this.cultureExhibitsService.listAdmin(); }
    create(payload) { return this.cultureExhibitsService.create(payload); }
    update(id, payload) {
        return this.cultureExhibitsService.update(id, payload);
    }
    remove(id) { return this.cultureExhibitsService.remove(id); }
    links(exhibitId) {
        return this.cultureExhibitsService.listLinks(exhibitId ? Number(exhibitId) : undefined);
    }
    createLink(payload) { return this.cultureExhibitsService.createLink(payload); }
    removeLink(id) { return this.cultureExhibitsService.removeLink(id); }
};
exports.AdminCultureExhibitsController = AdminCultureExhibitsController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdminCultureExhibitsController.prototype, "list", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [culture_exhibit_dto_1.CreateCultureExhibitDto]),
    __metadata("design:returntype", void 0)
], AdminCultureExhibitsController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, culture_exhibit_dto_1.UpdateCultureExhibitDto]),
    __metadata("design:returntype", void 0)
], AdminCultureExhibitsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], AdminCultureExhibitsController.prototype, "remove", null);
__decorate([
    (0, common_1.Get)('links/all'),
    __param(0, (0, common_1.Query)('exhibitId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AdminCultureExhibitsController.prototype, "links", null);
__decorate([
    (0, common_1.Post)('links'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [culture_exhibit_dto_1.CreateContentCultureLinkDto]),
    __metadata("design:returntype", void 0)
], AdminCultureExhibitsController.prototype, "createLink", null);
__decorate([
    (0, common_1.Delete)('links/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], AdminCultureExhibitsController.prototype, "removeLink", null);
exports.AdminCultureExhibitsController = AdminCultureExhibitsController = __decorate([
    (0, common_1.Controller)('admin/culture-exhibits'),
    (0, common_1.UseGuards)(admin_jwt_guard_1.AdminJwtGuard),
    __metadata("design:paramtypes", [culture_exhibits_service_1.CultureExhibitsService])
], AdminCultureExhibitsController);
//# sourceMappingURL=admin-culture-exhibits.controller.js.map