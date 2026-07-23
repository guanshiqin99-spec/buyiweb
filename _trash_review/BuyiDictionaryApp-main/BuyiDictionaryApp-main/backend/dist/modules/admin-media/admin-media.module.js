"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminMediaModule = void 0;
const common_1 = require("@nestjs/common");
const media_module_1 = require("../media/media.module");
const admin_media_controller_1 = require("./admin-media.controller");
let AdminMediaModule = class AdminMediaModule {
};
exports.AdminMediaModule = AdminMediaModule;
exports.AdminMediaModule = AdminMediaModule = __decorate([
    (0, common_1.Module)({
        imports: [media_module_1.MediaModule],
        controllers: [admin_media_controller_1.AdminMediaController],
    })
], AdminMediaModule);
//# sourceMappingURL=admin-media.module.js.map