import { SetMetadata } from '@nestjs/common';

export const PERMISSION_KEY = 'requiredPermission';

/**
 * 接口功能权限 / 按钮操作权限装饰器
 * 规范依据：架构项2「实现接口功能权限、按钮操作权限；权限全部存入数据库，禁止代码硬编码」
 *
 * 用法：
 *   @RequirePermission('dictionary:create')      // 接口功能权限
 *   @RequirePermission('dictionary:export', 'button') // 按钮操作权限
 *
 * 实际权限码与粒度由数据库 rbac_permission 表定义，本装饰器仅声明所需权限码，
 * PermissionGuard 会从 DB 加载当前用户的权限集合做匹配（服务端二次校验）。
 */
export function RequirePermission(code: string, level: 'interface' | 'button' = 'interface') {
  return SetMetadata(PERMISSION_KEY, { code, level });
}
