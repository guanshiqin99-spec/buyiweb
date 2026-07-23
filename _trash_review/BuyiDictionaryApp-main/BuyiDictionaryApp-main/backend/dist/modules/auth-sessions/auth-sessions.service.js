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
exports.AuthSessionsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const crypto_1 = require("crypto");
const typeorm_2 = require("typeorm");
const auth_session_entity_1 = require("../../entities/auth-session.entity");
let AuthSessionsService = class AuthSessionsService {
    constructor(authSessionRepository) {
        this.authSessionRepository = authSessionRepository;
    }
    async createSession(params) {
        const session = this.authSessionRepository.create({
            sessionId: params.sessionId,
            userType: params.userType,
            userId: params.userId,
            refreshTokenHash: this.hashRefreshToken(params.refreshToken),
            expiresAt: params.expiresAt,
            lastUsedAt: null,
            isActive: true,
        });
        return this.authSessionRepository.save(session);
    }
    async findActiveSession(sessionId, userType) {
        return this.authSessionRepository.findOne({
            where: {
                sessionId,
                userType,
                isActive: true,
            },
        });
    }
    async validateAccessSession(params) {
        const session = await this.findActiveSession(params.sessionId, params.userType);
        if (!session || session.userId !== params.userId) {
            return false;
        }
        if (session.expiresAt.getTime() <= Date.now()) {
            await this.authSessionRepository.update(session.id, {
                isActive: false,
            });
            return false;
        }
        return true;
    }
    async validateRefreshToken(params) {
        const session = await this.findActiveSession(params.sessionId, params.userType);
        if (!session || session.userId !== params.userId) {
            return null;
        }
        if (session.expiresAt.getTime() <= Date.now()) {
            await this.authSessionRepository.update(session.id, {
                isActive: false,
            });
            return null;
        }
        if (session.refreshTokenHash !== this.hashRefreshToken(params.refreshToken)) {
            return null;
        }
        return session;
    }
    async rotateRefreshToken(sessionId, refreshToken, expiresAt) {
        await this.authSessionRepository.update({ sessionId }, {
            refreshTokenHash: this.hashRefreshToken(refreshToken),
            expiresAt,
            lastUsedAt: new Date(),
        });
    }
    async deactivateSession(sessionId, userType) {
        await this.authSessionRepository.update({
            sessionId,
            userType,
            isActive: true,
        }, {
            isActive: false,
        });
    }
    hashRefreshToken(token) {
        return (0, crypto_1.createHash)('sha256').update(token).digest('hex');
    }
};
exports.AuthSessionsService = AuthSessionsService;
exports.AuthSessionsService = AuthSessionsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(auth_session_entity_1.AuthSession)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], AuthSessionsService);
//# sourceMappingURL=auth-sessions.service.js.map