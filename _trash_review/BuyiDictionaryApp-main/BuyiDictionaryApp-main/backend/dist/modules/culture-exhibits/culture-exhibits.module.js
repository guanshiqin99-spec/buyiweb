"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CultureExhibitsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const content_culture_link_entity_1 = require("../../entities/content-culture-link.entity");
const culture_exhibit_entity_1 = require("../../entities/culture-exhibit.entity");
const admin_culture_exhibits_controller_1 = require("./admin-culture-exhibits.controller");
const culture_exhibits_service_1 = require("./culture-exhibits.service");
const miniapp_culture_exhibits_controller_1 = require("./miniapp-culture-exhibits.controller");
let CultureExhibitsModule = class CultureExhibitsModule {
};
exports.CultureExhibitsModule = CultureExhibitsModule;
exports.CultureExhibitsModule = CultureExhibitsModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([culture_exhibit_entity_1.CultureExhibit, content_culture_link_entity_1.ContentCultureLink])],
        controllers: [miniapp_culture_exhibits_controller_1.MiniappCultureExhibitsController, admin_culture_exhibits_controller_1.AdminCultureExhibitsController],
        providers: [culture_exhibits_service_1.CultureExhibitsService],
        exports: [culture_exhibits_service_1.CultureExhibitsService],
    })
], CultureExhibitsModule);
//# sourceMappingURL=culture-exhibits.module.js.map