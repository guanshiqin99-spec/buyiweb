import { Repository } from 'typeorm';
import { Badge } from '../../entities/badge.entity';
export declare const BADGE_DEFINITIONS: Record<string, {
    name: string;
    description: string;
    pattern: 'batik' | 'drum' | 'weaving';
}>;
export declare class MiniappBadgesService {
    private readonly badgeRepository;
    constructor(badgeRepository: Repository<Badge>);
    list(userId: number): Promise<{
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
    unlock(userId: number, code: string): Promise<Badge>;
}
