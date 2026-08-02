# 布依族词典（Buyi Dictionary）

布依族词典是一套面向布依族语言与文化传承的多端数字媒体应用。项目将词汇查询、短语与谚语学习、民歌欣赏、文化展厅、学习记录和成就体系整合到 Web、微信小程序与运营后台中。

项目采用前后端分离架构：Web 前端和微信小程序共用 NestJS API，运营后台由后端提供静态资源与管理接口。项目当前也作为 2026 年北京市大学生数字媒体设计竞赛 B 类（互联网应用及多媒体作品应用类）作品使用。

## 功能概览

- **词典查询**：支持词条、拼音、布依文及相关内容检索。
- **语言学习**：提供短语、谚语、学习卡片、测验和学习记录。
- **民歌欣赏**：浏览民歌内容，播放音频并查看详情。
- **文化展厅**：展示布依族蜡染、传统工艺与自然文化内容，并提供音频导览。
- **个人成长**：收藏、每日任务、徽章、学习建议及热力图、雷达图等数据可视化。
- **AI 助手**：通过 SSE 提供流式问答，需要配置后端 AI 服务密钥。
- **多端体验**：Web 端支持响应式布局、深色模式、键盘导航、ARIA 和减少动效偏好。
- **运营管理**：管理员可维护词条、短语、谚语、民歌、文化展项、媒体资源和用户数据。

## 项目组成

| 子项目 | 目录 | 说明 | 主要技术 |
| --- | --- | --- | --- |
| Web 前端 | `buyi-dictionary-vue/` | 面向用户的 Vue 单页应用 | Vue 3、Vite、Pinia、Vue Router、Axios |
| 微信小程序 | `BuyiDictionaryApp-main/BuyiDictionaryApp-main/` | 小程序页面、组件和云函数调用 | 原生微信小程序 |
| 后端 API | `BuyiDictionaryApp-main/BuyiDictionaryApp-main/backend/` | 小程序接口、Web 接口、后台接口和静态后台 | NestJS 11、TypeORM、JWT |
| 早期原型 | `buyi-dictionary-web-draft/` | 历史 HTML/CSS 原型，仅作归档 | HTML、CSS、JavaScript |

## 系统架构

```text
Web 前端（Vue） ───────┐
                      ├── HTTP/HTTPS ──> NestJS 后端 ──> MySQL / SQLite
微信小程序 ────────────┘                    │
                                           ├── /api/miniapp/*
运营后台（/admin-web/） ────────────────────└── /api/admin/*
```

- Web 开发服务器默认运行在 `5173`，通过 Vite 代理访问后端。
- 后端默认运行在 `3000`，API 根路径为 `/api`。
- 生产环境使用 MySQL 8；本地开发可使用项目配置的 SQLite（sql.js）模式。
- 媒体资源默认保存在后端 `uploads/`，也支持通过媒体抽象层接入 COS。
- 后端提供健康检查 `/api/health`，Swagger 文档通常位于 `/api/docs`（是否启用由环境变量控制）。

## 环境要求

- Node.js 18 或更高版本；后端推荐 Node.js 20.x
- npm 9 或更高版本
- MySQL 8（生产环境或需要完整联调时）
- 微信开发者工具（开发微信小程序时）
- Docker Desktop（使用容器部署时）

## 快速开始

### 方式一：Windows 脚本

在仓库根目录双击以下脚本即可：

| 脚本 | 用途 |
| --- | --- |
| `启动前端.bat` | 启动 Web 开发服务器 |
| `启动后端.bat` | 启动 NestJS 后端 |
| `启动竞赛包.bat` | 同时启动前端和后端 |
| `导入示例数据.bat` | 导入开发用示例数据 |

### 方式二：手动启动

先启动后端：

```powershell
cd BuyiDictionaryApp-main\BuyiDictionaryApp-main\backend
npm install
# 按项目实际环境准备 .env；首次运行可参考 .env.example
npm run start:dev
```

再启动 Web 前端：

```powershell
cd buyi-dictionary-vue
npm install
npm run dev
```

启动后访问 `http://localhost:5173`。后端地址为 `http://127.0.0.1:3000/api`。

开发微信小程序时，用微信开发者工具打开 `BuyiDictionaryApp-main\BuyiDictionaryApp-main\`，并按小程序及后端文档配置接口地址、AppID 和云函数环境。

## 数据库与初始化

开发环境的数据源和迁移策略由后端 `.env` 控制。生产环境建议使用 MySQL，并关闭 TypeORM 自动同步：

```powershell
cd BuyiDictionaryApp-main\BuyiDictionaryApp-main\backend
npm run db:migrate
npm run seed:data       # 仅在需要导入示例数据时执行
npm run admin:init      # 初始化管理员账号时执行
```

管理员账号、数据库密码、JWT 密钥和第三方 API 密钥均应通过环境变量或安全的密钥管理服务注入。请勿把真实密钥提交到 Git，也不要在生产环境继续使用示例密码。

## 常用命令

### Web 前端

```powershell
cd buyi-dictionary-vue
npm run dev       # 开发服务器
npm run build     # 生产构建
npm run preview   # 预览生产构建
npm run lint      # ESLint 检查并按配置修复
npm run format    # 格式化 src/
```

### 后端

```powershell
cd BuyiDictionaryApp-main\BuyiDictionaryApp-main\backend
npm run start:dev   # 热更新开发模式
npm run build       # 编译 TypeScript
npm run start:prod  # 运行 dist/main
npm run db:migrate  # 执行迁移
npm run db:revert   # 回滚最近一次迁移
npm run admin:init  # 初始化管理员
npm run seed:data   # 导入种子数据
npm test            # Jest 测试
npm run lint        # TypeScript 类型检查
```

## Docker 部署

仓库根目录提供 `docker-compose.yml`，包含 MySQL、NestJS 后端和 Nginx Web 前端三个服务。

```powershell
Copy-Item .env.production.example .env
# 编辑 .env，至少替换数据库密码、JWT_SECRET、域名和 CORS_ORIGIN
docker compose up -d --build
```

默认端口：

| 服务 | 地址 |
| --- | --- |
| Web | `http://localhost:8080` |
| API | `http://localhost:3000/api` |
| MySQL | `127.0.0.1:3306` |

生产部署前请阅读 [`部署方案.md`](部署方案.md) 和 [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md)，确认反向代理、HTTPS、微信域名校验、媒体资源访问、备份和日志策略均已配置。

## 环境变量

生产环境可复制 [`.env.production.example`](.env.production.example) 为 `.env` 后填写。关键配置包括：

- `APP_PUBLIC_BASE_URL`：对外访问地址。
- `CORS_ORIGIN`：允许访问 API 的前端来源，多个来源用逗号分隔。
- `JWT_SECRET`：至少 32 位的随机密钥。
- `DB_*`、`MYSQL_*`：数据库连接配置。
- `WECHAT_APP_ID`、`WECHAT_APP_SECRET`、`WECHAT_MOCK_MODE`：微信登录配置。
- `DEEPSEEK_API_KEY`、`AI_BASE_URL`、`AI_MODEL`：AI 助手配置。
- `MEDIA_DRIVER`、`MEDIA_PUBLIC_BASE_URL`：媒体资源存储与访问配置。

本地演示可以使用 mock 微信登录；正式环境必须关闭 mock，并填写真实微信配置。

## 目录结构

```text
BuyiDictionaryWeb/
├── buyi-dictionary-vue/                 # Vue Web 前端
├── BuyiDictionaryApp-main/
│   └── BuyiDictionaryApp-main/
│       ├── pages/                        # 微信小程序页面
│       ├── components/                   # 小程序组件
│       ├── utils/                        # 小程序工具与 API 封装
│       └── backend/                      # NestJS 后端
├── docs/                                 # 技术、开发、部署、API 与测试文档
├── deploy/                               # 部署相关配置
├── docker-compose.yml                    # Docker Compose 编排
├── .env.production.example               # 生产环境变量模板
├── ARCHITECTURE.md                       # 系统架构说明
├── CHANGELOG.md                          # 版本变更记录
├── CONTRIBUTING.md                        # 贡献指南
├── SECURITY.md                            # 安全策略
└── LICENSE.md                            # MIT 许可证
```

## 文档导航

- [系统架构](ARCHITECTURE.md)
- [快速启动指南](QUICKSTART.md)
- [开发指南](docs/DEVELOPMENT.md)
- [部署指南](docs/DEPLOYMENT.md)
- [API 参考](docs/API_REFERENCE.md)
- [测试指南](docs/TESTING.md)
- [贡献指南](CONTRIBUTING.md)
- [安全策略](SECURITY.md)
- [变更记录](CHANGELOG.md)

## 许可证与素材

代码以 MIT License 发布，详见 [`LICENSE.md`](LICENSE.md)。文化资料、图片、音频和民歌素材的来源与使用说明请阅读 [`buyi-dictionary-vue/docs/material-provenance.md`](buyi-dictionary-vue/docs/material-provenance.md)。使用或再分发非代码素材前，请单独核对其授权范围。
