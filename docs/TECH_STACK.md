# 技术栈

> 本文档列出项目所有子模块使用的技术栈、版本要求与选型理由。
>
> 最后更新：2026-07-21

---

## 一、技术栈总览

| 层级 | 技术 | 版本 | 用途 |
|------|------|------|------|
| Web 前端框架 | Vue 3 | ^3.4.0 | SPA 框架 |
| Web 构建工具 | Vite | ^5.0.0 | 开发服务器 + 生产构建 |
| Web 状态管理 | Pinia | ^2.1.0 | 组合式与选项式 store |
| Web 路由 | Vue Router | ^4.2.0 | History 模式 + 鉴权守卫 |
| Web HTTP 客户端 | Axios | ^1.6.0 | 拦截器 + 401 自动刷新 |
| 小程序框架 | 微信原生小程序 | — | 原生 pages/components/utils 结构 |
| 后端框架 | NestJS | ^11.1.6 | IoC + 模块化架构 |
| ORM | TypeORM | ^0.3.30 | 实体映射 + 迁移 |
| 数据库（开发） | SQLite via sql.js | ^1.13.0 | 零配置本地数据库 |
| 数据库（生产） | MySQL | 8.0+ | 生产数据存储 |
| 鉴权 | JWT | @nestjs/jwt ^11.0.1 | 双令牌认证 |
| 密码哈希 | bcryptjs | ^3.0.2 | 用户与管理员密码 |
| API 文档 | Swagger | @nestjs/swagger ^11.2.6 | 自动生成 OpenAPI |
| 容器化 | Docker + Docker Compose | — | 一键编排 |
| Web 服务器（生产） | Nginx | alpine | 静态托管 + 反向代理 |
| 进程守护 | PM2 | — | Node 服务常驻 |

---

## 二、Web 前端技术栈

### 2.1 核心依赖

来源：[`buyi-dictionary-vue/package.json`](../buyi-dictionary-vue/package.json)

| 依赖 | 版本 | 用途 |
|------|------|------|
| `vue` | ^3.4.0 | Vue 3 框架，使用 Composition API + `<script setup>` |
| `vue-router` | ^4.2.0 | 路由管理 |
| `pinia` | ^2.1.0 | 状态管理 |
| `axios` | ^1.6.0 | HTTP 请求 |

### 2.2 开发依赖

| 依赖 | 版本 | 用途 |
|------|------|------|
| `vite` | ^5.0.0 | 构建工具 |
| `@vitejs/plugin-vue` | ^5.0.0 | Vue 单文件组件支持 |
| `vite-plugin-singlefile` | ^2.3.3 | 单文件打包（便于竞赛提交） |
| `eslint` | ^8.50.0 | 代码检查 |
| `eslint-plugin-vue` | ^9.17.0 | Vue 文件 lint |
| `prettier` | ^3.0.0 | 代码格式化 |

### 2.3 样式方案

- **设计令牌**：原生 CSS 变量（`src/assets/styles/variables.css`）
- **液态玻璃**：`backdrop-filter` + 多层 inset box-shadow（`liquid-glass.css`）
- **不使用 UI 框架**，所有组件自实现
- **字体**：DM Sans + Noto Serif SC + JetBrains Mono（Google Fonts）
- **响应式断点**：移动端 < 640px、平板 640-900px、桌面 > 900px

### 2.4 工具库

| 工具 | 路径 | 用途 |
|------|------|------|
| `agentStream.js` | `src/utils/` | SSE 流式读取 |
| `api.js` | `src/utils/` | axios 实例 + API 对象封装 |
| `authInterceptor.js` | `src/utils/` | 401 自动刷新 token 队列 |
| `liquidGlass.js` | `src/utils/` | 光标跟随单例 |
| `navTonePolicy.js` | `src/utils/` | 导航栏背景采样策略（P0 不变量） |
| `pointerGlow.js` | `src/utils/` | 鼠标光晕 |
| `toneSynth.js` | `src/utils/` | 声调合成（Web Audio API） |
| `userProgress.js` | `src/utils/` | 学习进度 |
| `learningReminder.js` | `src/utils/` | 学习提醒（Service Worker） |
| `logger.js` | `src/utils/` | 前端日志 |
| `contentTypes.js` | `src/utils/` | 内容类型常量 |

---

## 三、微信小程序技术栈

### 3.1 框架

- **微信原生小程序**（非 Taro / uni-app）
- **页面结构**：`pages/*/{index.js, index.json, index.wxml, index.wxss}`
- **自定义 tabBar**：`app.json` 中 `tabBar.custom: true`
- **深色模式**：`app.json` 中 `darkmode: true` + `theme.json`

### 3.2 工具

| 工具 | 路径 | 用途 |
|------|------|------|
| `api.js` | `utils/` | wx.request 封装 |
| `runtime-config.js` | `utils/` | 运行时接口地址 |
| `view.js` | `utils/` | 视图工具 |
| `favorites.js` / `favSongs.js` | `utils/` | 本地收藏缓存 |

---

## 四、后端技术栈

### 4.1 核心依赖

来源：[`backend/package.json`](../BuyiDictionaryApp-main/BuyiDictionaryApp-main/backend/package.json)

| 依赖 | 版本 | 用途 |
|------|------|------|
| `@nestjs/common` `@nestjs/core` | ^11.1.6 | NestJS 核心 |
| `@nestjs/platform-express` | ^11.1.6 | Express 适配器 |
| `@nestjs/config` | ^4.0.2 | 配置管理 |
| `@nestjs/jwt` | ^11.0.1 | JWT 签发与验证 |
| `@nestjs/typeorm` | ^11.0.0 | TypeORM 集成 |
| `@nestjs/serve-static` | ^5.0.4 | 静态文件托管（/admin-web） |
| `@nestjs/swagger` | ^11.2.6 | OpenAPI 文档 |
| `typeorm` | ^0.3.30 | ORM |
| `mysql2` | ^3.14.0 | MySQL 驱动 |
| `sql.js` | ^1.13.0 | SQLite 驱动（开发环境） |
| `bcryptjs` | ^3.0.2 | 密码哈希 |
| `class-validator` `class-transformer` | ^0.14.2 / ^0.5.1 | DTO 校验与转换 |
| `helmet` | ^8.1.0 | HTTP 安全头 |
| `axios` | ^1.16.0 | 调用微信 / AI 上游 |
| `cos-nodejs-sdk-v5` | ^2.14.7 | 腾讯云 COS |
| `xlsx` | ^0.18.5 | Excel 导入导出 |
| `pinyin-pro` | ^3.27.0 | 拼音转换（搜索增强） |
| `serverless-http` | ^4.0.0 | 云函数适配 |

### 4.2 开发依赖

| 依赖 | 版本 | 用途 |
|------|------|------|
| `typescript` | ^5.8.2 | TypeScript 编译 |
| `ts-node` | ^10.9.2 | 直接运行 TS 脚本 |
| `jest` `ts-jest` | ^29.x | 单元测试 |
| `supertest` | ^7.0.0 | HTTP 集成测试 |
| `@nestjs/testing` | ^11.1.6 | NestJS 测试工具 |
| `@types/*` | — | 类型定义 |

### 4.3 运行时

- **Node.js 20.x**（`engines.node` 限定）
- **TypeScript 5.8** + 严格模式
- **NestJS 11**（最新 LTS）

---

## 五、数据库

### 5.1 开发环境（SQLite）

- 通过 `sql.js` 在 Node.js 中加载 SQLite
- 数据文件：`backend/buyi-local.sqlite`
- 优点：零配置、便于演示
- `DB_SYNCHRONIZE=true`：自动建表

### 5.2 生产环境（MySQL）

- MySQL 8.0+
- 通过 `mysql2` 驱动连接
- 使用 migration 管理结构变更
- `DB_SYNCHRONIZE=false`：禁止自动建表

### 5.3 数据库迁移

```bash
npm run db:migrate    # 执行迁移
npm run db:revert     # 回滚一次
```

迁移文件位于 `backend/src/migrations/`：

- `1710000000000-baseline-schema.ts` — 基线结构
- `1721000000000-add-culture-exhibits.ts` — 文化展项
- `1722000000000-add-quiz-attempts.ts` — 答题记录
- `1730000000000-add-rbac-and-audit.ts` — RBAC 与审计

---

## 六、媒体存储

### 6.1 本地存储（开发）

- `MEDIA_DRIVER=local`
- 文件保存到 `backend/uploads/`
- 通过 `/uploads/*` 路径访问

### 6.2 腾讯云 COS（生产）

- `MEDIA_DRIVER=cos`
- 环境变量：
  - `COS_SECRET_ID`
  - `COS_SECRET_KEY`
  - `COS_BUCKET`
  - `COS_REGION`
  - `COS_PUBLIC_BASE_URL`

### 6.3 上传限制

| 类型 | 大小上限 | MIME 白名单 |
|------|---------|-------------|
| 图片 | 10MB | jpeg, png, webp, gif |
| 音频 | 10MB | mpeg, mp3, wav, x-wav, mp4, aac, ogg |

---

## 七、外部服务

### 7.1 微信小程序后台

- **code2session**：用 `wx.login` 换取 openid
- **订阅消息**：每日学习提醒投递
- **环境变量**：`WECHAT_APP_ID`、`WECHAT_APP_SECRET`
- **Mock 模式**：`WECHAT_MOCK_MODE=true` 时跳过真实微信调用

### 7.2 DeepSeek AI

- **用途**：AI 助手 `agentApi.askStream` 的后端
- **环境变量**：
  - `AI_PROVIDER=deepseek`
  - `DEEPSEEK_API_KEY`
  - `AI_BASE_URL=https://api.deepseek.com`
  - `AI_MODEL=deepseek-chat`
- **协议**：SSE 流式（`data: {"type":"delta","content":"..."}`）

### 7.3 Google Fonts

- **DM Sans**：无衬线正文字体
- **Noto Serif SC**：衬线展示字体
- **JetBrains Mono**：代码等宽字体
- 通过 `index.html` 中 `<link rel="preconnect">` + `<link rel="stylesheet">` 加载

---

## 八、部署与运维

### 8.1 容器化

- **Dockerfile**：
  - [`buyi-dictionary-vue/Dockerfile`](../buyi-dictionary-vue/Dockerfile) — 多阶段构建（Node 构建 + Nginx 运行）
  - [`backend/Dockerfile`](../BuyiDictionaryApp-main/BuyiDictionaryApp-main/backend/Dockerfile) — Node 20 alpine
- **Docker Compose**：编排 MySQL + 后端 + 前端

### 8.2 进程管理

- **PM2**：守护 Node.js 进程
  ```bash
  pm2 start dist/main.js --name buyi-backend
  pm2 startup
  pm2 save
  ```

### 8.3 反向代理

- **Nginx**：
  - 托管前端静态文件
  - 反向代理 `/api/` 与 `/admin-web/` 到 NestJS
  - SPA 路由回退：`try_files $uri $uri/ /index.html`

---

## 九、开发工具

| 工具 | 用途 | 配置位置 |
|------|------|----------|
| ESLint | JS/Vue 代码检查 | `buyi-dictionary-vue/.eslintrc*` |
| Prettier | 代码格式化 | `buyi-dictionary-vue/.prettierrc*` |
| Jest | 单元测试 | `backend/jest.config.js`、`buyi-dictionary-vue/tests/setup.mjs` |
| Swagger | API 文档 | NestJS 自动生成 `/api/docs` |
| ts-node | 直接运行 TypeScript | 后端脚本入口 |

---

## 十、版本约定

- **Node.js**：20.x LTS（生产强制，开发推荐 18+）
- **MySQL**：8.0+
- **Vue**：3.4+（Composition API 完整支持）
- **Vite**：5.0+（ESM 原生支持）
- **NestJS**：11.x（最新 LTS）
- **TypeORM**：0.3.30+（migration 工具链稳定）
- **Docker**：Compose v3.8
