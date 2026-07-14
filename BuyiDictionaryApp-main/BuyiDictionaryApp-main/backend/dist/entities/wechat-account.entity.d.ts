import { User } from './user.entity';
export declare class WechatAccount {
    id: number;
    openid: string;
    unionid: string | null;
    sessionKey: string | null;
    userId: number;
    user: User;
    createdAt: Date;
    updatedAt: Date;
}
