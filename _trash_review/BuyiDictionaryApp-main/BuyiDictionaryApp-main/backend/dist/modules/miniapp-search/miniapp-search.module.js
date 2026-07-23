"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MiniappSearchModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const learning_record_entity_1 = require("../../entities/learning-record.entity");
const content_module_1 = require("../content/content.module");
const miniapp_favorites_module_1 = require("../miniapp-favorites/miniapp-favorites.module");
const miniapp_search_controller_1 = require("./miniapp-search.controller");
let MiniappSearchModule = class MiniappSearchModule {
};
exports.MiniappSearchModule = MiniappSearchModule;
exports.MiniappSearchModule = MiniappSearchModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([learning_record_entity_1.LearningRecord]), content_module_1.ContentModule, miniapp_favorites_module_1.MiniappFavoritesModule],
        controllers: [miniapp_search_controller_1.MiniappSearchController],
    })
], MiniappSearchModule);
//# sourceMappingURL=miniapp-search.module.js.map