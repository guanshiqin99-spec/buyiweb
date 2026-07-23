# Tasks

> 执行顺序：Task 1（删除装饰器，无依赖）可与 Task 3（越权核对）并行；Task 2（LoginLockout 接入）独立。Task 4（构建验证）依赖前三者完成。

- [x] Task 1: 删除三个未接入的安全装饰器
  - [x] SubTask 1.1: 删除 `backend/src/common/decorators/require-ownership.decorator.ts`
  - [x] SubTask 1.2: 删除 `backend/src/common/decorators/require-permission.decorator.ts`
  - [x] SubTask 1.3: 删除 `backend/src/common/decorators/require-sign.decorator.ts`
  - [x] SubTask 1.4: 全局搜索 `RequireOwnership` / `RequirePermission` / `RequireSign` / `OWNERSHIP_KEY` / `PERMISSION_KEY` / `REQUIRE_SIGN_KEY` 确认无残留引用

- [x] Task 2: LoginLockoutService 接入登录流程
  - [x] SubTask 2.1: 新建 `backend/src/modules/auth-security/auth-security.module.ts`，将 `LoginLockoutService` 注册为 provider（用工厂注入 threshold=5, lockMinutes=15）并 export
  - [x] SubTask 2.2: 在 `backend/src/app.module.ts` 的 imports 数组中加入 `AuthSecurityModule`
  - [x] SubTask 2.3: 在 `admin-auth.module.ts` 中 import `AuthSecurityModule`；在 `admin-auth.service.ts` 构造函数注入 `LoginLockoutService`，在 `login()` 方法开头调 `ensureNotLocked(username, ip)`、密码校验失败时 `recordFailure(username, ip)`、成功时 `recordSuccess(username, ip)`
  - [x] SubTask 2.4: 在 `miniapp-auth.module.ts` 中 import `AuthSecurityModule`；在 `miniapp-auth.service.ts` 的 `webLogin()` 方法中接入同样三处调用（微信 `login()` 不接入）
  - [x] SubTask 2.5: 确认 controller 能把 request IP 传到 service。检查 `admin-auth.controller.ts` 和 `miniapp-auth.controller.ts` 的 login/webLogin 方法是否通过 `@Req()` 获取 IP 并传入 service；如未传则补传
  - [x] SubTask 2.6: 确认 `main.ts` 中 `app.set('trust proxy', 1)` 是否开启（生产在 Nginx 反代后需信任 X-Forwarded-For），未开启则开启
  - [x] SubTask 2.7（补充）: 在"账号不存在/未激活"分支也调用 recordFailure，防止用户名枚举

- [x] Task 3: 全量核对并修复水平越权漏洞
  - [x] SubTask 3.1: 扫描 `miniapp-favorites` 模块 — 全部带 userId 过滤，无漏洞
  - [x] SubTask 3.2: 扫描 `miniapp-learning-records` 模块 — 全部带 userId 过滤，无漏洞
  - [x] SubTask 3.3: 扫描 `miniapp-settings` 模块 — 通过 UsersService 按 userId 查询，无漏洞
  - [x] SubTask 3.4: 扫描 `miniapp-quiz` 模块 — 全部带 userId 过滤，无漏洞
  - [x] SubTask 3.5: 扫描 `miniapp-search` 的 mine 接口 — 通过 favoritesService.annotate 传 userId，无漏洞
  - [x] SubTask 3.6: 结论：所有查询都已带 userId 过滤，无需修改

- [x] Task 4: 构建与验证
  - [x] SubTask 4.1: 后端 `npm run build` 无错误（webpack compiled successfully）
  - [x] SubTask 4.2: 后端 `npm run test` 通过（14/14 tests passed）
  - [ ] SubTask 4.3: 手动验证登录失败锁定：连续 5 次错误密码 → 第 6 次提示锁定（需启动服务运行时验证）
  - [ ] SubTask 4.4: 手动验证锁定期内正确密码也被拒（需启动服务运行时验证）
  - [x] SubTask 4.5: 手动验证水平越权：代码层确认 miniapp-* 模块无按 id 单条操作路由，无法越权

# Task Dependencies

- Task 4 依赖 Task 1、Task 2、Task 3 全部完成
- Task 1、Task 2、Task 3 之间无依赖，可并行
