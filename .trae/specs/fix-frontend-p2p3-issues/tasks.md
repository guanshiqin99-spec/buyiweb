# Tasks

## 阶段 1：架构抽取（可并行启动）

- [x] Task 1: 创建共享内容类型映射模块（Issue 11）
  - [x] SubTask 1.1: 新建 `src/utils/contentTypes.js`
  - [x] SubTask 1.2: 重构 `Dictionary.vue` — 移除 `typeToContentType`，改用 `getContentLabel`
  - [x] SubTask 1.3: 重构 `Profile.vue` — 移除 `typeLabels`
  - [x] SubTask 1.4: 重构 `Favorites.vue` — 移除 `typeLabels` / `typePaths`
  - [x] SubTask 1.5: 重构 `api.js` — 移除 `CONTENT_PATHS`
  - [x] SubTask 1.6（补充）: 重构 `Record.vue` — 移除 `typeLabels`
- [x] Task 2: 拆分 api.js — 抽取鉴权状态机与流式客户端（Issue 16）
  - [x] SubTask 2.1: 新建 `src/utils/logger.js`
  - [x] SubTask 2.2: 新建 `src/utils/authInterceptor.js`
  - [x] SubTask 2.3: `stores/auth.js` 新增 `tryRefresh()` action
  - [x] SubTask 2.4: 新建 `src/utils/agentStream.js`
  - [x] SubTask 2.5: 瘦身 `api.js`
  - [x] SubTask 2.6: 修改 `stores/agent.js` 引用
  - [x] SubTask 2.7: 修改 `main.js` 调用 `installAuthInterceptor`

## 阶段 2：样式系统收敛

- [x] Task 3: 统一 variables.css 字体 token 与字号阶梯（Issue 10/18）
  - [x] SubTask 3.1: 移除 `variables.css` 中重复定义的 `--font-sans` / `--font-serif` / `--font-mono`
  - [x] SubTask 3.2: 在 `variables.css` 中新增 `--font-h1` / `--font-h2` / `--font-h3` 字号阶梯 token
- [x] Task 4: 收敛 main.css / liquid-glass.css（Issue 10）
  - [x] SubTask 4.1: 解决 `.reveal` 双重定义冲突
  - [x] SubTask 4.2: 删除 `titleBreath` 死代码（保留实际使用的 `titleBreathe`）
  - [x] SubTask 4.3: 明示共享组件类归属注释
- [x] Task 5: 移除 Culture.vue 本地 token shadow（Issue 12）
- [x] Task 6: 重构 Songs.vue .song-library 改用 .liquid-glass-quiet（Issue 12）

## 阶段 3：视觉层级恢复（依赖阶段 2）

- [~] Task 7: ~~收敛 liquid-glass 使用范围（Issue 14）~~ [SKIPPED - 用户指示不执行]
- [x] Task 8: 工具页减少堆叠动画系统（Issue 13）

## 阶段 4：移动端与首页（可并行）

- [x] Task 9: AppHeader 移动端抽屉过渡与关闭交互（Issue 15）
- [~] Task 10: ~~Home.vue 调整词典定位优先级（Issue 17）~~ [SKIPPED - 用户指示不执行]

## 阶段 5：错误边界与对比度（可并行）

- [x] Task 11: 注册全局错误处理器与 404 路由（Issue 19）
- [x] Task 12: Quiz.vue 背景对比度修复（Issue 21）

## 阶段 6：业务语义与测试

- [x] Task 13: Learn.vue 复习按钮 actionType 区分（Issue 22）
- [x] Task 14: 新增单元测试覆盖新模块（Issue 20）

## 阶段 7：验证

- [x] Task 15: 构建与回归验证

# Task Dependencies

- Task 1、Task 2 互相独立，可并行
- Task 3 独立
- Task 4 依赖 Task 3
- Task 5、Task 6 依赖 Task 3，可与 Task 4 并行
- Task 7 依赖 Task 4、5、6 [SKIPPED]
- Task 8 依赖 Task 4
- Task 9、Task 10、Task 11、Task 12 互相独立，可并行 [Task 10 SKIPPED]
- Task 13 独立
- Task 14 依赖 Task 1、Task 2
- Task 15 依赖全部上游任务
