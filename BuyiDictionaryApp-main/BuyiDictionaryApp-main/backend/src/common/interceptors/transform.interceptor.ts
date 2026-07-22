import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, map } from 'rxjs';
import { ApiResult } from '../response/api-response';

export const SKIP_TRANSFORM_KEY = 'skipTransform';

/**
 * 全局响应包装拦截器
 * 规范依据：架构项4「全局固定统一返回体，包含状态码、提示信息、业务数据、时间戳」
 *
 * 将控制器返回的裸数据统一包装为 { code, message, data, timestamp, requestId }。
 * 标记 @SkipTransform() 的接口（如文件流下载）可跳过包装。
 */
@Injectable()
export class TransformInterceptor implements NestInterceptor {
  constructor(private readonly reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<ApiResult> {
    const request = context.switchToHttp().getRequest<{
      method: string;
      requestId?: string;
    }>();

    return next.handle().pipe(
      map((data) => {
        // 已经是 ApiResult 结构则不再重复包装
        if (data && typeof data === 'object' && 'code' in data && 'timestamp' in data) {
          return { ...data, requestId: request.requestId } as ApiResult;
        }

        const httpStatus = context.switchToHttp().getResponse<{ statusCode: number }>().statusCode;
        const message =
          request.method === 'POST' || request.method === 'PUT' || request.method === 'PATCH'
            ? '操作成功'
            : '请求成功';

        return {
          code: httpStatus,
          message,
          data: data ?? null,
          timestamp: new Date().toISOString(),
          requestId: request.requestId,
        } as ApiResult;
      }),
    );
  }
}
