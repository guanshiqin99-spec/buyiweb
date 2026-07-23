# Checklist

> 验证范围：Task 1（删除装饰器）、Task 2（LoginLockout 接入）、Task 3（水平越权核对）、Task 4（构建验证）。

## Task 1 — 删除未接入装饰器

- [x] `backend/src/common/decorators/require-ownership.decorator.ts` 已删除
- [x] `backend/src/common/decorators/require-permission.decorator.ts` 已删除
- [x] `backend/src/common/decorators/require-sign.decorator.ts` 已删除
- [x] 全局搜索 `RequireOwnership` / `RequirePermission` / `RequireSign` / `OWNERSHIP_KEY` / `PERMISSION_KEY` / `REQUIRE_SIGN_KEY` 无任何命中
- [x] `@Roles` + `RolesGuard` 仍正常工作（未误删）

## Task 2 — LoginLockoutService 接入

- [x] `backend/src/modules/auth-security/auth-security.module.ts` 已创建，`LoginLockoutService` 注册为 provider 并 export
- [x] `LoginLockoutService` 构造函数通过工厂注入 threshold=5、lockMinutes=15
- [x] `app.module.ts` 的 imports 数组包含 `AuthSecurityModule`
- [x] `admin-auth.service.ts` 的 `login()` 中调用了 `ensureNotLocked` / `recordFailure` / `recordSuccess`
- [x] `admin-auth.service.ts` 在"账号不存在/未激活"分支也调用 recordFailure（防止用户名枚举）
- [x] `miniapp-auth.service.ts` 的 `webLogin()` 中调用了 `ensureNotLocked` / `recordFailure` / `recordSuccess`
- [x] `miniapp-auth.service.ts` 在"账号不存在/未激活"分支也调用 recordFailure
- [x] `miniapp-auth.service.ts` 的微信 `login()` 未接入失败锁定（无密码爆破风险）
- [x] controller 将 request IP 传入了 service 的 login 方法
- [x] `main.ts` 中 `app.set('trust proxy', 1)` 已开启（Nginx 反代场景）

## Task 3 — 水平越权核对

- [x] `miniapp-favorites`：所有查询都带 `userId` 过滤（list/toggle/clear/getFavoriteMap/annotate）
- [x] `miniapp-learning-records`：所有查询都带 `userId` 过滤（create/list/clear/getStats）
- [x] `miniapp-settings`：通过 UsersService 按 `userId` 查询，未按 `id` 查询
- [x] `miniapp-quiz`：create/list 限定 `userId`
- [x] `miniapp-search` 的 mine 接口通过 favoritesService.annotate 传 userId
- [x] 补充核对 `miniapp-me` / `miniapp-badges` / `miniapp-agent` — 均带 userId 过滤
- [x] 结论：所有 miniapp-* 模块均无按资源 id 操作单条用户私有数据的路由，从路由层避免了越权

## Task 4 — 构建与验证

- [x] 后端 `npm run build` 无错误（webpack 5.104.1 compiled successfully）
- [x] 后端 `npm run test` 通过（14/14 tests passed, 3 suites）
- [ ] 连续 5 次错误密码登录 → 第 6 次返回"账号已被锁定，请 15 分钟后重试"（需手动运行时验证）
- [ ] 锁定期内输入正确密码也被拒绝（需手动运行时验证）
- [ ] 登录成功后失败计数清零（需手动运行时验证）
- [x] 用户 A 修改请求中的 id 尝试访问用户 B 的收藏/学习记录 — 代码层确认无按 id 单条操作路由，无法越权
