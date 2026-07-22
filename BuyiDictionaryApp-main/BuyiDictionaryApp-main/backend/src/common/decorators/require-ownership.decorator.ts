import { SetMetadata } from '@nestjs/common';

export const OWNERSHIP_KEY = 'requireOwnership';

/**
 * 行级数据存取权限装饰器
 * 规范依据：架构项2「实现行级数据存取权限」+ 安全项2「拦截水平越权（访问他人私有数据）」
 *
 * 用法：
 *   @RequireOwnership({ resource: 'favorite', idParam: 'id' })
 *
 * PermissionGuard 会调用 RbacService 注册的 OwnershipResolver，
 * 校验当前登录用户是否为该资源（按 idParam 取参）的属主；
 * 管理员角色可豁免（垂直越权由 @RequirePermission 单独控制）。
 */
export function RequireOwnership(options: { resource: string; idParam?: string }) {
  return SetMetadata(OWNERSHIP_KEY, {
    resource: options.resource,
    idParam: options.idParam ?? 'id',
  });
}
