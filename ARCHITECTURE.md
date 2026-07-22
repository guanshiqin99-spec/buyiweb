# 系统架构

> 本文档描述布依族词典项目的整体架构、模块划分与数据流。
>
> 最后更新：2026-07-21

---

## 一、整体架构

项目采用 **前后端分离 + 多端共用后端** 的架构：

```text
┌──────────────────────────────────────────────────────────────┐
│                       客户端层                                │
├─────────────────┬─────────────────────┬──────────────────────┤
│  Web 前端 (Vue) │  微信小程序         │  运营后台 (静态 SPA)  │
│  /              │  /pages/*           │  /admin-web/         │
└────────┬────────┴──────────┬──────────┴──────────┬───────────┘
         │ Axios             │ wx.request          │ fetch
         │                   │                     │
         │   /api/* (HTTPS)  │                     │
         └───────────────────┼─────────────────────┘
                             ▼
┌──────────────────────────────────────────────────────────────┐
│                  NestJS 后端（端口 3000）                    │
├──────────────────────────────────────────────────────────────┤
│  /api/miniapp/*   小程序接口（鉴权：miniapp-jwt.guard）       │
│  /api/admin/*     后台接口（鉴权：admin-jwt.guard + RBAC）    │
│  /api/health      健康检查                                   │
│  /api/docs        Swagger 文档                               │
│  /admin-web/      静态后台前端（ServeStatic）                │
└────────────────────────┬─────────────────────────────────────┘
                         ▼
┌──────────────────────────────────────────────────────────────┐
│                       数据与存储层                            │
├────────────────────┬─────────────────────────────────────────┤
│  TypeORM 实体层     │  17 个实体：用户、词条、民歌、收藏等     │
│  MySQL / SQLite    │  生产 MySQL 8 / 开发 sqljs              │
│  腾讯云 COS        │  媒体资源存储（图片、音频）              │
└────────────────────┴─────────────────────────────────────────┘
```

---

## 二、模块划分

### 2.1 Web 前端模块（`buyi-dictionary-vue/src/`）

| 模块 | 职责 | 关键文件 |
|------|------|----------|
| `assets/styles/` | 设计令牌系统 | `variables.css`, `liquid-glass.css`, `main.css` |
| `components/layout/` | 布局组件 | `AppHeader.vue`, `AppFooter.vue` |
| `components/common/` | 通用组件 | `PageShell.vue`, `SearchBar.vue`, `SearchModal.vue`, `FloatingParticles.vue` |
| `components/specific/` | 业务组件 | `AudioPlayer.vue`, `AgentPanel.vue`, `ToneChart.vue`, `BarChart.vue` |
| `components/icons/` | SVG 图标 | `IconBase.vue` + 20+ 图标组件 |
| `views/` | 页面视图 | 10 个页面，对应 10 条路由 |
| `stores/` | Pinia 状态 | `auth`, `player`, `favorites`, `search`, `theme`, `agent` |
| `router/` | 路由配置 | History 模式 + `requiresAuth` 守卫 |
| `utils/` | 工具函数 | `api.js`（Axios 封装）、`liquidGlass.js`、`navTonePolicy.js` |
| `data/` | 静态数据 | `tones.js`, `quiz.js`, `playableSongs.js` |

### 2.2 微信小程序模块（`BuyiDictionaryApp-main/BuyiDictionaryApp-main/`）

| 模块 | 职责 |
|------|------|
| `pages/home/` | 首页 |
| `pages/dictionary/`, `pages/query/` | 词汇查询 |
| `pages/phrases/`, `pages/proverbs/` | 短语与谚语 |
| `pages/song/` | 民歌列表 |
| `pages/quiz/` | 答题测验 |
| `pages/login/` | 登录注册 |
| `pages/mine/`, `pages/setting/` | 个人中心与设置 |
| `pages/record/` | 学习记录 |
| `pages/favorite/` | 收藏 |
| `utils/api.js` | 接口封装 |
| `utils/runtime-config.js` | 运行时接口地址配置 |
| `app.js` | 小程序入口 |

### 2.3 后端模块（`backend/src/modules/`）

后端按业务域划分为 **小程序接口**、**后台接口**、**公共模块** 三类：

#### 小程序接口模块（`/api/miniapp/*`）

| 模块 | 路径前缀 | 职责 |
|------|---------|------|
| `miniapp-auth` | `/miniapp/auth` | 微信登录、Web 登录、token 续期、退出 |
| `miniapp-home` | `/miniapp/home` | 首页轮播、推荐、统计 |
| `miniapp-me` | `/miniapp/me` | 个人信息 |
| `miniapp-dictionary` | `/miniapp/dictionary` | 词条查询 |
| `miniapp-phrases` | `/miniapp/phrases` | 短语查询 |
| `miniapp-proverbs` | `/miniapp/proverbs` | 谚语查询 |
| `miniapp-songs` | `/miniapp/songs` | 民歌列表与详情 |
| `miniapp-search` | `/miniapp/search` | 综合搜索 |
| `miniapp-favorites` | `/miniapp/favorites` | 收藏管理 |
| `miniapp-learning-records` | `/miniapp/learning-records` | 学习记录与统计 |
| `miniapp-badges` | `/miniapp/badges` | 徽章系统 |
| `miniapp-settings` | `/miniapp/settings` | 用户设置 |
| `miniapp-quiz` | `/miniapp/quiz` | 答题测验 |
| `miniapp-culture-exhibits` | `/miniapp/culture-exhibits` | 文化展项 |
| `miniapp-agent` | `/miniapp/agent` | AI 助手（SSE 流式） |

#### 后台接口模块（`/api/admin/*`）

| 模块 | 路径前缀 | 职责 |
|------|---------|------|
| `admin-auth` | `/admin/auth` | 管理员登录、续期、退出 |
| `admin-content` | `/admin/{dictionary,phrases,proverbs,songs}` | 内容 CRUD 与 Excel 导入 |
| `admin-media` | `/admin/media` | 媒体上传（图片/音频） |
| `admin-dashboard` | `/admin/dashboard` | 仪表盘统计 |
| `admin-users` | `/admin/users` | 用户管理 |
| `admin-culture-exhibits` | `/admin/culture-exhibits` | 文化展项管理 |

#### 公共模块

| 模块 | 职责 |
|------|------|
| `auth-security` | 登录失败锁定 |
| `auth-sessions` | session 管理，logout 后令牌立即失效 |
| `content` | 内容查询与导入的共享服务 |
| `media` | 媒体存储抽象（local / cos） |
| `health` | 健康检查与就绪检查 |
| `seed` | 开发环境种子数据 |

### 2.4 后端公共层（`backend/src/common/`）

| 子目录 | 职责 |
|--------|------|
| `decorators/` | `@CurrentUser`、`@Public`、`@RequirePermission`、`@Roles` 等装饰器 |
| `guards/` | `JwtAuthGuard`、`MiniappJwtGuard`、`AdminJwtGuard`、`RolesGuard` |
| `interceptors/` | 响应包装、PII 字段脱敏 |
| `filters/` | 全局异常过滤器 |
| `dto/` | 分页查询、token 续期等通用 DTO |
| `enums/` | `AdminRole`、`ContentType` 枚举 |
| `services/` | `WechatService`（code2session） |

---

## 三、数据模型

后端共定义 17 个 TypeORM 实体，位于 `backend/src/entities/`：

```text
User ──┬── Favorite ─── DictionaryEntry / Phrase / Proverb / Song
       ├── LearningRecord
       ├── QuizAttempt
       ├── UserSetting
       └── Badge ← UserBadge

Admin ──── AuthSession

MediaAsset ──── (covers) ── DictionaryEntry / Song / CultureExhibit

CultureExhibit ──── ContentCultureLink ──── DictionaryEntry / Phrase / ...

WechatAccount ──── User
```

| 实体 | 说明 |
|------|------|
| `User` | 小程序用户 |
| `Admin` | 后台管理员，含 RBAC 角色 |
| `AuthSession` | 会话记录，logout 后令牌失效 |
| `DictionaryEntry` | 词条 |
| `Phrase` | 短语 |
| `Proverb` | 谚语 |
| `Song` | 民歌 |
| `CultureExhibit` | 文化展项 |
| `ContentCultureLink` | 内容与文化展项的关联表 |
| `MediaAsset` | 媒体资源 |
| `Favorite` | 用户收藏 |
| `LearningRecord` | 学习记录 |
| `QuizAttempt` | 答题记录 |
| `Badge` | 徽章定义 |
| `UserSetting` | 用户设置 |
| `WechatAccount` | 微信账号绑定 |
| `AgentCache` | AI 助手对话缓存 |

---

## 四、关键数据流

### 4.1 用户登录流程

```text
小程序 ──(wx.login code)──> /miniapp/auth/wechat-login
                                    │
                                    ▼
                          WechatService.code2session
                                    │
                                    ▼
                          创建/查找 User + WechatAccount
                                    │
                                    ▼
                          签发 access + refresh token
                                    │
                                    ▼
                          创建 AuthSession
                                    │
                          ◀──(tokens)──
```

### 4.2 401 自动刷新流程

```text
Axios 请求 → 401 → 队列暂停
                  ↓
                  POST /miniapp/auth/refresh (refreshToken)
                  ↓
                  成功 → 重放队列 + 更新本地 token
                  失败 → clearAuthAndRedirect('/login')
```

### 4.3 AI 助手 SSE 流式

```text
前端 AgentPanel → agentApi.askStream(question)
                                ↓
                          fetch('/miniapp/agent/ask', { stream: true })
                                ↓
                          后端代理到 DeepSeek API
                                ↓
                          流式返回 data: {"type":"delta","content":"..."}
                                ↓
                          reader.read() 逐块渲染
```

### 4.4 内容管理流程

```text
运营后台 ──填表──> /api/admin/dictionary (POST, RBAC)
                          │
                          ▼
                   写入 DictionaryEntry 表
                          │
                          ▼
小程序 ──> /api/miniapp/dictionary ──> 读取最新数据
```

---

## 五、前端架构细节

详见 [buyi-dictionary-vue/README.md](buyi-dictionary-vue/README.md) 与 [docs/TECH_STACK.md](docs/TECH_STACK.md)。摘要：

- **路由**：History 模式，`beforeEach` 守卫检查 `meta.requiresAuth`
- **状态管理**：6 个 Pinia store（组合式与选项式混用）
- **API 封装**：单一 axios 实例，拦截器附加 token + 401 自动刷新
- **设计系统**：CSS 变量令牌驱动，无 UI 框架
- **液态玻璃**：`utils/liquidGlass.js` 单例管理光标跟随与视差
- **导航栏主题**：`utils/navTonePolicy.js` 三点采样 + 96ms 稳定延迟

---

## 六、部署架构

### 6.1 推荐生产架构

```text
阿里云 ECS / 自建服务器
  Nginx :80 / 443
    ├─ / → Web 静态文件 (buyi-dictionary-vue/dist)
    ├─ /api/ → NestJS :3000
    └─ /admin-web/ → NestJS :3000
  Node/NestJS :127.0.0.1:3000 (PM2 守护)
  MySQL :127.0.0.1:3306 或独立 RDS
  腾讯云 COS（媒体资源）
```

### 6.2 Docker Compose 架构

```text
容器编排
  ├─ mysql:8.0        (3306)
  ├─ buyi-backend    (3000, NestJS)
  └─ buyi-web        (80, Nginx 托管 Vue 静态文件)
```

详见 [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)。

---

## 七、扩展性考虑

| 维度 | 现状 | 扩展方向 |
|------|------|----------|
| 横向扩展 | NestJS 无状态，token 自包含 | 多实例 + 共享 session 存储（Redis） |
| 数据库 | TypeORM 抽象，可切 MySQL/SQLite | 切换 PostgreSQL 仅需改 driver |
| 媒体存储 | `MediaService` 抽象 local / cos | 新增 OSS/七牛只需实现接口 |
| AI 提供商 | `AI_PROVIDER` 环境变量切换 | 已支持 deepseek，可扩展 OpenAI/Claude |
| 多语言 | 当前仅中文 | i18n 需在前端 store + 后端 content 表扩展 |
