import { OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { AppConfig } from '../../config/app.config';
import { UserSetting } from '../../entities/user-setting.entity';
import { WechatAccount } from '../../entities/wechat-account.entity';
export declare class LearningReminderService implements OnModuleInit, OnModuleDestroy {
    private readonly configService;
    private readonly settingsRepository;
    private readonly wechatAccountsRepository;
    private readonly logger;
    private timer?;
    private sending;
    private accessToken;
    private accessTokenExpiresAt;
    constructor(configService: ConfigService<AppConfig, true>, settingsRepository: Repository<UserSetting>, wechatAccountsRepository: Repository<WechatAccount>);
    onModuleInit(): void;
    onModuleDestroy(): void;
    getClientConfig(): {
        enabled: boolean;
        templateId: string;
    };
    private isConfigured;
    private beijingNow;
    private parseTemplateData;
    private getAccessToken;
    private deliverDueReminders;
}
