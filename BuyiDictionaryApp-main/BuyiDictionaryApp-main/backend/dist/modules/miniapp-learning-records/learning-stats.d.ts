import { ContentType } from '../../common/enums/content-type.enum';
export interface LearningRecordStatsSource {
    contentType: ContentType;
    createdAt: Date | string;
}
export declare function calculateLearningStats(records: LearningRecordStatsSource[], now?: Date): {
    todayCount: number;
    totalCount: number;
    streakDays: number;
    typeCounts: Record<ContentType, number>;
    today: number;
    total: number;
    streak: number;
};
