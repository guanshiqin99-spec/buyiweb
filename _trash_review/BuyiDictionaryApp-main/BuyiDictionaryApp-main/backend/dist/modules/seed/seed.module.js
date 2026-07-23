"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SeedModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const admin_entity_1 = require("../../entities/admin.entity");
const dictionary_entry_entity_1 = require("../../entities/dictionary-entry.entity");
const phrase_entity_1 = require("../../entities/phrase.entity");
const proverb_entity_1 = require("../../entities/proverb.entity");
const song_entity_1 = require("../../entities/song.entity");
const culture_exhibit_entity_1 = require("../../entities/culture-exhibit.entity");
const content_culture_link_entity_1 = require("../../entities/content-culture-link.entity");
const seed_service_1 = require("./seed.service");
let SeedModule = class SeedModule {
};
exports.SeedModule = SeedModule;
exports.SeedModule = SeedModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([admin_entity_1.Admin, dictionary_entry_entity_1.DictionaryEntry, phrase_entity_1.Phrase, proverb_entity_1.Proverb, song_entity_1.Song, culture_exhibit_entity_1.CultureExhibit, content_culture_link_entity_1.ContentCultureLink])],
        providers: [seed_service_1.SeedService],
    })
], SeedModule);
//# sourceMappingURL=seed.module.js.map