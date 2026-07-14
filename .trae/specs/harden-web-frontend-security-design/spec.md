# Web 端安全与设计质量加固 Spec

## Why

基于 security-best-practices、web-design-guidelines、frontend-skill 三项技能对 `buyi-dictionary-vue` 前端、NestJS 后端及 CloudRun 代理的综合审查，发现 **15 项安全问题**（含 4 项严重：硬编码生产凭据、CORS 全开放 + HTTP 明文传 Token）与 **多项设计质量问题**（卡片滥用、液态玻璃过度、多强调色、工具页营销文案、动效泛滥与死代码）。这些问题在交付前必须收敛，以确保安全性、可维护性与视觉品质。

## Scope（本次仅执行 P0 + P1）

> 用户指示：仅执行 P0 与 P1 优先级，跳过 Task 6（移除 Admin@123456），P2/P3 全部 SKIPPED。

### P0 — 严重安全（立即修复）

- **删除仓库内所有硬编码生产凭据**：MySQL root 口令、管理员口令、SSH root 口令（reset_admin.js / show_tables.js / upload.js / 8 个部署脚本）
- **修复 CloudRun 代理**：CORS 改白名单、上游改 HTTPS、目标地址改环境变量

### P1 — 高危安全 + 设计硬规则（本周修复）

- **移除 JWT `'change-me'` 兜底**：未设置 `JWT_SECRET` 时直接 throw
- **关闭生产 Swagger**：默认值改 `false`
- **缩短 access token 有效期**：7d → 30min，refresh 维持 7d
- ~~移除默认管理员口令 `Admin@123456`~~ [SKIPPED — 用户指示不执行]
- **移除盒装 hero**：NotFound / Login 改全宽极简
- **工具页去默认卡**：Profile / Record / Favorites / Settings 统计与列表项改平面 + 分隔线
- **收敛强调色**：删除 Culture / Songs 的 `--page-accent:#f2bd70` 与 `--page-brand-light:#8ac7d3`
- **工具页文案改 utility**：Settings / Dictionary / Record / Favorites / Login / Profile 营销句改工具性标题

### P2/P3 — SKIPPED（不在本次执行）

- ~~Admin 写接口加 `@Roles`（RBAC）~~ [P2 SKIPPED]
- ~~补全 admin 写接口限流~~ [P2 SKIPPED]
- ~~加强密码复杂度校验~~ [P2 SKIPPED]
- ~~收敛液态玻璃变体~~ [P2 SKIPPED]
- ~~清理动效系统~~ [P2 SKIPPED]
- ~~Web 界面规范修复（Login id / alt / noopener / scrim / 年份 / select label）~~ [P3 SKIPPED]
- ~~Token 存储迁移~~ [后续迭代]
- ~~文档脱敏~~ [P3 SKIPPED]
- ~~移除 SQLite 二进制~~ [P3 SKIPPED]

## Impact

- **Affected code**:
  - 前端：`buyi-dictionary-vue/src/views/*.vue`、`components/**/*.vue`、`assets/styles/*.css`、`stores/auth.js`、`utils/api.js`、`utils/authInterceptor.js`
  - 后端：`BuyiDictionaryApp-main/backend/src/main.ts`、`config/app.config.ts`、`modules/admin-content/*`、`modules/admin-media/*`、`modules/admin-auth/dto/*`、`modules/miniapp-auth/dto/*`
  - 代理：`buyidict-api/server.js`
  - 运维脚本：`reset_admin.js`、`show_tables.js`、`upload.js`、`deploy_ssh.py` 等 8 个脚本
  - 文档：`项目部署与前后端联动说明.md`、`布依族词典-竞赛分析与设计方案.md`、`README.md`
- **Affected specs**: 无既有 spec 受影响（`fix-frontend-p2p3-issues` 已完成）
- **BREAKING**: Token 有效期缩短（7d→30min）会导致现有登录态提前过期，需前端配合刷新逻辑；液态玻璃变体收敛可能影响依赖特定变体类的组件样式

## ADDED Requirements

### Requirement: 生产凭据零硬编码

系统 SHALL NOT 在任何源码文件中包含生产数据库口令、管理员口令、SSH 口令。所有凭据 MUST 通过环境变量或 CI/CD secrets 注入。

#### Scenario: 脚本运行时
- **WHEN** 运维脚本（reset_admin / upload / deploy_ssh 等）执行
- **THEN** 从 `process.env` 读取凭据，源码中无明文口令

### Requirement: JWT 密钥无默认兜底

系统 SHALL NOT 在任何环境下使用 `'change-me'` 作为 JWT 密钥。未设置 `JWT_SECRET` 时 MUST 在启动时 throw。

#### Scenario: 未设置 JWT_SECRET
- **WHEN** 应用启动且 `process.env.JWT_SECRET` 未设置
- **THEN** 启动失败并提示"必须设置 JWT_SECRET"

### Requirement: 生产环境关闭 Swagger

系统 SHALL 在生产环境默认关闭 Swagger UI。仅在显式设置 `ENABLE_SWAGGER=true` 时开启。

#### Scenario: 生产启动未设置 ENABLE_SWAGGER
- **WHEN** `NODE_ENV=production` 且未设置 `ENABLE_SWAGGER`
- **THEN** `/api/docs` 返回 404

### Requirement: ~~Admin 写接口细粒度 RBAC~~ [DEFERRED — P2 不在本次执行]

### Requirement: ~~液态玻璃变体收敛为 2 种~~ [DEFERRED — P2 不在本次执行]

### Requirement: 工具页 utility 文案

工具/仪表盘页的 heading SHALL 使用工具性名称（如"设置""布依语词典""学习记录"），subtitle SHALL 说明范围或行为，不含营销口号。

#### Scenario: 用户扫描工具页
- **WHEN** 用户仅扫描标题与标签
- **THEN** 能立即理解页面用途，无需阅读正文

## MODIFIED Requirements

### Requirement: Access Token 有效期

Access token 默认有效期从 `7d` 改为 `30min`；refresh token 维持 `7d`。前端 `authInterceptor.js` 的刷新逻辑需确保 access token 过期前自动刷新。

### Requirement: CloudRun 代理 CORS

`buyidict-api/server.js` 的 CORS 从 `Access-Control-Allow-Origin: *` 改为白名单来源，上游通信从 HTTP 改为 HTTPS。

### Requirement: ~~动效系统~~ [DEFERRED — P2 不在本次执行]

## REMOVED Requirements

### Requirement: 硬编码凭据脚本

**Reason**: 安全风险——生产凭据明文暴露于版本库。
**Migration**: `reset_admin.js` / `show_tables.js` / `upload.js` 改为从 `process.env` 读取；8 个部署脚本改用 SSH 密钥认证；从 git 历史清除敏感提交（`git filter-repo`）；轮换所有已泄露凭据。

### Requirement: ~~液态玻璃多变体~~ [DEFERRED — P2 不在本次执行]
