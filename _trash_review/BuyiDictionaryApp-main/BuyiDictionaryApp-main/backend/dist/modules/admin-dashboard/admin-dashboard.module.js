"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminDashboardModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const dictionary_entry_entity_1 = require("../../entities/dictionary-entry.entity");
const favorite_entity_1 = require("../../entities/favorite.entity");
const learning_record_entity_1 = require("../../entities/learning-record.entity");
const phrase_entity_1 = require("../../entities/phrase.entity");
const proverb_entity_1 = require("../../entities/proverb.entity");
const song_entity_1 = require("../../entities/song.entity");
const user_entity_1 = require("../../entities/user.entity");
const admin_dashboard_controller_1 = require("./admin-dashboard.controller");
const admin_dashboard_service_1 = require("./admin-dashboard.service");
let AdminDashboardModule = class AdminDashboardModule {
};
exports.AdminDashboardModule = AdminDashboardModule;
exports.AdminDashboardModule = AdminDashboardModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([user_entity_1.User, dictionary_entry_entity_1.DictionaryEntry, phrase_entity_1.Phrase, proverb_entity_1.Proverb, song_entity_1.Song, favorite_entity_1.Favorite, learning_record_entity_1.LearningRecord])],
        controllers: [admin_dashboard_controller_1.AdminDashboardController],
        providers: [admin_dashboard_service_1.AdminDashboardService],
    })
], AdminDashboardModule);
//# sourceMappingURL=admin-dashboard.module.js.map