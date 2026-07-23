import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
export declare class HealthService {
    private readonly dataSource;
    private readonly configService;
    constructor(dataSource: DataSource, configService: ConfigService);
    getHealth(): {
        status: string;
        service: string;
        environment: string;
        timestamp: number;
    };
    getReadiness(): Promise<{
        status: string;
        checks: {
            database: boolean;
            mediaConfig: boolean;
        };
        timestamp: number;
    }>;
}
