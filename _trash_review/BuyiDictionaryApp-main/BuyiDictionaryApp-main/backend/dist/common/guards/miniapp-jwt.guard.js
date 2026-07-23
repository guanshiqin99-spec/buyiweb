"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MiniappJwtGuard = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("./jwt-auth.guard");
let MiniappJwtGuard = class MiniappJwtGuard extends jwt_auth_guard_1.JwtAuthGuard {
    async canActivate(context) {
        const allowed = await super.canActivate(context);
        const request = context.switchToHttp().getRequest();
        if (request.user?.tokenType !== 'miniapp') {
            throw new common_1.UnauthorizedException('\u9700\u8981\u5c0f\u7a0b\u5e8f\u7528\u6237\u8eab\u4efd');
        }
        return allowed;
    }
};
exports.MiniappJwtGuard = MiniappJwtGuard;
exports.MiniappJwtGuard = MiniappJwtGuard = __decorate([
    (0, common_1.Injectable)()
], MiniappJwtGuard);
//# sourceMappingURL=miniapp-jwt.guard.js.map