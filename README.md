# 布依族词典 · Buyi Dictionary

> 面向布依族语言文化保护的数字媒体应用，覆盖 Web、微信小程序、后台管理三端，提供词汇查询、短语学习、谚语传承、民歌欣赏、文化探索等功能。
>
> 参赛目标：2026 年北京市大学生数字媒体设计竞赛 B 类（互联网应用及多媒体作品应用类）。

---

## 项目简介

布依族词典是一个面向布依族语言文化保护的多端数字媒体应用，由三个相互独立又彼此联动的子项目组成：

| 子项目 | 目录 | 角色 | 技术栈 |
|--------|------|------|--------|
| Web 前端 | [`buyi-dictionary-vue/`](buyi-dictionary-vue) | 面向用户的 Vue 3 SPA | Vue 3 + Vite 5 + Pinia |
| 微信小程序 + 后端 | [`BuyiDictionaryApp-main/`](BuyiDictionaryApp-main) | 小程序前端 + NestJS 后端 + 后台管理 | 原生小程序 + NestJS + TypeORM |
| 早期 HTML 原型 | [`buyi-dictionary-web-draft/`](buyi-dictionary-web-draft) | 设计原型归档 | 原生 HTML/CSS |

整体架构：

```text
┌─────────────────┐     ┌─────────────────┐
│  Web 前端 (Vue) │     │  微信小程序     │
└────────┬────────┘     └────────┬────────┘
         │ Axios HTTP            │ wx.request
         │                       │
         └───────────┬───────────┘
                     ▼
          ┌──────────────────────┐
          │  NestJS 后端 (3000)  │
          │  /api/miniapp/*      │
          │  /api/admin/*        │
          │  /admin-web/         │
          └──────────┬───────────┘
                     ▼
          ┌──────────────────────┐
          │  MySQL + 腾讯云 COS  │
          └──────────────────────┘
```

---

## 核心特性

- **多端覆盖**：Web、微信小程序、后台管理共用同一后端
- **Liquid Glass 设计系统**：蜡染靛蓝配色 + 液态玻璃光学材质
- **深色模式**：light / dark / auto 跟随系统
- **无障碍设计**：ARIA 标签、键盘导航、`prefers-reduced-motion`
- **响应式布局**：移动端 / 平板 / 桌面端
- **双令牌认证**：access token + refresh token，session 级 logout
- **AI 助手**：SSE 流式问答（依赖后端 DeepSeek 接入）
- **微信学习提醒**：每日定时投递订阅消息

---

## 快速开始

### 环境要求

- Node.js 18+（后端推荐 20.x）
- npm 9+（或 pnpm / yarn）
- MySQL 8+（生产） / SQLite via sqljs（开发）
- 微信开发者工具（仅小程序开发需要）

### 一键启动（本地随包模式）

Windows 用户可直接双击仓库根目录的批处理脚本：

- [`启动后端.bat`](启动后端.bat) — 启动 NestJS 后端（端口 3000）
- [`启动前端.bat`](启动前端.bat) — 启动 Vite 开发服务器（端口 5173）
- [`启动竞赛包.bat`](启动竞赛包.bat) — 同时启动前后端
- [`导入示例数据.bat`](导入示例数据.bat) — 初始化种子数据

### 手动启动

```bash
# 1. 启动后端
cd BuyiDictionaryApp-main/BuyiDictionaryApp-main/backend
npm install
cp .env.example .env       # 首次运行需要
npm run start:dev           # http://127.0.0.1:3000/api

# 2. 启动 Web 前端
cd buyi-dictionary-vue
npm install
npm run dev                 # http://localhost:5173

# 3. 启动小程序（可选）
# 用微信开发者工具打开 BuyiDictionaryApp-main/BuyiDictionaryApp-main 目录
```

### 默认账号

本地种子数据启用的管理员账号：

- 用户名：`admin`
- 密码：`Admin@123456`

---

## 项目结构

```text
BuyiDictionaryWeb/
├── buyi-dictionary-vue/             # Web 前端（Vue 3 SPA）
│   ├── src/
│   │   ├── assets/                  # 图片与样式令牌
│   │   ├── components/              # 布局 / 通用 / 业务组件
│   │   ├── views/                   # 10 个页面视图
│   │   ├── stores/                   # Pinia 状态管理
│   │   ├── router/                   # 路由 + 鉴权守卫
│   │   └── utils/                    # API 封装、工具函数
│   ├── tests/                       # 单元测试
│   ├── docs/                        # 前端专题文档
│   └── Dockerfile
│
├── BuyiDictionaryApp-main/
│   └── BuyiDictionaryApp-main/
│       ├── pages/                   # 微信小程序页面
│       ├── components/              # 小程序组件
│       ├── utils/                   # 小程序工具
│       ├── backend/                 # NestJS 后端
│       │   ├── src/
│       │   │   ├── modules/         # 业务模块（miniapp + admin）
│       │   │   ├── entities/        # TypeORM 实体
│       │   │   ├── common/          # 守卫、拦截器、装饰器
│       │   │   └── migrations/      # 数据库迁移
│       │   └── README.md
│       └── buyidict-api/            # 函数型云托管示例
│
├── buyi-dictionary-web-draft/       # 早期 HTML 原型（归档）
│
├── docs/                            # 专题文档（技术栈、开发、部署、API、测试）
├── docker-compose.yml              # 一键容器化部署
├── .env.production.example          # 生产环境变量模板
├── README.md                        # 项目总览（本文件）
├── ARCHITECTURE.md                 # 系统架构
├── CONTRIBUTING.md                 # 贡献指南
├── SECURITY.md                     # 安全策略
├── CHANGELOG.md                    # 变更记录
└── LICENSE.md                       # MIT 许可证
```

---

## 文档导航

### 根目录核心文档

| 文档 | 用途 |
|------|------|
| [README.md](README.md) | 项目总览（本文件） |
| [ARCHITECTURE.md](ARCHITECTURE.md) | 系统架构、模块划分、数据流 |
| [CONTRIBUTING.md](CONTRIBUTING.md) | 代码规范、提交约定、分支策略 |
| [SECURITY.md](SECURITY.md) | 安全策略与生产环境检查清单 |
| [CHANGELOG.md](CHANGELOG.md) | 版本变更记录 |
| [LICENSE.md](LICENSE.md) | MIT 许可证 |

### `docs/` 专题文档

| 文档 | 用途 |
|------|------|
| [docs/TECH_STACK.md](docs/TECH_STACK.md) | 完整技术栈与版本要求 |
| [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md) | 本地开发环境搭建与调试 |
| [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) | 生产部署、Nginx、PM2、Docker |
| [docs/API_REFERENCE.md](docs/API_REFERENCE.md) | 后端 API 端点速查 |
| [docs/TESTING.md](docs/TESTING.md) | 测试用例编写与运行 |

子项目各自的入门文档：

- [buyi-dictionary-vue/README.md](buyi-dictionary-vue/README.md) — Web 前端
- [buyi-dictionary-vue/ARCHITECTURE.md](buyi-dictionary-vue/ARCHITECTURE.md) — 前端架构细节
- [BuyiDictionaryApp-main/BuyiDictionaryApp-main/backend/README.md](BuyiDictionaryApp-main/BuyiDictionaryApp-main/backend/README.md) — NestJS 后端
- [BuyiDictionaryApp-main/BuyiDictionaryApp-main/项目部署与前后端联动说明.md](BuyiDictionaryApp-main/BuyiDictionaryApp-main/项目部署与前后端联动说明.md) — 前后端联动说明

---

## 常用命令

### Web 前端

```bash
cd buyi-dictionary-vue
npm run dev        # 启动开发服务器
npm run build     # 生产构建
npm run preview   # 预览构建产物
npm run lint      # ESLint 检查
npm run format    # Prettier 格式化
npm run test      # 运行单元测试
```

### 后端

```bash
cd BuyiDictionaryApp-main/BuyiDictionaryApp-main/backend
npm run start:dev     # 启动开发服务
npm run build         # 编译 TypeScript
npm run start:prod    # 运行生产构建
npm run db:migrate    # 执行数据库迁移
npm run db:revert     # 回滚最近一次迁移
npm run admin:init    # 初始化管理员账号
npm run seed:data     # 导入种子数据
npm test              # 运行 Jest 测试
npm run lint          # TypeScript 类型检查
```

### Docker 一键部署

```bash
cp .env.production.example .env
docker compose up -d
```

服务端口：

- Web 前端：`http://localhost:8080`
- 后端 API：`http://localhost:3000/api`
- MySQL：`localhost:3306`

---

## 许可证

MIT License — 详见各子项目内的 LICENSE 文件。

---

## 致谢

- 文化资料：中国非物质文化遗产网公开条目
- 民歌素材：详见 [docs/material-provenance.md](buyi-dictionary-vue/docs/material-provenance.md)
- 设计灵感：Apple Liquid Glass + 布依族蜡染纹样
