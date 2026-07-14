import { MiniappBadgesService } from './miniapp-badges.service';
export declare class MiniappBadgesController {
    private readonly badgesService;
    constructor(badgesService: MiniappBadgesService);
    list(user: {
        sub: number;
    }): Promise<{
        items: {
            code: string;
            name: string;
            description: string;
            pattern: "batik" | "drum" | "weaving";
            locked: boolean;
            unlockedAt: Date | null;
        }[];
        total: number;
        unlockedCount: number;
    }>;
}
