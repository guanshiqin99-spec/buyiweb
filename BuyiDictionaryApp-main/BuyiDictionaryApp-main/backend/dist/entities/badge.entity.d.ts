import { User } from './user.entity';
export declare class Badge {
    id: number;
    userId: number;
    user: User;
    code: string;
    unlockedAt: Date;
}
