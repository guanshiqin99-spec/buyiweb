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
        stats: {
            today: number;
            total: number;
            streak: number;
            typeCounts: {
                dictionary: number;
                phrase: number;
                proverb: number;
                song: number;
            };
        };
    }>;
    stats(user: {
        sub: number;
    }): Promise<{
        today: number;
        total: number;
        streak: number;
        typeCounts: {
            dictionary: number;
            phrase: number;
            proverb: number;
            song: number;
        };
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
