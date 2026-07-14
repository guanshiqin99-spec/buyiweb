import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import axios from 'axios';
import { In, Repository } from 'typeorm';
import { AppConfig } from '../../config/app.config';
import { UserSetting } from '../../entities/user-setting.entity';
import { WechatAccount } from '../../entities/wechat-account.entity';

@Injectable()
export class LearningReminderService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(LearningReminderService.name);
  private timer?: NodeJS.Timeout;
  private sending = false;
  private accessToken = '';
  private accessTokenExpiresAt = 0;

  constructor(
    private readonly configService: ConfigService<AppConfig, true>,
    @InjectRepository(UserSetting)
    private readonly settingsRepository: Repository<UserSetting>,
    @InjectRepository(WechatAccount)
    private readonly wechatAccountsRepository: Repository<WechatAccount>,
  ) {}

  onModuleInit() {
    if (!this.isConfigured()) return;
    this.timer = setInterval(() => this.deliverDueReminders().catch((error) => {
      this.logger.error(`学习提醒投递失败: ${error instanceof Error ? error.message : String(error)}`);
    }), 60_000);
    this.timer.unref?.();
  }

  onModuleDestroy() {
    if (this.timer) clearInterval(this.timer);
  }

  getClientConfig() {
    const templateId = this.configService.get('wechat.reminderTemplateId', { infer: true });
    return { enabled: Boolean(templateId), templateId };
  }

  private isConfigured() {
    return Boolean(
      !this.configService.get('wechat.mockMode', { infer: true })
      && this.configService.get('wechat.appId', { infer: true })
      && this.configService.get('wechat.appSecret', { infer: true })
      && this.configService.get('wechat.reminderTemplateId', { infer: true })
      && this.configService.get('wechat.reminderTemplateDataJson', { infer: true }),
    );
  }

  private beijingNow() {
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

  private parseTemplateData(date: string) {
    const source = this.configService.get('wechat.reminderTemplateDataJson', { infer: true });
    const parsed = JSON.parse(source || '{}') as Record<string, { value: string }>;
    return Object.fromEntries(Object.entries(parsed).map(([key, entry]) => [
      key,
      { value: String(entry?.value || '').replaceAll('{{date}}', date).slice(0, 200) },
    ]));
  }

  private async getAccessToken() {
    if (this.accessToken && Date.now() < this.accessTokenExpiresAt) return this.accessToken;
    const appId = this.configService.get('wechat.appId', { infer: true });
    const appSecret = this.configService.get('wechat.appSecret', { infer: true });
    const response = await axios.get('https://api.weixin.qq.com/cgi-bin/token', {
      params: { grant_type: 'client_credential', appid: appId, secret: appSecret },
      timeout: 10_000,
    });
    if (!response.data?.access_token) throw new Error(response.data?.errmsg || '无法获取微信 access_token');
    this.accessToken = response.data.access_token;
    this.accessTokenExpiresAt = Date.now() + Math.max(60, Number(response.data.expires_in || 7200) - 300) * 1000;
    return this.accessToken;
  }

  private async deliverDueReminders() {
    if (this.sending || !this.isConfigured()) return;
    const now = this.beijingNow();
    const reminderHour = this.configService.get('wechat.reminderHour', { infer: true });
    if (now.hour !== reminderHour || now.minute > 4) return;

    this.sending = true;
    try {
      const enabledSettings = await this.settingsRepository.find({ where: { key: 'notifications', value: 'true' } });
      if (!enabledSettings.length) return;
      const userIds = enabledSettings.map((setting) => setting.userId);
      const [accounts, lastSent] = await Promise.all([
        this.wechatAccountsRepository.find({ where: { userId: In(userIds) } }),
        this.settingsRepository.find({ where: { userId: In(userIds), key: 'lastLearningReminderDate' } }),
      ]);
      const lastSentMap = new Map(lastSent.map((setting) => [setting.userId, setting]));
      const enabledMap = new Map(enabledSettings.map((setting) => [setting.userId, setting]));
      const token = await this.getAccessToken();
      const templateId = this.configService.get('wechat.reminderTemplateId', { infer: true });
      const data = this.parseTemplateData(now.date);

      for (const account of accounts) {
        if (lastSentMap.get(account.userId)?.value === now.date) continue;
        try {
          const response = await axios.post(
            `https://api.weixin.qq.com/cgi-bin/message/subscribe/send?access_token=${encodeURIComponent(token)}`,
            { touser: account.openid, template_id: templateId, page: 'pages/app/index', data },
            { timeout: 10_000 },
          );
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
        } catch (error) {
          this.logger.warn(`用户 ${account.userId} 的学习提醒未送达: ${error instanceof Error ? error.message : String(error)}`);
        }
      }
    } finally {
      this.sending = false;
    }
  }
}
