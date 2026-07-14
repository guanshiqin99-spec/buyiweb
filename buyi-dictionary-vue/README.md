# 布依族词典 - Vue 3 Web版

## 项目简介

布依族语言词典的 Web 版本，用于数字媒体竞赛。采用 Vue 3 + Vite 构建，融合布依族蜡染靛蓝配色与 Apple Liquid Glass 设计风格，提供词典查询、文化探索、民歌欣赏、学习打卡等功能。

- 🎨 Liquid Glass 设计风格 + 布依族蜡染靛蓝配色
- 📱 响应式设计，支持移动端
- 🌙 深色模式（light / dark / auto 跟随系统）
- ♿ 无障碍设计：ARIA 标签、键盘导航、焦点管理
- 🔍 词汇搜索与学习卡片
- 🎵 音频播放与进度控制

## 快速开始

### 1. 安装依赖

```bash
cd buyi-dictionary-vue
npm install
```

网络较慢时使用国内镜像：

```bash
npm install --registry=https://registry.npmmirror.com
```

### 2. 启动开发服务器

```bash
npm run dev
```

项目将在 http://localhost:5173 启动（端口被占用时自动递增）。

### 3. 构建生产版本

```bash
npm run build
```

构建产物输出至 `dist/`。

## 项目结构

```
src/
├── assets/
│   ├── images/          # 布依族文化图片与背景
│   └── styles/          # 全局样式
│       ├── variables.css     # 设计令牌（颜色/字体/阴影/深色模式）
│       ├── main.css          # 基础排版与 Vue 特有样式
│       └── liquid-glass.css  # 液态玻璃光学材质
├── components/
│   ├── layout/          # 布局组件
│   │   ├── AppHeader.vue
│   │   └── AppFooter.vue
│   ├── common/          # 通用组件
│   │   ├── Card.vue
│   │   ├── CursorGlow.vue
│   │   ├── FloatingParticles.vue
│   │   ├── LiquidGlass.vue
│   │   ├── PageShell.vue
│   │   ├── SearchBar.vue
│   │   └── SearchModal.vue
│   └── specific/        # 业务组件
│       ├── AgentPanel.vue
│       ├── AudioPlayer.vue
│       ├── BarChart.vue
│       ├── LearningCard.vue
│       ├── PatternDecoration.vue
│       ├── ToneChart.vue
│       └── WordCard.vue
├── views/               # 页面视图
│   ├── Home.vue         # 首页
│   ├── Dictionary.vue   # 词典查询
│   ├── Culture.vue      # 文化探索
│   ├── Songs.vue        # 民歌欣赏
│   ├── Learn.vue        # 学习打卡
│   ├── Favorites.vue    # 收藏
│   ├── Profile.vue      # 个人中心
│   ├── Record.vue       # 学习记录
│   ├── Settings.vue     # 设置
│   └── Login.vue        # 登录注册
├── stores/              # Pinia 状态管理
│   ├── auth.js          # 认证
│   ├── player.js        # 播放器
│   ├── favorites.js     # 收藏
│   ├── search.js        # 搜索
│   ├── theme.js         # 主题
│   └── agent.js         # AI 助手
├── router/
│   └── index.js         # 路由配置（含鉴权守卫）
└── utils/
    ├── api.js           # API 封装
    ├── cursorGlow.js    # 光标光晕
    └── liquidGlass.js   # 玻璃材质交互
```

## 功能特性

- ✅ 首页展示与视差背景
- ✅ 词典搜索（拼音/汉字/布依文）
- ✅ 文化探索（声调曲线图、词汇分布柱状图）
- ✅ 民歌播放（完整播放器、进度拖动、键盘/触屏支持）
- ✅ 学习卡片翻转打卡
- ✅ 收藏管理
- ✅ 用户登录注册
- ✅ 学习记录
- ✅ 深色模式（手动 / 跟随系统）
- ✅ Liquid Glass 设计系统
- ✅ 响应式布局
- ✅ 无障碍设计（键盘导航、ARIA、焦点管理）
- ✅ AI 助手面板

## 设计系统

项目使用 Liquid Glass 设计系统，基于 CSS 变量令牌管理：

- **品牌色彩**：蜡染靛蓝 `#3A6B8C`、银饰银白 `#E8E4E1`、织锦暖橙 `#D4883A`
- **深色模式**：通过 `[data-theme="dark"]` 覆盖令牌，`color-scheme: dark` 同步原生 UI
- **毛玻璃效果**：`backdrop-filter` + 菲涅尔边框高光
- **动画**：遵循 `prefers-reduced-motion`，仅动画 `transform`/`opacity`

## 后端 API

项目预留后端接口，需配合 NestJS 后端使用（开发时通过 Vite 代理转发至 `http://127.0.0.1:3000`）：

- 词汇搜索：`GET /api/dictionary/search`
- 短语查询：`GET /api/phrases/search`
- 谚语查询：`GET /api/proverbs/search`
- 民歌列表：`GET /api/songs`
- 用户登录：`POST /api/auth/login`

## 技术栈

- Vue 3 (Composition API)
- Vite 5 (构建工具)
- Pinia (状态管理)
- Vue Router 4 (路由)
- Axios (HTTP 请求)

## 许可证

MIT License
