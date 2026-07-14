# Checklist

## 阶段 1：架构抽取

- [x] `src/utils/contentTypes.js` 已创建，导出 `getContentLabel` / `getContentRoute` / `getContentApiPath`
- [x] `Dictionary.vue` 已移除 `typeToContentType` 与 `getTypeLabel`，改用 `getContentLabel`
- [x] `Profile.vue` 已移除 `typeLabels`，改用 `getContentLabel`
- [x] `Favorites.vue` 已移除 `typeLabels` 与 `typePaths`，改用 `getContentLabel` / `getContentRoute`
- [x] `Record.vue` 已移除 `typeLabels`，改用 `getContentLabel`
- [x] `api.js` 已移除 `CONTENT_PATHS`，`contentApi` 改用 `getContentApiPath`
- [x] `song` content type 在所有视图中一致处理
- [x] `src/utils/logger.js` 已创建
- [x] `src/utils/authInterceptor.js` 已创建，导出 `installAuthInterceptor`
- [x] `stores/auth.js` 新增 `tryRefresh()` action
- [x] `auth.js` 是 `localStorage.token` 的唯一写入者（通过 setSession）
- [x] `src/utils/agentStream.js` 已创建，迁移 `askStream`
- [x] `stores/agent.js` 引用已改为从 `agentStream.js` 导入
- [x] `api.js` 仅保留 axios 实例、请求拦截器、响应成功 unwrap、端点 URL 绑定
- [x] `main.js` 调用 `installAuthInterceptor(api, authStore)`

## 阶段 2：样式系统收敛

- [x] `variables.css` 中 `--font-sans` / `--font-serif` / `--font-mono` 仅有一处定义
- [x] `variables.css` 已新增 `--font-h1` / `--font-h2` / `--font-h3` 字号阶梯 token
- [x] `.reveal` 在 `main.css` 与 `liquid-glass.css` 之间仅有一处定义
- [x] `titleBreath` 死代码已删除（保留实际使用的 `titleBreathe`）
- [x] `liquid-glass.css` 与 `main.css` 顶部注释明示共享组件类归属
- [x] `Culture.vue` 已移除 `.culture-page` 中对 20 个全局 token 的本地 shadow
- [x] `Culture.vue` 新增 `--page-*` 语义令牌
- [x] `Culture.vue` 在浅色 / 深色模式下渲染正确
- [x] `Songs.vue` `.song-library` 改用 `.liquid-glass-quiet` 类
- [x] `Songs.vue` 已移除手工 `feTurbulence` 噪声 data-URI
- [x] `Songs.vue` 已移除硬编码 hex
- [x] `Songs.vue` 渲染正确

## 阶段 3：视觉层级恢复

- [~] ~~`Profile.vue` 等次级表面降级为 `liquid-glass-quiet`~~ [Task 7 SKIPPED]
- [x] `ToolPageShell.vue` 已关闭背景视差（粒子本就无）
- [x] 工具页卡片 hover 移除强发光（`[data-tool-page]` 作用域禁用 glow/浮起）
- [x] IntersectionObserver reveal 在工具页仅触发一次（已验证 unobserve）

## 阶段 4：移动端与首页

- [x] `.nav-drawer` 改为常驻 `display: flex` + transform + opacity
- [x] 抽屉过渡时长 ≤ 250ms，缓动 `ease-out`
- [x] 新增 `.nav-drawer-scrim` 半透明遮罩，点击关闭
- [x] 抽屉打开时按下 Escape 可关闭
- [x] 路由变化时抽屉自动关闭
- [x] `prefers-reduced-motion: reduce` 下关闭过渡
- [~] ~~`Home.vue` Hero kicker 调整为同时体现词典定位的文案~~ [Task 10 SKIPPED]

## 阶段 5：错误边界与对比度

- [x] `main.js` 已注册 `app.config.errorHandler`
- [x] `router/index.js` 已注册 `router.onError`
- [x] `src/views/NotFound.vue` 已创建
- [x] `router/index.js` 末尾新增 catch-all 路由
- [x] `App.vue` 为 `<RouterView>` 包裹 `<Suspense>` + 错误回退
- [x] `Quiz.vue` 已新增 `.quiz-page__scrim` 渐变遮罩
- [x] `Quiz.vue` 无阴影文本已添加最小 `text-shadow`
- [x] `Quiz.vue` 白字与金色 kicker 在 `bouyei-nature.jpg` 亮区满足 WCAG AA

## 阶段 6：业务语义与测试

- [x] `Learn.vue` 新增 `recordedReviewIds` Set，独立于 `recordedVisitIds`
- [x] `Learn.vue` `handleReview` 改为调用 `recordsApi.create({ actionType: 'review' })`
- [x] `Learn.vue` `nextWord` 的 `view` 记录与"复习"的 `review` 记录互不干扰
- [x] `Learn.vue` 允许同一卡片同时产生 `view` 与 `review` 两类记录
- [x] `Learn.vue` toast 文案区分"已加入复习清单"与"已复习过，无需重复添加"
- [x] `tests/contentTypes.test.js` 已创建
- [x] `tests/auth.test.js` 已创建
- [x] `tests/api.test.js` 已创建
- [x] `package.json` `test` 脚本已包含新测试文件

## 阶段 7：验证

- [x] `npm run build` 0 errors、0 new warnings
- [x] `npm run test` 所有新旧测试通过（29/29）
- [x] 登录 / 登出 / token 刷新链路无回归
- [x] 词典搜索 / 收藏 / 学习记录复习按钮工作正常
- [x] Quiz 对比度在 `bouyei-nature.jpg` 亮区可读
- [x] 移动端抽屉过渡平滑，scrim / Escape / 路由关闭均生效
- [x] 404 页面在未知路径下正确渲染
- [x] 深色模式下 Culture / Songs 渲染正确
- [x] P0/P1 问题未被回归
