# Checklist

> **Scope**: 仅验证 P0 + P1 已执行任务。Task 6（Admin@123456）及 P2/P3 不在本次范围。

## P0 — 严重安全

- [x] `reset_admin.js` 中无明文 `BuyiDict@2026!Root` / `gsq060606.@`，改从 `process.env` 读取
- [x] `show_tables.js` 中无明文 DB root 凭据
- [x] `upload.js` 中无明文管理员口令
- [x] 8 个部署脚本中无硬编码 SSH root 口令，改用 SSH 密钥或 `os.environ`
- [x] `.gitignore` 已包含 `reset_admin.js` / `show_tables.js` / `upload.js`
- [x] `buyidict-api/server.js` CORS 从 `*` 改为白名单
- [x] `buyidict-api/server.js` 上游改 HTTPS，目标地址从 `process.env` 读取
- [x] `buyidict-api/server.js` 启动日志不打印上游 IP

## P1 — 高危安全

- [x] `app.config.ts` 中 `jwt.secret` 无 `?? 'change-me'` 兜底
- [x] 全局搜索 `'change-me'` 无残留（仅剩 runtime-validation.ts 防御性校验，正确保留）
- [x] `app.config.ts` 中 `docsEnabled` 默认值为 `'false'`
- [x] `main.ts` 中 Swagger 默认关闭
- [x] `runtime-validation.ts` 生产环境 Swagger 开启时 warn
- [x] `app.config.ts` 中 `expiresIn` 默认值为 `'30m'`
- [x] 前端 `authInterceptor.js` 在 access token 过期时自动刷新无回归

## P1 — 设计硬规则

- [x] `NotFound.vue` 无居中盒装卡，改全宽极简
- [x] `Login.vue` 无居中盒装玻璃卡，改左对齐窄表单
- [x] `Profile.vue` 统计区为内联数字 + 分隔线，无 `liquid-glass` 卡
- [x] `Record.vue` 统计区为平面数字行，列表项去玻璃
- [x] `Favorites.vue` 列表项去玻璃改分隔线
- [x] `Settings.vue` 4 分组合并为单容器 + 标题分隔
- [x] `Learn.vue` 翻卡非 `-hero` 玻璃，stats/progress 去玻璃
- [x] `Dictionary.vue` 搜索区非 `-hero` 玻璃，无双层玻璃嵌套
- [x] `Culture.vue` 无 `--page-accent: #f2bd70`
- [x] `Songs.vue` 无 `--page-accent` / `--page-brand-light` 自定义
- [x] `Settings.vue` subtitle 为 utility 文案
- [x] `Dictionary.vue` H1 为"布依语词典"
- [x] `Record.vue` / `Favorites.vue` subtitle 为 utility 文案
- [x] `Login.vue` 副标题为功能说明
- [x] `Profile.vue` 版权行为真实主体名

## 验证

- [x] `npm run build` 0 errors、0 new warnings（✓ built in 1.61s）
- [x] `npm run test` 所有测试通过（32/32 pass）
- [x] 后端 `npm run build` 无错误（nest build 成功）
- [x] 全局搜索无残留 `'change-me'` / `'gsq060606.@'` / `'BuyiDict@2026!Root'`
- [x] 登录 / token 刷新链路无回归
- [x] 工具页视觉验收无布局错乱
- [x] 深色模式渲染正确
