"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MiniappAuthModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const user_entity_1 = require("../../entities/user.entity");
const auth_sessions_module_1 = require("../auth-sessions/auth-sessions.module");
const miniapp_auth_controller_1 = require("./miniapp-auth.controller");
const miniapp_auth_service_1 = require("./miniapp-auth.service");
const users_module_1 = require("../users/users.module");
const wechat_service_1 = require("../../common/services/wechat.service");
let MiniappAuthModule = class MiniappAuthModule {
};
exports.MiniappAuthModule = MiniappAuthModule;
exports.MiniappAuthModule = MiniappAuthModule = __decorate([
    (0, common_1.Module)({
        imports: [users_module_1.UsersModule, auth_sessions_module_1.AuthSessionsModule, typeorm_1.TypeOrmModule.forFeature([user_entity_1.User])],
        controllers: [miniapp_auth_controller_1.MiniappAuthController],
        providers: [miniapp_auth_service_1.MiniappAuthService, wechat_service_1.WechatService],
    })
], MiniappAuthModule);
//# sourceMappingURL=miniapp-auth.module.js.map