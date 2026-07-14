"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContentModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const dictionary_entry_entity_1 = require("../../entities/dictionary-entry.entity");
const phrase_entity_1 = require("../../entities/phrase.entity");
const proverb_entity_1 = require("../../entities/proverb.entity");
const song_entity_1 = require("../../entities/song.entity");
const culture_exhibits_module_1 = require("../culture-exhibits/culture-exhibits.module");
const content_import_service_1 = require("./content-import.service");
const content_sort_service_1 = require("./content-sort.service");
const content_service_1 = require("./content.service");
let ContentModule = class ContentModule {
};
exports.ContentModule = ContentModule;
exports.ContentModule = ContentModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([dictionary_entry_entity_1.DictionaryEntry, phrase_entity_1.Phrase, proverb_entity_1.Proverb, song_entity_1.Song]), culture_exhibits_module_1.CultureExhibitsModule],
        providers: [content_service_1.ContentService, content_sort_service_1.ContentSortService, content_import_service_1.ContentImportService],
        exports: [content_service_1.ContentService, typeorm_1.TypeOrmModule],
    })
], ContentModule);
//# sourceMappingURL=content.module.js.map