import { SetMetadata } from '@nestjs/common';

export const SKIP_TRANSFORM_KEY = 'skipTransform';

/**
 * 标记接口跳过统一返回体包装（用于文件流、SSE、webhook 回显等）
 */
export const SkipTransform = () => SetMetadata(SKIP_TRANSFORM_KEY, true);
