import { Badge } from './badge.entity';
import { Favorite } from './favorite.entity';
import { LearningRecord } from './learning-record.entity';
import { UserSetting } from './user-setting.entity';
import { WechatAccount } from './wechat-account.entity';
export declare class User {
    id: number;
    nickname: string | null;
    avatarUrl: string | null;
    username: string | null;
    passwordHash: string | null;
    phoneNumber: string | null;
    isActive: boolean;
    lastLoginTime: Date | null;
    createdAt: Date;
    updatedAt: Date;
    wechatAccounts: WechatAccount[];
    favorites: Favorite[];
    learningRecords: LearningRecord[];
    badges: Badge[];
    settings: UserSetting[];
}
