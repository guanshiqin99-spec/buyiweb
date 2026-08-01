# Web 前端逻辑与 UI 问题审查报告

> 基于 Vercel Web Interface Guidelines（来源：https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md）
> 审查方式：代码静态审查 + 反模式扫描，未修改源代码。

## 执行摘要

- **审查文件数**：约 30 个（含入口、视图、组件、状态、样式）
- **发现问题总数**：约 70 条
- **优先级分布**：
  - P0（严重，必须修）：1 条
  - P1（高，建议尽快修）：约 25 条
  - P2（中低，优化项）：约 45 条
- **主要问题类别**：
  1. 可访问性（a11y）：语义化按钮、焦点可见性、屏幕阅读器支持
  2. 交互/逻辑：timer/observer 未清理、破坏性操作无确认、状态与 URL 不同步
  3. 导航：多处使用 `<button>` 做页面跳转，未用 `<RouterLink>`
  4. 图片/性能：首屏图未 preload、背景图 alt 不当、懒加载策略
  5. 动效：`prefers-reduced-motion` 处理遗漏、`box-shadow`/`width` 等触发布局的过渡

---

## P0 严重问题

### Culture.vue

- [src/views/Culture.vue:73-75](file:///d:/BuyiDictionaryWeb/buyi-dictionary-vue/src/views/Culture.vue#L73-L75) - `[P0][animation/a11y]` 开启 `prefers-reduced-motion` 时，`.reveal-on-scroll` 未添加 `.is-visible`，导致内容始终不可见（Accessibility / Animation）

---

## 按文件问题清单

### src/views/Home.vue

- [src/views/Home.vue:71](file:///d:/BuyiDictionaryWeb/buyi-dictionary-vue/src/views/Home.vue#L71) - `[P2][state]` `setTimeout(() => isLoaded.value = true)` 未在 `onUnmounted` 清理（Timers）
- [src/views/Home.vue:76](file:///d:/BuyiDictionaryWeb/buyi-dictionary-vue/src/views/Home.vue#L76) - `[P2][content]` `banners` 数据已拉取但模板未渲染，数据悬空（Content Handling）
- [src/views/Home.vue:138](file:///d:/BuyiDictionaryWeb/buyi-dictionary-vue/src/views/Home.vue#L138) - `[P2][state]` 统计数字动画使用 `setTimeout` 链，未在卸载时清理（Timers）
- [src/views/Home.vue:190](file:///d:/BuyiDictionaryWeb/buyi-dictionary-vue/src/views/Home.vue#L190) - `[P2][content]` 计数使用硬编码 fallback `646`，且无加载/错误状态（Content Handling）
- [src/views/Home.vue:208](file:///d:/BuyiDictionaryWeb/buyi-dictionary-vue/src/views/Home.vue#L208) - `[P2][a11y]` `pick-chip` 的 `:key` 依赖可能重复的非唯一字段（Accessibility）
- [src/views/Home.vue:211](file:///d:/BuyiDictionaryWeb/buyi-dictionary-vue/src/views/Home.vue#L211) - `[P1][navigation]` 推荐词条使用 `<button>` + `router.push` 跳转，应使用 `<RouterLink>`（Navigation & State）
- [src/views/Home.vue:223](file:///d:/BuyiDictionaryWeb/buyi-dictionary-vue/src/views/Home.vue#L223) - `[P1][navigation]` 词典入口使用 `<button>` 做页面跳转，应使用 `<RouterLink>`（Navigation & State）
- [src/views/Home.vue:273](file:///d:/BuyiDictionaryWeb/buyi-dictionary-vue/src/views/Home.vue#L273) - `[P1][navigation]` CTA “聆听布依天籁” 使用 `<button>` 跳转，应使用 `<RouterLink>`（Navigation & State）
- [src/views/Home.vue:316](file:///d:/BuyiDictionaryWeb/buyi-dictionary-vue/src/views/Home.vue#L316) - `[P1][navigation]` “登录开启 / 开始学习” 使用 `<button>` 跳转，应使用 `<RouterLink>`（Navigation & State）

### src/views/Dictionary.vue

- [src/views/Dictionary.vue:66](file:///d:/BuyiDictionaryWeb/buyi-dictionary-vue/src/views/Dictionary.vue#L66) - `[P1][state]` 默认选中首个结果，但筛选条件变化后不会重新对齐，可能显示空详情（Navigation & State）
- [src/views/Dictionary.vue:99-113](file:///d:/BuyiDictionaryWeb/buyi-dictionary-vue/src/views/Dictionary.vue#L99-L113) - `[P2][forms]` 收藏 / 学习操作无本地 loading，快速点击可重复提交（Forms）
- [src/views/Dictionary.vue:145](file:///d:/BuyiDictionaryWeb/buyi-dictionary-vue/src/views/Dictionary.vue#L145) - `[P2][state]` `clearMsg` 的 `setTimeout` 未在卸载时清理（Timers）
- [src/views/Dictionary.vue:195-198](file:///d:/BuyiDictionaryWeb/buyi-dictionary-vue/src/views/Dictionary.vue#L195-L198) - `[P2][state]` 搜索 debounce 定时器未在 `onUnmounted` 清理（Timers）
- [src/views/Dictionary.vue:195-198](file:///d:/BuyiDictionaryWeb/buyi-dictionary-vue/src/views/Dictionary.vue#L195-L198) - `[P1][navigation]` 搜索关键词仅读取 URL，未在输入时同步回 `query.q`，无法分享 / 后退（Navigation & State）
- [src/views/Dictionary.vue:249](file:///d:/BuyiDictionaryWeb/buyi-dictionary-vue/src/views/Dictionary.vue#L249) - `[P1][a11y]` 结果项使用 `<article role="button">`，应改为语义化 `<button>` 或 `<RouterLink>`（Anti-pattern）
- [src/views/Dictionary.vue:261](file:///d:/BuyiDictionaryWeb/buyi-dictionary-vue/src/views/Dictionary.vue#L261) - `[P2][content]` 中文释义长文本无截断或换行处理（Content Handling）
- [src/views/Dictionary.vue:290-316](file:///d:/BuyiDictionaryWeb/buyi-dictionary-vue/src/views/Dictionary.vue#L290-L316) - `[P2][a11y]` 详情操作按钮内 SVG 图标未加 `aria-hidden="true"`，与外层 `aria-label` 冗余（Accessibility）
- [src/views/Dictionary.vue:299](file:///d:/BuyiDictionaryWeb/buyi-dictionary-vue/src/views/Dictionary.vue#L299) - `[P1][state]` 收藏按钮未读取 `favoritesStore` 当前状态，图标始终显示未收藏（State）
- [src/views/Dictionary.vue:437](file:///d:/BuyiDictionaryWeb/buyi-dictionary-vue/src/views/Dictionary.vue#L437) - `[P1][focus]` `.result-item` 设置 `outline: none`，虽有 `:focus-visible` 但需确认视觉对比度足够（Focus States）

### src/views/Learn.vue

- [src/views/Learn.vue:28-31](file:///d:/BuyiDictionaryWeb/buyi-dictionary-vue/src/views/Learn.vue#L28-L31) - `[P2][state]` `showMsg` 的 `setTimeout` 未在卸载时清理（Timers）
- [src/views/Learn.vue:39-70](file:///d:/BuyiDictionaryWeb/buyi-dictionary-vue/src/views/Learn.vue#L39-L70) - `[P2][forms]` 收藏 / 复习按钮无 loading，快速点击可重复提交（Forms）
- [src/views/Learn.vue:78-84](file:///d:/BuyiDictionaryWeb/buyi-dictionary-vue/src/views/Learn.vue#L78-L84) - `[P1][logic]` `nextWord` 先切换索引再记录学习，会把“下一词”而非当前词写入学习记录（State）
- [src/views/Learn.vue:124](file:///d:/BuyiDictionaryWeb/buyi-dictionary-vue/src/views/Learn.vue#L124) - `[P2][a11y]` 学习统计条数字异步更新但无 `aria-live`（Async updates）
- [src/views/Learn.vue:151-172](file:///d:/BuyiDictionaryWeb/buyi-dictionary-vue/src/views/Learn.vue#L151-L172) - `[P1][a11y]` 翻转卡片容器是 `<div role="button">`，应使用 `<button>` 并补充翻转后的屏幕阅读器状态（Anti-pattern / Focus）

### src/views/Songs.vue

- [src/views/Songs.vue:33-69](file:///d:/BuyiDictionaryWeb/buyi-dictionary-vue/src/views/Songs.vue#L33-L69) - `[P1][state]` 滚动入场 `IntersectionObserver` 未在 `onUnmounted` 断开，存在内存泄漏（Timers/Observers）
- [src/views/Songs.vue:81](file:///d:/BuyiDictionaryWeb/buyi-dictionary-vue/src/views/Songs.vue#L81) - `[P2][images]` Hero 封面 `loading="eager"` 但缺少 `fetchpriority="high"`（Images）
- [src/views/Songs.vue:149](file:///d:/BuyiDictionaryWeb/buyi-dictionary-vue/src/views/Songs.vue#L149) - `[P2][content]` 歌曲时长硬编码为 `--`，未解析真实数据（Content Handling）
- [src/views/Songs.vue:224](file:///d:/BuyiDictionaryWeb/buyi-dictionary-vue/src/views/Songs.vue#L224) - `[P2][performance]` `.hero-blur-bg` 使用 `filter: blur(40px)` 覆盖全屏，滚动时可能触发重绘（Performance）

### src/views/Culture.vue

- [src/views/Culture.vue:13](file:///d:/BuyiDictionaryWeb/buyi-dictionary-vue/src/views/Culture.vue#L13) - `[P2][typography]` “200 万” 使用普通空格，应使用 `&nbsp;` 防止换行（Typography）
- [src/views/Culture.vue:64](file:///d:/BuyiDictionaryWeb/buyi-dictionary-vue/src/views/Culture.vue#L64) - `[P2][images]` “铜鼓文化” 与 “蜡染工艺” 复用同一张图片 `bouyei-craft.jpg`，视觉语义不一致（Images）
- [src/views/Culture.vue:73-75](file:///d:/BuyiDictionaryWeb/buyi-dictionary-vue/src/views/Culture.vue#L73-L75) - `[P0][animation/a11y]` 开启 `prefers-reduced-motion` 时未给 `.reveal-on-scroll` 添加 `.is-visible`，内容保持不可见（Animation / Accessibility）

### src/views/Profile.vue

- [src/views/Profile.vue:38-44](file:///d:/BuyiDictionaryWeb/buyi-dictionary-vue/src/views/Profile.vue#L38-L44) - `[P1][interaction]` 退出登录直接调用 `logout()`，无二次确认；未登录时跳转应使用 `<RouterLink>`（Destructive actions / Navigation）
- [src/views/Profile.vue:76](file:///d:/BuyiDictionaryWeb/buyi-dictionary-vue/src/views/Profile.vue#L76) - `[P2][images]` 头像 `alt="头像"` 较笼统，可使用用户名或留空（Images）
- [src/views/Profile.vue:83](file:///d:/BuyiDictionaryWeb/buyi-dictionary-vue/src/views/Profile.vue#L83) - `[P1][navigation]` “登录 / 注册” 使用 `<button>` + `router.push`，应使用 `<RouterLink>`（Navigation & State）
- [src/views/Profile.vue:125-139](file:///d:/BuyiDictionaryWeb/buyi-dictionary-vue/src/views/Profile.vue#L125-L139) - `[P2][a11y]` 徽章图标 SVG 未加 `aria-hidden="true"`（Accessibility）
- [src/views/Profile.vue:154-167](file:///d:/BuyiDictionaryWeb/buyi-dictionary-vue/src/views/Profile.vue#L154-L167) - `[P2][focus]` 菜单 `<RouterLink>` 无显式 `focus-visible` 样式，键盘焦点可能不可见（Focus）
- [src/views/Profile.vue:362](file:///d:/BuyiDictionaryWeb/buyi-dictionary-vue/src/views/Profile.vue#L362) - `[P2][content]` 用户昵称长文本可能撑破布局，需截断处理（Content Handling）
- [src/views/Profile.vue:374](file:///d:/BuyiDictionaryWeb/buyi-dictionary-vue/src/views/Profile.vue#L374) - `[P2][focus]` `.login-btn` 未定义显式 `focus-visible` 样式（Focus）

### src/views/Favorites.vue

- [src/views/Favorites.vue:43-50](file:///d:/BuyiDictionaryWeb/buyi-dictionary-vue/src/views/Favorites.vue#L43-L50) - `[P1][interaction]` 取消收藏直接删除，无确认或撤销（Destructive actions）
- [src/views/Favorites.vue:86](file:///d:/BuyiDictionaryWeb/buyi-dictionary-vue/src/views/Favorites.vue#L86) - `[P1][navigation]` 收藏项主体使用 `<div role="button">` 跳转，应使用 `<RouterLink>`（Navigation & State）
- [src/views/Favorites.vue:86](file:///d:/BuyiDictionaryWeb/buyi-dictionary-vue/src/views/Favorites.vue#L86) - `[P2][a11y]` `fav-item-body` 缺少 `aria-label` 说明跳转目标（Accessibility）
- [src/views/Favorites.vue:176](file:///d:/BuyiDictionaryWeb/buyi-dictionary-vue/src/views/Favorites.vue#L176) - `[P1][navigation]` 空状态 CTA 使用 `<button>` 跳转，应使用 `<RouterLink>`（Navigation & State）
- [src/views/Favorites.vue:215](file:///d:/BuyiDictionaryWeb/buyi-dictionary-vue/src/views/Favorites.vue#L215) - `[P1][focus]` `.remove-btn` 设置 `outline: none`，需确认有可见焦点替代（Focus States）

### src/views/Record.vue

- [src/views/Record.vue:22-25](file:///d:/BuyiDictionaryWeb/buyi-dictionary-vue/src/views/Record.vue#L22-L25) - `[P2][state]` 统计 / 记录请求失败被静默吞掉，用户看不到错误（Error handling）
- [src/views/Record.vue:98](file:///d:/BuyiDictionaryWeb/buyi-dictionary-vue/src/views/Record.vue#L98) - `[P1][navigation]` 空状态 CTA 使用 `<button>` 跳转，应使用 `<RouterLink>`（Navigation & State）

### src/views/Settings.vue

- [src/views/Settings.vue:21-31](file:///d:/BuyiDictionaryWeb/buyi-dictionary-vue/src/views/Settings.vue#L21-L31) - `[P2][state]` 设置加载失败仅 `console.error`，未给用户提示（Error handling）
- [src/views/Settings.vue:55-57](file:///d:/BuyiDictionaryWeb/buyi-dictionary-vue/src/views/Settings.vue#L55-L57) - `[P2][state]` 主题切换在点击保存前已写入 `themeStore`，刷新后可能与未保存状态不一致（State）
- [src/views/Settings.vue:69-154](file:///d:/BuyiDictionaryWeb/buyi-dictionary-vue/src/views/Settings.vue#L69-L154) - `[P2][interaction]` 页面离开前未提示未保存的更改（Navigation & State）
- [src/views/Settings.vue:84](file:///d:/BuyiDictionaryWeb/buyi-dictionary-vue/src/views/Settings.vue#L84) - `[P2][forms]` 主题 `<select>` 仅有 `aria-label` 无可见 `<label>`（Forms）
- [src/views/Settings.vue:214](file:///d:/BuyiDictionaryWeb/buyi-dictionary-vue/src/views/Settings.vue#L214) - `[P2][focus/hover]` `.setting-select` 无 hover 状态，焦点仅依赖 outline（Hover & Interactive States）
- [src/views/Settings.vue:223](file:///d:/BuyiDictionaryWeb/buyi-dictionary-vue/src/views/Settings.vue#L223) - `[P1][focus]` `.setting-select` 设置 `outline: none`，需确保焦点可见（Focus States）

### src/views/Login.vue

- [src/views/Login.vue:98](file:///d:/BuyiDictionaryWeb/buyi-dictionary-vue/src/views/Login.vue#L98) - `[P2][images]` 登录背景图 `loading="eager"` 但缺少 `fetchpriority="high"`（Images）
- [src/views/Login.vue:109-135](file:///d:/BuyiDictionaryWeb/buyi-dictionary-vue/src/views/Login.vue#L109-L135) - `[P2][forms]` 输入框有 `aria-invalid` 但无 `aria-describedby` 关联错误信息（Forms）
- [src/views/Login.vue:165](file:///d:/BuyiDictionaryWeb/buyi-dictionary-vue/src/views/Login.vue#L165) - `[P2][state]` 切换登录/注册模式时未清空已输入字段（State）
- [src/views/Login.vue:244-258](file:///d:/BuyiDictionaryWeb/buyi-dictionary-vue/src/views/Login.vue#L244-L258) - `[P2][focus]` 输入框 focus 仅有 `border-color` 变化，focus 指示不够清晰（Focus States）
- [src/views/Login.vue:252](file:///d:/BuyiDictionaryWeb/buyi-dictionary-vue/src/views/Login.vue#L252) - `[P1][focus]` 输入框设置 `outline: none`，需确保有其他可见焦点指示（Focus States）
- [src/views/Login.vue:307-325](file:///d:/BuyiDictionaryWeb/buyi-dictionary-vue/src/views/Login.vue#L307-L325) - `[P2][focus]` `switch-link` 是 `<button>` 但无显式 `focus-visible` 样式（Focus States）

### src/components/layout/AppHeader.vue

- [src/components/layout/AppHeader.vue:78](file:///d:/BuyiDictionaryWeb/buyi-dictionary-vue/src/components/layout/AppHeader.vue#L78) - `[P1][interaction]` 顶部“退出”直接调用 `authStore.logout()`，破坏性操作缺少确认（Destructive actions）
- [src/components/layout/AppHeader.vue:202](file:///d:/BuyiDictionaryWeb/buyi-dictionary-vue/src/components/layout/AppHeader.vue#L202) - `[P2][focus]` `.nav-link` 未定义显式 `focus-visible` 样式（Focus States）
- [src/components/layout/AppHeader.vue:242](file:///d:/BuyiDictionaryWeb/buyi-dictionary-vue/src/components/layout/AppHeader.vue#L242) - `[P2][focus]` `.nav-auth-btn` 未定义显式 `focus-visible` 样式（Focus States）
- [src/components/layout/AppHeader.vue:272](file:///d:/BuyiDictionaryWeb/buyi-dictionary-vue/src/components/layout/AppHeader.vue#L272) - `[P2][focus]` `.nav-burger` 未定义显式 `focus-visible` 样式（Focus States）
- [src/components/layout/AppHeader.vue:334](file:///d:/BuyiDictionaryWeb/buyi-dictionary-vue/src/components/layout/AppHeader.vue#L334) - `[P2][focus]` 抽屉菜单链接未定义显式 `focus-visible` 样式（Focus States）
- [src/components/layout/AppHeader.vue:334](file:///d:/BuyiDictionaryWeb/buyi-dictionary-vue/src/components/layout/AppHeader.vue#L334) - `[P2][a11y]` 抽屉关闭后焦点未回到汉堡按钮（Focus management）

### src/components/layout/AppFooter.vue

- [src/components/layout/AppFooter.vue:9](file:///d:/BuyiDictionaryWeb/buyi-dictionary-vue/src/components/layout/AppFooter.vue#L9) - `[P2][a11y]` 页脚直接使用 `<h3>`，标题层级跳级（缺少 `<h2>`）（Accessibility）
- [src/components/layout/AppFooter.vue:23-25](file:///d:/BuyiDictionaryWeb/buyi-dictionary-vue/src/components/layout/AppFooter.vue#L23-L25) - `[P2][logic]` “项目介绍 / 使用帮助 / 联系我们”按钮无点击处理，是失效交互（Anti-pattern）
- [src/components/layout/AppFooter.vue:87](file:///d:/BuyiDictionaryWeb/buyi-dictionary-vue/src/components/layout/AppFooter.vue#L87) - `[P2][focus]` footer 链接与 `.footer-link-btn` 未定义显式 `focus-visible` 样式（Focus States）

### src/components/common/SearchModal.vue

- [src/components/common/SearchModal.vue:119](file:///d:/BuyiDictionaryWeb/buyi-dictionary-vue/src/components/common/SearchModal.vue#L119) - `[P2][a11y]` 弹窗打开时自动聚焦输入框，移动端未降级（Touch & Interaction）
- [src/components/common/SearchModal.vue:168](file:///d:/BuyiDictionaryWeb/buyi-dictionary-vue/src/components/common/SearchModal.vue#L168) - `[P2][perf]` `updateActive` 中交错读取 `offsetTop/offsetHeight` 与写入 `scrollTop`，导致布局抖动（Performance）
- [src/components/common/SearchModal.vue:254](file:///d:/BuyiDictionaryWeb/buyi-dictionary-vue/src/components/common/SearchModal.vue#L254) - `[P2][a11y]` `aria-autocomplete="list"` 但缺少 `aria-controls` 与 `aria-activedescendant`，组合框模式不完整（Accessibility）
- [src/components/common/SearchModal.vue:270](file:///d:/BuyiDictionaryWeb/buyi-dictionary-vue/src/components/common/SearchModal.vue#L270) - `[P2][a11y]` 分组标题 `<p>` 位于 `role="listbox"` 内，不是有效 option（Accessibility）
- [src/components/common/SearchModal.vue:271](file:///d:/BuyiDictionaryWeb/buyi-dictionary-vue/src/components/common/SearchModal.vue#L271) - `[P2][a11y]` 建议项使用 `<button role="option">`，listbox 子项角色语义混乱（Accessibility）
- [src/components/common/SearchModal.vue:402](file:///d:/BuyiDictionaryWeb/buyi-dictionary-vue/src/components/common/SearchModal.vue#L402) - `[P1][focus]` `.search-modal-input` 设置 `outline: none`，需确保焦点可见（Focus States）
- [src/components/common/SearchModal.vue:450](file:///d:/BuyiDictionaryWeb/buyi-dictionary-vue/src/components/common/SearchModal.vue#L450) - `[P2][focus]` `.suggestion-item` 未定义显式 `focus-visible` 样式（Focus States）

### src/components/common/SearchBar.vue

- [src/components/common/SearchBar.vue:39](file:///d:/BuyiDictionaryWeb/buyi-dictionary-vue/src/components/common/SearchBar.vue#L39) - `[P2][a11y]` 搜索图标 SVG 缺少 `aria-hidden`（外层已有 `aria-label`，但图标自身应隐藏）（Accessibility）
- [src/components/common/SearchBar.vue:101](file:///d:/BuyiDictionaryWeb/buyi-dictionary-vue/src/components/common/SearchBar.vue#L101) - `[P1][focus]` 输入框设置 `outline: none`，需确保焦点可见（Focus States）
- [src/components/common/SearchBar.vue:114](file:///d:/BuyiDictionaryWeb/buyi-dictionary-vue/src/components/common/SearchBar.vue#L114) - `[P2][focus]` `.clear-btn` 未定义显式 `focus-visible` 样式（Focus States）
- [src/components/common/SearchBar.vue:132](file:///d:/BuyiDictionaryWeb/buyi-dictionary-vue/src/components/common/SearchBar.vue#L132) - `[P2][focus]` `.search-btn` 未定义显式 `focus-visible` 样式（Focus States）

### src/components/common/PageShell.vue

- [src/components/common/PageShell.vue:59](file:///d:/BuyiDictionaryWeb/buyi-dictionary-vue/src/components/common/PageShell.vue#L59) - `[P2][a11y]` 背景图使用 `alt="title"`，装饰性背景图应 `alt=""`（Images）
- [src/components/common/PageShell.vue:59](file:///d:/BuyiDictionaryWeb/buyi-dictionary-vue/src/components/common/PageShell.vue#L59) - `[P2][perf]` 首屏关键背景图未设置 `fetchpriority="high"`（Images）
- [src/components/common/PageShell.vue:87](file:///d:/BuyiDictionaryWeb/buyi-dictionary-vue/src/components/common/PageShell.vue#L87) - `[P2][layout]` `.page-shell` 设置 `overflow: hidden`，可能截断子元素 focus ring（Safe Areas & Layout）

### src/components/specific/AudioPlayer.vue

- [src/components/specific/AudioPlayer.vue:134](file:///d:/BuyiDictionaryWeb/buyi-dictionary-vue/src/components/specific/AudioPlayer.vue#L134) - `[P1][a11y]` `.song-info` 使用 `role="button"` 的 `<div>`，仅处理 Enter 键，未处理 Space 键（Accessibility）
- [src/components/specific/AudioPlayer.vue:165](file:///d:/BuyiDictionaryWeb/buyi-dictionary-vue/src/components/specific/AudioPlayer.vue#L165) - `[P2][a11y]` `.play-button` 未显式声明 `type="button"`（Forms）
- [src/components/specific/AudioPlayer.vue:165](file:///d:/BuyiDictionaryWeb/buyi-dictionary-vue/src/components/specific/AudioPlayer.vue#L165) - `[P2][focus]` `.play-button` 未定义显式 `focus-visible` 样式（Focus States）
- [src/components/specific/AudioPlayer.vue:231](file:///d:/BuyiDictionaryWeb/buyi-dictionary-vue/src/components/specific/AudioPlayer.vue#L231) - `[P2][focus]` `.disc-play` 未定义显式 `focus-visible` 样式（Focus States）
- [src/components/specific/AudioPlayer.vue:318](file:///d:/BuyiDictionaryWeb/buyi-dictionary-vue/src/components/specific/AudioPlayer.vue#L318) - `[P2][focus]` `.song-info` 设置 `outline: none`，需确保焦点可见（Focus States）
- [src/components/specific/AudioPlayer.vue:465](file:///d:/BuyiDictionaryWeb/buyi-dictionary-vue/src/components/specific/AudioPlayer.vue#L465) - `[P2][focus]` `.progress-bar` 设置 `outline: none`，需确保焦点可见（Focus States）
- [src/components/specific/AudioPlayer.vue:486](file:///d:/BuyiDictionaryWeb/buyi-dictionary-vue/src/components/specific/AudioPlayer.vue#L486) - `[P2][animation]` `.progress-fill` 使用 `width` 过渡，会触发布局重排（Animation）
- [src/components/specific/AudioPlayer.vue:571](file:///d:/BuyiDictionaryWeb/buyi-dictionary-vue/src/components/specific/AudioPlayer.vue#L571) - `[P2][focus]` `.disc-expand` 设置 `outline: none`，需确保焦点可见（Focus States）

### src/components/specific/ToneChart.vue

- [src/components/specific/ToneChart.vue:89](file:///d:/BuyiDictionaryWeb/buyi-dictionary-vue/src/components/specific/ToneChart.vue#L89) - `[P2][typography]` canvas 字体硬编码 `'DM Sans, sans-serif'`，未使用主题字体变量（Typography）

### src/components/specific/BarChart.vue

- [src/components/specific/BarChart.vue:211](file:///d:/BuyiDictionaryWeb/buyi-dictionary-vue/src/components/specific/BarChart.vue#L211) - `[P2][content]` `.bar-label` 设置 `white-space: nowrap`，长分类名溢出未处理（Content Handling）

### src/components/specific/AgentPanel.vue

- [src/components/specific/AgentPanel.vue:21](file:///d:/BuyiDictionaryWeb/buyi-dictionary-vue/src/components/specific/AgentPanel.vue#L21) - `[P2][a11y]` 面板打开时自动聚焦输入框，移动端未降级（Touch & Interaction）
- [src/components/specific/AgentPanel.vue:84](file:///d:/BuyiDictionaryWeb/buyi-dictionary-vue/src/components/specific/AgentPanel.vue#L84) - `[P2][forms]` `.agent-fab` 未显式声明 `type="button"`（Forms）
- [src/components/specific/AgentPanel.vue:142](file:///d:/BuyiDictionaryWeb/buyi-dictionary-vue/src/components/specific/AgentPanel.vue#L142) - `[P2][a11y]` 消息容器 `aria-live="polite"` 缺少 `aria-atomic="false"`，新增消息时可能整段重读（Accessibility）
- [src/components/specific/AgentPanel.vue:164](file:///d:/BuyiDictionaryWeb/buyi-dictionary-vue/src/components/specific/AgentPanel.vue#L164) - `[P2][forms]` `.quick-chip` 按钮未显式声明 `type="button"`（Forms）
- [src/components/specific/AgentPanel.vue:449](file:///d:/BuyiDictionaryWeb/buyi-dictionary-vue/src/components/specific/AgentPanel.vue#L449) - `[P1][focus]` 输入框或按钮设置 `outline: none`，需确保焦点可见（Focus States）

### index.html

- [index.html:23](file:///d:/BuyiDictionaryWeb/buyi-dictionary-vue/index.html#L23) - `[P2][performance]` Google Fonts CSS 未预加载，首屏字体可能阻塞渲染（Critical fonts preload）

### src/App.vue

- [src/App.vue:22](file:///d:/BuyiDictionaryWeb/buyi-dictionary-vue/src/App.vue#L22) - `[P2][interaction]` `/` 热键未排除 Ctrl/Cmd/Alt 修饰键，可能误触发或覆盖浏览器快捷键（Keyboard handlers）
- [src/App.vue:40](file:///d:/BuyiDictionaryWeb/buyi-dictionary-vue/src/App.vue#L40) - `[P1][a11y]` skip-link 指向 `#main`，但 `App.vue` 模板本身无该 id，依赖子路由渲染，存在跳转到空目标的风险（skip link / semantic HTML）

### src/stores/player.js

- [src/stores/player.js:9-10](file:///d:/BuyiDictionaryWeb/buyi-dictionary-vue/src/stores/player.js#L9-L10) - `[P2][state]` `playlist`/`currentIndex` 已声明但播放逻辑未使用（unused state）
- [src/stores/player.js:27-30](file:///d:/BuyiDictionaryWeb/buyi-dictionary-vue/src/stores/player.js#L27-L30) - `[P2][locale]` 时间格式化硬编码 `mm:ss`，未使用 `Intl`（hardcoded date/time format）
- [src/stores/player.js:40](file:///d:/BuyiDictionaryWeb/buyi-dictionary-vue/src/stores/player.js#L40) - `[P1][logic]` 歌曲时长硬编码为 222s，所有音频共享同一占位时长（data logic）

### src/stores/auth.js

- [src/stores/auth.js:6-8](file:///d:/BuyiDictionaryWeb/buyi-dictionary-vue/src/stores/auth.js#L6-L8) - `[P1][state]` Token 与 refreshToken 持久化在 localStorage，存在 XSS 风险且跨标签页状态易不同步（state persistence）
- [src/stores/auth.js:6-8](file:///d:/BuyiDictionaryWeb/buyi-dictionary-vue/src/stores/auth.js#L6-L8) - `[P2][state]` localStorage 读取未 try-catch，沙箱/无痕模式可能初始化崩溃（state persistence）
- [src/stores/auth.js:67-77](file:///d:/BuyiDictionaryWeb/buyi-dictionary-vue/src/stores/auth.js#L67-L77) - `[P2][interaction]` `fetchUserProfile` 失败仅 `console.error`，未向 UI 暴露错误（error handling）

### src/stores/favorites.js

- [src/stores/favorites.js:17-29](file:///d:/BuyiDictionaryWeb/buyi-dictionary-vue/src/stores/favorites.js#L17-L29) - `[P2][interaction]` 获取收藏失败仅 `console.error`，未向 UI 暴露错误（error handling）
- [src/stores/favorites.js:37-38](file:///d:/BuyiDictionaryWeb/buyi-dictionary-vue/src/stores/favorites.js#L37-L38) - `[P2][state]` `toggleFavorite` 成功时向列表 push 简化对象，可能与后端返回结构不一致（state sync）

### src/stores/search.js

- [src/stores/search.js:4-9](file:///d:/BuyiDictionaryWeb/buyi-dictionary-vue/src/stores/search.js#L4-L9) - `[P2][navigation]` 搜索 Modal 开关状态未同步到 URL，无法深链与刷新恢复（deep-link stateful UI）

### src/stores/agent.js

- [src/stores/agent.js:78-88](file:///d:/BuyiDictionaryWeb/buyi-dictionary-vue/src/stores/agent.js#L78-L88) - `[P2][a11y]` 流式回答为异步内容更新，未配套 `aria-live` 通知机制（async updates need aria-live）

### src/utils/api.js

- [src/utils/api.js:10-14](file:///d:/BuyiDictionaryWeb/buyi-dictionary-vue/src/utils/api.js#L10-L14) - `[P2][state]` 请求拦截器中 localStorage 读取未做异常保护（state persistence）
- [src/utils/api.js:65-84](file:///d:/BuyiDictionaryWeb/buyi-dictionary-vue/src/utils/api.js#L65-L84) - `[P2][interaction]` HTTP 错误仅 `console.error`，缺少统一的用户提示或上报（error handling）

### src/utils/liquidGlass.js

- [src/utils/liquidGlass.js:6-8](file:///d:/BuyiDictionaryWeb/buyi-dictionary-vue/src/utils/liquidGlass.js#L6-L8) - `[P2][animation]` `prefers-reduced-motion` 仅在模块加载时检测，运行时切换系统偏好不生效（prefers-reduced-motion）
- [src/utils/liquidGlass.js:194-195](file:///d:/BuyiDictionaryWeb/buyi-dictionary-vue/src/utils/liquidGlass.js#L194-L195) - `[P2][performance]` window scroll/resize 全局监听器缺少卸载入口，SPA 生命周期内无法释放（cleanup）

### src/utils/cursorGlow.js

- [src/utils/cursorGlow.js:6-8](file:///d:/BuyiDictionaryWeb/buyi-dictionary-vue/src/utils/cursorGlow.js#L6-L8) - `[P2][animation]` `prefers-reduced-motion` 仅在模块加载时检测，运行时切换系统偏好不生效（prefers-reduced-motion）

### src/assets/styles/variables.css

- [src/assets/styles/variables.css:35,139](file:///d:/BuyiDictionaryWeb/buyi-dictionary-vue/src/assets/styles/variables.css#L35-L139) - `[P2][typography]` 引用 `JetBrains Mono` 但未在 `index.html` 加载，实际会回退系统等宽字体（critical fonts）

### src/assets/styles/main.css

- [src/assets/styles/main.css:39](file:///d:/BuyiDictionaryWeb/buyi-dictionary-vue/src/assets/styles/main.css#L39) - `[P2][animation]` skip-link 使用 `transition: top` 触发重排，应改用 `transform`（animate transform/opacity only）

### src/assets/styles/liquid-glass.css

- [src/assets/styles/liquid-glass.css:92-94](file:///d:/BuyiDictionaryWeb/buyi-dictionary-vue/src/assets/styles/liquid-glass.css#L92-L94) - `[P2][animation]` `.liquid-glass` transition 包含 `box-shadow`，非合成器友好（animate transform/opacity only）
- [src/assets/styles/liquid-glass.css:152](file:///d:/BuyiDictionaryWeb/buyi-dictionary-vue/src/assets/styles/liquid-glass.css#L152) - `[P2][performance]` `will-change: transform` 在全局伪元素上使用，可能造成渲染层爆炸（will-change overuse）
- [src/assets/styles/liquid-glass.css:383-384](file:///d:/BuyiDictionaryWeb/buyi-dictionary-vue/src/assets/styles/liquid-glass.css#L383-L384) - `[P2][animation]` `.card-interactive` transition 包含 `box-shadow`，非合成器友好（animate transform/opacity only）
- [src/assets/styles/liquid-glass.css:440-441](file:///d:/BuyiDictionaryWeb/buyi-dictionary-vue/src/assets/styles/liquid-glass.css#L440-L441) - `[P2][a11y]` `.no-scrollbar` 完全隐藏滚动条，影响键盘/触屏用户感知可滚动区域（avoid hiding scrollbars）
- [src/assets/styles/liquid-glass.css:469](file:///d:/BuyiDictionaryWeb/buyi-dictionary-vue/src/assets/styles/liquid-glass.css#L469) - `[P2][animation]` `.pulse-hover` transition 包含 `box-shadow`，非合成器友好（animate transform/opacity only）

---

## 全局性重复模式

1. **使用 `<button>` 做页面跳转**：Home、Profile、Favorites、Record、Dictionary 推荐 chip 等位置使用 `<button @click="router.push">`，无法支持中键/Command+点击、右键菜单、地址栏预览。
2. **Timer / Observer 未清理**：Home、Dictionary、Learn、Songs 中的 `setTimeout`、debounce、`IntersectionObserver` 未全部在 `onUnmounted` 清理，存在内存泄漏与回调异常风险。
3. **`<div role="button">` 反模式**：Dictionary 结果项、Learn 翻转卡片、Favorites 收藏项主体、AudioPlayer 歌曲信息均使用非语义化元素，键盘与屏幕阅读器支持不足。
4. **焦点可见性依赖全局样式**：多处交互元素设置 `outline: none` 后仅依赖全局 `:focus-visible`，在深色/透明背景上对比度可能不足；部分按钮完全未定义 `focus-visible` 样式。
5. **Store / API 错误静默处理**：auth、favorites、api、player、Record、Settings 等将错误停留在 `console.error`，用户看不到失败反馈。
6. **`prefers-reduced-motion` 检测为一次性**：`liquidGlass.js`、`cursorGlow.js` 在模块加载时读取偏好，用户中途切换系统设置不会生效。
7. **非合成器友好动画**：`liquid-glass.css` 多处 transition 包含 `box-shadow`，AudioPlayer 进度条使用 `width` 过渡，都会触发布局或重绘。
8. **状态未深链化**：搜索 Modal 开关等全局状态未同步到 URL，刷新后无法恢复。

---

## 未覆盖 / 需运行时验证项

- 后端 API 返回的真实数据结构与前端映射是否一致（如 `contentApi.list`、`searchApi.search`）。
- 音频真实时长、播放进度同步、断网重连等播放器行为。
- 深色模式在 iOS Safari / Android Chrome 地址栏、`<select>` 下拉、系统键盘上的实际表现。
- 屏幕阅读器（NVDA/VoiceOver）对流式回答、翻转卡片、搜索建议的实际朗读效果。
- 真实设备上的触屏拖动、双指缩放、安全区适配。

---

## 建议修复优先级

### P0（立即修复）
- Culture.vue 减少动效模式下内容不可见。

### P1（建议尽快）
- 破坏性操作添加确认：AppHeader/Profile 退出登录、Favorites 取消收藏。
- 将页面跳转的 `<button>` 改为 `<RouterLink>`：Home、Profile、Favorites、Record、Dictionary chip。
- 将 `<article role="button">` / `<div role="button">` 改为语义化 `<button>` 或 `<RouterLink>`。
- 修复 Learn.vue `nextWord` 学习记录逻辑（记录当前词而非下一词）。
- Dictionary.vue 搜索关键词同步到 URL，筛选后重新对齐选中项。
- 焦点可见性：确保所有 `outline: none` 都有足够的 `:focus-visible` 替代样式。
- 清理未卸载的 timer/observer。
- App.vue `/` 热键排除修饰键。

### P2（优化项）
- 为所有装饰性 SVG 加 `aria-hidden="true"`。
- 首屏关键图片加 `fetchpriority="high"`。
- 改进错误处理，将 API/store 错误暴露到 UI。
- 主题/设置未保存离开提示。
- 将 `box-shadow`/`width` 动画改为 `transform/opacity`。
- 运行时监听 `prefers-reduced-motion` 变化。
- 统一时间/数字格式，使用 `Intl`。
- 图片 alt 优化、长文本截断。
- SearchModal 完善 `aria-controls` / `aria-activedescendant`。

---

## 验证清单

- [ ] `npm run build` 通过，无构建错误。
- [ ] 浏览器 DevTools Lighthouse Accessibility ≥ 90，Performance ≥ 80。
- [ ] 键盘全程可导航：Tab、Enter、Space、Escape、方向键。
- [ ] 开启系统“减少动效”后，所有内容可见且动画停止。
- [ ] 深色/浅色切换时，地址栏、`select`、图片遮罩无闪烁。
- [ ] 屏幕阅读器可正确朗读：搜索建议、翻转卡片、播放进度、流式回答。
- [ ] 中键 / Ctrl+Cmd+点击所有“跳转按钮”可正常在新标签页打开。
