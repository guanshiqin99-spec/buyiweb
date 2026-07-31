# 布依词典前后端与数据库安全审计报告

> 生成时间：2026-07-31
> 审计范围：Vue 3 Web 前端、微信小程序前端 + 云函数、NestJS 后端、TypeORM/MySQL 数据库层、部署配置
> 审计方式：基于代码与配置的只读静态审计，参照 Express / Vue / 通用前端安全规范
> 审计依据：`security-best-practices` 技能参考文档（javascript-express-web-server-security、javascript-typescript-vue-web-frontend-security、javascript-general-web-frontend-security）

---

## 一、执行摘要

本次对布依词典项目的前端、后端与数据库做了一次全面只读安全审计。项目整体安全基线**良好**：后端启用了 helmet、全局 ValidationPipe（whitelist + forbidNonWhitelisted）、Bearer 头鉴权（CSRF 不适用）、双令牌会话（refresh token 哈希存储 + 一次一用 + logout 即失效）、登录锁定、关键端点限流、运行时环境变量强制校验、无 SQL 注入与 RCE sink、JWT_SECRET 无代码级 fallback。

但仍发现 **5 项致命、10 项高危、13 项中危、13 项低危** 问题，主要集中在：

1. **敏感数据泄露**：管理员接口返回用户密码哈希与手机号；`SECURITY.md` 声称的 PII 脱敏拦截器实际未实现；两个 SQLite 数据库文件被提交进 git。
2. **部署配置不安全**：根 `docker-compose.yml` 默认弱密码、3306 端口对公网开放、默认值与生产校验直接冲突。
3. **传输安全**：小程序云函数 `apiProxy` 以明文 HTTP 回连后端 IP，Bearer Token 在传输中裸奔。
4. **数据库迁移缺陷**：5 个迁移只注册了 3 个，baseline 迁移依赖 synchronize 而非显式 DDL，生产关闭 synchronize 后会崩。
5. **鉴权与限流缺口**：`agent/generate` 端点未鉴权；破坏性管理端点缺少 RBAC 角色细分；限流/锁定用进程内 Map，多实例下失效。

**最高优先级修复项**（P0，建议立即处理）：F-01、F-02、F-03、F-04、F-05、H-01、H-02。

---

## 二、严重程度分级说明

| 级别 | 含义 |
|------|------|
| 致命 (Critical) | 可被直接利用造成数据泄露、凭据盗取、未授权访问，或部署即处于不安全状态 |
| 高危 (High) | 在特定条件下可被利用，或显著扩大攻击面，需优先修复 |
| 中危 (Medium) | 防御纵深缺失或存在可被组合利用的弱点 |
| 低危 (Low) | 信息泄露、加固建议或需在条件变化后重新评估 |

---

## 三、致命问题（Critical）

### F-01 管理员用户列表接口泄露密码哈希与手机号

- **Rule ID**: EXPRESS-DATA-001 / OWASP A02
- **Severity**: Critical
- **Location**: [admin-users.controller.ts](file:///d:/BuyiDictionaryWeb/BuyiDictionaryApp-main/BuyiDictionaryApp-main/backend/src/modules/admin-users/admin-users.controller.ts#L20-L36)、[user.entity.ts](file:///d:/BuyiDictionaryWeb/BuyiDictionaryApp-main/BuyiDictionaryApp-main/backend/src/entities/user.entity.ts#L24-L28)
- **Evidence**:
  ```ts
  // admin-users.controller.ts:20-36
  @Get()
  async list(@Query() query: PaginationQueryDto) {
    const [items, total] = await this.userRepository.findAndCount({
      order: { id: 'DESC' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });               // ← 无 select，返回全部列
    return { items, total, page, pageSize };
  }
  // user.entity.ts:24-28 —— passwordHash、phoneNumber 未标注 @Exclude
  @Column({ type: 'varchar', length: 100, nullable: true }) passwordHash!: string | null;
  @Column({ type: 'varchar', length: 32, nullable: true }) phoneNumber!: string | null;
  ```
- **Impact**: 任何 `SUPER_ADMIN` 调用 `GET /api/admin/users` 都会在响应里拿到所有 Web 注册用户的 `passwordHash`（bcrypt 哈希）与 `phoneNumber`（PII）。管理员账号被盗或内部越权即可离线爆破弱密码、横向撞库、泄露用户隐私。
- **Fix**: 在 `findAndCount` 中显式 `select: ['id','username','nickname','avatarUrl','isActive','lastLoginTime','createdAt']`；或在 `User` 实体敏感字段加 `@Exclude()` 并注册全局 `ClassSerializerInterceptor`。

---

### F-02 `PiiMaskInterceptor` 在 SECURITY.md 声称存在但实际未实现

- **Rule ID**: EXPRESS-DATA-002 / 文档与实现不符
- **Severity**: Critical
- **Location**:
  - 声明：[SECURITY.md:101-107](file:///d:/BuyiDictionaryWeb/SECURITY.md#L101-L107)（2.7 节"PII 数据脱敏"）
  - 实际缺失：[main.ts](file:///d:/BuyiDictionaryWeb/BuyiDictionaryApp-main/BuyiDictionaryApp-main/backend/src/main.ts)（无任何全局拦截器）、[app.module.ts:89-98](file:///d:/BuyiDictionaryWeb/BuyiDictionaryApp-main/BuyiDictionaryApp-main/backend/src/app.module.ts#L89-L98)（providers 无 PiiMaskInterceptor）
  - 暴露点：[miniapp-me.controller.ts:23](file:///d:/BuyiDictionaryWeb/BuyiDictionaryApp-main/BuyiDictionaryApp-main/backend/src/modules/miniapp-me/miniapp-me.controller.ts#L23)
- **Evidence**:
  ```ts
  // miniapp-me.controller.ts —— 明文返回手机号，未脱敏
  return {
    user: {
      id: currentUser.id,
      nickname: currentUser.nickname,
      avatarUrl: currentUser.avatarUrl,
      phoneNumber: currentUser.phoneNumber,  // ← 明文
    },
    ...
  };
  ```
  全仓库 grep `PiiMask` 命中 0 个相关实现文件。
- **Impact**: SECURITY.md 声称"手机号保留前 3 后 4、身份证号保留前 4 后 4、邮箱保留首字符与域名"自动脱敏，实际未实现。`miniapp/me` 接口返回明文手机号；F-01 中 admin/users 接口也返回明文手机号。文档与实现不符导致安全依赖被误判，PII 实际处于无保护暴露状态。
- **Fix**: 二选一：(a) 在 `main.ts` 注册一个真正的全局 `PiiMaskInterceptor`，对响应中 `phoneNumber`/`idCard`/`email` 字段做正则脱敏；(b) 至少在序列化层显式脱敏（如 `miniapp-me.controller.ts:23` 改为返回 `maskPhone(currentUser.phoneNumber)`）。同时订正 SECURITY.md。

---

### F-03 两个 SQLite 数据库文件已提交进 git 仓库

- **Rule ID**: EXPRESS-SECRETS-001 / 供应链与凭据泄露
- **Severity**: Critical
- **Location**:
  - [buyi_dictionary.db](file:///d:/BuyiDictionaryWeb/buyi_dictionary.db)（90,112 字节）
  - [buyi-local.sqlite](file:///d:/BuyiDictionaryWeb/BuyiDictionaryApp-main/BuyiDictionaryApp-main/backend/buyi-local.sqlite)（167,936 字节）
- **Evidence**: `git ls-files -- "*.db" "*.sqlite" "*.sqlite3"` 确认两文件被跟踪；`git check-ignore` 返回非零确认未被忽略。
  - `buyi_dictionary.db` ASCII 提取命中：`admin`、`password`、`user`、`Token`、`Hash`
  - `buyi-local.sqlite` ASCII 提取命中表名：`admins`、`auth_sessions`、`agent_cache`、`badges`、`quiz_attempts`；字段：`passwordHash`、`refreshTokenHash`、`answersJson`、`avatarUrl`、`actionType`
  - 根 `.gitignore:70-72` 仅排除 `*-test.sqlite`，并注释"保留 buyi_dictionary.db 作为种子数据"；`backend/.gitignore` 仅排除 `buyi-runtime.sqlite`
- **Impact**: `buyi-local.sqlite` 是开发环境完整数据库快照，含 `admins`、`auth_sessions`、`wechat_accounts` 等表结构与字段名。即使当前为样例数据，仍泄露：(1) 完整 schema（攻击面收窄）；(2) 若含数据，则 `passwordHash`（cost=6 弱哈希，见 H-04）、`refreshTokenHash`、`openid`/`unionid`/`sessionKey`、`phoneNumber` 全部泄露。
- **Fix**: (1) `git rm --cached buyi_dictionary.db BuyiDictionaryApp-main/BuyiDictionaryApp-main/backend/buyi-local.sqlite`；(2) 在根 `.gitignore` 加 `*.db`、`*.sqlite`、`*.sqlite3`、`buyi-local.sqlite`；在 `backend/.gitignore` 加 `*.sqlite`、`buyi-local.sqlite`；(3) 轮换可能存在于历史 commit 中的管理员密码、JWT 密钥、微信 AppSecret。

---

### F-04 根 docker-compose.yml 将 MySQL 3306 暴露到所有接口 + 默认弱密码

- **Rule ID**: EXPRESS-CONFIG-001
- **Severity**: Critical
- **Location**: [docker-compose.yml:9-16](file:///d:/BuyiDictionaryWeb/docker-compose.yml#L9-L16)
- **Evidence**:
  ```yaml
  mysql:
    environment:
      MYSQL_ROOT_PASSWORD: ${MYSQL_ROOT_PASSWORD:-buyi_root_password}
      MYSQL_PASSWORD: ${MYSQL_PASSWORD:-buyi_password}
    ports:
      - "3306:3306"   # 未绑定 127.0.0.1
  ```
  对比 [deploy/docker-compose.yml:16](file:///d:/BuyiDictionaryWeb/deploy/docker-compose.yml#L16) 是 `"127.0.0.1:3306:3306"`（安全）。
- **Impact**: 任何拿到该 compose 部署的人若未设置环境变量，MySQL 会以 `root`/`buyi_root_password` 默认密码暴露在 0.0.0.0:3306，可被公网扫描器爆破。`buyi_root_password` / `buyi_password` 在常见弱密码字典中。
- **Fix**: (1) `ports` 改为 `"127.0.0.1:3306:3306"`；(2) 移除默认值或改为强制报错：`${MYSQL_ROOT_PASSWORD:?MYSQL_ROOT_PASSWORD required}`。

---

### F-05 根 docker-compose.yml 默认值与生产 runtime-validation 直接冲突

- **Rule ID**: EXPRESS-CONFIG-002
- **Severity**: Critical
- **Location**: [docker-compose.yml:32,34,47,50,52](file:///d:/BuyiDictionaryWeb/docker-compose.yml#L32-L52)
- **Evidence**:
  ```yaml
  ENABLE_SWAGGER: true                       # 与 SECURITY.md 3.1 节冲突
  CORS_ORIGIN: ${CORS_ORIGIN:-*}             # 通配符
  WECHAT_MOCK_MODE: ${WECHAT_MOCK_MODE:-true}
  SEED_ON_BOOT: ${SEED_ON_BOOT:-true}
  DEFAULT_ADMIN_PASSWORD: ${DEFAULT_ADMIN_PASSWORD:-Admin@123456}
  ```
- **Impact**: `runtime-validation.ts:41-49` 在 `NODE_ENV=production` 下会强制 throw 阻止启动，因此该 compose 在生产下直接无法启动；但若有人误把 `NODE_ENV` 改回 development，则全套安全开关失效。`CORS_ORIGIN` 默认 `*` 在生产 runtime-validation 中只 warn 不 error，会真正生效导致跨域全开。
- **Fix**: 所有默认值改为安全值：`ENABLE_SWAGGER: false`、`CORS_ORIGIN: ${CORS_ORIGIN:?required}`、`WECHAT_MOCK_MODE: false`、`SEED_ON_BOOT: false`、`DEFAULT_ADMIN_PASSWORD: ${DEFAULT_ADMIN_PASSWORD:?required}`。

---

## 四、高危问题（High）

### H-01 存储型 XSS：上传文件名扩展名与 MIME 校验对象不一致

- **Rule ID**: EXPRESS-UPLOAD-001 / OWASP A03
- **Severity**: High
- **Location**: [media.service.ts:30-52](file:///d:/BuyiDictionaryWeb/BuyiDictionaryApp-main/BuyiDictionaryApp-main/backend/src/modules/media/media.service.ts#L30-L52)、[media.service.ts:76-109](file:///d:/BuyiDictionaryWeb/BuyiDictionaryApp-main/BuyiDictionaryApp-main/backend/src/modules/media/media.service.ts#L76-L109)
- **Evidence**:
  ```ts
  // validateUpload 只检查 file.originalname 扩展名 + file.mimetype（客户端可伪造）
  async validateUpload(file: UploadedMediaFile, kind: 'image' | 'audio') {
    const extension = extname(file.originalname || '');
    if (!mimeWhiteList.includes(file.mimetype)) { ... }
  }
  // 但落盘文件名取自 payload.filename（用户可控）
  async upload(file, payload: UploadMediaDto) {
    this.validateUpload(file, payload.kind);
    const uploaded = await this.storageService.upload({
      filename: this.normalizeFilename(payload.filename || file.originalname), // ← 用户可控
    });
  }
  // normalizeFilename 只校验字符正则 + "有扩展名"，不限定扩展名必须匹配 kind/mimetype
  private normalizeFilename(filename: string) {
    if (!/^[\w.\-()\u4e00-\u9fa5\s]+$/.test(value)) { ... }
    if (!extname(value)) { ... }
    return value.replace(/\s+/g, '-');
  }
  ```
- **Impact**: 管理员（含权限较低的 `EDITOR`，因 [admin-media.controller.ts](file:///d:/BuyiDictionaryWeb/BuyiDictionaryApp-main/BuyiDictionaryApp-main/backend/src/modules/admin-media/admin-media.controller.ts) 未挂 `RolesGuard`，见 M-01）可构造请求：`file.originalname="x.png"`、`file.mimetype="image/png"`、`payload.filename="evil.html"`、文件体为 `<script>...</script>`。校验通过后文件以 `evil.html` 落盘到 `uploads/`，再由 `ServeStaticModule`（[app.module.ts:46-49](file:///d:/BuyiDictionaryWeb/BuyiDictionaryApp-main/BuyiDictionaryApp-main/backend/src/app.module.ts#L46-L49)）按扩展名以 `text/html` 提供服务，形成存储型 XSS。
- **Fix**: 在 `normalizeFilename` 中强制校验最终扩展名必须属于 `kind` 对应白名单且与 `file.mimetype` 一致；或直接忽略 `payload.filename` 的扩展名，用 `crypto.randomUUID()` + 受控扩展名重命名落盘。

---

### H-02 小程序云函数 apiProxy 以明文 HTTP 回连后端，Bearer Token 裸奔

- **Rule ID**: JS-HTTP-001 / EXPRESS-SECRETS-002 / 传输安全
- **Severity**: High
- **Location**: [cloudfunctions/apiProxy/index.js:11](file:///d:/BuyiDictionaryWeb/BuyiDictionaryApp-main/BuyiDictionaryApp-main/cloudfunctions/apiProxy/index.js#L11)、[:30-58](file:///d:/BuyiDictionaryWeb/BuyiDictionaryApp-main/BuyiDictionaryApp-main/cloudfunctions/apiProxy/index.js#L30-L58)
- **Evidence**:
  ```js
  const BACKEND_BASE = 'http://39.96.81.132:80/api';   // 行 11：明文 HTTP + 硬编码 IP
  headers: { 'content-type':'application/json', ...headers },  // 行 46-49：headers 含 Authorization
  const requestModule = isHttps ? https : http;          // 行 58：此处走 http
  ```
  小程序 [utils/agentStream.js:78](file:///d:/BuyiDictionaryWeb/BuyiDictionaryApp-main/BuyiDictionaryApp-main/utils/agentStream.js#L78) 与 [app.js:96-118](file:///d:/BuyiDictionaryWeb/BuyiDictionaryApp-main/BuyiDictionaryApp-main/app.js#L96-L118) 把 `Authorization: Bearer <token>` 透传给云函数，云函数再以明文 http 转发。`utils/api.js:32-34` 的"正式版必须 HTTPS"校验只在降级 `wx.request` 路径生效；走云函数路径（`shouldUseCloudContainer()` 在 develop/trial/release 均为 true，见 [runtime-config.js:14](file:///d:/BuyiDictionaryWeb/BuyiDictionaryApp-main/BuyiDictionaryApp-main/utils/runtime-config.js#L14)）时该 HTTPS 校验被完全绕过。
- **Impact**: 云函数宿主到后端 IP 之间任意 MITM 可窃取用户 access token；同时硬编码 IP 暴露内部基础设施地址，便于定向扫描。旧 IP（`39.96.81.132`）可能已失效或未加固。
- **Fix**: 后端启用 HTTPS，将 `BACKEND_BASE` 改为 `https://<域名>/api`；在云函数内强制 `if (!/^https:/.test(targetUrl)) return 502`；移除硬编码 IP，改用域名 + 云函数环境变量注入。

---

### H-03 数据库迁移注册不完整：RBAC/审计日志/MFA/song.duration 未注册

- **Rule ID**: EXPRESS-DB-001
- **Severity**: High
- **Location**: [database.config.ts:46](file:///d:/BuyiDictionaryWeb/BuyiDictionaryApp-main/BuyiDictionaryApp-main/backend/src/config/database.config.ts#L46)
- **Evidence**:
  ```ts
  export const migrations = [BaselineSchema1710000000000, AddCultureExhibits1721000000000, AddQuizAttempts1722000000000];
  ```
  实际 `src/migrations/` 下有 5 个迁移文件，未注册的 2 个：
  - `1730000000000-add-rbac-and-audit.ts`（创建 `rbac_permission`/`rbac_role`/`rbac_role_permission`/`rbac_user_role`/`audit_log`/`mfa_factor`，并给 `admins`/`users` 补 `is_deleted`/`created_by`/`updated_by` 列）
  - `1731000000000-add-song-duration.ts`（给 `songs` 加 `duration` 列，对应 [song.entity.ts:29](file:///d:/BuyiDictionaryWeb/BuyiDictionaryApp-main/BuyiDictionaryApp-main/backend/src/entities/song.entity.ts#L29)）
- **Impact**: 生产 `DB_SYNCHRONIZE=false`（runtime-validation 强制）后，`migration:run` 不会创建这些表/列。RBAC、审计日志、MFA 功能运行时报"table not exists"；`songs.duration` 查询报"unknown column"。当前线上靠 synchronize 维持，一旦 synchronize 真正关闭即崩。
- **Fix**: `database.config.ts:46` 改为注册全部 5 个迁移。

---

### H-04 baseline 迁移 up() 调用 `synchronize(false)`，不是真正的迁移

- **Rule ID**: EXPRESS-DB-002
- **Severity**: High
- **Location**: [1710000000000-baseline-schema.ts:7](file:///d:/BuyiDictionaryWeb/BuyiDictionaryApp-main/BuyiDictionaryApp-main/backend/src/migrations/1710000000000-baseline-schema.ts#L7)
- **Evidence**:
  ```ts
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.connection.synchronize(false);
  }
  ```
- **Impact**: `synchronize(false)` 表示"根据实体生成 schema 但不允许数据丢失"。在 `DB_SYNCHRONIZE=false` 的纯迁移流程下，该 baseline 迁移不会创建任何表（依赖 ORM 自动同步，而该路径在生产被禁用）。`migration:run` 跑完后 baseline 表全缺。down() 又是裸 `DROP TABLE IF EXISTS`，破坏性极强。
- **Fix**: 把 baseline 迁移改写为显式 `CREATE TABLE` DDL（参照 `1730000000000-add-rbac-and-audit.ts` 写法），或确认生产先手动跑 `deploy/db/*.sql`。

---

### H-05 seed.service.ts 使用 bcrypt cost factor = 6（远低于声称的 10）

- **Rule ID**: EXPRESS-AUTH-002
- **Severity**: High
- **Location**: [seed.service.ts:81](file:///d:/BuyiDictionaryWeb/BuyiDictionaryApp-main/BuyiDictionaryApp-main/backend/src/modules/seed/seed.service.ts#L81)
- **Evidence**:
  ```ts
  const passwordHash = await bcrypt.hash(password, 6);
  ```
  对比 [init-admin.ts:30](file:///d:/BuyiDictionaryWeb/BuyiDictionaryApp-main/BuyiDictionaryApp-main/backend/src/scripts/init-admin.ts#L30)、[miniapp-auth.service.ts:154](file:///d:/BuyiDictionaryWeb/BuyiDictionaryApp-main/BuyiDictionaryApp-main/backend/src/modules/miniapp-auth/miniapp-auth.service.ts#L154) 均用 10，SECURITY.md 7.1 节明确"cost factor 不低于 10"。
- **Impact**: seed 出来的 admin 哈希极易被 GPU 爆破（cost=6 ≈ 64 轮，cost=10 ≈ 1024 轮，差 16 倍）。结合 F-03 中 `buyi-local.sqlite` 被提交，若该库含 seed 的 admin 数据，离线爆破成本极低。虽 `seed.service.ts:70-72` 生产环境直接 return（良好），但开发库泄露仍是真实风险。
- **Fix**: `seed.service.ts:81` 改为 `bcrypt.hash(password, 10)`。

---

### H-06 默认管理员密码 `Admin@123456` 在多处硬编码

- **Rule ID**: EXPRESS-CONFIG-003
- **Severity**: High
- **Location**:
  - [app.config.ts:113](file:///d:/BuyiDictionaryWeb/BuyiDictionaryApp-main/BuyiDictionaryApp-main/backend/src/config/app.config.ts#L113) `adminPassword: process.env.DEFAULT_ADMIN_PASSWORD ?? 'Admin@123456'`
  - [seed.service.ts:80](file:///d:/BuyiDictionaryWeb/BuyiDictionaryApp-main/BuyiDictionaryApp-main/backend/src/modules/seed/seed.service.ts#L80) `get<string>('seed.adminPassword', 'Admin@123456')`
  - [docker-compose.yml:52](file:///d:/BuyiDictionaryWeb/docker-compose.yml#L52) `DEFAULT_ADMIN_PASSWORD: ${DEFAULT_ADMIN_PASSWORD:-Admin@123456}`
- **Impact**: 若部署未设置 `DEFAULT_ADMIN_PASSWORD`，seed（仅开发环境生效）会用 `Admin@123456`，该密码在通用字典中。
- **Fix**: 默认值改为 `''` 并在 `seedAdmin` 中检测空值 throw（参照 [init-admin.ts:20-22](file:///d:/BuyiDictionaryWeb/BuyiDictionaryApp-main/BuyiDictionaryApp-main/backend/src/scripts/init-admin.ts#L20-L22)）；docker-compose 用 `${DEFAULT_ADMIN_PASSWORD:?required}` 强制注入。

---

### H-07 wechat-account 敏感字段（openid/unionid/sessionKey）实体层无 @Exclude

- **Rule ID**: EXPRESS-DATA-003
- **Severity**: High
- **Location**: [wechat-account.entity.ts:9-17](file:///d:/BuyiDictionaryWeb/BuyiDictionaryApp-main/BuyiDictionaryApp-main/backend/src/entities/wechat-account.entity.ts#L9-L17)
- **Evidence**:
  ```ts
  @Index({ unique: true }) @Column({ length: 128 }) openid!: string;
  @Column({ type: 'varchar', length: 128, nullable: true }) unionid!: string | null;
  @Column({ type: 'varchar', length: 128, nullable: true }) sessionKey!: string | null;  // 微信敏感凭证
  ```
- **Impact**: `sessionKey` 可用于解密微信小程序敏感接口（如手机号授权）。当前 `miniapp-auth.service.ts` 返回体未直接包含这些字段（良好），但只要未来有任何接口直接返回 `WechatAccount` 实体就会泄露。
- **Fix**: 在 `openid`、`unionid`、`sessionKey` 上加 `@Exclude()` 并配合 `ClassSerializerInterceptor`；`sessionKey` 还应考虑入库时加密（参考 `1730000000000-add-rbac-and-audit.ts:117` 中 `mfa_factor.secret_encrypted` 的做法）。

---

### H-08 auth-session.refreshTokenHash / agent-cache 敏感字段无 @Exclude

- **Rule ID**: EXPRESS-DATA-004
- **Severity**: High
- **Location**: [auth-session.entity.ts:25-26](file:///d:/BuyiDictionaryWeb/BuyiDictionaryApp-main/BuyiDictionaryApp-main/backend/src/entities/auth-session.entity.ts#L25-L26)、[agent-cache.entity.ts:18-27](file:///d:/BuyiDictionaryWeb/BuyiDictionaryApp-main/BuyiDictionaryApp-main/backend/src/entities/agent-cache.entity.ts#L18-L27)
- **Evidence**:
  ```ts
  // auth-session.entity.ts
  @Column({ type: 'varchar', length: 128 }) refreshTokenHash!: string;
  // agent-cache.entity.ts
  @Column({ type: 'varchar', length: 500 }) question!: string;   // 用户原始提问
  @Column({ type: 'text' }) answer!: string;
  ```
- **Impact**: `refreshTokenHash`（sha256）泄露后可用于离线比对验证 token 是否有效；`AgentCache.question` 含用户原始提问（可能含个人意图），`answer` 含完整回答。当前无接口直接暴露这些实体，但实体层无防护。
- **Fix**: 敏感字段加 `@Exclude()`；`AgentCache` 若用于管理员查看，应在响应 DTO 中裁剪。

---

### H-09 DB_USERNAME 默认 root + MySQL 连接未启用 SSL

- **Rule ID**: EXPRESS-CONFIG-004 / 最小权限原则
- **Severity**: High
- **Location**: [app.config.ts:85](file:///d:/BuyiDictionaryWeb/BuyiDictionaryApp-main/BuyiDictionaryApp-main/backend/src/config/app.config.ts#L85)、[database.config.ts:64-80](file:///d:/BuyiDictionaryWeb/BuyiDictionaryApp-main/BuyiDictionaryApp-main/backend/src/config/database.config.ts#L64-L80)
- **Evidence**:
  ```ts
  // app.config.ts:85
  username: process.env.DB_USERNAME ?? 'root',
  // database.config.ts:64-80 —— mysql 配置无 ssl 选项
  return { type: 'mysql', host, port, ..., charset: 'utf8mb4', connectTimeout: 30000, timezone: '+08:00' };
  ```
  `runtime-validation.ts:54-57` 仅检查 `DB_USERNAME` 非空，未拒绝 `root`。
- **Impact**: 默认值是 root 账号（违反 SECURITY.md 3.3 节"数据库账号使用最小权限原则"）。若 MySQL 跨主机部署，无 SSL 时凭据明文传输。
- **Fix**: (1) runtime-validation 增加 `if (env.DB_USERNAME === 'root') errors.push('生产环境不允许使用 root 账号')`；(2) `database.config.ts` 生产增加 `ssl: { rejectUnauthorized: true }` 或可配置；(3) 默认值改为非 root 业务账号。

---

### H-10 sealos-deploy.yml 中 root 密码与业务密码相同 + 开启 synchronize

- **Rule ID**: EXPRESS-CONFIG-005
- **Severity**: High
- **Location**: [sealos-deploy.yml:30-31,209](file:///d:/BuyiDictionaryWeb/sealos-deploy.yml#L30-L31)
- **Evidence**:
  ```yaml
  stringData:
    MYSQL_ROOT_PASSWORD: "<MYSQL_PASSWORD>"   # 与业务密码同值
    MYSQL_PASSWORD: "<MYSQL_PASSWORD>"
  ...
  - name: DB_SYNCHRONIZE
    value: "true"   # 首次部署开启自动建表，后续改为 false
  ```
- **Impact**: (1) root 与业务账号同密码，业务账号一旦泄露即可提权到 root；(2) `DB_SYNCHRONIZE: "true"` 与 SECURITY.md 3.1 节、runtime-validation.ts:41-43 冲突，Sealos 部署时 NODE_ENV=production 会被 runtime-validation throw 拒绝启动。"后续改为 false" 是手动操作，易遗漏。
- **Fix**: (1) 拆为两个独立 Secret 字段；(2) `DB_SYNCHRONIZE: "false"`。

---

## 五、中危问题（Medium）

### M-01 管理端内容/媒体/仪表盘控制器缺少 RBAC（RolesGuard）

- **Rule ID**: EXPRESS-AUTHZ-001 / OWASP A01
- **Severity**: Medium
- **Location**:
  - [admin-dictionary.controller.ts:13](file:///d:/BuyiDictionaryWeb/BuyiDictionaryApp-main/BuyiDictionaryApp-main/backend/src/modules/admin-content/admin-dictionary.controller.ts#L13)、[admin-phrases.controller.ts:13](file:///d:/BuyiDictionaryWeb/BuyiDictionaryApp-main/BuyiDictionaryApp-main/backend/src/modules/admin-content/admin-phrases.controller.ts#L13)、[admin-proverbs.controller.ts:13](file:///d:/BuyiDictionaryWeb/BuyiDictionaryApp-main/BuyiDictionaryApp-main/backend/src/modules/admin-content/admin-proverbs.controller.ts#L13)、[admin-songs.controller.ts:13](file:///d:/BuyiDictionaryWeb/BuyiDictionaryApp-main/BuyiDictionaryApp-main/backend/src/modules/admin-content/admin-songs.controller.ts#L13)
  - [admin-media.controller.ts:21](file:///d:/BuyiDictionaryWeb/BuyiDictionaryApp-main/BuyiDictionaryApp-main/backend/src/modules/admin-media/admin-media.controller.ts#L21)
  - [admin-dashboard.controller.ts:6](file:///d:/BuyiDictionaryWeb/BuyiDictionaryApp-main/BuyiDictionaryApp-main/backend/src/modules/admin-dashboard/admin-dashboard.controller.ts#L6)（含 `batch-publish`）
  - [admin-culture-exhibits.controller.ts:7](file:///d:/BuyiDictionaryWeb/BuyiDictionaryApp-main/BuyiDictionaryApp-main/backend/src/modules/culture-exhibits/admin-culture-exhibits.controller.ts#L7)
- **Evidence**: 上述控制器仅挂 `AdminJwtGuard`，未挂 `RolesGuard`/`@Roles`。`AdminRole` 枚举定义了 `SUPER_ADMIN` 与 `EDITOR` 两个角色，但只有 [admin-users.controller.ts:12-13](file:///d:/BuyiDictionaryWeb/BuyiDictionaryApp-main/BuyiDictionaryApp-main/backend/src/modules/admin-users/admin-users.controller.ts#L12-L13) 用了 `@Roles(AdminRole.SUPER_ADMIN)`。
- **Impact**: `EDITOR` 角色可执行删除内容、一键批量发布、删除媒体、管理文化展项等高破坏性操作，超出"编辑"职责。结合 H-01，EDITOR 可上传恶意 HTML 文件。
- **Fix**: 对删除/批量发布/媒体删除等破坏性端点加 `@UseGuards(AdminJwtGuard, RolesGuard)` + `@Roles(AdminRole.SUPER_ADMIN)`；查询/创建/更新可保留 `EDITOR`。

---

### M-02 `/api/miniapp/agent/generate` 未鉴权 + 速率限制可绕过

- **Rule ID**: EXPRESS-RATELIMIT-001 / OWASP A04
- **Severity**: Medium
- **Location**: [miniapp-agent.controller.ts:136-197](file:///d:/BuyiDictionaryWeb/BuyiDictionaryApp-main/BuyiDictionaryApp-main/backend/src/modules/miniapp-agent/miniapp-agent.controller.ts#L136-L197)、[rate-limit.ts:13-41](file:///d:/BuyiDictionaryWeb/BuyiDictionaryApp-main/BuyiDictionaryApp-main/backend/src/common/http/rate-limit.ts#L13-L41)、[main.ts:23,73-80](file:///d:/BuyiDictionaryWeb/BuyiDictionaryApp-main/BuyiDictionaryApp-main/backend/src/main.ts#L23-L80)
- **Evidence**:
  ```ts
  // miniapp-agent.controller.ts —— generate 方法无 @UseGuards，类上也无 guard，无 @Public
  @Post('generate') @HttpCode(200)
  async generate(@Body() dto: GenerateDto, @Res() res: Response): Promise<void> { ... }
  // rate-limit.ts —— key 基于 req.ip
  const key = `${req.ip || req.socket.remoteAddress || 'unknown'}:${req.path}`;
  // main.ts:23 —— trust proxy=1
  app.set('trust proxy', 1);
  ```
- **Impact**: 该端点显式"免登录"开放，每次调用触发 DeepSeek 付费 API（[miniapp-agent.service.ts:213](file:///d:/BuyiDictionaryWeb/BuyiDictionaryApp-main/BuyiDictionaryApp-main/backend/src/modules/miniapp-agent/miniapp-agent.service.ts#L213)）。① 任何人都可消耗后端 API 配额；② `trust proxy=1` 下若反代用 `$proxy_add_x_forwarded_for` 追加而非覆写，攻击者可伪造 XFF 每次换 IP 绕过 10/min 限流；③ 限流用进程内 Map，多实例下等效上限 = 限流 × 实例数。
- **Fix**: ① 给 `generate` 加 `@UseGuards(MiniappJwtGuard)`（与 `ask` 一致），或至少加更严限流；② nginx 用 `proxy_set_header X-Forwarded-For $remote_addr;` 覆写；③ 限流改 Redis 共享存储。

---

### M-03 限流与登录锁定均为进程内 Map，多实例下失效

- **Rule ID**: EXPRESS-RATELIMIT-002
- **Severity**: Medium
- **Location**: [rate-limit.ts:13](file:///d:/BuyiDictionaryWeb/BuyiDictionaryApp-main/BuyiDictionaryApp-main/backend/src/common/http/rate-limit.ts#L13)、[login-lockout.service.ts:13-14](file:///d:/BuyiDictionaryWeb/BuyiDictionaryApp-main/BuyiDictionaryApp-main/backend/src/modules/auth-security/login-lockout.service.ts#L13-L14)
- **Evidence**:
  ```ts
  // rate-limit.ts
  const buckets = new Map<string, Bucket>();   // 进程内
  // login-lockout.service.ts
  private readonly accountMap = new Map<string, LockEntry>();
  private readonly ipMap = new Map<string, LockEntry>();
  ```
- **Impact**: 部署多副本（K8s 多 Pod、Serverless）时每个进程独立计数。登录锁定阈值 5 次/15 分钟实际变成 `5 × 实例数`，暴力破解成本大幅降低。重启后状态丢失。
- **Fix**: 改用 Redis 存储计数与锁定状态，TTL 与窗口对齐。

---

### M-04 `xlsx@0.18.5` 存在已知 CVE

- **Rule ID**: EXPRESS-DEPS-001
- **Severity**: Medium
- **Location**: [package.json:48](file:///d:/BuyiDictionaryWeb/BuyiDictionaryApp-main/BuyiDictionaryApp-main/backend/package.json#L48) `"xlsx": "^0.18.5"`；使用处 [content-import.service.ts:49,56,66](file:///d:/BuyiDictionaryWeb/BuyiDictionaryApp-main/BuyiDictionaryApp-main/backend/src/modules/content/content-import.service.ts#L49-L66)
- **Evidence**: `xlsx` 0.18.5 受 `CVE-2023-30533`（原型污染）、`CVE-2024-22363`（ReDoS）影响。`XLSX.read(file.buffer, { type: 'buffer' })` 直接解析管理员上传的 Excel。
- **Impact**: 管理员账号被盗可构造恶意 Excel 触发原型污染/DoS。npm 上的 0.18.5 是最后公开版本且未修复。
- **Fix**: 迁移到 SheetJS 官方分发版（`https://cdn.sheetjs.com/xlsx-0.20.3/xlsx-0.20.3.tgz`）或换用 `exceljs`。

---

### M-05 Vue Web 端 access/refresh token 均存于 localStorage

- **Rule ID**: VUE-AUTH-001 / JS-STORAGE-001
- **Severity**: Medium
- **Location**: [auth.js:11-13](file:///d:/BuyiDictionaryWeb/buyi-dictionary-vue/src/stores/auth.js#L11-L13)、[:24-28](file:///d:/BuyiDictionaryWeb/buyi-dictionary-vue/src/stores/auth.js#L24-L28)；[api.js:26-27](file:///d:/BuyiDictionaryWeb/buyi-dictionary-vue/src/utils/api.js#L26-L27)
- **Evidence**:
  ```js
  const token = ref(localStorage.getItem('token') || '')
  const refreshToken = ref(localStorage.getItem('refreshToken') || '')
  localStorage.setItem('refreshToken', refreshToken.value)  // 行 26：长期 refresh token 入 localStorage
  ```
- **Impact**: 已确认是 Bearer 头鉴权（无 `withCredentials`，CSRF 不适用）。但一旦发生任何 XSS，攻击者可直接读 `localStorage` 盗走 access + refresh token，refresh token 长期有效使危害放大。logout 清理已正确实现（良好实践）。
- **Fix**: refresh token 改由后端 HttpOnly Cookie 管理，或仅内存保留、缩短 access token 生命周期；至少对 refresh token 不做 localStorage 持久化。

---

### M-06 部署层缺失 CSP / 防点击劫持 / MIME 嗅探等安全头

- **Rule ID**: VUE-HEADERS-001 / JS-CSP-001
- **Severity**: Medium
- **Location**: [nginx.conf](file:///d:/BuyiDictionaryWeb/buyi-dictionary-vue/nginx.conf)（全文无安全响应头）；Cloudflare Pages 侧无 `_headers` 文件；[public/_routes.json](file:///d:/BuyiDictionaryWeb/buyi-dictionary-vue/public/_routes.json) 仅做路由分流
- **Evidence**: `nginx.conf` 只有 `server_tokens off`（良好）与缓存头，无 `Content-Security-Policy`/`X-Frame-Options`/`X-Content-Type-Options`/`Referrer-Policy`。[Dockerfile:11-15](file:///d:/BuyiDictionaryWeb/buyi-dictionary-vue/Dockerfile#L11-L15) 用该 nginx 作生产 runtime，`EXPOSE 80`。
- **Impact**: 缺 CSP 使潜在 XSS 无纵深防御；缺 `X-Frame-Options`/`frame-ancestors` 可被 iframe 嵌套点击劫持；缺 `X-Content-Type-Options` 允许 MIME 嗅探。
- **Fix**: 在 nginx 或 CF `_headers` 加 `Content-Security-Policy`（按实际加载域收紧）、`X-Frame-Options: SAMEORIGIN`、`X-Content-Type-Options: nosniff`、`Referrer-Policy: strict-origin-when-cross-origin`。

---

### M-07 自增主键作为对外公开 ID 暴露在 URL 与响应中

- **Rule ID**: 通用安全原则（避免自增 ID 作为公开资源 ID）
- **Severity**: Medium
- **Location**: 所有实体用 `@PrimaryGeneratedColumn()` 自增 int（如 [base-content.entity.ts:10](file:///d:/BuyiDictionaryWeb/BuyiDictionaryApp-main/BuyiDictionaryApp-main/backend/src/entities/base-content.entity.ts#L10)、[user.entity.ts:11](file:///d:/BuyiDictionaryWeb/BuyiDictionaryApp-main/BuyiDictionaryApp-main/backend/src/entities/user.entity.ts#L11)、[culture-exhibit.entity.ts:5](file:///d:/BuyiDictionaryWeb/BuyiDictionaryApp-main/BuyiDictionaryApp-main/backend/src/entities/culture-exhibit.entity.ts#L5)）；控制器 [admin-media.controller.ts:53](file:///d:/BuyiDictionaryWeb/BuyiDictionaryApp-main/BuyiDictionaryApp-main/backend/src/modules/admin-media/admin-media.controller.ts#L53) `@Delete(':id')`、[content.service.ts:449](file:///d:/BuyiDictionaryWeb/BuyiDictionaryApp-main/BuyiDictionaryApp-main/backend/src/modules/content/content.service.ts#L449) `serialize()` 直接返回 `id: item.id`
- **Evidence**:
  ```ts
  // content.service.ts:447-457
  serialize(item: ContentEntity, type: ContentType) {
    const base = { id: item.id, type, ... };   // 自增 ID 直接暴露
  }
  ```
- **Impact**: 攻击者可通过 `/api/miniapp/dictionary/:id` 枚举所有词条（爬取全量内容）；通过 `/api/admin/users` 枚举用户总数；对 admin 接口爆破 ID 探测。违反"避免自增 ID 作为公开资源 ID"原则。
- **Fix**: 对外公开内容（dictionary/phrase/proverb/song/culture-exhibit）改用 `slug` 或 `uuid` 作为对外 ID（`culture-exhibit.entity.ts` 已有 `slug` 唯一字段可借鉴）。

---

### M-08 `learning_records` 表无任何索引，但 hot 接口对其聚合

- **Rule ID**: EXPRESS-DB-003（性能与可用性）
- **Severity**: Medium
- **Location**: [learning-record.entity.ts:5-26](file:///d:/BuyiDictionaryWeb/BuyiDictionaryApp-main/BuyiDictionaryApp-main/backend/src/entities/learning-record.entity.ts#L5-L26)、[miniapp-search.controller.ts:38-45](file:///d:/BuyiDictionaryWeb/BuyiDictionaryApp-main/BuyiDictionaryApp-main/backend/src/modules/miniapp-search/miniapp-search.controller.ts#L38-L45)
- **Evidence**:
  ```ts
  @Entity('learning_records')
  export class LearningRecord {   // 类上无 @Index
    @PrimaryGeneratedColumn() id!: number;
    @Column() userId!: number;
    @Column({ type: 'varchar', length: 32 }) contentType!: ContentType;
    @Column() contentId!: number;
    @Column({ type: 'varchar', length: 16 }) actionType!: 'view' | 'play' | 'review';
    @CreateDateColumn() createdAt!: Date;
  }
  // miniapp-search.controller.ts hot 接口全表扫描 + group by
  ```
  对比 [quiz-attempt.entity.ts:5](file:///d:/BuyiDictionaryWeb/BuyiDictionaryApp-main/BuyiDictionaryApp-main/backend/src/entities/quiz-attempt.entity.ts#L5) 有 `@Index(['userId', 'createdAt'])`。
- **Impact**: `learning_records` 是高频写入表，hot 接口全表扫描 + group by，数据量大时性能崩溃；按 `userId` 查询也无索引。
- **Fix**: 加 `@Index(['userId', 'createdAt'])` 和 `@Index(['actionType', 'contentId', 'contentType'])`，并补对应迁移。

---

### M-09 `DB_LOGGING=true` 时 TypeORM 会打印查询参数（含敏感值）

- **Rule ID**: EXPRESS-INFO-002 / 日志脱敏
- **Severity**: Medium
- **Location**: [database.config.ts:76,110](file:///d:/BuyiDictionaryWeb/BuyiDictionaryApp-main/BuyiDictionaryApp-main/backend/src/config/database.config.ts#L76-L110)
- **Evidence**:
  ```ts
  logging,   // 直接传给 TypeORM，默认 logger 会把 query 和 parameters 都打到 console
  ```
  SECURITY.md 7.5 节声称"日志中禁止输出 token、密码等敏感字段"。
- **Impact**: 若生产 `DB_LOGGING=true`，登录、注册、刷新 token 相关查询的参数（passwordHash、refreshTokenHash、openid）会进入日志，如 `[params: ["admin", "$2a$10$xxx..."]]`。
- **Fix**: 自定义 TypeORM Logger 对 `parameters` 中的 password/refreshTokenHash/openid 字段做 mask；或在 runtime-validation 中限制生产 `DB_LOGGING` 只能是 `false` 或 `['error', 'warn']`。

---

### M-10 `init-admin.ts` 在更新已存在管理员时强制把 role 改为 SUPER_ADMIN

- **Rule ID**: EXPRESS-AUTHZ-002（提权风险）
- **Severity**: Medium
- **Location**: [init-admin.ts:32-36](file:///d:/BuyiDictionaryWeb/BuyiDictionaryApp-main/BuyiDictionaryApp-main/backend/src/scripts/init-admin.ts#L32-L36)
- **Evidence**:
  ```ts
  if (existing) {
    existing.passwordHash = passwordHash;
    existing.role = AdminRole.SUPER_ADMIN;   // 强制提权
    existing.isActive = true;
    await adminRepository.save(existing);
  }
  ```
- **Impact**: 任何能执行 `init-admin` 脚本的人（有 DB 访问权）可把任意已存在的 admin 账号（甚至 EDITOR）提权为 SUPER_ADMIN 并重置密码，绕过 RBAC。
- **Fix**: 不要强制覆盖 role，仅当 `--force` 参数时才覆盖；或仅更新 passwordHash，保留原 role。

---

### M-11 Dockerfile 把 `src/` 源码复制到生产镜像

- **Rule ID**: EXPRESS-CONFIG-006（攻击面）
- **Severity**: Medium
- **Location**: [backend/Dockerfile:25](file:///d:/BuyiDictionaryWeb/BuyiDictionaryApp-main/BuyiDictionaryApp-main/backend/Dockerfile#L25)
- **Evidence**:
  ```dockerfile
  COPY --from=build /app/backend/src ./src
  ```
- **Impact**: 生产镜像包含 TypeScript 源码，镜像泄露即源码泄露（含实体定义、迁移、配置逻辑），扩大攻击面。
- **Fix**: 仅复制 `dist/`、`package*.json`、`nest-cli.json`；移除 `src` 复制。

---

### M-12 小程序 access/refresh token 持久化于 wx 本地存储

- **Rule ID**: MP-STORAGE-001
- **Severity**: Medium（小程序语境下风险低于 Web localStorage）
- **Location**: [app.js:34](file:///d:/BuyiDictionaryWeb/BuyiDictionaryApp-main/BuyiDictionaryApp-main/app.js#L34)、[:197-204](file:///d:/BuyiDictionaryWeb/BuyiDictionaryApp-main/BuyiDictionaryApp-main/app.js#L197-L204)、[:43-44](file:///d:/BuyiDictionaryWeb/BuyiDictionaryApp-main/BuyiDictionaryApp-main/app.js#L43-L44)
- **Evidence**: `_persistLoginState()` 把 `token`/`refreshToken`/`userInfo` 写入 `wx.setStorageSync('loginState', {...})`；启动时从 `wx.getStorageSync('loginState')` 还原。
- **Impact**: 小程序存储为 app 作用域、跨域 JS 执行面小，故风险低于 Web；但本地设备取证/越狱环境下可被提取。logout 已清理（良好）。
- **Fix**: 可考虑 refresh token 不落本地、仅内存 + 短期 access token；或加密存储。当前实现可接受，列为加固建议。

---

### M-13 MySQL 连接池未配置

- **Rule ID**: EXPRESS-DB-004（可用性）
- **Severity**: Medium
- **Location**: [database.config.ts:64-80](file:///d:/BuyiDictionaryWeb/BuyiDictionaryApp-main/BuyiDictionaryApp-main/backend/src/config/database.config.ts#L64-L80)
- **Evidence**: mysql 配置无 `connectionLimit`/`poolSize`/`acquireTimeout`/`extra`。
- **Impact**: TypeORM mysql2 默认连接池较小（10），并发下连接耗尽。
- **Fix**: 增加 `extra: { connectionLimit: Number(process.env.DB_POOL_SIZE ?? 20) }`、`acquireTimeout: 30000`。

---

## 六、低危问题（Low）

### L-01 AI 智能体缓存跨用户共享

- **Rule ID**: EXPRESS-LOGIC-001
- **Severity**: Low
- **Location**: [miniapp-agent.service.ts:70-90,270-291](file:///d:/BuyiDictionaryWeb/BuyiDictionaryApp-main/BuyiDictionaryApp-main/backend/src/modules/miniapp-agent/miniapp-agent.service.ts#L70-L90)
- **Evidence**: `streamChat` 在 `history` 为空时按 `normalizeKey(question)` 查 `agent_cache` 表，命中则直接回放缓存答案给任意用户。
- **Impact**: 用户 A 的提问结果会被用户 B 命中。当前答案均为通用布依文化内容，敏感度低；未来 prompt 含用户上下文则会泄露。
- **Fix**: 缓存键加入 `userId` 哈希，或仅对匿名/公共场景启用缓存。

### L-02 Web 注册无密码强度校验

- **Rule ID**: EXPRESS-AUTH-001
- **Severity**: Low
- **Location**: [web-login.dto.ts:21-24](file:///d:/BuyiDictionaryWeb/BuyiDictionaryApp-main/BuyiDictionaryApp-main/backend/src/modules/miniapp-auth/dto/web-login.dto.ts#L21-L24)
- **Evidence**: `@IsString() @MinLength(6) @MaxLength(100) password!: string;` 仅要求 6 位长度，无复杂度。
- **Fix**: 加 `@Matches(/^(?=.*[A-Za-z])(?=.*\d).{8,}$/)` 或引入 `zxcvbn` 评分。

### L-03 `/ready` 端点泄露配置缺失细节

- **Rule ID**: EXPRESS-INFO-001
- **Severity**: Low
- **Location**: [health.controller.ts:16-20](file:///d:/BuyiDictionaryWeb/BuyiDictionaryApp-main/BuyiDictionaryApp-main/backend/src/modules/health/health.controller.ts#L16-L20)、[health.service.ts:22-48](file:///d:/BuyiDictionaryWeb/BuyiDictionaryApp-main/BuyiDictionaryApp-main/backend/src/modules/health/health.service.ts#L22-L48)
- **Evidence**: `/api/ready` 无需鉴权（`@Public()`），响应可能含 `issues: ['对象存储配置缺少 COS_SECRET_ID', '生产环境必须关闭 DB_SYNCHRONIZE', ...]`。
- **Impact**: 未认证攻击者可探测后端存储类型、配置完整度，辅助侦察。
- **Fix**: 生产环境 `/ready` 只返回 `status: 'ready'|'degraded'`，`issues` 仅写日志不回包。

### L-04 WeChat `sessionKey` 明文存储

- **Rule ID**: EXPRESS-STORAGE-001
- **Severity**: Low
- **Location**: [wechat-account.entity.ts:16-17](file:///d:/BuyiDictionaryWeb/BuyiDictionaryApp-main/BuyiDictionaryApp-main/backend/src/entities/wechat-account.entity.ts#L16-L17)、[users.service.ts:51,74](file:///d:/BuyiDictionaryWeb/BuyiDictionaryApp-main/BuyiDictionaryApp-main/backend/src/modules/users/users.service.ts#L51-L74)
- **Evidence**: `sessionKey` 以 `varchar(128)` 明文存库，登录时直接覆写。
- **Impact**: 微信 `session_key` 用于解密小程序加密数据（手机号、用户信息），泄露后可解密历史加密包。本应用目前未使用其解密能力，风险有限。
- **Fix**: 若不使用加密数据解密，可不存储；若需要，加密存储或仅在内存缓存。

### L-05 控制器手动解析 `X-Forwarded-For` 作为 IP 兜底

- **Rule ID**: EXPRESS-LOGIC-002
- **Severity**: Low
- **Location**: [admin-auth.controller.ts:17-18](file:///d:/BuyiDictionaryWeb/BuyiDictionaryApp-main/BuyiDictionaryApp-main/backend/src/modules/admin-auth/admin-auth.controller.ts#L17-L18)、[miniapp-auth.controller.ts:25-26](file:///d:/BuyiDictionaryWeb/BuyiDictionaryApp-main/BuyiDictionaryApp-main/backend/src/modules/miniapp-auth/miniapp-auth.controller.ts#L25-L26)
- **Evidence**: `const forwarded = req.headers['x-forwarded-for']; const ip = req.ip || (typeof forwarded === 'string' ? forwarded : forwarded?.[0]) || '';`
- **Impact**: `trust proxy=1` 下 `req.ip` 已正确解析，该兜底基本是死代码；但若 `req.ip` 为空（误配），会直接取 XFF 最左值（攻击者可控）作为锁定 IP，可被用来故意锁定他人账号或绕过 IP 锁定。
- **Fix**: 删除手动 XFF 解析，统一用 `req.ip`；如需记录真实 IP 由网关注入 `X-Real-IP`。

### L-06 Vue `:href` 绑定 API 返回的 sourceUrl，未做协议校验

- **Rule ID**: VUE-XSS-004 / JS-URL-002
- **Severity**: Low
- **Location**: [Culture.vue:167](file:///d:/BuyiDictionaryWeb/buyi-dictionary-vue/src/views/Culture.vue#L167)
- **Evidence**: `<a v-if="linkedExhibit.sourceUrl" :href="linkedExhibit.sourceUrl" target="_blank" rel="noreferrer">`，`linkedExhibit` 来自 API。Vue 3.4+ 对 `:href` 的 `javascript:` 有内置过滤，且数据为管理员核验链接，故实际风险低。
- **Fix**: 渲染前用 `new URL()` 解析并仅允许 `http/https`。

### L-07 Google Fonts CDN 样式表无 SRI

- **Rule ID**: VUE-SRI-001 / JS-SRI-001
- **Severity**: Low
- **Location**: [index.html:21-23](file:///d:/BuyiDictionaryWeb/buyi-dictionary-vue/index.html#L21-L23)
- **Evidence**: `<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=...">` 无 `integrity` 属性。无 `<script src=>` 第三方脚本（唯一脚本为本地 `/src/main.js`），第三方脚本面已属最小。
- **Fix**: 自托管字体或加 `integrity` + `crossorigin`。

### L-08 Service Worker 缓存鉴权 API 响应且 logout 时不清缓存

- **Rule ID**: VUE-SW-001
- **Severity**: Low
- **Location**: [learning-reminder-sw.js:35-79](file:///d:/BuyiDictionaryWeb/buyi-dictionary-vue/public/learning-reminder-sw.js#L35-L79)
- **Evidence**: `fetch` 监听器对 `GET /api/miniapp/*` 做 network-first 缓存，缓存键为 Authorization 的 SHA-256 哈希（未存原始 token，良好）；但 [authInterceptor.js](file:///d:/BuyiDictionaryWeb/buyi-dictionary-vue/src/utils/authInterceptor.js) 的 `clearAuthAndRedirect` 只清 localStorage，不清 `caches`。
- **Impact**: 用户 profile/favorites/learning-records 等响应在登出后仍残留于 Cache API，公共设备存在数据残留取证风险；不同 token 产生不同哈希键，他人不会直接命中。
- **Fix**: logout/401 清理时调用 `caches.delete('buyi-miniapp-api-v1')`。

### L-09 notificationclick 用 push 载荷 URL 导航，未校验协议

- **Rule ID**: VUE-SW-002
- **Severity**: Low
- **Location**: [learning-reminder-sw.js:20-33](file:///d:/BuyiDictionaryWeb/buyi-dictionary-vue/public/learning-reminder-sw.js#L20-L33)
- **Evidence**: `const targetUrl = event.notification.data?.url || '/learn'`；`existing.navigate(targetUrl)` / `self.clients.openWindow(targetUrl)`。
- **Fix**: 显式校验 `targetUrl` 以 `/` 开头或为同源 http(s)。

### L-10 apiProxy 将后端错误 message 回传客户端

- **Rule ID**: JS-INFO-001
- **Severity**: Low
- **Location**: [cloudfunctions/apiProxy/index.js:243-249](file:///d:/BuyiDictionaryWeb/BuyiDictionaryApp-main/BuyiDictionaryApp-main/cloudfunctions/apiProxy/index.js#L243-L249)
- **Evidence**: `data: { message: \`云函数代理请求失败: ${err.message}\` }`，可能泄露内部 targetUrl（含 IP）。
- **Fix**: 对外返回通用文案，日志侧脱敏。

### L-11 小程序生产默认 API 指向临时 trycloudflare 隧道域名

- **Rule ID**: MP-CONFIG-001
- **Severity**: Low（可靠性为主）
- **Location**: [runtime-config.js:20-21](file:///d:/BuyiDictionaryWeb/BuyiDictionaryApp-main/BuyiDictionaryApp-main/utils/runtime-config.js#L20-L21)
- **Evidence**: `DEFAULT_API_BASES` 的 development 与 production 均为 `https://casting-object-link-hide.trycloudflare.com/api`。
- **Impact**: trycloudflare 为临时隧道，不适合生产；该域名若过期被他人接管可能成为请求劫持点。
- **Fix**: 生产用稳定 HTTPS 域名，由 env/配置注入。

### L-12 login.js 打印 wx.login code 片段

- **Rule ID**: MP-LOG-001
- **Severity**: Low
- **Location**: [pages/login/login.js:88](file:///d:/BuyiDictionaryWeb/BuyiDictionaryApp-main/BuyiDictionaryApp-main/pages/login/login.js#L88)
- **Evidence**: `console.log('[Login] wx.login success, code:', res.code ? res.code.substring(0,10)+'...' : 'EMPTY')`
- **Impact**: wx.login code 为 5 分钟短时凭证、服务端兑换，仅打印前 10 字符，风险低。
- **Fix**: 生产移除该日志。

### L-13 Vue 登录后 redirect 仅 `startsWith('/')` 校验

- **Rule ID**: VUE-ROUTER-002
- **Severity**: Low / Info
- **Location**: [Login.vue:75](file:///d:/BuyiDictionaryWeb/buyi-dictionary-vue/src/views/Login.vue#L75)
- **Evidence**: `router.push(typeof redirect === 'string' && redirect.startsWith('/') ? redirect : '/')`。`redirect` 来自 `route.query.redirect`（守卫写入 `to.fullPath`）。`startsWith('/')` 允许 `//evil.com`，但因走 `router.push`（`createWebHashHistory`），导航发生在 hash 内、不离开当前源，非真正开放重定向；`javascript:` 因不以 `/` 开头被拒。
- **Fix**: 额外拒绝以 `//` 或 `/\` 开头的值。

---

## 七、已确认安全的良好实践

> 以下为审计中确认到位的安全控制，无需修改，作为基线保留。

### 鉴权与会话
1. **JWT 机制完整**：access/refresh 分离，`tokenKind`/`tokenType` claim 双重校验；refresh token 一次一用（`rotateRefreshToken` 用后即换）；logout 真正失效 session（`deactivateSession` 置 `isActive=false`）；refresh token 在 DB 中存 SHA-256 哈希而非明文（[auth-sessions.service.ts:82-84,113-115](file:///d:/BuyiDictionaryWeb/BuyiDictionaryApp-main/BuyiDictionaryApp-main/backend/src/modules/auth-sessions/auth-sessions.service.ts#L82-L115)）。
2. **登录响应不返回 passwordHash**：[admin-auth.service.ts:47-54](file:///d:/BuyiDictionaryWeb/BuyiDictionaryApp-main/BuyiDictionaryApp-main/backend/src/modules/admin-auth/admin-auth.service.ts#L47-L54)、[miniapp-auth.service.ts](file:///d:/BuyiDictionaryWeb/BuyiDictionaryApp-main/BuyiDictionaryApp-main/backend/src/modules/miniapp-auth/miniapp-auth.service.ts) 仅返回 `{ id, username, role }` / `{ id, nickname, avatarUrl, username }`。
3. **bcrypt cost factor = 10**（用于真实密码哈希，[init-admin.ts:30](file:///d:/BuyiDictionaryWeb/BuyiDictionaryApp-main/BuyiDictionaryApp-main/backend/src/scripts/init-admin.ts#L30)、[miniapp-auth.service.ts:154](file:///d:/BuyiDictionaryWeb/BuyiDictionaryApp-main/BuyiDictionaryApp-main/backend/src/modules/miniapp-auth/miniapp-auth.service.ts#L154)）符合推荐下限（注：seed 用 6，见 H-05）。
4. **登录锁定策略**（[login-lockout.service.ts](file:///d:/BuyiDictionaryWeb/BuyiDictionaryApp-main/BuyiDictionaryApp-main/backend/src/modules/auth-security/login-lockout.service.ts)）：账号 + IP 双维度，账号阈值 5 次、IP 阈值 10 次，锁定 15 分钟，30 分钟滑窗；账号不存在也计失败（防枚举）。
5. **越权（IDOR）防护到位**：`miniapp-favorites`、`miniapp-learning-records`、`miniapp-quiz`、`miniapp-settings`、`miniapp-me` 全部以 JWT 中的 `user.sub` 作为 owner 过滤/写入，无按 `id` 直查改他人资源的路径。
6. **鉴权覆盖完整**：除刻意公开的 `@Public()` 端点外，所有 admin 控制器挂 `AdminJwtGuard`，所有用户态 miniapp 控制器挂 `MiniappJwtGuard`。

### 输入校验与注入
7. **无 SQL 注入**：所有 `createQueryBuilder`/`query` 均用参数化绑定（[content.service.ts:386-393](file:///d:/BuyiDictionaryWeb/BuyiDictionaryApp-main/BuyiDictionaryApp-main/backend/src/modules/content/content.service.ts#L386-L393)、[admin-dashboard.service.ts:82-105](file:///d:/BuyiDictionaryWeb/BuyiDictionaryApp-main/BuyiDictionaryApp-main/backend/src/modules/admin-dashboard/admin-dashboard.service.ts#L82-L105)、[miniapp-search.controller.ts:39-45](file:///d:/BuyiDictionaryWeb/BuyiDictionaryApp-main/BuyiDictionaryApp-main/backend/src/modules/miniapp-search/miniapp-search.controller.ts#L39-L45)）。
8. **无 RCE 风险**：全仓未出现 `child_process`、`exec`、`spawn`、`eval`、`new Function`。
9. **全局 ValidationPipe**（[main.ts:38-44](file:///d:/BuyiDictionaryWeb/BuyiDictionaryApp-main/BuyiDictionaryApp-main/backend/src/main.ts#L38-L44)）：`whitelist:true` + `forbidNonWhitelisted:true` + `transform:true`，所有 DTO 用 class-validator 装饰器约束。
10. **SSRF 已规避**：DeepSeek 调用的 `baseURL` 来自环境变量，用户输入仅作为 `messages` 内容；微信 `code2session` 固定 `api.weixin.qq.com` 且对 `code` 做 `encodeURIComponent`。

### 错误处理与密钥
11. **错误处理不泄露堆栈**（[http-exception.filter.ts](file:///d:/BuyiDictionaryWeb/BuyiDictionaryApp-main/BuyiDictionaryApp-main/backend/src/common/filters/http-exception.filter.ts)）：非 `HttpException` 统一返回"服务器内部错误"，仅日志记录 `error.message`（非 `stack`）。
12. **密钥无硬编码/无代码级 fallback**：`jwt.secret` 直接读 `process.env.JWT_SECRET!`（[app.config.ts:74](file:///d:/BuyiDictionaryWeb/BuyiDictionaryApp-main/BuyiDictionaryApp-main/backend/src/config/app.config.ts#L74)），未设置时启动即报错。`.gitignore` 排除 `.env`/`.env.local`/`.env.production`。
13. **运行时配置强制校验**（[runtime-validation.ts](file:///d:/BuyiDictionaryWeb/BuyiDictionaryApp-main/BuyiDictionaryApp-main/backend/src/config/runtime-validation.ts)）：生产环境强制 `JWT_SECRET` 非空且非 `change-me`、`DB_TYPE=mysql`、`DB_SYNCHRONIZE=false`、`WECHAT_MOCK_MODE=false`、`SEED_ON_BOOT=false`、`MEDIA_DRIVER!=local`。
14. **生产环境 seed 不执行**（[seed.service.ts:70-72,93-95,120-122](file:///d:/BuyiDictionaryWeb/BuyiDictionaryApp-main/BuyiDictionaryApp-main/backend/src/modules/seed/seed.service.ts#L70-L122)）：三处 seed 方法在 `isProductionEnvironment` 为真时直接 return。

### 网络与部署
15. **CORS 白名单**（[main.ts:33-36](file:///d:/BuyiDictionaryWeb/BuyiDictionaryApp-main/BuyiDictionaryApp-main/backend/src/main.ts#L33-L36)）：origin 严格按 `CORS_ORIGIN` 逗号分割白名单，非 `*`，配合 `credentials:true` 安全。
16. **helmet 已启用**；Dockerfile 用非 root 用户 `nodejs`。
17. **Bearer 头鉴权**（非 Cookie），CSRF 不适用——前后端均无 `withCredentials`/`credentials:'include'`。
18. **utf8mb4 charset 已设置**；`connectTimeout: 30000`；`timezone: '+08:00'`。
19. **deploy/docker-compose.yml 端口绑定 127.0.0.1**（[deploy/docker-compose.yml:16,60](file:///d:/BuyiDictionaryWeb/deploy/docker-compose.yml#L16-L60)）。
20. **媒体文件 MIME 白名单 + 大小限制**（10MB，[admin-media.controller.ts:33-35](file:///d:/BuyiDictionaryWeb/BuyiDictionaryApp-main/BuyiDictionaryApp-main/backend/src/modules/admin-media/admin-media.controller.ts#L33-L35)）。

### 前端
21. **无 XSS 危险 sink 作用于不可信数据**：Vue 端唯一 `v-html`（[FloatingParticles.vue:85](file:///d:/BuyiDictionaryWeb/buyi-dictionary-vue/src/components/common/FloatingParticles.vue#L85)）渲染硬编码静态 SVG 常量；`innerHTML`/`insertAdjacentHTML`/`document.write`/`DOMParser` 全项目无匹配。AI 流式回复在两端均以文本插值渲染（Vue `{{ msg.text }}`；小程序 `<text>{{item.content}}</text>`），自动转义。
22. **路由守卫仅 UX**：`router.beforeEach` 仅检查 `isLoggedIn` 做引导，真实鉴权由后端 guard 承担。
23. **登出清理**：Vue 清 token/refreshToken/userInfo 并跳转登录页；小程序 `clearLoginState` 清 globalData 并 `removeStorageSync('loginState')`。
24. **CF Pages Function 代理不泄露后端密钥**：从 `context.env.BACKEND_URL` 读取后端地址（服务端 env，不进客户端 bundle），仅转发 `Authorization/Content-Type/Accept` 三类头。
25. **登录流程符合约束**：小程序经后端 `/miniapp/auth/wechat-login`，未直接调 `login` 云函数换取 token。
26. **唯一约束合理**：admin.username、user.username、wechat-account.openid、auth-session.sessionId、favorite(userId,contentType,contentId)、user-setting(userId,key)、agent-cache.questionKey、culture-exhibit.slug 等均有唯一约束。

---

## 八、修复优先级建议

| 优先级 | Finding ID | 一句话修复 |
|--------|-----------|-----------|
| **P0（立即）** | F-01 | `admin/users` 列表 `select` 去除 `passwordHash`/`phoneNumber` |
| P0 | F-02 | 实现 `PiiMaskInterceptor` 或在 `miniapp-me.controller` 脱敏 `phoneNumber`，订正 SECURITY.md |
| P0 | F-03 | `git rm --cached` 两个 .db/.sqlite 文件并加 `.gitignore`，轮换历史凭据 |
| P0 | F-04 | `docker-compose.yml` 3306 端口绑 `127.0.0.1` + 移除默认密码 |
| P0 | F-05 | `docker-compose.yml` 所有默认值改为安全值或强制注入 |
| P0 | H-01 | 上传文件名扩展名强制匹配 `kind` 白名单，或用 UUID 重命名 |
| P0 | H-02 | apiProxy 改 HTTPS + 移除硬编码 IP，云函数内强制拒绝非 https |
| **P1（短期）** | H-03 | `database.config.ts` 注册全部 5 个迁移 |
| P1 | H-04 | baseline 迁移改写为显式 DDL |
| P1 | H-05 | `seed.service.ts` bcrypt cost 6 → 10 |
| P1 | H-06 | 移除 `Admin@123456` 默认值 |
| P1 | H-07 | wechat-account 敏感字段加 `@Exclude` |
| P1 | H-08 | auth-session/agent-cache 敏感字段加 `@Exclude` |
| P1 | H-09 | runtime-validation 拒绝 `DB_USERNAME=root` + 启用 SSL |
| P1 | H-10 | sealos-deploy.yml root/业务密码分离 + `synchronize=false` |
| P1 | M-01 | 删除/批量发布类端点加 `@Roles(SUPER_ADMIN)` |
| P1 | M-02 | `generate` 加 `MiniappJwtGuard`；nginx 覆写 XFF |
| P1 | M-03 | 限流/锁定改 Redis |
| P1 | M-04 | 升级 xlsx 到 SheetJS 官方版或换 exceljs |
| P1 | M-05 | 评估 refresh token 存储方式（HttpOnly Cookie 或仅内存） |
| P1 | M-06 | 补部署层 CSP / X-Frame-Options / X-Content-Type-Options |
| **P2（常规加固）** | M-07 | 对外公开 ID 改用 slug/uuid |
| P2 | M-08 | learning_records 加索引 |
| P2 | M-09 | 自定义 TypeORM Logger 脱敏参数 |
| P2 | M-10 | init-admin 不强制覆盖 role |
| P2 | M-11 | Dockerfile 移除 src 复制 |
| P2 | M-12 | 小程序 refresh token 不落本地 |
| P2 | M-13 | 配置 MySQL 连接池 |
| **P3（机会加固）** | L-01 ~ L-13 | 见各条 Fix |

---

## 九、已提交到仓库的 .db 文件清单

| # | 文件绝对路径 | 大小 | git 跟踪 | .gitignore | 已识别敏感内容 |
|---|------|------|------|------|------|
| 1 | `d:\BuyiDictionaryWeb\buyi_dictionary.db` | 90,112 B | 已跟踪 | 未忽略 | ASCII 命中：`admin`、`password`、`user`、`Token`、`Hash` |
| 2 | `d:\BuyiDictionaryWeb\BuyiDictionaryApp-main\BuyiDictionaryApp-main\backend\buyi-local.sqlite` | 167,936 B | 已跟踪 | 未忽略 | 表名：`admins`、`auth_sessions`、`agent_cache`、`badges`、`quiz_attempts`；字段：`passwordHash`、`refreshTokenHash`、`answersJson`、`avatarUrl`、`actionType` |

> 注：根 `.gitignore:70-72` 仅排除 `*-test.sqlite`，并注释"保留 buyi_dictionary.db 作为种子数据"；`backend/.gitignore` 仅排除 `buyi-runtime.sqlite`。两个被提交的 SQLite 文件都不在忽略范围内，需按 F-03 立即移除并轮换凭据。

---

## 十、复审章节（2026-07-31 第二轮）

> 本章为 P0 修复后的复审结果。验证修复正确性 + 深度复查 P1/P2 现状 + 查漏补缺新发现。

### 10.1 P0 修复验证结果

| 修复 ID | 验证结果 | 说明 |
|---------|---------|------|
| F-01 admin-users select 白名单 | ✅ 通过 | [admin-users.controller.ts:24-30](file:///d:/BuyiDictionaryWeb/BuyiDictionaryApp-main/BuyiDictionaryApp-main/backend/src/modules/admin-users/admin-users.controller.ts#L24-L30) select 7 字段，不含 passwordHash/phoneNumber |
| F-02 maskPhone + SECURITY.md | ✅ 通过 | [miniapp-me.controller.ts:8-13](file:///d:/BuyiDictionaryWeb/BuyiDictionaryApp-main/BuyiDictionaryApp-main/backend/src/modules/miniapp-me/miniapp-me.controller.ts#L8-L13) 逻辑正确；[SECURITY.md:99-107](file:///d:/BuyiDictionaryWeb/SECURITY.md#L99-L107) 与实现一致 |
| F-03 SQLite 移除跟踪 | ✅ 通过 | `git ls-files` 确认两文件已不被跟踪；本地文件物理仍在，启动竞赛包.bat 不受影响 |
| F-04 docker-compose 3306 绑 127.0.0.1 | ✅ 通过 | [docker-compose.yml:16](file:///d:/BuyiDictionaryWeb/docker-compose.yml#L16) |
| H-01 normalizeFilename 扩展名白名单 | ✅ 通过 | [media.service.ts:97-121](file:///d:/BuyiDictionaryWeb/BuyiDictionaryApp-main/BuyiDictionaryApp-main/backend/src/modules/media/media.service.ts#L97-L121) kind 参数 + 白名单 + 两处调用同步 |
| H-02 apiProxy BACKEND_BASE 外部化 | ✅ 通过 | [apiProxy/index.js:12](file:///d:/BuyiDictionaryWeb/BuyiDictionaryApp-main/BuyiDictionaryApp-main/cloudfunctions/apiProxy/index.js#L12) |

**回归检测**：6 项修复全部无功能性回归。maskPhone 空串边缘返回 `''` 而非 `******`（无害，前端用 `|| ''` 兜底）；audio/.mp4 扩展名被有意收紧为 .m4a（标准音频上传不受影响）。

### 10.2 P1 项现状（全部仍存在，代码零变更）

上一轮 12 项 P1（H-03~H-10、M-01~M-04）**全部仍存在**，逐项已重新定位确认：

| ID | 位置 | 状态 |
|----|------|------|
| H-03 迁移注册不完整 | [database.config.ts:46](file:///d:/BuyiDictionaryWeb/BuyiDictionaryApp-main/BuyiDictionaryApp-main/backend/src/config/database.config.ts#L46) | 仅注册 3/5 个迁移 |
| H-04 baseline 迁移空壳 | [1710000000000-baseline-schema.ts:7](file:///d:/BuyiDictionaryWeb/BuyiDictionaryApp-main/BuyiDictionaryApp-main/backend/src/migrations/1710000000000-baseline-schema.ts#L7) | up() 调 synchronize(false) |
| H-05 seed bcrypt cost=6 | [seed.service.ts:81](file:///d:/BuyiDictionaryWeb/BuyiDictionaryApp-main/BuyiDictionaryApp-main/backend/src/modules/seed/seed.service.ts#L81) | 应为 10 |
| H-06 默认密码 Admin@123456 | [app.config.ts:113](file:///d:/BuyiDictionaryWeb/BuyiDictionaryApp-main/BuyiDictionaryApp-main/backend/src/config/app.config.ts#L113) 等 3 处 | 硬编码 |
| H-07 wechat-account 无 @Exclude | [wechat-account.entity.ts:11-17](file:///d:/BuyiDictionaryWeb/BuyiDictionaryApp-main/BuyiDictionaryApp-main/backend/src/entities/wechat-account.entity.ts#L11-L17) | openid/unionid/sessionKey |
| H-08 auth-session/agent-cache 无 @Exclude | [auth-session.entity.ts:26](file:///d:/BuyiDictionaryWeb/BuyiDictionaryApp-main/BuyiDictionaryApp-main/backend/src/entities/auth-session.entity.ts#L26) 等 | refreshTokenHash/question/answer |
| H-09 DB_USERNAME 默认 root + 无 SSL | [app.config.ts:85](file:///d:/BuyiDictionaryWeb/BuyiDictionaryApp-main/BuyiDictionaryApp-main/backend/src/config/app.config.ts#L85) | runtime-validation 未拒绝 root |
| H-10 sealos-deploy 密码同值+synchronize | [sealos-deploy.yml:30-31,209](file:///d:/BuyiDictionaryWeb/sealos-deploy.yml#L30-L31) | +MEDIA_DRIVER=local 启动即崩 |
| M-01 admin 控制器缺 RolesGuard | 7 个控制器 | EDITOR 可删内容/批量发布 |
| M-02 agent/generate 未鉴权 | [miniapp-agent.controller.ts:136-197](file:///d:/BuyiDictionaryWeb/BuyiDictionaryApp-main/BuyiDictionaryApp-main/backend/src/modules/miniapp-agent/miniapp-agent.controller.ts#L136-L197) | 匿名刷 DeepSeek 配额 |
| M-03 限流/锁定进程内 Map | [rate-limit.ts:13](file:///d:/BuyiDictionaryWeb/BuyiDictionaryApp-main/BuyiDictionaryApp-main/backend/src/common/http/rate-limit.ts#L13) 等 | 多实例失效 |
| M-04 xlsx@0.18.5 CVE | [package.json:48](file:///d:/BuyiDictionaryWeb/BuyiDictionaryApp-main/BuyiDictionaryApp-main/backend/package.json#L48) | CVE-2023-30533/CVE-2024-22363 |

### 10.3 新发现的高危问题（本轮复审新增）

#### R-H01 docker-compose 后端 3000 端口暴露 0.0.0.0（P0 修复遗漏）

- **Severity**: High
- **Location**: [docker-compose.yml:60](file:///d:/BuyiDictionaryWeb/docker-compose.yml#L60)
- **Evidence**: `ports: - "3000:3000"`（未绑 127.0.0.1，对比 deploy/docker-compose.yml:60 已绑）
- **Impact**: 后端绕过前端 nginx 反代直接暴露，任何可路由到主机者都能直连 `/api/*`（含 health、Swagger 若开启）。
- **Fix**: 改为 `"127.0.0.1:3000:3000"`。

#### R-H02 deploy/docker-compose.yml CORS_ORIGIN 默认 *（P0 修复遗漏）

- **Severity**: High
- **Location**: [deploy/docker-compose.yml:34](file:///d:/BuyiDictionaryWeb/deploy/docker-compose.yml#L34)
- **Evidence**: `CORS_ORIGIN: ${CORS_ORIGIN:-*}`
- **Impact**: 未设环境变量时默认 `*`，允许任意站点跨域调用后端 API。配合 token 在 localStorage 可被 XSS 读取，形成"XSS → 偷 token → 跨域重放"链。
- **Fix**: 默认值改为显式白名单，或 `${CORS_ORIGIN:?required}` 强制注入。

#### R-H03 deploy/docker-compose.yml 弱默认凭据（P0 修复遗漏）

- **Severity**: High
- **Location**: [deploy/docker-compose.yml:9,12,33,52](file:///d:/BuyiDictionaryWeb/deploy/docker-compose.yml#L9-L52)
- **Evidence**:
  ```yaml
  MYSQL_ROOT_PASSWORD: ${MYSQL_ROOT_PASSWORD:-buyi_root_password}
  MYSQL_PASSWORD: ${MYSQL_PASSWORD:-buyi_password}
  JWT_SECRET: ${JWT_SECRET:-your-production-jwt-secret-change-me}
  DEFAULT_ADMIN_PASSWORD: ${DEFAULT_ADMIN_PASSWORD:-Admin@123456}
  ```
- **Impact**: 运维忘记设置环境变量时，容器以弱默认凭据启动：JWT 可预测伪造身份、MySQL root 弱密码、admin 后台默认口令。
- **Fix**: 移除所有敏感变量默认值，改为 `${VAR:?required}` 强制必填。

#### R-H04 弱默认 JWT_SECRET 可过生产校验

- **Severity**: High（提级，对应后端复审 N-01）
- **Location**: [docker-compose.yml:33](file:///d:/BuyiDictionaryWeb/docker-compose.yml#L33)、[runtime-validation.ts:35](file:///d:/BuyiDictionaryWeb/BuyiDictionaryApp-main/BuyiDictionaryApp-main/backend/src/config/runtime-validation.ts#L35)
- **Evidence**: `JWT_SECRET: ${JWT_SECRET:-your-production-jwt-secret}`；runtime-validation 仅拦截空值与字面量 `'change-me'`，`'your-production-jwt-secret'` 不在黑名单 → 通过生产校验。
- **Impact**: 若运维直接 `docker-compose up` 未设环境变量，生产用可预测密钥签发 JWT，攻击者可离线伪造任意管理员令牌。
- **Fix**: runtime-validation 增加 JWT_SECRET 最小长度校验（≥32 字节）与弱口令黑名单；移除 compose 中可预测兜底值。

### 10.4 新发现的中危问题（本轮复审新增）

| ID | 位置 | 问题 |
|----|------|------|
| R-M01 | [app.config.ts:77](file:///d:/BuyiDictionaryWeb/BuyiDictionaryApp-main/BuyiDictionaryApp-main/backend/src/config/app.config.ts#L77) | admin access token 有效期 24h（应 15m-1h），泄露窗口过长 |
| R-M02 | [functions/api/\[\[path\]\].js:53](file:///d:/BuyiDictionaryWeb/buyi-dictionary-vue/functions/api/[[path]].js#L53) | CF Pages Function 502 回传上游 error.message，泄露内部拓扑 |
| R-M03 | [Culture.vue:225](file:///d:/BuyiDictionaryWeb/buyi-dictionary-vue/src/views/Culture.vue#L225) | 第二处 :href 绑定 sourceUrl 未校验协议（L-06 之外遗漏） |
| R-M04 | [BuyiDictionaryApp-main/Dockerfile](file:///d:/BuyiDictionaryWeb/BuyiDictionaryApp-main/BuyiDictionaryApp-main/Dockerfile) | 根级 Dockerfile 缺 USER 指令（以 root 跑）、缺 HEALTHCHECK |
| R-M05 | [backend/Dockerfile:25](file:///d:/BuyiDictionaryWeb/BuyiDictionaryApp-main/BuyiDictionaryApp-main/backend/Dockerfile#L25) + 根 Dockerfile:22 | 生产镜像 COPY src/ 源码，镜像泄露即源码泄露 |
| R-M06 | [deploy/docker-compose.yml:32](file:///d:/BuyiDictionaryWeb/deploy/docker-compose.yml#L32) | ENABLE_SWAGGER: true（生产应 false） |
| R-M07 | [backend/Dockerfile:37](file:///d:/BuyiDictionaryWeb/BuyiDictionaryApp-main/BuyiDictionaryApp-main/backend/Dockerfile#L37) | HEALTHCHECK 用 curl 但 node:20-alpine 无 curl，健康检查始终失败 |
| R-M08 | [project.config.json:17](file:///d:/BuyiDictionaryWeb/BuyiDictionaryApp-main/BuyiDictionaryApp-main/project.config.json#L17) | uploadWithSourceMap: true，源码 sourcemap 上传微信平台 |
| R-M09 | [runtime-validation.ts:35-57](file:///d:/BuyiDictionaryWeb/BuyiDictionaryApp-main/BuyiDictionaryApp-main/backend/src/config/runtime-validation.ts#L35-L57) | 未校验 DB_PASSWORD 非空、JWT_SECRET 无长度门槛 |
| R-M10 | [storage.service.ts:41-57](file:///d:/BuyiDictionaryWeb/BuyiDictionaryApp-main/BuyiDictionaryApp-main/backend/src/modules/media/storage.service.ts#L41-L57) | 本地媒体同源存储型 XSS（dev/staging，生产 cos 强制） |

### 10.5 新发现的低危问题（本轮复审新增）

| ID | 位置 | 问题 |
|----|------|------|
| R-L01 | [jwt-auth.guard.ts:42](file:///d:/BuyiDictionaryWeb/BuyiDictionaryApp-main/BuyiDictionaryApp-main/backend/src/common/guards/jwt-auth.guard.ts#L42) 等 3 处 | JWT verify 未显式指定 algorithms: ['HS256'] |
| R-L02 | [auth-sessions.service.ts:82](file:///d:/BuyiDictionaryWeb/BuyiDictionaryApp-main/BuyiDictionaryApp-main/backend/src/modules/auth-sessions/auth-sessions.service.ts#L82) | refresh token 哈希比较未用 timingSafeEqual |
| R-L03 | [login-lockout.service.ts:46](file:///d:/BuyiDictionaryWeb/BuyiDictionaryApp-main/BuyiDictionaryApp-main/backend/src/modules/auth-security/login-lockout.service.ts#L46) 等 | 日志拼接用户输入可换行注入 |
| R-L04 | [health.service.ts:36-41](file:///d:/BuyiDictionaryWeb/BuyiDictionaryApp-main/BuyiDictionaryApp-main/backend/src/modules/health/health.service.ts#L36-L41) | /api/ready 降级时回显配置问题清单 |
| R-L05 | [SourceBadge.vue:24](file:///d:/BuyiDictionaryWeb/buyi-dictionary-vue/src/components/common/SourceBadge.vue#L24) | :href 组件未校验协议（当前硬编码安全，未来接入 API 触发） |
| R-L06 | [buyi-dictionary-vue/Dockerfile](file:///d:/BuyiDictionaryWeb/buyi-dictionary-vue/Dockerfile) | 缺 USER + HEALTHCHECK |
| R-L07 | [sealos-deploy.yml:30-33](file:///d:/BuyiDictionaryWeb/sealos-deploy.yml#L30-L33) | Secret 内联占位符，误提交风险 |
| R-L08 | [app.js:368-390](file:///d:/BuyiDictionaryWeb/BuyiDictionaryApp-main/BuyiDictionaryApp-main/app.js#L368-L390) | 小程序 clearLoginState 不清其他缓存 |
| R-L09 | [cloudfunctions/login/index.js:16](file:///d:/BuyiDictionaryWeb/BuyiDictionaryApp-main/BuyiDictionaryApp-main/cloudfunctions/login/index.js#L16) | nickname/avatarUrl 未校验长度/协议 |
| R-L10 | [package.json](file:///d:/BuyiDictionaryWeb/buyi-dictionary-vue/package.json) | axios ^1.6.0 范围过宽（lockfile 锁 1.18.1 安全，但无 lockfile 场景可回退） |
| R-L11 | [miniapp-auth.service.ts:149-151](file:///d:/BuyiDictionaryWeb/BuyiDictionaryApp-main/BuyiDictionaryApp-main/backend/src/modules/miniapp-auth/miniapp-auth.service.ts#L149-L151) | web-register 用户名存在性可枚举 |

### 10.6 复审结论

**修复验证**：6 项 P0 修复全部正确落地，无回归。

**关键风险链**：R-H01（后端 0.0.0.0:3000）+ R-H02（CORS *）+ R-H03（弱默认凭据）+ M-05（token localStorage）+ 任意 XSS（L-06/R-M03）可形成"直连后端 / XSS 偷 token / 跨域重放 / 弱密钥伪造"完整链。建议至少把 R-H01~R-H04 在下一轮一并修复，阻断链路。

**最紧迫的下一批修复**（P0 遗漏 + 提级项）：
1. R-H01 docker-compose 后端端口绑 127.0.0.1（1 行改动）
2. R-H02 deploy/docker-compose CORS_ORIGIN 移除 * 默认值
3. R-H03 deploy/docker-compose 移除所有弱默认凭据
4. R-H04 runtime-validation 加 JWT_SECRET 长度校验
5. H-03+H-04 补齐迁移注册 + baseline 写真 DDL
6. M-01 给 7 个 admin 控制器加 RolesGuard（EDITOR 越权防护）

---

## 十一、审计声明

- 本报告所有发现均基于代码与配置文件的**只读静态核查**，未对任何文件做修改。
- TLS / 安全头等可能在边缘（Cloudflare/Nginx）配置但仓库不可见的项目，按"verify at edge"处理，不计为代码缺陷。
- 报告生成路径：`d:\BuyiDictionaryWeb\security_best_practices_report.md`
