"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isProductionEnvironment = isProductionEnvironment;
exports.validateEnvironmentOrThrow = validateEnvironmentOrThrow;
exports.getReadinessReport = getReadinessReport;
function isTruthy(value, defaultValue = false) {
    if (value === undefined) {
        return defaultValue;
    }
    return value === 'true';
}
function isProductionEnvironment(env = process.env) {
    return ['production', 'prod'].includes(String(env.NODE_ENV || '').toLowerCase());
}
function requireValue(errors, key, value) {
    if (!String(value || '').trim()) {
        errors.push(`缺少必要环境变量 ${key}`);
    }
}
function validateEnvironmentOrThrow(env = process.env) {
    if (!isProductionEnvironment(env)) {
        return;
    }
    const errors = [];
    if (env.ENABLE_SWAGGER === 'true') {
        console.warn('⚠️ 生产环境开启了 Swagger，建议关闭');
    }
    const jwtSecret = String(env.JWT_SECRET || '').trim();
    const dbType = String(env.DB_TYPE || '').trim();
    const mediaDriver = String(env.MEDIA_DRIVER || '').trim() || 'local';
    if (!jwtSecret || jwtSecret === 'change-me') {
        errors.push('生产环境必须设置安全的 JWT_SECRET');
    }
    if (dbType !== 'mysql') {
        errors.push('生产环境只允许使用 MySQL');
    }
    if (isTruthy(env.DB_SYNCHRONIZE, true)) {
        errors.push('生产环境必须关闭 DB_SYNCHRONIZE');
    }
    if (isTruthy(env.WECHAT_MOCK_MODE, true)) {
        errors.push('生产环境必须关闭 WECHAT_MOCK_MODE');
    }
    if (isTruthy(env.SEED_ON_BOOT, true)) {
        errors.push('生产环境必须关闭 SEED_ON_BOOT');
    }
    if (mediaDriver === 'local') {
        errors.push('生产环境不允许使用本地媒体存储');
    }
    requireValue(errors, 'DB_HOST', env.DB_HOST);
    requireValue(errors, 'DB_PORT', env.DB_PORT);
    requireValue(errors, 'DB_USERNAME', env.DB_USERNAME);
    requireValue(errors, 'DB_NAME', env.DB_NAME);
    requireValue(errors, 'WECHAT_APP_ID', env.WECHAT_APP_ID);
    requireValue(errors, 'WECHAT_APP_SECRET', env.WECHAT_APP_SECRET);
    requireValue(errors, 'WECHAT_REMINDER_TEMPLATE_ID', env.WECHAT_REMINDER_TEMPLATE_ID);
    requireValue(errors, 'WECHAT_REMINDER_TEMPLATE_DATA_JSON', env.WECHAT_REMINDER_TEMPLATE_DATA_JSON);
    requireValue(errors, 'CORS_ORIGIN', env.CORS_ORIGIN);
    if (mediaDriver === 'cos') {
        requireValue(errors, 'COS_SECRET_ID', env.COS_SECRET_ID);
        requireValue(errors, 'COS_SECRET_KEY', env.COS_SECRET_KEY);
        requireValue(errors, 'COS_BUCKET', env.COS_BUCKET);
        requireValue(errors, 'COS_REGION', env.COS_REGION);
        requireValue(errors, 'COS_PUBLIC_BASE_URL', env.COS_PUBLIC_BASE_URL);
    }
    if (errors.length) {
        throw new Error(`生产环境配置校验失败：${errors.join('；')}`);
    }
}
function getReadinessReport(configService) {
    const issues = [];
    const driver = configService.get('media.driver', 'local');
    if (isProductionEnvironment(process.env)) {
        try {
            validateEnvironmentOrThrow(process.env);
        }
        catch (error) {
            issues.push(error instanceof Error ? error.message : '生产环境配置校验失败');
        }
    }
    if (driver === 'cos') {
        const requiredKeys = [
            ['COS_SECRET_ID', configService.get('media.cosSecretId', '')],
            ['COS_SECRET_KEY', configService.get('media.cosSecretKey', '')],
            ['COS_BUCKET', configService.get('media.cosBucket', '')],
            ['COS_REGION', configService.get('media.cosRegion', '')],
            ['COS_PUBLIC_BASE_URL', configService.get('media.cosPublicBaseUrl', '')],
        ];
        requiredKeys.forEach(([key, value]) => {
            if (!String(value || '').trim()) {
                issues.push(`对象存储配置缺少 ${key}`);
            }
        });
    }
    return {
        ok: issues.length === 0,
        issues,
    };
}
//# sourceMappingURL=runtime-validation.js.map