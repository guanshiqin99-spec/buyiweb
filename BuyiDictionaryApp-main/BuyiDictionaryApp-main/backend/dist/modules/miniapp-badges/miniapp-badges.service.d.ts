import { Repository } from 'typeorm';
import { Badge } from '../../entities/badge.entity';
import { Favorite } from '../../entities/favorite.entity';
import { LearningRecord } from '../../entities/learning-record.entity';
export declare const BADGE_DEFINITIONS: Record<string, {
    name: string;
    description: string;
    pattern: 'batik' | 'drum' | 'weaving';
}>;
export declare class MiniappBadgesService {
    private readonly badgeRepository;
    private readonly favoriteRepository;
    private readonly learningRecordRepository;
    constructor(badgeRepository: Repository<Badge>, favoriteRepository: Repository<Favorite>, learningRecordRepository: Repository<LearningRecord>);
    list(userId: number): Promise<{
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
    private syncProgressBadges;
    unlock(userId: number, code: string): Promise<Badge>;
}
