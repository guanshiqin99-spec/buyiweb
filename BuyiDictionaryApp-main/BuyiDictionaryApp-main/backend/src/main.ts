import { Logger, ValidationPipe } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { NextFunction, Request, Response } from 'express';
import { NestFactory } from '@nestjs/core';
import helmet from 'helmet';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { createRateLimitMiddleware } from './common/http/rate-limit';
import { validateEnvironmentOrThrow } from './config/runtime-validation';
import { AppModule } from './app.module';

async function bootstrap() {
  validateEnvironmentOrThrow(process.env);

  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule, { cors: false });
  app.setGlobalPrefix('api');

  app.use(
    helmet({
      crossOriginResourcePolicy: false,
    }),
  );
  app.enableCors({
    origin: process.env.CORS_ORIGIN?.split(',').map((item) => item.trim()).filter(Boolean) ?? false,
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.useGlobalFilters(new HttpExceptionFilter());
  app.use((req: Request, res: Response, next: NextFunction) => {
    const requestId = req.header('x-request-id') || randomUUID();
    req.requestId = requestId;
    res.setHeader('x-request-id', requestId);
    const startedAt = Date.now();
    res.on('finish', () => {
      logger.log(
        JSON.stringify({
          requestId,
          method: req.method,
          path: req.originalUrl,
          statusCode: res.statusCode,
          durationMs: Date.now() - startedAt,
        }),
      );
    });
    next();
  });
  app.use(
    ['/api/admin/auth/login', '/api/admin/auth/refresh', '/api/miniapp/auth/wechat-login', '/api/miniapp/auth/web-login', '/api/miniapp/auth/web-register', '/api/miniapp/auth/refresh'],
    createRateLimitMiddleware({
      limit: 20,
      windowMs: 60 * 1000,
      message: '请求过于频繁，请稍后再试',
    }),
  );
  app.use(
    ['/api/admin/media/upload'],
    createRateLimitMiddleware({
      limit: 10,
      windowMs: 60 * 1000,
      message: '上传过于频繁，请稍后再试',
    }),
  );
  app.use(
    ['/api/miniapp/agent/ask'],
    createRateLimitMiddleware({
      limit: 10,
      windowMs: 60 * 1000,
      message: '提问过于频繁，请稍后再试',
    }),
  );

  if ((process.env.ENABLE_SWAGGER ?? 'false') === 'true') {
    const config = new DocumentBuilder()
      .setTitle('Buyi Dictionary API')
      .setDescription('布依语词典小程序与管理后台接口文档')
      .setVersion('1.0.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);
  }

  const port = Number(process.env.PORT ?? 3000);
  const host = process.env.HOST ?? '0.0.0.0';
  await app.listen(port, host);
  logger.log(`HTTP server listening on ${host}:${port}`);
}

void bootstrap();
