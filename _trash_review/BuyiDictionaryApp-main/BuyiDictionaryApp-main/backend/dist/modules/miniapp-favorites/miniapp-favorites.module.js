"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MiniappFavoritesModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const favorite_entity_1 = require("../../entities/favorite.entity");
const content_module_1 = require("../content/content.module");
const miniapp_favorites_controller_1 = require("./miniapp-favorites.controller");
const miniapp_favorites_service_1 = require("./miniapp-favorites.service");
let MiniappFavoritesModule = class MiniappFavoritesModule {
};
exports.MiniappFavoritesModule = MiniappFavoritesModule;
exports.MiniappFavoritesModule = MiniappFavoritesModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([favorite_entity_1.Favorite]), content_module_1.ContentModule],
        controllers: [miniapp_favorites_controller_1.MiniappFavoritesController],
        providers: [miniapp_favorites_service_1.MiniappFavoritesService],
        exports: [miniapp_favorites_service_1.MiniappFavoritesService],
    })
], MiniappFavoritesModule);
//# sourceMappingURL=miniapp-favorites.module.js.map