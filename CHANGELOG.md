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
