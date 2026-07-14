# Checklist

## 阶段 1：架构抽取

- [ ] `src/utils/contentTypes.js` 已创建，导出 `getContentLabel` / `getContentRoute` / `getContentApiPath` 三个函数
- [ ] `Dictionary.vue` 已移除 `typeToContentType` 私有别名映射与本地 `filters`/`getTypeLabel` label 表，改用 `getContentLabel`
- [ ] `Dictionary.vue` 调用处（原 line 73/165/180）直接以 API content type 作为键
- [ ] `Profile.vue` 已移除 `typeLabels`，改用 `getContentLabel`
- [ ] `Favorites.vue` 已移除 `typeLabels` 与 `typePaths`，改用 `getContentLabel` / `getContentRoute`
- [ ] `api.js` 已移除 `CONTENT_PATHS`，`contentApi` 改用 `getContentApiPath`
- [ ] `song` content type 在所有视图中一致处理，不再被静默降级为 `dictionary`
- [ ] `src/utils/logger.js` 已创建，封装 `logApiError(error)` 与 `logRenderError(err, info)`、`logRouteChunkError(error)`
- [ ] `src/utils/authInterceptor.js` 已创建，导出 `installAuthInterceptor(axiosInstance, authStore)`
- [ ] `stores/auth.js` 新增 `tryRefresh()` action，封装 refresh token 调用 + 队列重放 + 失败清理 + 重定向
- [ ] `auth.js` 是 `localStorage.token` 的唯一写入者，`api.js` 不再直接写 localStorage
- [ ] `src/utils/agentStream.js` 已创建，迁移 `agentApi.askStream` 的 fetch + SSE 逻辑
- [ ] `stores/agent.js` 对 `askStream` 的引用已改为从 `agentStream.js` 导入
- [ ] `api.js` 仅保留 axios 实例、请求拦截器、响应成功 unwrap、端点 URL 绑定
- [ ] `api.js` 在 `main.js` 或入口处调用 `installAuthInterceptor(api, authStore)` 安装鉴权拦截器

## 阶段 2：样式系统收敛

- [ ] `variables.css` 中 `--font-sans` / `--font-serif` / `--font-mono` 仅有一处定义，无重复
- [ ] `variables.css` 已新增 `--font-h1` / `--font-h2` / `--font-h3` 字号阶梯 token
- [ ] `.reveal` 在 `main.css` 与 `liquid-glass.css` 之间仅有一处定义，无冲突
- [ ] `titleBreath` / `titleBreathe` 已合并为单一 `titleBreath` keyframe
- [ ] `liquid-glass.css` 与 `main.css` 顶部注释明示共享组件类归属
- [ ] `Culture.vue` 已移除 `.culture-page` 中对 20 个全局 token（`--background`、`--c-text*`、`--c-brand*`、`--c-accent*`、`--c-bg-silver`、`--c-divider`、`--c-focus`）的本地 shadow
- [ ] `Culture.vue` 改用 `data-theme="dark"` 或新增 `--page-*` 语义令牌实现深色沉浸
- [ ] `Culture.vue` 在浅色 / 深色模式下渲染正确，无视觉回归
- [ ] `Songs.vue` `.song-library` 改用 `.liquid-glass-quiet` 类
- [ ] `Songs.vue` 已移除手工 `feTurbulence` 噪声 data-URI 与 inset-shadow 栈
- [ ] `Songs.vue` 已移除硬编码 hex（`#0a1f33`、`#0d2842`、`#0f2d4a`、`#8ac7d3`），改用 `--page-*` 或全局令牌
- [ ] `Songs.vue` 渲染正确，无视觉回归

## 阶段 3：视觉层级恢复

- [ ] `Profile.vue` 中 `.stat-card`、`.chart-card`、`.menu-list` 已降级为 `liquid-glass-quiet`
- [ ] `Record.vue` 中 `.stat-card`、`.type-breakdown`、`.record-item` 已降级为 `liquid-glass-quiet`
- [ ] `Favorites.vue` 中 `.fav-item` 已降级为 `liquid-glass-quiet`
- [ ] `Settings.vue` 中 4 个 `.settings-group` 已降级为 `liquid-glass-quiet`
- [ ] `Learn.vue` 中 `.learn-stats`、`.progress` 已降级为 `liquid-glass-quiet`，flip-card 正反面保留 `liquid-glass-hero`
- [ ] `Dictionary.vue` 中 `.result-list`、`.entry-detail` 已降级为 `liquid-glass-quiet`，`.dictionary-search` 保留
- [ ] Hero、模态、登录卡、搜索框、Agent 面板仍保留 `liquid-glass` / `liquid-glass-hero` / `liquid-glass-content`
- [ ] `PageShell.vue` 或 `ToolPageShell.vue` 已新增工具页变体，关闭背景视差与粒子
- [ ] 工具页卡片 hover 移除强发光，仅保留 `transform: translateY(-2px)` 与 shadow 加深
- [ ] IntersectionObserver reveal 在工具页仅触发一次

## 阶段 4：移动端与首页

- [ ] `.nav-drawer` 改为常驻 `display: flex` + `transform: translateY(-100%)` + `opacity: 0`，`.open` 时滑入
- [ ] 抽屉过渡时长 ≤ 250ms，缓动 `ease-out`
- [ ] 新增 `.nav-drawer-scrim` 半透明遮罩，点击关闭抽屉
- [ ] 抽屉打开时按下 Escape 可关闭
- [ ] 路由变化时抽屉自动关闭（`watch(() => route.path, closeDrawer)`）
- [ ] `prefers-reduced-motion: reduce` 下关闭过渡，瞬时切换
- [ ] `Home.vue` Hero kicker 调整为同时体现词典定位的文案
- [ ] `Home.vue` H1 文案使"词典"作为产品核心定位在首屏可被识别
- [ ] `Home.vue` `.primary-action`（开始查词）视觉权重提升至与品牌名同级
- [ ] `Home.vue` 文化展区保留，未删除

## 阶段 5：错误边界与对比度

- [ ] `main.js` 已注册 `app.config.errorHandler`
- [ ] `router/index.js` 已注册 `router.onError` 处理懒加载失败
- [ ] `src/views/NotFound.vue` 已创建
- [ ] `router/index.js` 末尾新增 catch-all 路由 `/:pathMatch(.*)*`
- [ ] `App.vue` 为 `<RouterView>` 包裹 `<Suspense>` + 错误回退
- [ ] `Quiz.vue` 已新增 `.quiz-page__scrim` 渐变遮罩，仅在文字区域增强对比度
- [ ] `Quiz.vue` 无阴影文本（kicker / progress / score / summary）已添加最小 `text-shadow` 或改用对比度足够的颜色
- [ ] `Quiz.vue` 白字与金色 kicker 在 `bouyei-nature.jpg` 亮区满足 WCAG AA（4.5:1 正文，3:1 大字）

## 阶段 6：业务语义与测试

- [ ] `Learn.vue` 新增 `recordedReviewIds` Set，独立于 `recordedVisitIds`
- [ ] `Learn.vue` `handleReview` 改为调用 `recordsApi.create({ actionType: 'review' })`
- [ ] `Learn.vue` `nextWord` 的 `view` 记录与"复习"的 `review` 记录互不干扰
- [ ] `Learn.vue` 允许同一卡片在同一次访问中同时产生 `view` 与 `review` 两类记录
- [ ] `Learn.vue` toast 文案区分"已加入复习清单"与"已复习过，无需重复添加"
- [ ] `tests/contentTypes.test.js` 已创建，覆盖 4 种 content type 的查询与 fallback
- [ ] `tests/auth.test.js` 已创建，覆盖 `tryRefresh` 成功 / 失败 / 队列重放
- [ ] `tests/api.test.js` 已创建，覆盖端点 URL 绑定
- [ ] `package.json` `test` 脚本已包含新测试文件路径

## 阶段 7：验证

- [ ] `npm run build` 0 errors、0 new warnings
- [ ] `npm run test` 所有新旧测试通过
- [ ] 登录 / 登出 / token 刷新链路无回归
- [ ] 词典搜索 / 收藏 / 学习记录复习按钮工作正常
- [ ] Quiz 对比度在 `bouyei-nature.jpg` 亮区可读
- [ ] 移动端抽屉过渡平滑，scrim / Escape / 路由关闭均生效
- [ ] 404 页面在未知路径下正确渲染
- [ ] 深色模式下 Culture / Songs 渲染正确
- [ ] P0/P1 问题未被回归（参考 `frontend-acceptance-report.md` Issue 1-9）
