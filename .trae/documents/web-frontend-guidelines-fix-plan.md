# Web 前端整改计划

## 1. 目标

基于 `web-frontend-guidelines-review-report.md`，优先修复**影响功能、可访问性与交互正确性**的 P0/P1 问题，并补充少量 P2 细节优化。保持项目现有 Vue 3 + Pinia + 设计令牌的整体风格，只做必要修改，不引入额外依赖。

## 2. 当前状态

- 已有一份全量审查报告，列出约 70 条问题。
- `npm run build` 当前通过。
- 后端未运行，无法验证 API 行为，因此仅修复前端可独立验证的问题。

## 3. 整改范围与决策

本次计划覆盖 8 个文件，分为三类：

1. **逻辑/状态错误**：Learn.vue 学习记录顺序、Dictionary.vue 筛选后选中项、timer/observer 清理。
2. **可访问性与交互规范**：减少动效兜底、破坏性操作确认、`<button>` 跳转改为 `<RouterLink>`、焦点可见性、装饰性图片 alt。
3. **性能/体验细节**：图片 `fetchpriority`、歌曲真实时长回退、全局热键修饰键排除。

以下问题**暂不处理**（可在后续迭代中单独计划）：
- SearchModal / AgentPanel 的 `aria-controls`、`aria-activedescendant` 等复杂组合框语义。
- Store/API 错误统一提示与上报机制。
- `liquid-glass.css` 中 `box-shadow` 过渡的性能改造。
- 图片压缩、服务端渲染等超出前端代码范围的优化。

## 4. 具体整改项

### 4.1 Culture.vue —— 减少动效兜底

**问题**：`onMounted` 中检测到 `prefers-reduced-motion: reduce` 直接 return，未给 `.reveal-on-scroll` 添加 `.is-visible`；若 CSS 加载失败，内容可能不可见。

**改动**：
- 在 `onMounted` 中，无论是否减少动效，都先给所有 `.reveal-on-scroll` 元素添加 `.is-visible`；仅在非减少动效时才创建 IntersectionObserver。
- 保持现有 CSS 媒体查询作为双重兜底。

**文件**：[src/views/Culture.vue](file:///d:/BuyiDictionaryWeb/buyi-dictionary-vue/src/views/Culture.vue#L73-L87)

### 4.2 Learn.vue —— 学习记录逻辑与可访问性

**问题 1**：`nextWord` 先切换索引再记录，导致把“下一词”写入学习记录。

**改动**：
- 调整顺序：先记录当前词（如果已登录），再切换索引、递增 `learnedCount`。

**问题 2**：`showMsg` 的 `setTimeout` 未清理。

**改动**：
- 引入 `msgTimer` 变量，在 `onUnmounted` 中 `clearTimeout`。

**问题 3**：统计数字异步更新但无 `aria-live`。

**改动**：
- 给 `.learn-stats` 添加 `aria-live="polite"`、`aria-atomic="false"`。

**文件**：[src/views/Learn.vue](file:///d:/BuyiDictionaryWeb/buyi-dictionary-vue/src/views/Learn.vue)

### 4.3 Dictionary.vue —— 状态同步与清理

**问题 1**：筛选条件变化后，`selectedId` 可能指向被过滤掉的项，右侧详情为空。

**改动**：
- 用 `watch(filteredResults, ...)` 监听：如果当前 `selectedId` 不在过滤结果中，则自动选中第一项。

**问题 2**：搜索 debounce 定时器未在组件卸载时清理。

**改动**：
- 将 `debounceTimer` 变量移到模块级，在 `onUnmounted` 中 `clearTimeout`。

**问题 3**：搜索关键词未同步到 URL，无法分享/后退。

**改动**：
- 在 `watch(searchQuery)` 的 debounce 回调中，使用 `router.replace` 更新 `query.q`（空值时删除该参数）。

**问题 4**：详情操作按钮内 SVG 图标未隐藏，与外层 `aria-label` 冗余。

**改动**：
- 给四个 `.action-btn` 内的 `<svg>` 添加 `aria-hidden="true"`。

**文件**：[src/views/Dictionary.vue](file:///d:/BuyiDictionaryWeb/buyi-dictionary-vue/src/views/Dictionary.vue)

### 4.4 Favorites.vue —— 破坏性确认与语义化导航

**问题 1**：取消收藏直接删除，无确认。

**改动**：
- 在 `removeFavorite` 中调用 `window.confirm('确定取消收藏吗？')`，用户取消则直接返回。

**问题 2**：收藏项主体使用 `<div role="button">` 做跳转。

**改动**：
- 将 `.fav-item-body` 改为 `<RouterLink :to="...">`，删除 `role`、`tabindex`、`@keydown`。
- 保留原有样式（可能需要将 `.fav-item-body` 样式改为对 `a` 标签同样生效，或保持 class 不变）。

**问题 3**：空状态 CTA 使用 `<button>` 跳转。

**改动**：
- 改为 `<RouterLink to="/dictionary" class="cta-pill-outline">去词典探索</RouterLink>`。

**文件**：[src/views/Favorites.vue](file:///d:/BuyiDictionaryWeb/buyi-dictionary-vue/src/views/Favorites.vue)

### 4.5 Profile.vue —— 退出确认与导航

**问题 1**：退出登录无二次确认。

**改动**：
- `handleLoginBtn` 中，仅当 `window.confirm('确定要退出当前账号吗？')` 为 true 时才调用 `authStore.logout()`。

**问题 2**：未登录时“登录 / 注册”使用 `<button>` + `router.push`。

**改动**：
- 改为条件渲染：未登录使用 `<RouterLink to="/login" class="login-btn">登录 / 注册</RouterLink>`；已登录使用 `<button class="login-btn" @click="handleLogout">退出登录</button>`。
- 抽出 `handleLogout` 函数专门处理退出确认。

**问题 3**：菜单 `<RouterLink>` 无显式 `focus-visible`，昵称长文本可能撑破布局。

**改动**：
- 给 `.menu-item` 添加 `:focus-visible` 样式。
- 给 `.username` 添加 `overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 100%;`。

**文件**：[src/views/Profile.vue](file:///d:/BuyiDictionaryWeb/buyi-dictionary-vue/src/views/Profile.vue)

### 4.6 Home.vue —— 跳转语义化与资源清理

**问题 1**：多处使用 `<button @click="goTo">` 做页面跳转（推荐 chip、词典入口、民歌 CTA、学习 CTA、收束 CTA）。

**改动**：
- 推荐 chip：改为 `<RouterLink :to="{ path: '/dictionary', query: { q: ... } }">`，保留 `.pick-chip` 样式。
- 词典入口 `<li>` 内：改为 `<RouterLink :to="entry.link" class="dict-entry-item">`，保留样式。
- 民歌 CTA、学习区 CTA、收束 CTA：改为 `<RouterLink>` 并保留 `.cta-pill` / `.cta-pill-outline` 样式。
- 搜索触发按钮保持不变（它不是页面跳转，是打开搜索 Modal）。

**问题 2**：`setTimeout` 未清理。

**改动**：
- `isLoaded` 的 100ms 定时器存入变量并在 `onUnmounted` 清理。
- 统计数字动画的 `setTimeout` 链清理较复杂，本次改为在组件卸载时设置一个标志位，动画回调中检查标志位后提前退出。

**文件**：[src/views/Home.vue](file:///d:/BuyiDictionaryWeb/buyi-dictionary-vue/src/views/Home.vue)

### 4.7 AppHeader.vue —— 退出确认与抽屉焦点

**问题 1**：顶部“退出”按钮直接调用 `authStore.logout()`，无确认。

**改动**：
- 在 `handleAuthAction` 中，已登录时先 `window.confirm('确定要退出当前账号吗？')`。

**问题 2**：抽屉关闭后焦点未回到汉堡按钮。

**改动**：
- 给汉堡按钮加 `ref="burgerRef"`。
- 在 `closeDrawer` 后，使用 `nextTick(() => burgerRef.value?.focus())`。

**问题 3**：`.nav-link`、`.nav-auth-btn`、`.nav-burger` 无显式 `focus-visible`。

**改动**：
- 在 `<style scoped>` 中统一补全 `:focus-visible` 样式（outline: 2px solid var(--c-brand)，并考虑透明背景下的对比度：未滚动时使用白色 outline）。

**文件**：[src/components/layout/AppHeader.vue](file:///d:/BuyiDictionaryWeb/buyi-dictionary-vue/src/components/layout/AppHeader.vue)

### 4.8 Songs.vue —— Observer 清理与图片优先级

**问题 1**：`IntersectionObserver` 未在 `onUnmounted` 断开。

**改动**：
- 将本地 `obs` 提升为模块级变量 `scrollObserver`，在 `onUnmounted` 中 `disconnect()`。

**问题 2**：Hero 封面 `loading="eager"` 但缺少 `fetchpriority="high"`。

**改动**：
- 给 Hero `<img>` 添加 `fetchpriority="high"`。

**文件**：[src/views/Songs.vue](file:///d:/BuyiDictionaryWeb/buyi-dictionary-vue/src/views/Songs.vue)

### 4.9 PageShell.vue —— 装饰性背景图 alt

**问题**：背景图使用 `alt="title"`，但它是装饰性的。

**改动**：
- 将 `<img>` 的 `alt` 改为空字符串 `alt=""`。
- 可选：添加 `fetchpriority="high"`（背景图为首屏核心资源）。

**文件**：[src/components/common/PageShell.vue](file:///d:/BuyiDictionaryWeb/buyi-dictionary-vue/src/components/common/PageShell.vue)

### 4.10 AudioPlayer.vue —— 焦点与按钮类型

**问题 1**：`.song-info` 使用 `role="button"` 的 div，仅处理 Enter，未处理 Space。

**改动**：
- 添加 `@keydown.space.prevent="playerStore.toggleExpand()"`。

**问题 2**：`.play-button` 未声明 `type="button"`。

**改动**：
- 添加 `type="button"`。

**问题 3**：按钮内 SVG 图标未加 `aria-hidden`。

**改动**：
- 给 `.play-button`、`.disc-play` 内的 SVG 添加 `aria-hidden="true"`。

**问题 4**：`.play-button`、`.disc-play` 无显式 `focus-visible`。

**改动**：
- 补全 `:focus-visible` 样式。

**文件**：[src/components/specific/AudioPlayer.vue](file:///d:/BuyiDictionaryWeb/buyi-dictionary-vue/src/components/specific/AudioPlayer.vue)

### 4.11 App.vue —— 全局热键修饰键

**问题**：`/` 热键未排除 Ctrl/Cmd/Alt，可能误触发。

**改动**：
- 在 keydown 处理中先判断 `if (e.ctrlKey || e.metaKey || e.altKey) return`。

**文件**：[src/App.vue](file:///d:/BuyiDictionaryWeb/buyi-dictionary-vue/src/App.vue)

### 4.12 player.js —— 歌曲时长回退

**问题**：所有歌曲时长硬编码为 222s。

**改动**：
- 在 `playSong(song)` 中，优先使用 `song.duration`，无值时再回退到 `222`。

**文件**：[src/stores/player.js](file:///d:/BuyiDictionaryWeb/buyi-dictionary-vue/src/stores/player.js)

## 5. 实施顺序

建议按以下顺序修改，逐步验证：

1. 状态/逻辑错误：`Learn.vue`、`Dictionary.vue`、`player.js`。
2. 可访问性与交互：`Culture.vue`、`Favorites.vue`、`Profile.vue`、`Home.vue`、`AppHeader.vue`。
3. 细节优化：`Songs.vue`、`PageShell.vue`、`AudioPlayer.vue`、`App.vue`。

## 6. 验证步骤

每完成一个文件改动后：

- `npm run build` 必须通过，无新 warning。
- 浏览器手动检查：
  - `/culture`：开启系统“减少动效”后内容可见。
  - `/learn`：点击“下一词”后学习记录正确记录当前词；刷新页面无 setTimeout 警告。
  - `/dictionary`：筛选标签切换后，右侧详情自动跟随；搜索后 URL 出现 `?q=...`。
  - `/favorites`：取消收藏弹出确认；收藏项可用中键/Command+点击在新标签页打开。
  - `/profile`：退出登录弹出确认；未登录时“登录 / 注册”是新标签页可打开的链接。
  - `/`：首页所有 CTA 可用中键/Command+点击打开；键盘 Tab 焦点可见。
  - 任意页面：打开/关闭 AppHeader 移动端抽屉后焦点回到汉堡按钮。
  - `/songs`：页面卸载时无 IntersectionObserver 泄漏。
  - 播放器展开态：按 Space 可收起/展开；按钮焦点可见。

最终统一运行：
- `npm run build`
- 浏览器 DevTools Lighthouse Accessibility（粗略检查，目标 ≥ 90）
- 键盘全流程走查（Tab、Enter、Space、Escape）
