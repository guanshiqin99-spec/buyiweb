"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MiniappDictionaryModule = void 0;
const common_1 = require("@nestjs/common");
const content_module_1 = require("../content/content.module");
const miniapp_favorites_module_1 = require("../miniapp-favorites/miniapp-favorites.module");
const miniapp_dictionary_controller_1 = require("./miniapp-dictionary.controller");
let MiniappDictionaryModule = class MiniappDictionaryModule {
};
exports.MiniappDictionaryModule = MiniappDictionaryModule;
exports.MiniappDictionaryModule = MiniappDictionaryModule = __decorate([
    (0, common_1.Module)({
        imports: [content_module_1.ContentModule, miniapp_favorites_module_1.MiniappFavoritesModule],
        controllers: [miniapp_dictionary_controller_1.MiniappDictionaryController],
    })
], MiniappDictionaryModule);
//# sourceMappingURL=miniapp-dictionary.module.js.map