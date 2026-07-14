"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const crypto_1 = require("crypto");
const core_1 = require("@nestjs/core");
const helmet_1 = require("helmet");
const swagger_1 = require("@nestjs/swagger");
const http_exception_filter_1 = require("./common/filters/http-exception.filter");
const rate_limit_1 = require("./common/http/rate-limit");
const runtime_validation_1 = require("./config/runtime-validation");
const app_module_1 = require("./app.module");
async function bootstrap() {
    (0, runtime_validation_1.validateEnvironmentOrThrow)(process.env);
    const logger = new common_1.Logger('Bootstrap');
    const app = await core_1.NestFactory.create(app_module_1.AppModule, { cors: false });
    app.setGlobalPrefix('api');
    app.use((0, helmet_1.default)({
        crossOriginResourcePolicy: false,
    }));
    app.enableCors({
        origin: process.env.CORS_ORIGIN?.split(',').map((item) => item.trim()).filter(Boolean) ?? false,
        credentials: true,
    });
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
    }));
    app.useGlobalFilters(new http_exception_filter_1.HttpExceptionFilter());
    app.use((req, res, next) => {
        const requestId = req.header('x-request-id') || (0, crypto_1.randomUUID)();
        req.requestId = requestId;
        res.setHeader('x-request-id', requestId);
        const startedAt = Date.now();
        res.on('finish', () => {
            logger.log(JSON.stringify({
                requestId,
                method: req.method,
                path: req.originalUrl,
                statusCode: res.statusCode,
                durationMs: Date.now() - startedAt,
            }));
        });
        next();
    });
    app.use(['/api/admin/auth/login', '/api/admin/auth/refresh', '/api/miniapp/auth/wechat-login', '/api/miniapp/auth/web-login', '/api/miniapp/auth/web-register', '/api/miniapp/auth/refresh'], (0, rate_limit_1.createRateLimitMiddleware)({
        limit: 20,
        windowMs: 60 * 1000,
        message: '请求过于频繁，请稍后再试',
    }));
    app.use(['/api/admin/media/upload'], (0, rate_limit_1.createRateLimitMiddleware)({
        limit: 10,
        windowMs: 60 * 1000,
        message: '上传过于频繁，请稍后再试',
    }));
    app.use(['/api/miniapp/agent/ask'], (0, rate_limit_1.createRateLimitMiddleware)({
        limit: 10,
        windowMs: 60 * 1000,
        message: '提问过于频繁，请稍后再试',
    }));
    if ((process.env.ENABLE_SWAGGER ?? 'false') === 'true') {
        const config = new swagger_1.DocumentBuilder()
            .setTitle('Buyi Dictionary API')
            .setDescription('布依语词典小程序与管理后台接口文档')
            .setVersion('1.0.0')
            .addBearerAuth()
            .build();
        const document = swagger_1.SwaggerModule.createDocument(app, config);
        swagger_1.SwaggerModule.setup('api/docs', app, document);
    }
    const port = Number(process.env.PORT ?? 3000);
    const host = process.env.HOST ?? '0.0.0.0';
    await app.listen(port, host);
    logger.log(`HTTP server listening on ${host}:${port}`);
}
void bootstrap();
//# sourceMappingURL=main.js.map