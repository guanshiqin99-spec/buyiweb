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

export const appConfig = (): AppConfig => ({
  app: {
    name: process.env.APP_NAME ?? 'Buyi Dictionary API',
    port: Number(process.env.PORT ?? 3000),
    publicBaseUrl: process.env.APP_PUBLIC_BASE_URL ?? 'http://127.0.0.1:3000',
    env: process.env.NODE_ENV ?? 'development',
    corsOrigins: String(process.env.CORS_ORIGIN ?? 'http://localhost:3000')
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean),
    // 安全实践：生产环境默认关闭 Swagger，需显式开启
    docsEnabled: (process.env.ENABLE_SWAGGER ?? 'false') === 'true',
  },
  jwt: {
    // 安全实践：JWT 密钥无默认兜底，未设置时启动失败
    secret: process.env.JWT_SECRET!,
    // 安全实践：access token 短有效期，减少被盗用窗口
    expiresIn: process.env.JWT_EXPIRES_IN ?? '30m',
    adminExpiresIn: process.env.ADMIN_JWT_EXPIRES_IN ?? '1d',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? '30d',
    adminRefreshExpiresIn: process.env.ADMIN_JWT_REFRESH_EXPIRES_IN ?? '14d',
  },
  db: {
    type: process.env.DB_TYPE ?? 'sqljs',
    host: process.env.DB_HOST ?? '127.0.0.1',
    port: Number(process.env.DB_PORT ?? 3306),
    username: process.env.DB_USERNAME ?? 'root',
    password: process.env.DB_PASSWORD ?? '',
    database: process.env.DB_NAME ?? 'buyi_dictionary',
    synchronize: (process.env.DB_SYNCHRONIZE ?? 'true') === 'true',
    logging: (process.env.DB_LOGGING ?? 'false') === 'true',
  },
  wechat: {
    appId: process.env.WECHAT_APP_ID ?? '',
    appSecret: process.env.WECHAT_APP_SECRET ?? '',
    mockMode: (process.env.WECHAT_MOCK_MODE ?? 'true') === 'true',
    reminderTemplateId: process.env.WECHAT_REMINDER_TEMPLATE_ID ?? '',
    reminderTemplateDataJson: process.env.WECHAT_REMINDER_TEMPLATE_DATA_JSON ?? '',
    reminderHour: Number(process.env.WECHAT_REMINDER_HOUR ?? 20),
  },
  media: {
    driver: process.env.MEDIA_DRIVER ?? 'local',
    publicBaseUrl: process.env.MEDIA_PUBLIC_BASE_URL ?? 'http://localhost:3000/uploads',
    localUploadDir: process.env.MEDIA_LOCAL_UPLOAD_DIR ?? 'uploads',
    maxFileSize: Number(process.env.MEDIA_MAX_FILE_SIZE ?? 10 * 1024 * 1024),
    cosSecretId: process.env.COS_SECRET_ID ?? '',
    cosSecretKey: process.env.COS_SECRET_KEY ?? '',
    cosBucket: process.env.COS_BUCKET ?? '',
    cosRegion: process.env.COS_REGION ?? '',
    cosPublicBaseUrl: process.env.COS_PUBLIC_BASE_URL ?? '',
  },
  seed: {
    onBoot: (process.env.SEED_ON_BOOT ?? 'true') === 'true',
    adminUsername: process.env.DEFAULT_ADMIN_USERNAME ?? 'admin',
    adminPassword: process.env.DEFAULT_ADMIN_PASSWORD ?? 'Admin@123456',
  },
  ai: {
    provider: process.env.AI_PROVIDER ?? 'deepseek',
    apiKey: process.env.DEEPSEEK_API_KEY ?? '',
    baseURL: process.env.AI_BASE_URL ?? 'https://api.deepseek.com',
    model: process.env.AI_MODEL ?? 'deepseek-chat',
  },
});
