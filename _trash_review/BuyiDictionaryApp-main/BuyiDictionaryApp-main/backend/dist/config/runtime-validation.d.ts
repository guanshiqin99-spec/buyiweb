import { ConfigService } from '@nestjs/config';
type EnvMap = NodeJS.ProcessEnv;
export declare function isProductionEnvironment(env?: EnvMap): boolean;
export declare function validateEnvironmentOrThrow(env?: EnvMap): void;
export declare function getReadinessReport(configService: ConfigService): {
    ok: boolean;
    issues: string[];
};
export {};
