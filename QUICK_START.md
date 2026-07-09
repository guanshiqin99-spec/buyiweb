# 布依族词典Web版 - 快速启动指南

## 系统要求

- Node.js 16+ (推荐 18+)
- npm 8+ 或 yarn 1.22+
- 现代浏览器（Chrome、Firefox、Safari、Edge）

## 快速开始

### 方式一：使用启动脚本（推荐）

#### Windows 用户
`ash
# 双击运行 start.bat
# 或者在命令行中执行：
start.bat
`

#### PowerShell 用户
`powershell
# 运行启动脚本：
.\start.ps1
`

### 方式二：手动启动

`ash
# 1. 进入项目目录
cd buyi-dictionary-vue

# 2. 安装依赖（如果网络慢，可使用淘宝镜像）
npm install
# 或者使用淘宝镜像：
npm install --registry=https://registry.npmmirror.com

# 3. 启动开发服务器
npm run dev
`

### 方式三：使用 yarn

`ash
# 1. 进入项目目录
cd buyi-dictionary-vue

# 2. 安装依赖
yarn install

# 3. 启动开发服务器
yarn dev
`

## 访问项目

启动成功后，打开浏览器访问：
- **本地访问**: http://localhost:3000
- **局域网访问**: http://[你的IP]:3000

## 项目结构

`
buyi-dictionary-vue/
├── src/
│   ├── assets/          # 资源文件
│   ├── components/      # 组件
│   │   ├── layout/     # 布局组件
│   │   ├── common/     # 通用组件
│   │   └── specific/   # 特定组件
│   ├── views/          # 页面
│   ├── stores/         # 状态管理
│   ├── router/         # 路由
│   └── utils/          # 工具函数
├── public/             # 静态资源
├── package.json        # 依赖配置
└── vite.config.js      # 构建配置
`

## 主要功能

### 已实现
- ✅ 首页展示
- ✅ 词典搜索
- ✅ 文化介绍
- ✅ 民歌播放
- ✅ 学习卡片
- ✅ 数据可视化
- ✅ 个人中心
- ✅ 响应式设计
- ✅ Liquid Glass 效果

### 待实现
- ⏳ 后端API对接
- ⏳ 用户登录
- ⏳ 收藏功能
- ⏳ 深色模式

## 开发命令

`ash
# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览生产版本
npm run preview

# 代码检查
npm run lint

# 代码格式化
npm run format
`

## 常见问题

### Q: npm install 超时怎么办？
A: 使用淘宝镜像：
`ash
npm install --registry=https://registry.npmmirror.com
`

### Q: 端口被占用怎么办？
A: Vite 会自动尝试其他端口，或者手动指定端口：
`ash
npm run dev -- --port 3001
`

### Q: 如何修改API地址？
A: 编辑 ite.config.js 中的 proxy 配置：
`javascript
server: {
  proxy: {
    '/api': {
      target: 'http://your-api-server:3000',
      changeOrigin: true
    }
  }
}
`

### Q: 如何添加新的页面？
A: 
1. 在 src/views/ 创建新的 Vue 组件
2. 在 src/router/index.js 添加路由配置
3. 在导航栏中添加链接（可选）

## 设计系统

项目使用 Liquid Glass 设计系统：

### 颜色变量
`css
--c-brand: #3A6B8C        /* 蜡染靛蓝 */
--c-accent: #D4883A       /* 织锦暖橙 */
--c-bg-warm: #F5F2EF      /* 暖白背景 */
--c-glass: rgba(255,255,255,0.45)  /* 玻璃效果 */
`

### 组件使用
`ue
<!-- 毛玻璃面板 -->
<div class="liquid-glass">
  内容
</div>

<!-- 卡片组件 -->
<Card padding="24px">
  内容
</Card>

<!-- 搜索框 -->
<SearchBar v-model="query" @search="handleSearch" />
`

## 部署

### 构建生产版本
`ash
npm run build
`

### 部署到静态服务器
将 dist 目录部署到任何静态文件服务器（Nginx、Apache、Vercel、Netlify 等）

### Docker 部署
`dockerfile
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
`

## 技术支持

如有问题，请参考：
- README.md - 项目说明
- IMPLEMENTATION_PLAN.md - 实施计划
- PROJECT_STRUCTURE.md - 项目结构

## 许可证

MIT License
