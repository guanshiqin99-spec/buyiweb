# 布依词典 Web - 前端验收 P2/P3 问题修复 Spec

## Why

依据 `buyi-dictionary-vue/docs/frontend-acceptance-report.md` 的验收结论，前端存在 7 项 P2（中优先级体验问题）与 6 项 P3（低优先级打磨项），共 13 项。这些问题不影响核心功能，但影响可维护性、视觉层级、移动端体验、无障碍合规与错误安全网。本 Spec 仅修复 P2/P3，**不修改 P0/P1**。

## What Changes

### P2 — 体验改进

- **Issue 10（样式碎片化）**：在 `variables.css` 中收敛重复定义的字体 token；在 `main.css` / `liquid-glass.css` 之间清理 `.reveal` 定义冲突与重复 keyframes（`revealIn`/`revealUp`、`titleBreath`/`titleBreathe`）；将散落在 `liquid-glass.css` 中的共享组件类（`.card-interactive`、`.glow-card`、`.stagger-enter` 等）归属关系在注释中明示，避免双轨维护。
- **Issue 11（内容类型映射重复）**：新建 `src/utils/contentTypes.js`，导出 `getContentLabel(type)` / `getContentRoute(type)` / `getContentApiPath(type)`；`Dictionary.vue`、`Profile.vue`、`Favorites.vue`、`api.js` 全部改为引用此模块；移除 `Dictionary.vue` 的 `word` 私有别名，统一以 API content type 作为唯一键空间，补齐缺失的 `song` 映射。
- **Issue 12（本地 token shadow）**：移除 `Culture.vue` 在 `.culture-page` 中对 20 个全局 token 的本地 shadow，改走 `[data-theme="dark"]` 渠道或新增页面级语义令牌；重构 `Songs.vue` 的 `.song-library` 改用 `.liquid-glass-quiet` 类，移除手工 `feTurbulence` 噪声 data-URI 与硬编码 hex（`#0a1f33`、`#8ac7d3` 等）。
- **Issue 13（动画密度过高）**：在工具页（Dictionary/Settings/Profile/Favorites/Record/Learn）裁剪堆叠的动画系统数量——视差 + reveal + 粒子最多保留其一；与现有 `redesign-frontend-visual-hierarchy` Spec 互补，本 Spec 只处理"数量裁剪"，彼 Spec 处理"动效参数调优"。
- **Issue 14（液玻过度使用）**：收敛 `liquid-glass` 使用范围——主操作区（Hero、模态、登录卡、搜索框）保留 `liquid-glass` / `liquid-glass-hero`；列表项、菜单项、统计卡、设置分组、收藏项、记录项等次级表面降级为 `liquid-glass-quiet` 或纯色卡片（基于 `--card` token），恢复视觉层级。
- **Issue 15（移动端抽屉无过渡）**：为 `AppHeader.vue` 移动端抽屉添加滑入/滑出过渡（transform + opacity）、半透明 scrim 遮罩（点击关闭）、Escape 键关闭、路由变化自动关闭。
- **Issue 16（API 层与业务耦合）**：将 `api.js` 中的鉴权刷新状态机（`isRefreshing` / `pendingQueue` / `notifySessionUpdated` / `settlePendingRequests` / 401 分支 / `clearAuthAndRedirect`）迁移到 `stores/auth.js` 的 action 或新建 `src/utils/authInterceptor.js`；将 `agentApi.askStream` SSE 流式逻辑迁移到 `src/utils/agentStream.js`；将状态码错误日志迁移到 `src/utils/logger.js`；`api.js` 仅保留 axios 实例、请求拦截器（附加 Bearer）与端点 URL 绑定。

### P3 — 细节打磨

- **Issue 17（首页定位偏文化）**：调整 `Home.vue` 文案与优先级——保留文化馆叙事基调，但把搜索入口视觉权重提到与品牌名同级；调整 Hero kicker 与 H1 文案，使"词典"作为产品定位在首屏可被快速识别。
- **Issue 18（响应式字号不一致）**：在 `variables.css` 中定义统一字号阶梯 token（`--font-h1`、`--font-h2`、`--font-h3`），各页面 H1/H2/H3 统一引用同一 token，修正 Home / Culture / Songs / Quiz 的 `clamp()` 不一致。
- **Issue 19（无全局错误边界）**：在 `main.js` 注册 `app.config.errorHandler`；在 `router/index.js` 注册 `router.onError` 处理懒加载失败；新增 404 catch-all 路由与 `src/views/NotFound.vue`；为 `<RouterView>` 包裹 `<Suspense>` + 错误回退。
- **Issue 20（测试覆盖不足）**：新增针对 `contentTypes.js`、`auth.js`（refresh 状态机）、`api.js`（端点 URL 绑定）的单元测试；扩展 `package.json` 的 `test` 脚本以包含新文件；测试沿用现有 `node:test` + `node:assert/strict` 栈，不引入新测试框架。
- **Issue 21（Quiz 对比度不足）**：为 `Quiz.vue` 背景图叠加半透明渐变 scrim（保留原图设计意图，仅在文字区域增强对比度）；为无 text-shadow 的 kicker / progress / score 文本添加最小阴影或改用对比度足够的颜色，使白字与金色 kicker 在 `bouyei-nature.jpg` 亮区满足 WCAG AA。
- **Issue 22（复习按钮语义错配）**：将 `Learn.vue` `handleReview` 改为调用 `recordsApi.create({ actionType: 'review' })`，与 `nextWord` 隐式记录的 `view` actionType 区分；与 `recordCurrentView` 去重状态解耦，独立维护 review 去重集合。

## Impact

- **受影响能力**：
  - 全站视觉层级与可维护性（Issue 10/12/14/18）
  - 内容类型管理（Issue 11）
  - 移动端导航体验（Issue 15）
  - 鉴权架构清晰度与可测试性（Issue 16）
  - 首页产品定位（Issue 17）
  - 全局错误安全网（Issue 19）
  - 测试覆盖（Issue 20）
  - Quiz 无障碍（Issue 21）
  - 学习记录语义正确性（Issue 22）
  - 工具页动画密度（Issue 13）
- **受影响代码**：
  - 样式：`src/assets/styles/variables.css`、`src/assets/styles/main.css`、`src/assets/styles/liquid-glass.css`
  - 视图：`src/views/Home.vue`、`src/views/Culture.vue`、`src/views/Songs.vue`、`src/views/Quiz.vue`、`src/views/Learn.vue`、`src/views/Dictionary.vue`、`src/views/Profile.vue`、`src/views/Favorites.vue`、`src/views/Record.vue`、`src/views/Settings.vue`、`src/views/Login.vue`、新增 `src/views/NotFound.vue`
  - 组件：`src/components/layout/AppHeader.vue`、`src/components/common/ToolPageShell.vue`、`src/components/common/PageShell.vue`
  - 工具：`src/utils/api.js`（拆分瘦身）、新增 `src/utils/contentTypes.js`、`src/utils/authInterceptor.js`、`src/utils/agentStream.js`、`src/utils/logger.js`
  - Store：`src/stores/auth.js`、`src/stores/favorites.js`（如需修正 song 类型映射）
  - 入口与路由：`src/main.js`、`src/router/index.js`、`src/App.vue`
  - 测试：`tests/`（新增文件）、`package.json`

## ADDED Requirements

### Requirement: 共享内容类型映射模块

The system SHALL provide a single source of truth for content-type mappings across all views and utilities.

#### Scenario: 内容类型查询

- **WHEN** 任意视图或工具需要由 API content type 得到中文标签、路由路径或 API 路径段
- **THEN** 调用 `src/utils/contentTypes.js` 导出的 `getContentLabel(type)` / `getContentRoute(type)` / `getContentApiPath(type)` 函数
- **THEN** `Dictionary.vue`、`Profile.vue`、`Favorites.vue`、`api.js` 不再本地定义这些映射

#### Scenario: 移除私有别名

- **WHEN** `Dictionary.vue` 处理搜索结果中的 `type` 字段
- **THEN** 不再使用 `word` 私有别名映射到 `dictionary`
- **THEN** 直接以 API content type（`dictionary` / `phrase` / `proverb` / `song`）作为唯一键空间
- **THEN** `song` 类型不再被静默降级为 `dictionary`

### Requirement: 全局错误边界

The system SHALL provide centralized error handling at the app and router level.

#### Scenario: 渲染期错误

- **WHEN** 任意组件在渲染或生命周期抛出未捕获错误
- **THEN** `app.config.errorHandler` 捕获并显示全局错误回退 UI（而非空白屏幕）
- **THEN** 错误被记录到 `logger.js`，不静默吞没

#### Scenario: 路由懒加载失败

- **WHEN** 异步路由 chunk 加载失败（网络错误或部署 hash 不匹配）
- **THEN** `router.onError` 捕获并提示用户刷新重试

#### Scenario: 未知路径

- **WHEN** 用户访问未定义的路由
- **THEN** 命中 404 catch-all 路由，渲染 `NotFound.vue`

### Requirement: 移动端导航抽屉过渡

The system SHALL animate the mobile drawer with a slide/fade transition and provide standard dismiss affordances.

#### Scenario: 抽屉打开/关闭

- **WHEN** 用户点击汉堡按钮
- **THEN** 抽屉以 `transform: translateY` + `opacity` 过渡滑入，时长 ≤ 250ms，缓动 `ease-out`
- **THEN** 同时显示半透明 scrim 遮罩，点击 scrim 关闭抽屉
- **THEN** 抽屉关闭时反向播放过渡

#### Scenario: 键盘与路由关闭

- **WHEN** 抽屉打开时按下 Escape
- **THEN** 抽屉关闭
- **WHEN** 抽屉打开时路由发生变化（含编程式导航）
- **THEN** 抽屉自动关闭

### Requirement: 鉴权刷新状态机模块

The system SHALL move the token-refresh orchestration out of `api.js` into the auth store or a store-owned interceptor module.

#### Scenario: 401 自动刷新

- **WHEN** 响应拦截器收到 401 且存在 `refreshToken`
- **THEN** 调用 auth store 的 `tryRefresh()` action
- **THEN** auth store 拥有 `isRefreshing` / `pendingQueue` 状态，刷新成功后重放队列
- **THEN** 刷新失败时清除会话并重定向到 `/login`
- **THEN** `api.js` 不直接写 `localStorage.token`，auth store 是唯一写入者

#### Scenario: agent 流式接口独立

- **WHEN** 调用 `agentApi.askStream`
- **THEN** 该函数位于 `src/utils/agentStream.js`，使用独立的 fetch + SSE 实现，不与 axios 实例混用

## MODIFIED Requirements

### Requirement: 液玻效果使用范围

`liquid-glass` 系列类 SHALL 仅用于视觉层级中的"主操作区"，次级表面降级使用。

#### Scenario: 主操作区保留

- **WHEN** 渲染 Hero、模态、登录卡、搜索框、Agent 面板等核心交互元素
- **THEN** 保留 `liquid-glass` / `liquid-glass-hero` / `liquid-glass-content`

#### Scenario: 次级表面降级

- **WHEN** 渲染列表项、菜单项、统计卡、设置分组、收藏项、记录项等次级表面
- **THEN** 使用 `liquid-glass-quiet` 或基于 `--card` token 的纯色卡片
- **THEN** 不再与主操作区使用相同强度的玻璃材质，恢复视觉层级

### Requirement: 全局令牌不被本地 shadow

页面级深色主题 SHALL 通过 `[data-theme="dark"]` 渠道实现，不在视图 scoped style 中重新指向 `--c-*` 全局令牌。

#### Scenario: 深色沉浸页

- **WHEN** `Culture.vue` / `Songs.vue` 需要深色沉浸氛围
- **THEN** 通过在根元素上设置 `data-theme="dark"` 或新增页面级语义令牌（如 `--page-surface`、`--page-ink`）实现
- **THEN** 不在 scoped style 中重新定义 `--c-text`、`--c-brand`、`--c-divider`、`--c-accent`、`--c-focus` 等已有全局令牌

#### Scenario: Songs.vue 玻璃材质统一

- **WHEN** `Songs.vue` 渲染 `.song-library` 容器
- **THEN** 应用 `.liquid-glass-quiet` 类，不再手工实现 `feTurbulence` 噪声与 inset-shadow 栈
- **THEN** 不再硬编码 `#0a1f33`、`#0d2842`、`#0f2d4a`、`#8ac7d3` 等色值

### Requirement: 统一字号阶梯

页面 H1 / H2 / H3 SHALL 引用 `variables.css` 中定义的字号 token，不在 scoped style 中各自 `clamp()`。

#### Scenario: 字号引用

- **WHEN** 任何视图定义 H1
- **THEN** 使用 `font-size: var(--font-h1)`
- **WHEN** 任何视图定义 H2
- **THEN** 使用 `font-size: var(--font-h2)`
- **WHEN** 任何视图定义 H3
- **THEN** 使用 `font-size: var(--font-h3)`
- **THEN** 不再出现 `clamp(45px, 13vw, 70px)` 等页面私有 clamp

### Requirement: 学习记录语义区分

`Learn.vue` 的"复习"按钮 SHALL 发出与"下一词"不同的 `actionType`。

#### Scenario: 用户点击复习

- **WHEN** 用户点击"复习"按钮
- **THEN** 调用 `recordsApi.create({ contentType: 'dictionary', contentId, actionType: 'review' })`
- **THEN** 与 `nextWord` 隐式记录的 `view` actionType 互不干扰
- **THEN** review 与 view 各自维护独立去重集合，允许同一卡片在同一次访问中同时产生两类记录

### Requirement: Quiz 背景文字对比度

`Quiz.vue` 标题与正文 SHALL 在 `bouyei-nature.jpg` 任意区域满足 WCAG AA 对比度。

#### Scenario: 文字区域对比度

- **WHEN** 渲染 `.quiz-intro h1`、`.quiz-question h1`、`.quiz-result h1`
- **THEN** 在文字背后叠加渐变 scrim（不覆盖整图，仅在文字区域增强对比度）
- **THEN** 或为文本添加最小 `text-shadow`（≥ `0 2px 18px rgba(7,23,36,.85)`）

#### Scenario: 无阴影文本修复

- **WHEN** 渲染 `.quiz-intro > p`（kicker）、`.quiz-question header`（progress）、`.quiz-result h1`（score）、`.quiz-result > span` 等当前无阴影文本
- **THEN** 添加最小阴影，或改用 `var(--c-white)` + 阴影，或置于 scrim 之上

### Requirement: 首页词典定位优先级

`Home.vue` SHALL 使词典作为产品核心定位在首屏可被快速识别。

#### Scenario: Hero 文案与权重

- **WHEN** 用户首次进入首页
- **THEN** Hero kicker 不再仅写"布依数字文化馆"，调整为同时体现词典定位的文案（如"布依词典 · 数字文化馆"）
- **THEN** H1 与"开始查词" CTA 视觉权重与品牌名同级
- **THEN** 保留文化馆叙事基调，不删除文化展区

### Requirement: 工具页动画密度收敛

工具页（Dictionary/Settings/Profile/Favorites/Record/Learn）SHALL 限制堆叠的动画系统数量。

#### Scenario: 动画系统裁剪

- **WHEN** 工具页通过 `PageShell` 渲染
- **THEN** 视差、粒子、Hero stagger 入场最多保留其一
- **THEN** 卡片 hover lift 仅保留 transform，移除强发光
- **THEN** IntersectionObserver reveal 仅触发一次

## Constraints

- 仅修复 P2/P3，不修改 P0/P1（详见 `frontend-acceptance-report.md` Issue 1–9）
- 不创建任何非必要的文档文件（除 spec.md / tasks.md / checklist.md 外）
- 遵循用户偏好：最小化改动、不修改测试逻辑除非新增测试
- 与现有 `redesign-frontend-visual-hierarchy` Spec 互补：本 Spec 处理"数量裁剪"与"层级恢复"，彼 Spec 处理"动效参数调优"
- skill 应用范围：
  - `redis-development`：无直接关联场景（本任务无 Redis 使用），不强行套用
  - `security-best-practices`：适用于 Issue 16（鉴权状态机迁移不应引入新的不安全模式，如 token 不应在多个写入者之间漂移）
  - `web-design-guidelines`：适用于 Issue 15 / 21（无障碍、键盘交互、对比度）
  - `frontend-skill`：适用于 Issue 14 / 17 / 18（视觉层级、排版、克制）
- 不删除、不回滚用户已有改动
