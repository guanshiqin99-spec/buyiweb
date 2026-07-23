# 变更记录

> 本文档记录布依族词典项目的版本变更。
>
> 格式参考 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.0.0/)，版本号遵循 [SemVer](https://semver.org/lang/zh-CN/)。

---

## [Unreleased]

### 计划中

- 接入真实音频播放（替换模拟播放器）
- 完善后端测试覆盖率（miniapp-auth / content-import / media service）
- 移动端 Web 端适配优化

### 新增

- **小程序 AI 导览员**：新增 `components/agent-panel/` 与 `utils/agentStream.js`，在 `app.json` 全局注册后挂载到 home / query / quiz 三个页面，通过云函数 `apiProxy` 对接后端 `/miniapp/agent/*`
- **小程序 query 页 AI 工具区**：词条结果内新增「AI 造句 / AI 推荐」按钮与结果展示区
- **小程序 quiz 页 AI 五题挑战**：新增「AI 五题挑战」入口，由 DeepSeek 实时生成 5 道布依文化题
- **Web 词典移动端详情弹窗**：抽出 `buyi-dictionary-vue/src/components/specific/DictionaryEntryDetail.vue` 复用详情渲染；`Dictionary.vue` 在窄屏（≤860px）下改为点击词条弹出底部悬浮弹窗，解决竖屏数据量大时详解卡片掉到底部的问题
- **部署方案（Cloudflare Named Tunnel）**：`部署方案.md` 重写，落地北京 ECS（39.96.81.132）+ Cloudflare Named Tunnel（`api.buyitech.asia`）+ Cloudflare Pages 前端的三段式架构，cloudflared 安装为 systemd 守护进程保证开机自启

### 变更

- **小程序 AI 导览员弹窗遮挡导航栏修复**：`components/agent-panel/agent-panel.js` 新增 `_toggleTabBar` 方法，面板展开时调用 `wx.hideTabBar`、关闭时调用 `wx.showTabBar`，并通过 `app.eventBus` 广播 `tabbar:hide` / `tabbar:show` 事件，组件 `detached` 时恢复 TabBar；`agent-panel.wxss` 输入区 `padding-bottom` 调整为 `calc(24rpx + env(safe-area-inset-bottom))` 适配全面屏安全区，解决 AI 面板覆盖底部导航栏导致无法切页的问题
- **云函数 apiProxy**：`cloudfunctions/apiProxy/index.js` 对 `/miniapp/agent/*` 路径新增 `requestStream` 流式累积逻辑（解析 SSE `delta`/`done`/`error` 事件后一次性返回完整结果）；`BACKEND_BASE` 由 `:3000` 改为 `:80`（走 Nginx 入口）；`cloudbaserc.json` 云函数超时调整为 60s；`app.js` 的 `wx.cloud.callFunction` 透传 `timeout`
- **Web 个人中心徽章视觉**：`Profile.vue` 徽章增加「已解锁 / 未解锁」状态文案与差异化样式（已解锁品牌色描边 + 光晕，未解锁灰度 + 虚线边框）
- **Web 民歌媒体 URL 解析**：`buyi-dictionary-vue/src/data/playableSongs.js` 新增 `resolveMediaUrl`，自动把后端返回的相对路径（如 `/uploads/...`）拼接为完整媒体域名
- **bat 脚本路径**：`启动前端.bat` / `启动后端.bat` / `导入示例数据.bat` 中的硬编码 `D:\BuyiDictionaryWeb\...` 改为 `%~dp0` 相对路径，仓库迁移目录后不再报错
- **deploy_ssh.py**：新增 `--shell` 第三参数模式，调用 `run_shell` 而非 `run_ssh`

### 安全

- **Vercel 弱 JWT_SECRET 处置**：删除 `BuyiDictionaryApp-main/BuyiDictionaryApp-main/backend/vercel.json`，通过 Vercel CLI 下线并删除 `backend`（backend-nine-alpha-35.vercel.app）与 `buyi-dictionary-vue`（buyi-dictionary-vue.vercel.app）两个 Vercel 项目，项目列表已确认为空，风险消除

### 移除

- 删除根目录 `DEPLOY.md`（旧版部署文档，已被重写后的 `部署方案.md` 取代）

---

## [1.0.0] — 2026-07-21

### 新增

- **Web 前端**：Vue 3 + Vite 5 + Pinia SPA 项目
  - 10 个页面视图（首页、词典、文化、民歌、学习、收藏、个人、记录、设置、登录）
  - 6 个 Pinia store（auth / player / favorites / search / theme / agent）
  - Liquid Glass 设计系统 + 蜡染靛蓝配色
  - 深色模式（light / dark / auto）
  - 无障碍设计（ARIA、键盘导航、`prefers-reduced-motion`）
  - AI 助手 SSE 流式问答
  - 全局搜索热键 `/`
  - 鼠标光标光晕跟随
  - 液态玻璃光学材质（光标跟随、视差滚动）

- **后端**：NestJS 11 + TypeORM 0.3
  - 17 个 TypeORM 实体
  - 小程序接口 `/api/miniapp/*`（15 个模块）
  - 后台接口 `/api/admin/*`（6 个模块）
  - 健康检查与就绪检查
  - Swagger 自动文档
  - 双令牌认证（access + refresh）
  - session 级 logout（令牌立即失效）
  - RBAC 角色权限
  - 登录失败锁定
  - 微信小程序登录（code2session）
  - 微信学习提醒订阅消息
  - DeepSeek AI 集成
  - 媒体上传（图片/音频，MIME 白名单）
  - Excel 模板下载、导入预览、批量导入
  - 数据库迁移工具
  - 管理员初始化脚本
  - 生产环境强校验（拒绝不安全默认值启动）

- **微信小程序**：原生小程序
  - 15 个页面
  - 自定义 tabBar
  - 深色模式支持
  - 运行时接口地址配置
  - 学习提醒 Service Worker

- **基础设施**
  - Docker Compose 一键部署
  - Nginx 配置示例
  - PM2 进程守护示例
  - 一键启动批处理脚本（Windows）

### 文档

- 项目根目录标准化文档
  - README.md（项目总览）
  - ARCHITECTURE.md（系统架构）
  - CONTRIBUTING.md（贡献指南）
  - SECURITY.md（安全策略）
  - CHANGELOG.md（本文件）
  - LICENSE.md（MIT 许可证）
- `docs/` 专题文档
  - TECH_STACK.md（技术栈）
  - DEVELOPMENT.md（本地开发）
  - DEPLOYMENT.md（部署指南）
  - API_REFERENCE.md（API 参考）
  - TESTING.md（测试指南）
- 子项目各自 README 与专题文档

### 已知限制

- **播放器为模拟实现**：`player.js` 用 `requestAnimationFrame` 模拟进度推进，时长硬编码 222 秒，未接入真实音频文件
- **AI 助手依赖后端**：`agentApi.askStream` 需后端 `/miniapp/agent/ask` 返回 SSE 流
- **图片资源未压缩**：部分首页背景图超过 1MB，影响首屏性能
- **内容深度有限**：词条、短语、谚语数量较少，需通过后台 Excel 批量导入扩展

---

## 变更类型说明

- `新增`：新增的功能
- `变更`：对已有功能的修改
- `弃用`：即将移除的功能
- `移除`：本版本移除的功能
- `修复`：缺陷修复
- `安全`：安全相关修复

---

## 历史版本链接

- [Unreleased](https://github.com/your-repo/compare/v1.0.0...HEAD)
- [1.0.0](https://github.com/your-repo/releases/tag/v1.0.0)
