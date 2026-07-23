"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MiniappPhrasesModule = void 0;
const common_1 = require("@nestjs/common");
const content_module_1 = require("../content/content.module");
const miniapp_phrases_controller_1 = require("./miniapp-phrases.controller");
let MiniappPhrasesModule = class MiniappPhrasesModule {
};
exports.MiniappPhrasesModule = MiniappPhrasesModule;
exports.MiniappPhrasesModule = MiniappPhrasesModule = __decorate([
    (0, common_1.Module)({
        imports: [content_module_1.ContentModule],
        controllers: [miniapp_phrases_controller_1.MiniappPhrasesController],
    })
], MiniappPhrasesModule);
//# sourceMappingURL=miniapp-phrases.module.js.map