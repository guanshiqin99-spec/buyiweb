import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { CreateLearningRecordDto } from './dto/create-learning-record.dto';
import { MiniappLearningRecordsService } from './miniapp-learning-records.service';
export declare class MiniappLearningRecordsController {
    private readonly learningRecordsService;
    constructor(learningRecordsService: MiniappLearningRecordsService);
    list(user: {
        sub: number;
    }, query: PaginationQueryDto): Promise<{
        items: ({
            id: number;
            actionType: "view" | "play";
            createdAt: Date;
            content: {
                id: number;
                type: import("../../common/enums/content-type.enum").ContentType;
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
                type: import("../../common/enums/content-type.enum").ContentType;
                buyiText: string;
                zhText: string;
                enText: string | null;
                description: string | null;
                culturalNote: string | null;
                zhSortKey: string;
            } | {
                audioUrl: string | null;
                id: number;
                type: import("../../common/enums/content-type.enum").ContentType;
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
            typeCounts: Record<import("../../common/enums/content-type.enum").ContentType, number>;
            today: number;
            total: number;
            streak: number;
        };
    }>;
    stats(user: {
        sub: number;
    }): Promise<{
        todayCount: number;
        totalCount: number;
        streakDays: number;
        typeCounts: Record<import("../../common/enums/content-type.enum").ContentType, number>;
        today: number;
        total: number;
        streak: number;
    }>;
    create(user: {
        sub: number;
    }, payload: CreateLearningRecordDto): Promise<import("../../entities/learning-record.entity").LearningRecord>;
    clear(user: {
        sub: number;
    }): Promise<{
        success: boolean;
        deletedCount: number;
        message: string;
    }>;
}
