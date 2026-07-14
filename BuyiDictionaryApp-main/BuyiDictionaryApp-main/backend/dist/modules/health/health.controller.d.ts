import { HealthService } from './health.service';
export declare class HealthController {
    private readonly healthService;
    constructor(healthService: HealthService);
    getHealth(): {
        status: string;
        service: string;
        environment: string;
        timestamp: number;
    };
    getReady(): Promise<{
        status: string;
        checks: {
            database: boolean;
            mediaConfig: boolean;
        };
        timestamp: number;
    }>;
}
