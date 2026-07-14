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
exports.User = void 0;
const typeorm_1 = require("typeorm");
const badge_entity_1 = require("./badge.entity");
const favorite_entity_1 = require("./favorite.entity");
const learning_record_entity_1 = require("./learning-record.entity");
const quiz_attempt_entity_1 = require("./quiz-attempt.entity");
const user_setting_entity_1 = require("./user-setting.entity");
const wechat_account_entity_1 = require("./wechat-account.entity");
let User = class User {
};
exports.User = User;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], User.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 64, nullable: true }),
    __metadata("design:type", Object)
], User.prototype, "nickname", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 500, nullable: true }),
    __metadata("design:type", Object)
], User.prototype, "avatarUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 64, nullable: true, unique: true }),
    __metadata("design:type", Object)
], User.prototype, "username", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", Object)
], User.prototype, "passwordHash", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 32, nullable: true }),
    __metadata("design:type", Object)
], User.prototype, "phoneNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], User.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'datetime', nullable: true }),
    __metadata("design:type", Object)
], User.prototype, "lastLoginTime", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], User.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], User.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => wechat_account_entity_1.WechatAccount, (wechatAccount) => wechatAccount.user),
    __metadata("design:type", Array)
], User.prototype, "wechatAccounts", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => favorite_entity_1.Favorite, (favorite) => favorite.user),
    __metadata("design:type", Array)
], User.prototype, "favorites", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => learning_record_entity_1.LearningRecord, (record) => record.user),
    __metadata("design:type", Array)
], User.prototype, "learningRecords", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => quiz_attempt_entity_1.QuizAttempt, (attempt) => attempt.user),
    __metadata("design:type", Array)
], User.prototype, "quizAttempts", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => badge_entity_1.Badge, (badge) => badge.user),
    __metadata("design:type", Array)
], User.prototype, "badges", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => user_setting_entity_1.UserSetting, (setting) => setting.user),
    __metadata("design:type", Array)
], User.prototype, "settings", void 0);
exports.User = User = __decorate([
    (0, typeorm_1.Entity)('users')
], User);
//# sourceMappingURL=user.entity.js.map