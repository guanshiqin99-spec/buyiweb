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
var LearningReminderService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.LearningReminderService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const axios_1 = require("axios");
const typeorm_2 = require("typeorm");
const user_setting_entity_1 = require("../../entities/user-setting.entity");
const wechat_account_entity_1 = require("../../entities/wechat-account.entity");
let LearningReminderService = LearningReminderService_1 = class LearningReminderService {
    constructor(configService, settingsRepository, wechatAccountsRepository) {
        this.configService = configService;
        this.settingsRepository = settingsRepository;
        this.wechatAccountsRepository = wechatAccountsRepository;
        this.logger = new common_1.Logger(LearningReminderService_1.name);
        this.sending = false;
        this.accessToken = '';
        this.accessTokenExpiresAt = 0;
    }
    onModuleInit() {
        if (!this.isConfigured())
            return;
        this.timer = setInterval(() => this.deliverDueReminders().catch((error) => {
            this.logger.error(`学习提醒投递失败: ${error instanceof Error ? error.message : String(error)}`);
        }), 60_000);
        this.timer.unref?.();
    }
    onModuleDestroy() {
        if (this.timer)
            clearInterval(this.timer);
    }
    getClientConfig() {
        const templateId = this.configService.get('wechat.reminderTemplateId', { infer: true });
        return { enabled: Boolean(templateId), templateId };
    }
    isConfigured() {
        return Boolean(!this.configService.get('wechat.mockMode', { infer: true })
            && this.configService.get('wechat.appId', { infer: true })
            && this.configService.get('wechat.appSecret', { infer: true })
            && this.configService.get('wechat.reminderTemplateId', { infer: true })
            && this.configService.get('wechat.reminderTemplateDataJson', { infer: true }));
    }
    beijingNow() {
        const parts = new Intl.DateTimeFormat('en-CA', {
            timeZone: 'Asia/Shanghai',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            hourCycle: 'h23',
        }).formatToParts(new Date());
        const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
        return {
            date: `${values.year}-${values.month}-${values.day}`,
            hour: Number(values.hour),
            minute: Number(values.minute),
        };
    }
    parseTemplateData(date) {
        const source = this.configService.get('wechat.reminderTemplateDataJson', { infer: true });
        const parsed = JSON.parse(source || '{}');
        return Object.fromEntries(Object.entries(parsed).map(([key, entry]) => [
            key,
            { value: String(entry?.value || '').replaceAll('{{date}}', date).slice(0, 200) },
        ]));
    }
    async getAccessToken() {
        if (this.accessToken && Date.now() < this.accessTokenExpiresAt)
            return this.accessToken;
        const appId = this.configService.get('wechat.appId', { infer: true });
        const appSecret = this.configService.get('wechat.appSecret', { infer: true });
        const response = await axios_1.default.get('https://api.weixin.qq.com/cgi-bin/token', {
            params: { grant_type: 'client_credential', appid: appId, secret: appSecret },
            timeout: 10_000,
        });
        if (!response.data?.access_token)
            throw new Error(response.data?.errmsg || '无法获取微信 access_token');
        this.accessToken = response.data.access_token;
        this.accessTokenExpiresAt = Date.now() + Math.max(60, Number(response.data.expires_in || 7200) - 300) * 1000;
        return this.accessToken;
    }
    async deliverDueReminders() {
        if (this.sending || !this.isConfigured())
            return;
        const now = this.beijingNow();
        const reminderHour = this.configService.get('wechat.reminderHour', { infer: true });
        if (now.hour !== reminderHour || now.minute > 4)
            return;
        this.sending = true;
        try {
            const enabledSettings = await this.settingsRepository.find({ where: { key: 'notifications', value: 'true' } });
            if (!enabledSettings.length)
                return;
            const userIds = enabledSettings.map((setting) => setting.userId);
            const [accounts, lastSent] = await Promise.all([
                this.wechatAccountsRepository.find({ where: { userId: (0, typeorm_2.In)(userIds) } }),
                this.settingsRepository.find({ where: { userId: (0, typeorm_2.In)(userIds), key: 'lastLearningReminderDate' } }),
            ]);
            const lastSentMap = new Map(lastSent.map((setting) => [setting.userId, setting]));
            const enabledMap = new Map(enabledSettings.map((setting) => [setting.userId, setting]));
            const token = await this.getAccessToken();
            const templateId = this.configService.get('wechat.reminderTemplateId', { infer: true });
            const data = this.parseTemplateData(now.date);
            for (const account of accounts) {
                if (lastSentMap.get(account.userId)?.value === now.date)
                    continue;
                try {
                    const response = await axios_1.default.post(`https://api.weixin.qq.com/cgi-bin/message/subscribe/send?access_token=${encodeURIComponent(token)}`, { touser: account.openid, template_id: templateId, page: 'pages/app/index', data }, { timeout: 10_000 });
                    if (response.data?.errcode) {
                        if (Number(response.data.errcode) === 43101) {
                            const notificationSetting = enabledMap.get(account.userId);
                            if (notificationSetting) {
                                notificationSetting.value = 'false';
                                await this.settingsRepository.save(notificationSetting);
                            }
                        }
                        throw new Error(response.data.errmsg || `微信错误 ${response.data.errcode}`);
                    }
                    const existing = lastSentMap.get(account.userId);
                    const setting = existing || this.settingsRepository.create({ userId: account.userId, key: 'lastLearningReminderDate', value: now.date });
                    setting.value = now.date;
                    await this.settingsRepository.save(setting);
                    lastSentMap.set(account.userId, setting);
                }
                catch (error) {
                    this.logger.warn(`用户 ${account.userId} 的学习提醒未送达: ${error instanceof Error ? error.message : String(error)}`);
                }
            }
        }
        finally {
            this.sending = false;
        }
    }
};
exports.LearningReminderService = LearningReminderService;
exports.LearningReminderService = LearningReminderService = LearningReminderService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, typeorm_1.InjectRepository)(user_setting_entity_1.UserSetting)),
    __param(2, (0, typeorm_1.InjectRepository)(wechat_account_entity_1.WechatAccount)),
    __metadata("design:paramtypes", [config_1.ConfigService,
        typeorm_2.Repository,
        typeorm_2.Repository])
], LearningReminderService);
//# sourceMappingURL=learning-reminder.service.js.map