"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JwtAuthGuard = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const core_1 = require("@nestjs/core");
const jwt_1 = require("@nestjs/jwt");
const public_decorator_1 = require("../decorators/public.decorator");
const auth_sessions_service_1 = require("../../modules/auth-sessions/auth-sessions.service");
let JwtAuthGuard = class JwtAuthGuard {
    constructor(reflector, jwtService, configService, authSessionsService) {
        this.reflector = reflector;
        this.jwtService = jwtService;
        this.configService = configService;
        this.authSessionsService = authSessionsService;
    }
    async canActivate(context) {
        const isPublic = this.reflector.getAllAndOverride(public_decorator_1.IS_PUBLIC_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (isPublic) {
            return true;
        }
        const request = context.switchToHttp().getRequest();
        const authHeader = request.headers.authorization;
        if (!authHeader?.startsWith('Bearer ')) {
            throw new common_1.UnauthorizedException('\u7f3a\u5c11\u767b\u5f55\u4ee4\u724c');
        }
        const token = authHeader.slice('Bearer '.length);
        try {
            const payload = this.jwtService.verify(token, {
                secret: this.configService.get('jwt.secret', 'change-me'),
            });
            if (payload.tokenKind !== 'access') {
                throw new common_1.UnauthorizedException('\u767b\u5f55\u4ee4\u724c\u7c7b\u578b\u65e0\u6548');
            }
            if (!payload.sid || !payload.tokenType) {
                throw new common_1.UnauthorizedException('\u767b\u5f55\u4f1a\u8bdd\u4e0d\u5b58\u5728');
            }
            const sessionIsActive = await this.authSessionsService.validateAccessSession({
                sessionId: payload.sid,
                userType: payload.tokenType,
                userId: payload.sub,
            });
            if (!sessionIsActive) {
                throw new common_1.UnauthorizedException('\u5f53\u524d\u4f1a\u8bdd\u5df2\u5931\u6548\uff0c\u8bf7\u91cd\u65b0\u767b\u5f55');
            }
            request.user = payload;
            return true;
        }
        catch {
            throw new common_1.UnauthorizedException('\u767b\u5f55\u5df2\u5931\u6548\uff0c\u8bf7\u91cd\u65b0\u767b\u5f55');
        }
    }
};
exports.JwtAuthGuard = JwtAuthGuard;
exports.JwtAuthGuard = JwtAuthGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.Reflector,
        jwt_1.JwtService,
        config_1.ConfigService,
        auth_sessions_service_1.AuthSessionsService])
], JwtAuthGuard);
//# sourceMappingURL=jwt-auth.guard.js.map