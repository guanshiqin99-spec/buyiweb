# 快速启动指南

## 环境要求

- Node.js 18 及以上
- npm（或 pnpm / yarn）

## 安装依赖

```bash
cd d:\BuyiDictionaryWeb\buyi-dictionary-vue
npm install
```

## 启动开发服务器

```bash
npm run dev
```

默认访问地址：`http://localhost:5173/`

## 构建生产版本

```bash
npm run build
```

构建产物输出到 `dist/` 目录。

## 预览生产构建

```bash
npm run preview
```

## 常用命令

| 命令 | 说明 |
|------|------|
| `npm run dev` | 启动本地开发服务器 |
| `npm run build` | 生产构建 |
| `npm run preview` | 预览生产构建 |

## 项目结构

```
src/
  components/    # 公共组件与业务组件
  views/         # 页面级 Vue 组件
  stores/        # Pinia 状态管理
  utils/         # 工具函数与 API 封装
  assets/        # 图片、字体等静态资源
```

## 开发提示

- 后端服务未启动时，部分依赖 API 的功能（如登录、收藏、学习记录）无法完整验证，但前端页面可正常浏览。
- 全局搜索热键为 `/`，在输入框、文本域内不会误触发。
- 项目使用 Vue 3 + Vite + Pinia，样式基于 CSS 变量与 scoped CSS。
