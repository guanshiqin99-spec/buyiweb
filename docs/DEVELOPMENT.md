# 本地开发指南

> 本文档说明如何在本地搭建完整的开发环境，包括 Web 前端、后端、数据库与小程序。
>
> 最后更新：2026-07-21

---

## 一、环境准备

### 1.1 必装软件

| 软件 | 最低版本 | 推荐版本 | 说明 |
|------|---------|---------|------|
| Node.js | 18.0 | 20.x LTS | 后端 `engines.node` 限定 20.x |
| npm | 9.0 | 10.x | 随 Node 安装 |
| Git | 2.30 | 最新 | 版本控制 |
| 微信开发者工具 | 最新 | 最新 | 仅小程序开发需要 |
| VS Code | 最新 | 最新 | 推荐 IDE |

### 1.2 可选软件

- **MySQL 8.0+**：模拟生产数据库（开发默认用 SQLite，无需安装）
- **Docker Desktop**：使用 Docker Compose 一键启动
- **Postman / Insomnia**：API 调试
- **PM2**：本地模拟生产进程守护

### 1.3 VS Code 推荐插件

- Volar（Vue 3 支持）
- ESLint
- Prettier
- Tailwind CSS IntelliSense（即使项目未用 Tailwind，也有助于 CSS 提示）
- Docker
- NestJS Snippets

---

## 二、获取代码

```bash
git clone <repo-url> BuyiDictionaryWeb
cd BuyiDictionaryWeb
```

仓库结构：

```text
BuyiDictionaryWeb/
├── buyi-dictionary-vue/             # Web 前端
├── BuyiDictionaryApp-main/          # 小程序 + 后端
│   └── BuyiDictionaryApp-main/
│       ├── backend/                  # NestJS 后端
│       └── pages/                    # 小程序页面
├── docs/                            # 项目文档
└── README.md
```

---

## 三、启动后端

### 3.1 安装依赖

```bash
cd BuyiDictionaryApp-main/BuyiDictionaryApp-main/backend
npm install
```

国内网络较慢时可使用镜像：

```bash
npm install --registry=https://registry.npmmirror.com
```

### 3.2 配置环境变量

复制示例文件：

```bash
cp .env.example .env
```

开发环境推荐配置（`.env`）：

```env
NODE_ENV=development
PORT=3000

# 数据库（开发用 SQLite，零配置）
DB_TYPE=sqljs
DB_NAME=buyi-local.sqlite
DB_SYNCHRONIZE=true

# 微信（开发用 Mock 模式）
WECHAT_MOCK_MODE=true
WECHAT_APP_ID=wx_mock_app_id
WECHAT_APP_SECRET=wx_mock_app_secret

# 种子数据
SEED_ON_BOOT=true
DEFAULT_ADMIN_USERNAME=admin
DEFAULT_ADMIN_PASSWORD=Admin@123456

# JWT
JWT_SECRET=dev-secret-not-for-production

# CORS
CORS_ORIGIN=http://localhost:5173,http://localhost:8080
```

### 3.3 启动开发服务

```bash
npm run start:dev
```

启动成功后可访问：

| 地址 | 用途 |
|------|------|
| <http://127.0.0.1:3000/api> | API 根路径 |
| <http://127.0.0.1:3000/api/health> | 健康检查 |
| <http://127.0.0.1:3000/api/docs> | Swagger 文档 |
| <http://127.0.0.1:3000/admin-web/> | 后台管理界面 |

### 3.4 默认管理员

种子数据启用的默认账号：

- 用户名：`admin`
- 密码：`Admin@123456`

### 3.5 数据库迁移（可选）

开发环境 `DB_SYNCHRONIZE=true` 会自动建表，无需迁移。若需手动管理：

```bash
npm run db:migrate    # 执行迁移
npm run db:revert     # 回滚最近一次迁移
```

---

## 四、启动 Web 前端

### 4.1 安装依赖

```bash
cd buyi-dictionary-vue
npm install
```

### 4.2 配置环境变量

复制示例：

```bash
cp .env.development .env.local
```

默认配置（`.env.development`）已可直接使用，Vite 会通过 `vite.config.js` 中的 proxy 把 `/api` 与 `/uploads` 转发到 `http://127.0.0.1:3000`。

如需连接线上 API：

```env
VITE_API_BASE_URL=https://your-api.example.com/api
```

### 4.3 启动开发服务器

```bash
npm run dev
```

访问 <http://localhost:5173>。

### 4.4 开发提示

- 全局搜索热键：`/`（在输入框内不会误触发）
- 深色模式切换：设置页或顶部主题切换按钮
- AI 助手面板：右下角悬浮按钮，依赖后端 `/miniapp/agent/ask` SSE 接口
- 后端未运行时，依赖 API 的功能（登录、收藏、学习记录）会显示加载/错误状态

---

## 五、启动微信小程序

### 5.1 前置条件

- 已安装微信开发者工具
- 后端已在 `http://127.0.0.1:3000` 运行

### 5.2 导入项目

1. 打开微信开发者工具
2. 选择「导入项目」
3. 项目路径：`BuyiDictionaryApp-main/BuyiDictionaryApp-main`
4. AppID：可使用测试号（Mock 模式下不需要真实 AppID）

### 5.3 配置接口地址

小程序支持在小程序内「设置」页动态修改接口地址，默认开发地址为：

```text
http://127.0.0.1:3000/api
```

> 微信开发者工具中需在「详情 → 本地设置」勾选「不校验合法域名」才能访问 HTTP 接口。

---

## 六、一键启动（Windows）

仓库根目录提供了 Windows 批处理脚本：

| 脚本 | 用途 |
|------|------|
| [`启动后端.bat`](../启动后端.bat) | 启动 NestJS 后端 |
| [`启动前端.bat`](../启动前端.bat) | 启动 Vite 开发服务器 |
| [`启动竞赛包.bat`](../启动竞赛包.bat) | 同时启动前后端（用于竞赛演示） |
| [`导入示例数据.bat`](../导入示例数据.bat) | 执行 `npm run seed:data` |

双击即可运行，无需手动 `cd` 切换目录。

---

## 七、常用开发命令

### 7.1 Web 前端

```bash
cd buyi-dictionary-vue

npm run dev        # 启动开发服务器（端口 5173）
npm run build      # 生产构建（输出到 dist/）
npm run preview    # 预览生产构建
npm run lint       # ESLint 检查 + 自动修复
npm run format     # Prettier 格式化 src/
npm run test       # 运行单元测试
```

### 7.2 后端

```bash
cd BuyiDictionaryApp-main/BuyiDictionaryApp-main/backend

npm run start:dev      # 启动开发服务（watch 模式）
npm run build          # 编译 TypeScript 到 dist/
npm run start:prod     # 运行生产构建
npm run start          # 编译后启动（无 watch）

npm run db:migrate     # 执行数据库迁移
npm run db:revert      # 回滚最近一次迁移
npm run admin:init     # 初始化管理员账号
npm run seed:data      # 导入种子数据

npm test               # 运行 Jest 测试
npm run test:watch     # watch 模式测试
npm run lint           # TypeScript 类型检查
```

### 7.3 管理员初始化（生产）

```bash
npm run admin:init -- --username=admin --password=YourStrongPassword
```

---

## 八、调试技巧

### 8.1 后端断点调试（VS Code）

在 `.vscode/launch.json` 中添加：

```json
{
  "type": "node",
  "request": "launch",
  "name": "Debug Backend",
  "runtimeExecutable": "npm",
  "runtimeArgs": ["run", "start:dev"],
  "cwd": "${workspaceFolder}/BuyiDictionaryApp-main/BuyiDictionaryApp-main/backend",
  "sourceMaps": true
}
```

### 8.2 前端断点调试（VS Code）

安装 VS Code Chrome Debugger，配置 `launch.json`：

```json
{
  "type": "chrome",
  "request": "launch",
  "name": "Debug Frontend",
  "url": "http://localhost:5173",
  "webRoot": "${workspaceFolder}/buyi-dictionary-vue/src"
}
```

### 8.3 Swagger API 调试

访问 <http://127.0.0.1:3000/api/docs>，可直接在浏览器中：

- 查看所有 API 端点
- 在线发起请求
- 输入 token 调试鉴权接口

### 8.4 数据库查看

- **SQLite**（开发）：使用 DB Browser for SQLite 打开 `backend/buyi-local.sqlite`
- **MySQL**（生产）：使用 Navicat、DBeaver 或 MySQL Workbench

---

## 九、常见问题

### Q1：前端启动后接口全部 404？

**A**：后端未启动。先启动后端（端口 3000），Vite 会自动代理 `/api` 到后端。

### Q2：登录时提示「微信 code 无效」？

**A**：后端 `WECHAT_MOCK_MODE=true` 时会跳过真实微信校验。若关闭了 Mock 模式，需要配置真实的 `WECHAT_APP_ID` 与 `WECHAT_APP_SECRET`。

### Q3：小程序连不上后端？

**A**：检查小程序设置页中的接口地址是否为 `http://127.0.0.1:3000/api`，并确认微信开发者工具已勾选「不校验合法域名」。

### Q4：种子数据每次启动都会重复插入？

**A**：开发环境 `SEED_ON_BOOT=true` 会幂等插入，不会重复。生产环境必须设置为 `false`。

### Q5：图片显示不出来？

**A**：检查 `MEDIA_DRIVER` 与 `MEDIA_PUBLIC_BASE_URL` 配置。本地存储模式下，需保证 `uploads/` 目录可访问。

### Q6：构建前端后路由刷新 404？

**A**：生产环境需在 Nginx 配置 SPA 回退：`try_files $uri $uri/ /index.html;`，详见 [DEPLOYMENT.md](DEPLOYMENT.md)。

---

## 十、开发约定

详见 [CONTRIBUTING.md](../CONTRIBUTING.md)。摘要：

- 所有代码注释、文案、commit message 使用中文
- 前端优先使用 `<script setup>` + Composition API
- 后端遵循 NestJS 模块化约定，每个业务域独立模块
- 样式使用 CSS 变量令牌，不硬编码颜色
- 提交前运行 `npm run lint` 与 `npm test`
