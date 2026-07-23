"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminContentModule = void 0;
const common_1 = require("@nestjs/common");
const content_module_1 = require("../content/content.module");
const admin_dictionary_controller_1 = require("./admin-dictionary.controller");
const admin_phrases_controller_1 = require("./admin-phrases.controller");
const admin_proverbs_controller_1 = require("./admin-proverbs.controller");
const admin_songs_controller_1 = require("./admin-songs.controller");
let AdminContentModule = class AdminContentModule {
};
exports.AdminContentModule = AdminContentModule;
exports.AdminContentModule = AdminContentModule = __decorate([
    (0, common_1.Module)({
        imports: [content_module_1.ContentModule],
        controllers: [admin_dictionary_controller_1.AdminDictionaryController, admin_phrases_controller_1.AdminPhrasesController, admin_proverbs_controller_1.AdminProverbsController, admin_songs_controller_1.AdminSongsController],
    })
], AdminContentModule);
//# sourceMappingURL=admin-content.module.js.map