export interface AppConfig {
    app: {
        name: string;
        port: number;
        publicBaseUrl: string;
        env: string;
        corsOrigins: string[];
        docsEnabled: boolean;
    };
    jwt: {
        secret: string;
        expiresIn: string;
        adminExpiresIn: string;
        refreshExpiresIn: string;
        adminRefreshExpiresIn: string;
    };
    db: {
        type: string;
        host: string;
        port: number;
        username: string;
        password: string;
        database: string;
        synchronize: boolean;
        logging: boolean;
    };
    wechat: {
        appId: string;
        appSecret: string;
        mockMode: boolean;
        reminderTemplateId: string;
        reminderTemplateDataJson: string;
        reminderHour: number;
    };
    media: {
        driver: string;
        publicBaseUrl: string;
        localUploadDir: string;
        maxFileSize: number;
        cosSecretId: string;
        cosSecretKey: string;
        cosBucket: string;
        cosRegion: string;
        cosPublicBaseUrl: string;
    };
    seed: {
        onBoot: boolean;
        adminUsername: string;
        adminPassword: string;
    };
    ai: {
        provider: string;
        apiKey: string;
        baseURL: string;
        model: string;
    };
}
export declare const appConfig: () => AppConfig;
