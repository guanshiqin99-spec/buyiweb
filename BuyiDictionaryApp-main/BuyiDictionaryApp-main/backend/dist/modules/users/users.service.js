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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const favorite_entity_1 = require("../../entities/favorite.entity");
const learning_record_entity_1 = require("../../entities/learning-record.entity");
const user_setting_entity_1 = require("../../entities/user-setting.entity");
const user_entity_1 = require("../../entities/user.entity");
const wechat_account_entity_1 = require("../../entities/wechat-account.entity");
let UsersService = class UsersService {
    constructor(usersRepository, wechatAccountsRepository, userSettingsRepository, favoritesRepository, learningRecordsRepository) {
        this.usersRepository = usersRepository;
        this.wechatAccountsRepository = wechatAccountsRepository;
        this.userSettingsRepository = userSettingsRepository;
        this.favoritesRepository = favoritesRepository;
        this.learningRecordsRepository = learningRecordsRepository;
    }
    async findById(userId) {
        const user = await this.usersRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new common_1.NotFoundException('用户不存在');
        }
        return user;
    }
    async findWechatAccount(openid) {
        return this.wechatAccountsRepository.findOne({
            where: { openid },
            relations: ['user'],
        });
    }
    async upsertWechatUser(params) {
        const now = new Date();
        const existing = await this.findWechatAccount(params.openid);
        if (existing) {
            if (params.sessionKey) {
                existing.sessionKey = params.sessionKey;
            }
            if (params.unionid) {
                existing.unionid = params.unionid;
            }
            await this.wechatAccountsRepository.save(existing);
            const user = existing.user;
            user.nickname = params.nickname ?? user.nickname;
            user.avatarUrl = params.avatarUrl ?? user.avatarUrl;
            user.lastLoginTime = now;
            return this.usersRepository.save(user);
        }
        const user = this.usersRepository.create({
            nickname: params.nickname || '微信用户',
            avatarUrl: params.avatarUrl || null,
            lastLoginTime: now,
        });
        const savedUser = await this.usersRepository.save(user);
        const wechatAccount = this.wechatAccountsRepository.create({
            openid: params.openid,
            unionid: params.unionid ?? null,
            sessionKey: params.sessionKey ?? null,
            userId: savedUser.id,
        });
        await this.wechatAccountsRepository.save(wechatAccount);
        return savedUser;
    }
    async getSettings(userId) {
        const settings = await this.userSettingsRepository.find({ where: { userId } });
        return settings.reduce((acc, current) => {
            acc[current.key] = current.value;
            return acc;
        }, {});
    }
    async updateSettings(userId, updates) {
        const keys = Object.keys(updates);
        const existing = keys.length
            ? await this.userSettingsRepository.find({
                where: keys.map((key) => ({ userId, key })),
            })
            : [];
        const existingMap = new Map(existing.map((item) => [item.key, item]));
        for (const [key, value] of Object.entries(updates)) {
            const item = existingMap.get(key);
            if (item) {
                item.value = value;
                await this.userSettingsRepository.save(item);
                continue;
            }
            await this.userSettingsRepository.save(this.userSettingsRepository.create({
                userId,
                key,
                value,
            }));
        }
        return this.getSettings(userId);
    }
    async getProfileStats(userId) {
        const [favoriteCount, learningRecordCount, lastRecord] = await Promise.all([
            this.favoritesRepository.count({ where: { userId } }),
            this.learningRecordsRepository.count({ where: { userId } }),
            this.learningRecordsRepository.findOne({
                where: { userId },
                order: { createdAt: 'DESC' },
            }),
        ]);
        return {
            favoriteCount,
            learningRecordCount,
            lastActiveAt: lastRecord?.createdAt ?? null,
        };
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(1, (0, typeorm_1.InjectRepository)(wechat_account_entity_1.WechatAccount)),
    __param(2, (0, typeorm_1.InjectRepository)(user_setting_entity_1.UserSetting)),
    __param(3, (0, typeorm_1.InjectRepository)(favorite_entity_1.Favorite)),
    __param(4, (0, typeorm_1.InjectRepository)(learning_record_entity_1.LearningRecord)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], UsersService);
//# sourceMappingURL=users.service.js.map