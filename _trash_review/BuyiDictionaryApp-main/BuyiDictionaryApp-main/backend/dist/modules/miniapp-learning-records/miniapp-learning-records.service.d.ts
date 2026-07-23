import { Repository } from 'typeorm';
import { ContentType } from '../../common/enums/content-type.enum';
import { LearningRecord } from '../../entities/learning-record.entity';
import { ContentService } from '../content/content.service';
export declare class MiniappLearningRecordsService {
    private readonly learningRecordRepository;
    private readonly contentService;
    constructor(learningRecordRepository: Repository<LearningRecord>, contentService: ContentService);
    create(userId: number, payload: {
        contentType: ContentType;
        contentId: number;
        actionType: 'view' | 'play';
    }): Promise<LearningRecord>;
    list(userId: number, page: number, pageSize: number): Promise<{
        items: ({
            id: number;
            actionType: "view" | "play";
            createdAt: Date;
            content: {
                id: number;
                type: ContentType;
                buyiText: string;
                zhText: string;
                enText: string | null;
                description: string | null;
                culturalNote: string | null;
                zhSortKey: string;
            } | {
                title: string;
                artist: string | null;
                coverUrl: string | null;
                audioUrl: string | null;
                lyrics: string | null;
                id: number;
                type: ContentType;
                buyiText: string;
                zhText: string;
                enText: string | null;
                description: string | null;
                culturalNote: string | null;
                zhSortKey: string;
            } | {
                audioUrl: string | null;
                id: number;
                type: ContentType;
                buyiText: string;
                zhText: string;
                enText: string | null;
                description: string | null;
                culturalNote: string | null;
                zhSortKey: string;
            };
        } | {
            id: number;
            actionType: "view" | "play";
            createdAt: Date;
            content: null;
        })[];
        total: number;
        page: number;
        pageSize: number;
        totalPages: number;
        stats: {
            todayCount: number;
            totalCount: number;
            streakDays: number;
            typeCounts: Record<ContentType, number>;
            today: number;
            total: number;
            streak: number;
        };
    }>;
    clear(userId: number): Promise<{
        success: boolean;
        deletedCount: number;
        message: string;
    }>;
    getStats(userId: number): Promise<{
        todayCount: number;
        totalCount: number;
        streakDays: number;
        typeCounts: Record<ContentType, number>;
        today: number;
        total: number;
        streak: number;
    }>;
}
