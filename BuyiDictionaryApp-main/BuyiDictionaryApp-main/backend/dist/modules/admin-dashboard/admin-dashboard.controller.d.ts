import { AdminDashboardService } from './admin-dashboard.service';
export declare class AdminDashboardController {
    private readonly adminDashboardService;
    constructor(adminDashboardService: AdminDashboardService);
    summary(): Promise<{
        users: number;
        content: {
            dictionary: number;
            phrases: number;
            proverbs: number;
            songs: number;
            total: number;
        };
        unpublished: {
            dictionary: number;
            phrases: number;
            proverbs: number;
            songs: number;
            total: number;
        };
        favorites: number;
        learningRecords: number;
    }>;
    batchPublish(): Promise<{
        success: boolean;
        affected: {
            dictionary: number;
            phrases: number;
            proverbs: number;
            songs: number;
            total: number;
        };
    }>;
}
