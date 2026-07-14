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
exports.MiniappAuthService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const jwt_1 = require("@nestjs/jwt");
const typeorm_1 = require("@nestjs/typeorm");
const bcrypt = require("bcryptjs");
const crypto_1 = require("crypto");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("../../entities/user.entity");
const wechat_service_1 = require("../../common/services/wechat.service");
const auth_sessions_service_1 = require("../auth-sessions/auth-sessions.service");
const users_service_1 = require("../users/users.service");
let MiniappAuthService = class MiniappAuthService {
    constructor(usersRepository, usersService, wechatService, jwtService, configService, authSessionsService) {
        this.usersRepository = usersRepository;
        this.usersService = usersService;
        this.wechatService = wechatService;
        this.jwtService = jwtService;
        this.configService = configService;
        this.authSessionsService = authSessionsService;
    }
    async login(payload) {
        const session = await this.wechatService.code2Session(payload.code);
        const user = await this.usersService.upsertWechatUser({
            openid: session.openid,
            unionid: session.unionid,
            sessionKey: session.session_key,
            nickname: payload.nickname ?? null,
            avatarUrl: payload.avatarUrl ?? null,
        });
        const tokens = await this.issueTokens({
            userId: user.id,
            nickname: user.nickname,
        });
        const settings = await this.usersService.getSettings(user.id);
        return {
            ...tokens,
            user: {
                id: user.id,
                nickname: user.nickname,
                avatarUrl: user.avatarUrl,
            },
            settings,
        };
    }
    async refresh(refreshToken) {
        const payload = this.verifyRefreshToken(refreshToken);
        const session = await this.authSessionsService.validateRefreshToken({
            sessionId: payload.sid,
            userType: 'miniapp',
            userId: payload.sub,
            refreshToken,
        });
        if (!session) {
            throw new common_1.UnauthorizedException('\u5237\u65b0\u4ee4\u724c\u5df2\u5931\u6548\uff0c\u8bf7\u91cd\u65b0\u767b\u5f55');
        }
        const user = await this.usersService.findById(payload.sub);
        const tokens = await this.issueTokens({
            userId: user.id,
            nickname: user.nickname,
            sessionId: session.sessionId,
            persistSession: false,
        });
        await this.authSessionsService.rotateRefreshToken(session.sessionId, tokens.refreshToken, this.getTokenExpiry(tokens.refreshToken));
        const settings = await this.usersService.getSettings(user.id);
        return {
            ...tokens,
            user: {
                id: user.id,
                nickname: user.nickname,
                avatarUrl: user.avatarUrl,
            },
            settings,
        };
    }
    async logout(sessionId) {
        await this.authSessionsService.deactivateSession(sessionId, 'miniapp');
        return {
            success: true,
            message: '\u5df2\u9000\u51fa\u767b\u5f55',
        };
    }
    async webLogin(payload) {
        const user = await this.usersRepository.findOne({ where: { username: payload.username } });
        if (!user?.isActive || !user.passwordHash) {
            throw new common_1.UnauthorizedException('用户名或密码错误');
        }
        const isValid = await bcrypt.compare(payload.password, user.passwordHash);
        if (!isValid) {
            throw new common_1.UnauthorizedException('用户名或密码错误');
        }
        user.lastLoginTime = new Date();
        await this.usersRepository.save(user);
        const tokens = await this.issueTokens({
            userId: user.id,
            nickname: user.nickname,
        });
        const settings = await this.usersService.getSettings(user.id);
        return {
            ...tokens,
            user: {
                id: user.id,
                nickname: user.nickname,
                avatarUrl: user.avatarUrl,
                username: user.username,
            },
            settings,
        };
    }
    async webRegister(payload) {
        const existing = await this.usersRepository.findOne({ where: { username: payload.username } });
        if (existing) {
            throw new common_1.ConflictException('用户名已被占用');
        }
        const passwordHash = await bcrypt.hash(payload.password, 10);
        const user = this.usersRepository.create({
            username: payload.username,
            passwordHash,
            nickname: payload.nickname || payload.username,
            lastLoginTime: new Date(),
        });
        const savedUser = await this.usersRepository.save(user);
        const tokens = await this.issueTokens({
            userId: savedUser.id,
            nickname: savedUser.nickname,
        });
        const settings = await this.usersService.getSettings(savedUser.id);
        return {
            ...tokens,
            user: {
                id: savedUser.id,
                nickname: savedUser.nickname,
                avatarUrl: savedUser.avatarUrl,
                username: savedUser.username,
            },
            settings,
        };
    }
    async issueTokens(params) {
        const sessionId = params.sessionId ?? (0, crypto_1.randomUUID)();
        const persistSession = params.persistSession ?? true;
        const accessToken = await this.jwtService.signAsync({
            sub: params.userId,
            sid: sessionId,
            nickname: params.nickname,
            tokenType: 'miniapp',
            tokenKind: 'access',
        }, {
            secret: this.configService.get('jwt.secret', 'change-me'),
            expiresIn: this.configService.get('jwt.expiresIn', '7d'),
        });
        const refreshToken = await this.jwtService.signAsync({
            sub: params.userId,
            sid: sessionId,
            tokenType: 'miniapp',
            tokenKind: 'refresh',
        }, {
            secret: this.configService.get('jwt.secret', 'change-me'),
            expiresIn: this.configService.get('jwt.refreshExpiresIn', '30d'),
        });
        if (persistSession) {
            await this.authSessionsService.createSession({
                sessionId,
                userType: 'miniapp',
                userId: params.userId,
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
            if (payload.tokenType !== 'miniapp' || payload.tokenKind !== 'refresh') {
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
exports.MiniappAuthService = MiniappAuthService;
exports.MiniappAuthService = MiniappAuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        users_service_1.UsersService,
        wechat_service_1.WechatService,
        jwt_1.JwtService,
        config_1.ConfigService,
        auth_sessions_service_1.AuthSessionsService])
], MiniappAuthService);
//# sourceMappingURL=miniapp-auth.service.js.map