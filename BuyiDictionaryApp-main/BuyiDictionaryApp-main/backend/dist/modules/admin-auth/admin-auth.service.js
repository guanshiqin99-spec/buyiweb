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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminAuthService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const jwt_1 = require("@nestjs/jwt");
const typeorm_1 = require("@nestjs/typeorm");
const bcrypt = require("bcryptjs");
const crypto_1 = require("crypto");
const typeorm_2 = require("typeorm");
const admin_entity_1 = require("../../entities/admin.entity");
const auth_sessions_service_1 = require("../auth-sessions/auth-sessions.service");
let AdminAuthService = class AdminAuthService {
    constructor(adminRepository, jwtService, configService, authSessionsService) {
        this.adminRepository = adminRepository;
        this.jwtService = jwtService;
        this.configService = configService;
        this.authSessionsService = authSessionsService;
    }
    async login(payload) {
        const admin = await this.adminRepository.findOne({ where: { username: payload.username } });
        if (!admin?.isActive) {
            throw new common_1.UnauthorizedException('\u7ba1\u7406\u5458\u8d26\u53f7\u6216\u5bc6\u7801\u9519\u8bef');
        }
        const isValid = await bcrypt.compare(payload.password, admin.passwordHash);
        if (!isValid) {
            throw new common_1.UnauthorizedException('\u7ba1\u7406\u5458\u8d26\u53f7\u6216\u5bc6\u7801\u9519\u8bef');
        }
        const tokens = await this.issueTokens(admin);
        return {
            ...tokens,
            admin: {
                id: admin.id,
                username: admin.username,
                role: admin.role,
            },
        };
    }
    async refresh(refreshToken) {
        const payload = this.verifyRefreshToken(refreshToken);
        const session = await this.authSessionsService.validateRefreshToken({
            sessionId: payload.sid,
            userType: 'admin',
            userId: payload.sub,
            refreshToken,
        });
        if (!session) {
            throw new common_1.UnauthorizedException('\u5237\u65b0\u4ee4\u724c\u5df2\u5931\u6548\uff0c\u8bf7\u91cd\u65b0\u767b\u5f55');
        }
        const admin = await this.adminRepository.findOne({
            where: { id: payload.sub, isActive: true },
        });
        if (!admin) {
            throw new common_1.UnauthorizedException('\u7ba1\u7406\u5458\u8d26\u53f7\u4e0d\u53ef\u7528');
        }
        const tokens = await this.issueTokens(admin, session.sessionId, false);
        await this.authSessionsService.rotateRefreshToken(session.sessionId, tokens.refreshToken, this.getTokenExpiry(tokens.refreshToken));
        return {
            ...tokens,
            admin: {
                id: admin.id,
                username: admin.username,
                role: admin.role,
            },
        };
    }
    async logout(sessionId) {
        await this.authSessionsService.deactivateSession(sessionId, 'admin');
        return {
            success: true,
            message: '\u5df2\u9000\u51fa\u767b\u5f55',
        };
    }
    async issueTokens(admin, sessionId, persistSession = true) {
        const resolvedSessionId = sessionId ?? (0, crypto_1.randomUUID)();
        const accessToken = await this.jwtService.signAsync({
            sub: admin.id,
            sid: resolvedSessionId,
            username: admin.username,
            role: admin.role,
            tokenType: 'admin',
            tokenKind: 'access',
        }, {
            secret: this.configService.get('jwt.secret', 'change-me'),
            expiresIn: this.configService.get('jwt.adminExpiresIn', '1d'),
        });
        const refreshToken = await this.jwtService.signAsync({
            sub: admin.id,
            sid: resolvedSessionId,
            tokenType: 'admin',
            tokenKind: 'refresh',
        }, {
            secret: this.configService.get('jwt.secret', 'change-me'),
            expiresIn: this.configService.get('jwt.adminRefreshExpiresIn', '14d'),
        });
        if (persistSession) {
            await this.authSessionsService.createSession({
                sessionId: resolvedSessionId,
                userType: 'admin',
                userId: admin.id,
                refreshToken,
                expiresAt: this.getTokenExpiry(refreshToken),
            });
        }
        return {
            accessToken,
            refreshToken,
        };
    }
    verifyRefreshToken(refreshToken) {
        try {
            const payload = this.jwtService.verify(refreshToken, {
                secret: this.configService.get('jwt.secret', 'change-me'),
            });
            if (payload.tokenType !== 'admin' || payload.tokenKind !== 'refresh') {
                throw new common_1.UnauthorizedException('\u5237\u65b0\u4ee4\u724c\u4e0d\u53ef\u7528');
            }
            return payload;
        }
        catch {
            throw new common_1.UnauthorizedException('\u5237\u65b0\u4ee4\u724c\u5df2\u5931\u6548\uff0c\u8bf7\u91cd\u65b0\u767b\u5f55');
        }
    }
    getTokenExpiry(token) {
        const payload = this.jwtService.decode(token);
        if (!payload?.exp) {
            throw new common_1.UnauthorizedException('\u65e0\u6cd5\u89e3\u6790\u5237\u65b0\u4ee4\u724c\u8fc7\u671f\u65f6\u95f4');
        }
        return new Date(payload.exp * 1000);
    }
};
exports.AdminAuthService = AdminAuthService;
exports.AdminAuthService = AdminAuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(admin_entity_1.Admin)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        jwt_1.JwtService,
        config_1.ConfigService,
        auth_sessions_service_1.AuthSessionsService])
], AdminAuthService);
//# sourceMappingURL=admin-auth.service.js.map