import { UsersService } from '../users/users.service';
export declare class MiniappMeController {
    private readonly usersService;
    constructor(usersService: UsersService);
    me(user: {
        sub: number;
    }): Promise<{
        user: {
            id: number;
            nickname: string | null;
            avatarUrl: string | null;
            phoneNumber: string | null;
        };
        settings: Record<string, string>;
        stats: {
            favoriteCount: number;
            learningRecordCount: number;
            lastActiveAt: Date | null;
        };
    }>;
}
