import { SetMetadata } from '@nestjs/common';

export const REQUIRE_SIGN_KEY = 'requireRequestSign';

/**
 * 标记接口必须携带 HMAC 请求签名（时间戳+nonce+盐防篡改/防重放）
 * 规范依据：安全项4「接口增加时间戳+随机盐加密签名，防参数篡改、请求重放」
 *
 * 用法：@RequireSign() 标注敏感写接口（数据导出、批量删除、管理员配置等）
 */
export const RequireSign = () => SetMetadata(REQUIRE_SIGN_KEY, true);
