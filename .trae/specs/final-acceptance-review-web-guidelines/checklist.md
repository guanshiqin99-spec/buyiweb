# Checklist

## 审查基准
- [x] 已拉取最新版 Web Interface Guidelines 并确认规则清单完整

## 入口与布局层
- [x] `index.html` 含 `<meta name="theme-color">`、`color-scheme`、字体 preload、preconnect（字体 preload 缺失，仅 stylesheet 引入）
- [x] `App.vue` / `main.js` 无 a11y 或反模式问题（skip-link 目标 `id="main"` 由各路由页/PageShell 提供，已验证有效）
- [x] `AppHeader.vue` 图标按钮均有 `aria-label`，导航用 `<RouterLink>`，焦点可见
- [ ] `AppFooter.vue` 链接语义正确，装饰元素 `aria-hidden`（span 伪装链接带 :hover、硬编码年份、链接缺 :focus-visible）

## 叙事页
- [x] `Home.vue` 计数动画 timer 已在卸载时清理；CTA 用 `<RouterLink>`；空状态处理
- [x] `Songs.vue` IntersectionObserver 已断开；Hero 图含 `fetchpriority="high"`；歌曲时长非硬编码 `--`
- [x] `Culture.vue` `prefers-reduced-motion: reduce` 下 `.reveal-on-scroll` 加 `.is-visible`（机制已移除，P0 不可见风险消除）；"200 万" 文案已不在代码库；图片语义（铜鼓/蜡染仍复用 bouyei-craft.jpg，残留 P2）

## 工具页
- [ ] `Dictionary.vue` 搜索关键词与 URL 双向同步；结果项用语义化 `<button>`/`<RouterLink>`；收藏图标读取 store 状态；`.result-item` 焦点可见；timer 已清理（收藏图标未读 store 状态、notify setTimeout 未清理 — P1 残留）
- [ ] `Learn.vue` `nextWord` 先记录当前词再切换索引；翻转卡片为 `<button>` 并含屏幕阅读器状态；统计条 `aria-live`；msg timer 已清理（翻转卡片仍为 div role=button — P1 残留）
- [x] `Login.vue` 输入有 label + autocomplete；错误聚焦首个错误字段；提交按钮在请求期间禁用并显示 spinner（缺 spinner、role=alert 与 aria-live 冲突 — P2 新发现）
- [x] `Settings.vue` / `Profile.vue` / `Favorites.vue` / `Record.vue` 表单与破坏性操作确认齐全；timer/observer 已清理（Settings.vue setTimeout 未清理 — P2 残留）
- [x] `Quiz.vue` 交互语义与状态正确

## 通用与专用组件
- [x] `PageShell.vue` / `ToolPageShell.vue` 视差与粒子按页面性格降级；reduced-motion 兜底
- [x] `FloatingParticles.vue` reduced-motion 下隐藏
- [ ] `SearchBar.vue` / `SearchModal.vue` 输入有 label/aria-label；结果区 `aria-live="polite"`；`overscroll-behavior: contain`；键盘可操作（input outline:none 无 :focus-visible 替代 — P1 新发现）
- [x] 专用组件（AgentPanel/AudioPlayer/AudioSpectrum/BarChart/PatternDecoration/ToneChart/TonePiano）无裸 `div onClick`、图标 `aria-hidden`、Canvas 有替代文本（AgentPanel .agent-input outline 替代过弱 — P2）
- [x] 图标组件 `aria-hidden="true"` 且 `focusable="false"`

## 样式与工具
- [x] 样式无 `transition: all`，显式列出过渡属性
- [ ] 无 `outline: none` 裸奔（除非有 `:focus-visible` 替代）（SearchBar/SearchModal input 残留）
- [x] 所有动效在 `prefers-reduced-motion: reduce` 下停止或降级
- [x] `liquidGlass.js` / `pointerGlow.js` observer/timer 在卸载时清理（pointerGlow 完整；liquidGlass 单例无 destroy — P2）

## 对照与签收
- [x] 旧报告 P0 问题（Culture.vue reveal 不可见）已修复
- [ ] 旧报告 P1 问题逐条判定 已修复 / 残留（Dictionary 收藏状态、Learn 翻转卡片 — P1 残留）
- [x] 本次新发现问题已标注类别与优先级
- [x] 已给出最终签收建议（通过 / 有条件通过 / 不通过）及阻塞项清单

## 最终签收建议：不通过（存在 P1 残留与新增 P1）

### 必须修复的阻塞项（P1）

1. `src/views/Dictionary.vue:282` — 收藏按钮图标未读 `favoritesStore.isFavorite()` 状态，按钮始终显示"未收藏"
2. `src/views/Learn.vue:155-163` — 翻转卡片仍用 `<div role="button" tabindex="0">`，应改为 `<button type="button">`
3. `src/components/common/SearchBar.vue:90,93` — `input { outline: none }` 无 `:focus-visible` 替代，键盘焦点不可见
4. `src/components/common/SearchModal.vue:431` — `input { outline: none }` 无 `:focus-visible` 替代，键盘焦点不可见
5. `src/components/layout/AppFooter.vue:23-25` — `<span class="footer-link-text">` 伪装为链接带 `:hover` 但非可交互元素（反模式）

### 建议（P2，可在后续迭代处理）

- AppFooter.vue:30 硬编码年份 `© 2026` → `Intl.DateTimeFormat`
- AppFooter.vue:87-100 链接缺 `:focus-visible`
- Dictionary.vue:182-185 / Settings.vue:44 `setTimeout` 未在 onUnmounted 清理
- Dictionary.vue:208 / Learn.vue:123 / ToolPageShell.vue:21 / Quiz.vue:53 `<img>` 缺显式 width/height
- Login.vue:98 缺 `fetchpriority="high"`；:154 `role="alert"` 与 `aria-live="polite"` 冲突；:156-162 缺 spinner
- Quiz.vue:99 phase 状态未反映到 URL
- Profile.vue:71 装饰性 emoji 未 `aria-hidden`
- Culture.vue:187 dialog 缺 `aria-labelledby`；:152,164 锚点缺 `scroll-margin-top`；:137,195 `target=_blank` 未提示新窗口
- liquid-glass.css:353,563 `box-shadow` 过渡触发重绘
- liquidGlass.js per-element `rafId` 在 pruneNodes 时未 cancel；无 destroy 函数
- FloatingParticles.vue:21,60 `animationId` 死代码
- 多处按钮缺 `touch-action: manipulation`
