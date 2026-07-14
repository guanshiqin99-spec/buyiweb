import { Repository } from 'typeorm';
import { Favorite } from '../../entities/favorite.entity';
import { LearningRecord } from '../../entities/learning-record.entity';
import { UserSetting } from '../../entities/user-setting.entity';
import { User } from '../../entities/user.entity';
import { WechatAccount } from '../../entities/wechat-account.entity';
export declare class UsersService {
    private readonly usersRepository;
    private readonly wechatAccountsRepository;
    private readonly userSettingsRepository;
    private readonly favoritesRepository;
    private readonly learningRecordsRepository;
    constructor(usersRepository: Repository<User>, wechatAccountsRepository: Repository<WechatAccount>, userSettingsRepository: Repository<UserSetting>, favoritesRepository: Repository<Favorite>, learningRecordsRepository: Repository<LearningRecord>);
    findById(userId: number): Promise<User>;
    findWechatAccount(openid: string): Promise<WechatAccount | null>;
    upsertWechatUser(params: {
        openid: string;
        unionid?: string | null;
        sessionKey?: string | null;
        nickname?: string | null;
        avatarUrl?: string | null;
    }): Promise<User>;
    getSettings(userId: number): Promise<Record<string, string>>;
    updateSettings(userId: number, updates: Record<string, string>): Promise<Record<string, string>>;
    getProfileStats(userId: number): Promise<{
        favoriteCount: number;
        learningRecordCount: number;
        lastActiveAt: Date | null;
    }>;
}
