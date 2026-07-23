import { MiniappBadgesService } from './miniapp-badges.service';
export declare class MiniappBadgesController {
    private readonly badgesService;
    constructor(badgesService: MiniappBadgesService);
    list(user: {
        sub: number;
    }): Promise<{
        items: {
            id: string | number;
            code: string;
            name: string;
            description: string;
            pattern: "batik" | "drum" | "weaving";
            locked: boolean;
            unlocked: boolean;
            isUnlocked: boolean;
            unlockedAt: Date | null;
        }[];
        total: number;
        unlockedCount: number;
    }>;
}
