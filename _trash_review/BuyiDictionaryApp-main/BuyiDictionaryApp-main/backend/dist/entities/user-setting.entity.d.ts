import { User } from './user.entity';
export declare class UserSetting {
    id: number;
    userId: number;
    user: User;
    key: string;
    value: string;
    createdAt: Date;
    updatedAt: Date;
}
