# 布依族词典 - Vue 3 Web版

## 项目简介

这是一个布依族语言词典的Web版本，用于数字媒体竞赛。项目采用Vue 3 + Vite构建，具有以下特点：

- 🎨 Apple Liquid Glass设计风格
- 🎭 布依族蜡染靛蓝配色
- 📱 响应式设计，支持移动端
- 🎵 音频播放功能
- 🔍 词汇搜索功能

## 快速开始

### 1. 安装依赖

`ash
cd buyi-dictionary-vue
npm install
`

如果网络较慢，可以使用国内镜像：

`ash
npm install --registry=https://registry.npmmirror.com
`

### 2. 启动开发服务器

`ash
npm run dev
`

项目将在 http://localhost:3000 启动

### 3. 构建生产版本

`ash
npm run build
`

## 项目结构

`
src/
├── assets/
│   ├── images/          # 布依族文化图片
│   ├── styles/          # 全局样式
│   │   ├── variables.css    # CSS变量
│   │   └── main.css         # 全局样式
│   └── fonts/           # 字体文件
├── components/
│   ├── layout/          # 布局组件
│   │   ├── AppHeader.vue
│   │   └── AppFooter.vue
│   └── common/          # 通用组件
│       ├── LiquidGlass.vue
│       ├── SearchBar.vue
│       └── Card.vue
├── views/
│   ├── Home.vue         # 首页
│   ├── Dictionary.vue   # 词典页面
│   ├── Culture.vue      # 文化页面
│   ├── Songs.vue        # 民歌页面
│   └── Profile.vue      # 个人中心
├── stores/
│   ├── auth.js          # 认证状态
│   ├── player.js        # 播放器状态
│   └── favorites.js     # 收藏状态
├── router/
│   └── index.js         # 路由配置
└── utils/
    └── api.js           # API封装
`

## 功能特性

### 已实现
- ✅ 首页展示
- ✅ 词典搜索页面
- ✅ 文化介绍页面
- ✅ 民歌播放页面
- ✅ 个人中心页面
- ✅ Liquid Glass设计系统
- ✅ 响应式布局
- ✅ 音频播放器状态管理

### 待实现
- ⏳ 后端API对接
- ⏳ 用户登录功能
- ⏳ 收藏功能
- ⏳ 数据可视化
- ⏳ 民族纹样装饰

## 设计系统

项目使用Liquid Glass设计系统，具有以下特点：

- **品牌色彩**: 蜡染靛蓝 #3A6B8C、银饰银白 #E8E4E1、织锦暖橙 #D4883A
- **毛玻璃效果**: 半透明面板 + 背景模糊
- **动画效果**: 标题呼吸、导航水波、搜索聚焦
- **响应式**: 移动端汉堡菜单

## 后端API

项目预留了后端API接口，需要配合NestJS后端使用：

- 词汇搜索: GET /api/dictionary/search
- 短语查询: GET /api/phrases/search
- 谚语查询: GET /api/proverbs/search
- 民歌列表: GET /api/songs
- 用户登录: POST /api/auth/login

## 竞赛加分项

- 📊 数据可视化：词汇分布地图、声调曲线图
- 🎨 民族纹样装饰：蜡染鱼鸟纹、铜鼓太阳纹
- 🎤 发音波形可视化
- ♿ 无障碍设计：ARIA标签、键盘导航
- 🌙 深色模式支持

## 技术栈

- Vue 3 (Composition API)
- Vite (构建工具)
- Pinia (状态管理)
- Vue Router 4 (路由)
- Axios (HTTP请求)

## 许可证

MIT License
