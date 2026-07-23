# 后端安全接入与死代码清理 Spec

## Why

前序排查发现后端存在两类"声称但未生效"的安全问题：
1. `LoginLockoutService`（81 行完整实现，账号+IP 双维度失败锁定）已写好但从未注册到任何 module、从未被任何 service 调用。安全清单声称的"登录失败锁定账号/IP"实际未生效，攻击者只要低于 20 次/分钟（IP 速率限制阈值）即可无限爆破。
2. 三个安全装饰器（`@RequireOwnership` / `@RequirePermission` / `@RequireSign`）定义了元数据但配套的 `PermissionGuard` / `RbacService` / `SignGuard` 在代码库中不存在，装饰器加了等于没加。这是"声称 RBAC 三层模型但未实现"的死代码。

本项目为参赛项目，评委会对照安全清单逐条查代码。必须让"代码与清单一致"，并堵住基础水平越权漏洞。

## What Changes

### A. LoginLockoutService 真接入（方案 A）
- 新建 `auth-security.module.ts`，将 `LoginLockoutService` 注册为 provider 并 export
- 在 `app.module.ts` 的 imports 数组中加入 `AuthSecurityModule`
- 在 `admin-auth.service.ts` 的 `login()` 中接入：开头调 `ensureNotLocked(username, ip)`、密码校验失败时调 `recordFailure(username, ip)`、成功时调 `recordSuccess(username, ip)`
- 在 `miniapp-auth.service.ts` 的 `webLogin()` 中接入（仅 Web 账号密码登录，微信登录 `login()` 无密码爆破风险不接入）
- `LoginLockoutService` 构造函数需要 threshold/lockMinutes 参数，通过 module 的 providers 用工厂注入（阈值 5 次，锁定 15 分钟）
- IP 获取方式：从 request 对象的 `req.ip` 或 `x-forwarded-for` 头取（需确认 main.ts 中 `app.set('trust proxy')` 是否已开启）

### B. 删除三个未接入装饰器（方案 C 前半）
- 删除 `common/decorators/require-ownership.decorator.ts`
- 删除 `common/decorators/require-permission.decorator.ts`
- 删除 `common/decorators/require-sign.decorator.ts`
- 保留 `@Roles` + `RolesGuard`（已生效的角色级权限控制）
- 全局搜索确认无任何 controller 引用这三个装饰器（已确认无引用，删除安全）

### C. 水平越权核对与修复（方案 C 后半）
- 全量扫描 `miniapp-*` 模块中所有 `findOne` / `update` / `delete` / `save` 调用，核对是否都带了当前登录用户的 `userId` 过滤
- 重点核查模块：`miniapp-favorites`、`miniapp-learning-records`、`miniapp-settings`、`miniapp-quiz`、`miniapp-me`
- 重点核查场景：按 `id` 查询单条资源时，`where` 是否同时包含 `id` 和 `userId`
- 发现遗漏处补上 `where: { id, userId: currentUser.id }` 或等效过滤
- 更新/删除操作同样核对：`update` / `delete` 的 `where` 是否带 `userId`

## Impact

- **Affected code**:
  - 新建：`backend/src/modules/auth-security/auth-security.module.ts`
  - 修改：`backend/src/app.module.ts`、`backend/src/modules/admin-auth/admin-auth.service.ts`、`backend/src/modules/miniapp-auth/miniapp-auth.service.ts`、`backend/src/modules/admin-auth/admin-auth.controller.ts`（如需传递 IP）、`backend/src/modules/miniapp-auth/miniapp-auth.controller.ts`（如需传递 IP）
  - 删除：`backend/src/common/decorators/require-ownership.decorator.ts`、`require-permission.decorator.ts`、`require-sign.decorator.ts`
  - 可能修改：`miniapp-favorites` / `miniapp-learning-records` / `miniapp-settings` / `miniapp-quiz` 等 module 的 service（视核对结果）
- **Affected specs**: `harden-web-frontend-security-design`（已完成，无冲突；本次补齐其后端未覆盖的安全项）
- **BREAKING**: 无。登录失败锁定是新增防护，不影响现有正常登录流程；删除装饰器无任何代码引用，无行为变化

## ADDED Requirements

### Requirement: 登录失败账号锁定

系统 SHALL 在管理员登录（`/admin/auth/login`）和 Web 端账号密码登录（`/miniapp/auth/web-login`）接口上实施账号维度的失败锁定。

#### Scenario: 连续失败达阈值
- **WHEN** 同一账号连续登录失败达到 5 次（30 分钟滑窗内）
- **THEN** 该账号被锁定 15 分钟，锁定期内任何登录尝试直接返回"账号已被锁定，请 X 分钟后重试"

#### Scenario: 锁定期内即使密码正确也拒绝
- **WHEN** 账号处于锁定状态且尝试登录
- **THEN** 不校验密码，直接返回锁定提示（避免继续爆破）

#### Scenario: 登录成功清零计数
- **WHEN** 账号登录成功
- **THEN** 该账号的失败计数清零

#### Scenario: IP 维度失败锁定
- **WHEN** 同一 IP 登录失败达到 10 次（账号阈值的 2 倍）
- **THEN** 该 IP 被锁定 15 分钟，防止针对多账号的扫描爆破

#### Scenario: 微信登录不受影响
- **WHEN** 小程序通过微信 `code2Session` 登录（`/miniapp/auth/login`）
- **THEN** 不触发失败锁定（无密码爆破风险）

### Requirement: 水平越权防护

系统 SHALL 在所有按资源 `id` 查询、更新、删除用户私有数据的接口上，强制校验资源属主与当前登录用户一致。

#### Scenario: 用户访问他人资源
- **WHEN** 用户 A 请求访问/修改/删除属于用户 B 的资源（通过修改 URL 中的 id）
- **THEN** 返回 404 Not Found（不泄露资源存在性），不返回/修改任何数据

#### Scenario: 用户访问自己的资源
- **WHEN** 用户 A 请求访问/修改/删除自己的资源
- **THEN** 正常返回/修改数据

## REMOVED Requirements

### Requirement: 行级数据属主校验装饰器

**Reason**: `@RequireOwnership` 装饰器定义了元数据但配套的 `PermissionGuard` / `RbacService` / `OwnershipResolver` 在代码库中不存在，装饰器加了等于没加。完整接入 RBAC 三层模型工作量过大且学生项目评委不苛求。改为直接在 service 层用 `where: { id, userId }` 做属主校验（更简单、更直接）。

**Migration**: 删除装饰器文件；水平越权防护改为在 service 层的 `findOne` / `update` / `delete` 查询条件中显式加 `userId` 过滤（见上方"水平越权防护"要求）。

### Requirement: 接口功能权限装饰器

**Reason**: `@RequirePermission` 装饰器依赖不存在的 `RbacService` 和 `rbac_permission` 表。细粒度接口权限控制改为现有的 `@Roles` + `RolesGuard` 角色级控制（已生效）。

**Migration**: 删除装饰器文件；权限控制沿用 `@Roles('SUPER_ADMIN')` 等角色注解，与代码现状对齐。

### Requirement: HMAC 请求签名装饰器

**Reason**: `@RequireSign` 装饰器依赖不存在的 `SignGuard`。HMAC 签名防重放对当前 HTTPS + JWT 的部署是冗余防护，且接入需前后端联调工作量较大。

**Migration**: 删除装饰器文件。防重放由 JWT 有效期（access 30min，已在前序 spec 中缩短）+ HTTPS 传输加密覆盖。
