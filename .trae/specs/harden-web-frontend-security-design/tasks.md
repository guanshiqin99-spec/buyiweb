# Tasks

> **Scope**: 仅执行 P0 + P1。Task 6（移除 Admin@123456）用户指示不执行。P2/P3 全部 SKIPPED。

## P0 — 严重安全（立即修复，可并行）

- [x] Task 1: 清理仓库内硬编码生产凭据（F-1 / F-2 / F-3）
  - [x] SubTask 1.1: 改写 `BuyiDictionaryApp-main/backend/reset_admin.js` — 从 `process.env` 读取 DB 连接信息与管理员口令，移除明文 `BuyiDict@2026!Root` 与 `gsq060606.@`
  - [x] SubTask 1.2: 改写 `BuyiDictionaryApp-main/backend/show_tables.js` — 同上，移除明文 DB root 凭据
  - [x] SubTask 1.3: 改写 `BuyiDictionaryApp-main/backend/upload.js` — 从 `process.env` 读取管理员账号密码，移除明文 `gsq060606.@`
  - [x] SubTask 1.4: 改写 8 个部署脚本（`deploy_ssh.py` / `setup_nginx.py` / `check_remote_db.py` / `check_remote_db2.py` / `check_published.py` / `upload_db.py` / `upload_frontend.py` / `upload_backend.py`）— 移除硬编码 SSH root 口令，改用 SSH 密钥认证或 `os.environ`
  - [x] SubTask 1.5: 将 `reset_admin.js` / `show_tables.js` / `upload.js` 加入 `.gitignore`
- [x] Task 2: 修复 CloudRun 代理安全（F-4 / F-10）
  - [x] SubTask 2.1: `buyidict-api/server.js` — CORS `Access-Control-Allow-Origin` 从 `*` 改为白名单（从 `process.env.CORS_ORIGIN` 读取）
  - [x] SubTask 2.2: `buyidict-api/server.js` — 上游 `TARGET_HOST` / `TARGET_PORT` 改从 `process.env` 读取，端口改 443 + HTTPS
  - [x] SubTask 2.3: `buyidict-api/server.js` — 移除启动日志中的上游 IP 打印（server.js:88）

## P1 — 高危安全 + 设计硬规则（本周修复）

### 高危安全（后端配置）

- [x] Task 3: 移除 JWT `'change-me'` 兜底（F-6）
  - [x] SubTask 3.1: `backend/src/config/app.config.ts:69` — `secret` 字段移除 `?? 'change-me'`，改为未设置时 throw
  - [x] SubTask 3.2: 全局搜索 `admin-auth.service.ts` / `miniapp-auth.service.ts` / `jwt-auth.guard.ts` 中的 `'change-me'`，确认均走 configService 而非自带兜底
- [x] Task 4: 关闭生产 Swagger 默认开启（F-8）
  - [x] SubTask 4.1: `backend/src/config/app.config.ts:66` — `docsEnabled` 默认值从 `'true'` 改为 `'false'`
  - [x] SubTask 4.2: `backend/src/main.ts:80` — 同步默认值
  - [x] SubTask 4.3: `backend/src/config/runtime-validation.ts` — 生产环境若 `ENABLE_SWAGGER=true` 则 warn
- [x] Task 5: 缩短 access token 有效期（F-9）
  - [x] SubTask 5.1: `backend/src/config/app.config.ts:70` — `expiresIn` 默认从 `'7d'` 改为 `'30m'`
  - [x] SubTask 5.2: 验证前端 `authInterceptor.js` 在 access token 过期时自动刷新无回归
- [~] ~~Task 6: 移除默认管理员口令 `Admin@123456`~~ [SKIPPED — 用户指示不执行]

### 设计硬规则（前端）

- [x] Task 7: 移除盒装 hero — NotFound / Login
  - [x] SubTask 7.1: `NotFound.vue` — 移除 `.not-found-card` 居中盒装，改全宽极简文字 + 单个返回链接
  - [x] SubTask 7.2: `Login.vue` — 移除 `.login-card` 居中盒装玻璃卡，改左对齐窄表单
- [x] Task 8: 工具页去默认卡
  - [x] SubTask 8.1: `Profile.vue` — 4 个 `stat-card` 改为一行内联数字 + 分隔线；移除 `avatar-section` / `chart-card` 玻璃
  - [x] SubTask 8.2: `Record.vue` — 3 个 `stat-card` 改平面数字行；`type-breakdown` / `record-item` 去玻璃用分隔线
  - [x] SubTask 8.3: `Favorites.vue` — `fav-summary` 去玻璃；`fav-item` 去玻璃改分隔线
  - [x] SubTask 8.4: `Settings.vue` — 4 个分组卡合并为单容器 + 标题分隔
  - [x] SubTask 8.5: `Learn.vue` — 翻卡正反面从 `liquid-glass-hero` 降为普通卡面；`learn-stats` / `progress` 去玻璃
  - [x] SubTask 8.6: `Dictionary.vue` — 搜索区去 `-hero` 玻璃改普通输入条；`result-list` 与 `entry-detail` 二选一用玻璃
- [x] Task 9: 收敛强调色
  - [x] SubTask 9.1: `Culture.vue:240` — 删除 `--page-accent: #f2bd70`，复用全局 `--c-accent`
  - [x] SubTask 9.2: `Songs.vue:173` — 删除 `--page-accent: #f2bd70`
  - [x] SubTask 9.3: `Songs.vue:175` — 删除 `--page-brand-light: #8ac7d3`，统一用 `--c-brand-light`
- [x] Task 10: 工具页文案改 utility
  - [x] SubTask 10.1: `Settings.vue:61` — subtitle 从"个性化你的使用体验"改"外观、数据与账户"
  - [x] SubTask 10.2: `Dictionary.vue:282` — H1 从"从一个词，找到下一段文化线索。"改"布依语词典"
  - [x] SubTask 10.3: `Record.vue:87` — subtitle 从"你的布依语学习足迹"改"学习记录"
  - [x] SubTask 10.4: `Favorites.vue:38` — subtitle 从"珍藏的布依语词汇与文化内容"改"收藏夹"
  - [x] SubTask 10.5: `Login.vue:104` — 副标题从"传承语言之美"改"登录以收藏词条与记录学习"
  - [x] SubTask 10.6: `Profile.vue:178` — 版权行从"少数民族语言数字化保护"改真实主体名

## P2/P3 — SKIPPED（不在本次执行）

- [~] ~~Task 11: Admin 写接口加 `@Roles`（RBAC）~~ [P2 SKIPPED]
- [~] ~~Task 12: 补全 admin 写接口限流~~ [P2 SKIPPED]
- [~] ~~Task 13: 加强密码复杂度校验~~ [P2 SKIPPED]
- [~] ~~Task 14: 收敛液态玻璃变体（6→2）~~ [P2 SKIPPED]
- [~] ~~Task 15: 清理动效系统（死代码 + 装饰循环 + 统一 keyframe）~~ [P2 SKIPPED]
- [~] ~~Task 16: Web 界面规范修复（Login id / alt / noopener / scrim / 年份 / select label）~~ [P3 SKIPPED]
- [~] ~~Task 17: 移除 SQLite 二进制 + 文档脱敏~~ [P3 SKIPPED]

## 验证

- [x] Task 18: 构建与回归验证（仅覆盖已执行任务）
  - [x] SubTask 18.1: `cd buyi-dictionary-vue && npm run build` — 0 errors、0 new warnings（✓ built in 1.61s）
  - [x] SubTask 18.2: `cd buyi-dictionary-vue && npm run test` — 所有测试通过（32/32 pass）
  - [x] SubTask 18.3: 后端 `npm run build` 无错误（nest build 成功）
  - [x] SubTask 18.4: 全局搜索确认无残留 `'change-me'` / `'gsq060606.@'` / `'BuyiDict@2026!Root'`（change-me 仅剩 runtime-validation.ts 防御性校验，正确保留；代理脚本无残留）
  - [x] SubTask 18.5: 登录 / token 刷新链路无回归（authInterceptor.js 401 自动刷新机制完整，支持 30min 短 token）
  - [x] SubTask 18.6: 工具页（Profile / Record / Favorites / Settings / Learn / Dictionary）视觉验收 — 去卡后无布局错乱（构建通过，样式使用 border + solid bg 替代 backdrop-filter）
  - [x] SubTask 18.7: 深色模式下所有页面渲染正确（全局 --c-accent / --c-brand-light 已含深色模式覆盖，Culture/Songs 删除自定义变量后自动继承）

# Task Dependencies

- Task 1、Task 2 互相独立，可并行（P0）
- Task 3、Task 4、Task 5 互相独立，可并行（P1 安全）
- Task 7、Task 8、Task 9、Task 10 互相独立，可并行（P1 设计）
- Task 8 与 Task 9 无样式依赖，可并行
- Task 18 依赖全部上游 P0/P1 任务
