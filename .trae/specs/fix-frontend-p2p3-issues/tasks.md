# Tasks

## 阶段 1：架构抽取（可并行启动）

- [ ] Task 1: 创建共享内容类型映射模块（Issue 11）
  - [ ] SubTask 1.1: 新建 `src/utils/contentTypes.js`，导出 `getContentLabel(type)`、`getContentRoute(type)`、`getContentApiPath(type)` 三个纯函数，内部基于单一 canonical 数组 `[{ key: 'dictionary', label: '词汇', route: '/dictionary', apiPath: 'dictionary' }, ...]` 派生
  - [ ] SubTask 1.2: 重构 `Dictionary.vue` — 移除 `typeToContentType` 私有别名映射，移除 `filters` 与 `getTypeLabel` 中的本地 label 表，改用 `getContentLabel`；调用处（line 73/165/180）直接传 API content type
  - [ ] SubTask 1.3: 重构 `Profile.vue` — 移除 `typeLabels`（lines 21-26），`typeChartData` 改用 `getContentLabel(k)`
  - [ ] SubTask 1.4: 重构 `Favorites.vue` — 移除 `typeLabels`（14-19）与 `typePaths`（21-26），改用 `getContentLabel` / `getContentRoute`
  - [ ] SubTask 1.5: 重构 `api.js` — 移除 `CONTENT_PATHS`（145-150），`contentApi` 改用 `getContentApiPath`
- [ ] Task 2: 拆分 api.js — 抽取鉴权状态机与流式客户端（Issue 16）
  - [ ] SubTask 2.1: 新建 `src/utils/logger.js`，导出 `logApiError(error)` 函数，封装现有 403/404/500/network 状态码日志逻辑（迁移自 api.js 87-106）
  - [ ] SubTask 2.2: 新建 `src/utils/authInterceptor.js`，迁移 `AUTH_SESSION_UPDATED_EVENT`、`AUTH_SESSION_CLEARED_EVENT` 常量、`isRefreshing`、`pendingQueue`、`settlePendingRequests`、`notifySessionUpdated`、`clearAuthAndRedirect`、401 分支逻辑；导出 `installAuthInterceptor(axiosInstance, authStore)` 安装函数
  - [ ] SubTask 2.3: 在 `stores/auth.js` 中新增 `tryRefresh()` action，封装 refresh token 调用 + 队列重放 + 失败清理 + 重定向；auth store 成为 `localStorage.token` 的唯一写入者
  - [ ] SubTask 2.4: 新建 `src/utils/agentStream.js`，迁移 `agentApi.askStream` 的 fetch + SSE 逻辑（api.js 184-247）
  - [ ] SubTask 2.5: 瘦身 `api.js` — 仅保留 axios 实例、请求拦截器（附加 Bearer）、响应成功 unwrap、端点 URL 绑定；调用 `installAuthInterceptor(api, authStore)` 安装鉴权拦截器
  - [ ] SubTask 2.6: 校验 `stores/agent.js` 对 `agentApi.askStream` 的引用改为从 `agentStream.js` 导入

## 阶段 2：样式系统收敛

- [ ] Task 3: 统一 variables.css 字体 token 与字号阶梯（Issue 10 / 18）
  - [ ] SubTask 3.1: 移除 `variables.css` 中重复定义的 `--font-sans` / `--font-serif` / `--font-mono`（lines 33-35 与 158-160 重复），保留单一定义
  - [ ] SubTask 3.2: 在 `variables.css` 中新增统一字号阶梯 token：`--font-h1: clamp(38px, 6vw, 66px)`、`--font-h2: clamp(28px, 4vw, 48px)`、`--font-h3: clamp(22px, 3vw, 32px)`，并补充深色模式覆盖（如需）
- [ ] Task 4: 收敛 main.css / liquid-glass.css（Issue 10）
  - [ ] SubTask 4.1: 解决 `.reveal` 双重定义冲突 — 保留 `main.css` 中受 `.motion-ready` 门控的版本（keyframe `revealIn`），移除 `liquid-glass.css` lines 366-375 的重复版本与 `revealUp` keyframe
  - [ ] SubTask 4.2: 合并 `titleBreath` / `titleBreathe` 两个 keyframe 为单一 `titleBreath`
  - [ ] SubTask 4.3: 在 `liquid-glass.css` 与 `main.css` 顶部注释中明示共享组件类（`.card-interactive`、`.glow-card`、`.stagger-enter`、`.section-divider`、`.img-container`、`.pulse-hover`、`.no-scrollbar`）归属 `liquid-glass.css`，`main.css` 仅保留 Vue 特有动画与排版
- [ ] Task 5: 移除 Culture.vue 本地 token shadow（Issue 12）
  - [ ] SubTask 5.1: 在 `Culture.vue` 根元素（`.culture-page`）改为设置 `data-theme="dark"`，或新增页面级语义令牌 `--page-surface`、`--page-ink`、`--page-muted`、`--page-accent`、`--page-border` 替代 `--culture-*` 与本地 shadow 的 `--c-*`
  - [ ] SubTask 5.2: 删除 scoped style lines 233-267 中对 `--background`、`--c-text*`、`--c-brand*`、`--c-accent*`、`--c-bg-silver`、`--c-divider`、`--c-focus` 共 20 个全局 token 的本地重新指向
  - [ ] SubTask 5.3: 将 scoped style 中所有 `var(--culture-*)` 引用替换为新的 `--page-*` 或全局令牌引用
  - [ ] SubTask 5.4: 验证 Culture 页面在浅色 / 深色模式下渲染正确，无视觉回归
- [ ] Task 6: 重构 Songs.vue .song-library 改用 .liquid-glass-quiet（Issue 12）
  - [ ] SubTask 6.1: 删除 `.song-library` 中手工 `feTurbulence` 噪声 data-URI、inset-shadow 栈、`backdrop-filter` 重写（lines 197-224），改用 `class="liquid-glass-quiet"`
  - [ ] SubTask 6.2: 删除 `--song-*` 命名空间与硬编码 hex（`#0a1f33`、`#0d2842`、`#0f2d4a`、`#8ac7d3`），改用 `--page-*` 语义令牌或全局令牌
  - [ ] SubTask 6.3: 验证 Songs 页面渲染正确，无视觉回归

## 阶段 3：视觉层级恢复（依赖阶段 2）

- [ ] Task 7: 收敛 liquid-glass 使用范围（Issue 14）
  - [ ] SubTask 7.1: 在 `Profile.vue` 中将 `.stat-card`、`.chart-card`、`.menu-list` 由 `liquid-glass liquid-glass-content` 降级为 `liquid-glass-quiet`
  - [ ] SubTask 7.2: 在 `Record.vue` 中将 `.stat-card`、`.type-breakdown`、`.record-item` 降级为 `liquid-glass-quiet`
  - [ ] SubTask 7.3: 在 `Favorites.vue` 中将 `.fav-item` 降级为 `liquid-glass-quiet`
  - [ ] SubTask 7.4: 在 `Settings.vue` 中将 4 个 `.settings-group` 全部降级为 `liquid-glass-quiet`
  - [ ] SubTask 7.5: 在 `Learn.vue` 中将 `.learn-stats`、`.progress` 降级为 `liquid-glass-quiet`，flip-card 正反面保留 `liquid-glass-hero`
  - [ ] SubTask 7.6: 在 `Dictionary.vue` 中将 `.result-list`、`.entry-detail` 降级为 `liquid-glass-quiet`，`.dictionary-search`（hero 搜索）保留
- [ ] Task 8: 工具页减少堆叠动画系统（Issue 13）
  - [ ] SubTask 8.1: 在 `PageShell.vue` 中新增 `variant="tool"` prop（或在 `ToolPageShell.vue` 中），关闭背景视差与粒子
  - [ ] SubTask 8.2: 工具页卡片 hover 移除 `glow-card` / 强发光 class，仅保留 `transform: translateY(-2px)` 与 shadow 加深
  - [ ] SubTask 8.3: IntersectionObserver reveal 在工具页保留但仅触发一次（如已如此则跳过）

## 阶段 4：移动端与首页（可并行）

- [ ] Task 9: AppHeader 移动端抽屉过渡与关闭交互（Issue 15）
  - [ ] SubTask 9.1: 修改 `.nav-drawer` CSS：将 `display: none ↔ flex` 改为常驻 `display: flex` + `transform: translateY(-100%)` + `opacity: 0` + `pointer-events: none`，`.open` 时 `translateY(0)` + `opacity: 1` + `pointer-events: auto`，过渡 `transform 250ms ease-out, opacity 250ms ease-out`
  - [ ] SubTask 9.2: 在抽屉下方新增 scrim 元素 `<div v-if="isDrawerOpen" class="nav-drawer-scrim" @click="closeDrawer" />`，半透明黑（`rgba(0,0,0,0.4)`），过渡 fade
  - [ ] SubTask 9.3: 在 `AppHeader.vue` setup 中添加 `keydown` Escape 监听（仅 `isDrawerOpen` 为 true 时生效）
  - [ ] SubTask 9.4: 添加 `watch(() => route.path, closeDrawer)`，监听路由变化自动关闭
  - [ ] SubTask 9.5: 在 `prefers-reduced-motion: reduce` 下关闭过渡，瞬时切换
- [ ] Task 10: Home.vue 调整词典定位优先级（Issue 17）
  - [ ] SubTask 10.1: 调整 Hero kicker 文案，由"布依数字文化馆"改为同时体现词典定位的文案（如"布依词典 · 数字文化馆"）
  - [ ] SubTask 10.2: 调整 H1 文案，使"词典"作为产品核心定位在首屏可被识别（保留诗意，但加入"词典"语义）
  - [ ] SubTask 10.3: 提升 `.primary-action`（开始查词）视觉权重 — 与品牌名同级字号或同等强对比填充
  - [ ] SubTask 10.4: 保留 `language-exhibit`、`craft-exhibit`、`sound-exhibit` 等文化展区，不删除

## 阶段 5：错误边界与对比度（可并行）

- [ ] Task 11: 注册全局错误处理器与 404 路由（Issue 19）
  - [ ] SubTask 11.1: 在 `main.js` 中注册 `app.config.errorHandler = (err, instance, info) => { logger.logRenderError(err, info); /* 触发全局错误 UI */ }`
  - [ ] SubTask 11.2: 在 `router/index.js` 中注册 `router.onError((error) => { if (error.message.includes('Failed to fetch dynamically imported module')) { logger.logRouteChunkError(error); /* 提示用户刷新 */ } })`
  - [ ] SubTask 11.3: 新建 `src/views/NotFound.vue`，简洁 404 页面，提供"返回首页"链接
  - [ ] SubTask 11.4: 在 `router/index.js` 末尾新增 catch-all 路由 `{ path: '/:pathMatch(.*)*', name: 'not-found', component: () => import('../views/NotFound.vue') }`
  - [ ] SubTask 11.5: 在 `App.vue` 中为 `<RouterView>` 包裹 `<Suspense>` + 错误回退模板（或在 `router.onError` 中以全局 toast 提示）
- [ ] Task 12: Quiz.vue 背景对比度修复（Issue 21）
  - [ ] SubTask 12.1: 在 `.quiz-page__bg img` 上方新增一层 `.quiz-page__scrim`，使用 `linear-gradient(180deg, rgba(7,23,36,.45), rgba(7,23,36,.25))` 渐变（不覆盖整图，仅在文字区域增强对比度），保留原图设计意图
  - [ ] SubTask 12.2: 为 `.quiz-intro > p`（kicker）、`.quiz-question header`（progress）、`.quiz-result h1`（score）、`.quiz-result > span` 添加 `text-shadow: 0 2px 12px rgba(7,23,36,.85)`，或将这些文本置于 scrim 之上
  - [ ] SubTask 12.3: 验证 `bouyei-nature.jpg` 亮区文字对比度 ≥ WCAG AA（4.5:1 正文，3:1 大字）

## 阶段 6：业务语义与测试

- [ ] Task 13: Learn.vue 复习按钮 actionType 区分（Issue 22）
  - [ ] SubTask 13.1: 在 `Learn.vue` setup 中新增 `recordedReviewIds` Set，独立于 `recordedVisitIds`
  - [ ] SubTask 13.2: 修改 `handleReview` — 调用 `recordsApi.create({ contentType: 'dictionary', contentId: currentWord.value.id, actionType: 'review' })`，与 `recordCurrentView` 解耦
  - [ ] SubTask 13.3: 调整 toast 文案 — 成功时仍提示"已加入复习清单"；失败时区分"已复习过，无需重复添加"
  - [ ] SubTask 13.4: 验证 `nextWord` 的 `view` 记录与"复习"的 `review` 记录互不干扰，允许同一卡片同时产生两类记录
- [ ] Task 14: 新增单元测试覆盖新模块（Issue 20）
  - [ ] SubTask 14.1: 新建 `tests/contentTypes.test.js` — 覆盖 `getContentLabel` / `getContentRoute` / `getContentApiPath` 三个函数对 4 种 content type 的查询，以及未知类型的 fallback 行为
  - [ ] SubTask 14.2: 新建 `tests/auth.test.js` — 覆盖 `tryRefresh` action 的成功 / 失败 / 队列重放路径（mock axios）
  - [ ] SubTask 14.3: 新建 `tests/api.test.js` — 覆盖 `authApi` / `favoritesApi` / `recordsApi` 等端点 URL 绑定（断言 URL 拼接正确，不发真实请求）
  - [ ] SubTask 14.4: 在 `package.json` 的 `test` 脚本中追加新测试文件路径

## 阶段 7：验证

- [ ] Task 15: 构建与回归验证
  - [ ] SubTask 15.1: 运行 `npm run build`，确保 0 errors、0 new warnings
  - [ ] SubTask 15.2: 运行 `npm run test`，确保所有新旧测试通过
  - [ ] SubTask 15.3: 手动验证关键路径 — 登录/登出、token 刷新、词典搜索、收藏、学习记录复习按钮、Quiz 对比度、移动端抽屉、404 页面、深色模式 Culture/Songs
  - [ ] SubTask 15.4: 复核 P0/P1 问题未被回归（参考 `frontend-acceptance-report.md` Issue 1-9 的描述）

# Task Dependencies

- Task 1、Task 2 互相独立，可并行
- Task 3 独立
- Task 4 依赖 Task 3
- Task 5、Task 6 依赖 Task 3，可与 Task 4 并行
- Task 7 依赖 Task 4、5、6（次级表面降级需先完成样式收敛）
- Task 8 依赖 Task 4
- Task 9、Task 10、Task 11、Task 12 互相独立，可并行
- Task 13 独立
- Task 14 依赖 Task 1、Task 2（测试目标为新模块）
- Task 15 依赖全部上游任务
