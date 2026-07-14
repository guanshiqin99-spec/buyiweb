"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MiniappBadgesModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const badge_entity_1 = require("../../entities/badge.entity");
const miniapp_badges_controller_1 = require("./miniapp-badges.controller");
const miniapp_badges_service_1 = require("./miniapp-badges.service");
let MiniappBadgesModule = class MiniappBadgesModule {
};
exports.MiniappBadgesModule = MiniappBadgesModule;
exports.MiniappBadgesModule = MiniappBadgesModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([badge_entity_1.Badge])],
        controllers: [miniapp_badges_controller_1.MiniappBadgesController],
        providers: [miniapp_badges_service_1.MiniappBadgesService],
        exports: [miniapp_badges_service_1.MiniappBadgesService],
    })
], MiniappBadgesModule);
//# sourceMappingURL=miniapp-badges.module.js.map