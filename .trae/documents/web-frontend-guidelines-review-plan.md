# Web 前端逻辑与 UI 问题审查计划

## 1. 目标与范围

基于 Vercel Web Interface Guidelines（最新版），对 `buyi-dictionary-vue` 前端进行全量审查，识别**逻辑问题**（交互、状态、可访问性、表单、性能等）与 **UI 问题**（焦点、动效、色彩、排版、图片等），输出一份结构化审查报告，**不修改代码**，由用户确认后再决定修复项。

已确认用户选择：
- 范围：**全量审查**
- 修复方式：**先出报告再决定**

## 2. 当前项目状态

- 技术栈：Vue 3.4 + Vite 5 + Pinia + Vue Router 4，纯前端 SPA。
- 入口与配置：`index.html` / `src/main.js` / `src/router/index.js` / `package.json`。
- 样式体系：`src/assets/styles/variables.css`（设计令牌）、`liquid-glass.css`、`main.css`。
- 全局组件/视图约 30+ 文件，主要交互集中在：
  - 导航与搜索：`AppHeader.vue`、`SearchModal.vue`、`SearchBar.vue`
  - 页面视图：`Home.vue`、`Dictionary.vue`、`Learn.vue`、`Songs.vue`、`Culture.vue`、`Profile.vue`、`Favorites.vue`、`Record.vue`、`Settings.vue`、`Login.vue`
  - 功能组件：`AudioPlayer.vue`、`ToneChart.vue`、`BarChart.vue`、`AgentPanel.vue`、`PageShell.vue`
  - 全局状态：`theme.js`、`player.js`、`auth.js`、`favorites.js`、`search.js`、`agent.js`
- 前序修复已覆盖：主题色同步、搜索弹窗焦点、词典键盘选择、登录按钮状态、退出确认、Canvas 可访问性、AudioPlayer 嵌套交互、移动抽屉 `inert` 等。
- 仍存疑点：图片 `width/height` 与 `loading` 策略、未绑定点击的占位按钮、可能残留的硬编码颜色/焦点/动效问题。

## 3. 审查原则

- 使用指南来源：`https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md`
- 输出格式：`file:line` 可点击定位，按文件分组，每条仅描述问题与对应规则。
- 区分：
  - **逻辑问题**：影响功能、交互、可访问性、性能、安全。
  - **UI 问题**：视觉、排版、动效、主题一致性。
- 不涉及后端 API 正确性，仅审查前端代码与表现。

## 4. 审查步骤

### 4.1 准备与工具

1. 重新拉取最新指南，保存到临时参考。
2. 确认本地文件列表：`src/**/*.{vue,js,css}`、`index.html`。
3. 使用 `Grep` 扫描常见反模式，作为重点审查入口：
   - `outline:\s*none` / `outline-none`
   - `transition:\s*all`
   - `@click` 出现在非 `<button>` / `<a>` 上
   - `<img` 缺少 `width` 或 `height`
   - `autoFocus` / `autofocus`
   - `preventDefault.*paste` / `onPaste`
   - 硬编码 `rgba(` / `#` 颜色（排除 variables.css）
   - `window.confirm` 使用场景（确认是否足够的破坏性确认）
   - `user-scalable` / `maximum-scale`
   - `aria-hidden="true"` 是否包裹可聚焦元素

### 4.2 按模块审查

#### A. 全局与入口

| 文件 | 审查重点 |
|------|----------|
| `index.html` | `theme-color` 与当前主题背景是否一致；字体 `preconnect` 是否完整；是否缺少 `preload` 关键字体；viewport 是否禁用缩放。 |
| `src/main.js` | 主题初始化时机；是否重复初始化；全局事件/样式加载顺序。 |
| `src/App.vue` | `skip-link` 是否真正跳到 `<main id="main">`；`/` 热键是否覆盖输入框；全局事件解绑。 |
| `src/router/index.js` | 登录守卫重定向后是否保留原地址；滚动行为是否覆盖锚点；未匹配路由处理。 |
| `src/assets/styles/variables.css` | 深色模式变量是否完整；是否存在未使用的变量。 |
| `src/assets/styles/main.css` / `liquid-glass.css` | 全局 `transition: all`；动画是否响应 `prefers-reduced-motion`；焦点环是否覆盖所有交互元素；`touch-action` 与 `-webkit-tap-highlight-color` 设置。 |

#### B. 导航与搜索

| 文件 | 审查重点 |
|------|----------|
| `AppHeader.vue` | 抽屉关闭后焦点是否回到汉堡按钮；`nav-auth-btn` 作为破坏性操作是否需要二次确认；移动端抽屉链接是否可通过键盘导航；未滚动时文字对比度。 |
| `SearchModal.vue` | 弹窗打开/关闭焦点管理；`aria-selected` 更新是否触发屏幕阅读器；空输入时的最近/热门搜索项是否都有键盘支持；请求竞态保护是否完整。 |
| `SearchBar.vue` | 输入框 `label` / `aria-label`；搜索按钮 `aria-label`；提交状态与加载反馈。 |

#### C. 页面视图

| 文件 | 审查重点 |
|------|----------|
| `Home.vue` | 图片是否都有 `width/height/loading`；计数动画是否可在 `prefers-reduced-motion` 下禁用；Hero 按钮焦点环在深色背景可见；推荐词条 key 是否稳定；长文本截断。 |
| `Dictionary.vue` | 列表项使用 `role="button"` 是否优于 `<button>`；双栏布局在移动端是否可访问；详情面板操作按钮是否有文本标签；筛选 URL 同步是否处理 `replace` 异常；收藏/学习错误提示是否聚焦。 |
| `Learn.vue` | 翻转卡片是否支持键盘/屏幕阅读器（翻转后背面内容如何被朗读）；`isFlipped` 仅视觉翻转可能导致辅助技术不可感知；动作按钮是否有 loading/成功反馈；学习进度计数逻辑是否正确。 |
| `Songs.vue` | Hero 封面 `eager` 是否合理；歌单列表 `song-row-main` 作为大按钮是否包含过多嵌套；歌词预览截断；`duration` 占位是否友好。 |
| `Culture.vue` | 图片尺寸与懒加载；`ToneChart` 可访问性；纹样符号卡片是否有语义标题层级；非遗图片与文字对比度。 |
| `Profile.vue` / `Favorites.vue` / `Record.vue` | 空状态处理；加载/错误状态； destructive 操作确认；表单字段 label 与验证；长列表是否需要虚拟化。 |
| `Settings.vue` | 主题切换是否立即反馈；退出登录确认；表单未保存离开提示；API 错误处理。 |
| `Login.vue` | 提交按钮状态；错误字段聚焦；密码输入 `autocomplete`；`aria-live` 错误提示。 |

#### D. 功能组件

| 文件 | 审查重点 |
|------|----------|
| `AudioPlayer.vue` | 进度条 `role="slider"` 的 `aria-valuetext` 更新；触屏拖动与鼠标事件是否冲突；收起/展开状态切换的焦点；动画是否在减少动效下禁用。 |
| `ToneChart.vue` | `<canvas>` 的 `aria-label` / 文字替代；是否监听主题变化并重绘；是否响应 `prefers-reduced-motion`。 |
| `BarChart.vue` | 同上 Canvas 可访问性；颜色是否依赖变量；动画是否可中断。 |
| `AgentPanel.vue` | 对话区域是否自动滚动并避免破坏焦点；输入框 label；加载状态 `aria-live`；关闭按钮 `aria-label`。 |
| `PageShell.vue` | 标题层级；背景图是否装饰性；安全区与滚动行为。 |

#### E. 状态与工具

| 文件 | 审查重点 |
|------|----------|
| `theme.js` | `auto` 模式下系统主题变化监听是否重复添加；SSR/无 `window` 环境是否安全；`color-scheme` 同步。 |
| `player.js` | 播放状态与 UI 同步；audio 事件错误处理；进度更新是否节流。 |
| `auth.js` / `favorites.js` / `search.js` / `agent.js` | 异步错误是否被吞掉；状态持久化是否安全；注销后状态清理。 |
| `api.js` | 错误统一处理；loading 状态；请求取消/竞态。 |
| `liquidGlass.js` / `cursorGlow.js` | 是否在减少动效下禁用；是否避免在 render 中读取布局；性能影响。 |

### 4.3 汇总报告结构

输出文件：`d:\BuyiDictionaryWeb\buyi-dictionary-vue\.trae\documents\web-frontend-guidelines-review-report.md`

报告至少包含：

1. **执行摘要**：问题总数、高优先级数、主要类别。
2. **问题清单**：按文件分组，每条包含：
   - 文件与行号（`file:line`）
   - 问题类型：逻辑 / UI / 可访问性 / 性能
   - 违反的指南规则
   - 简短描述
3. **全局性问题**：跨多个文件出现的模式（如 `transition: all`、图片缺尺寸）。
4. **未覆盖项**：需要运行后端或真机才能验证的功能。
5. **修复建议优先级**：P0（必须修）、P1（建议修）、P2（优化）。
6. **验证清单**：如何在浏览器/构建中验证。

## 5. 验证步骤

- 审查过程中使用 `npm run build` 确认无构建错误。
- 使用浏览器 DevTools 的 Lighthouse（Accessibility + Performance）作为辅助参考。
- 手动键盘测试：Tab 导航、Enter/Space、Escape、焦点可见性。
- 手动屏幕阅读器测试（NVDA/VoiceOver）重点验证：
  - `SearchModal` 搜索结果导航
  - `Learn.vue` 翻转卡片状态
  - `AudioPlayer` 进度条
  - `Dictionary` 结果列表与详情
- 检查 `prefers-reduced-motion` 下所有动画是否禁用。
- 检查深色模式切换时地址栏、`<select>`、图片遮罩是否一致。

## 6. 约束与假设

- **不修改代码**：本次计划仅输出报告；后续修复需用户确认后另做计划。
- **不保证运行时行为**：后端未启动时无法验证 API 驱动的交互，仅能从代码层面审查。
- **图片压缩**：指南建议的大图压缩需外部工具（如 Squoosh），超出代码审查范围，可列为建议。
- **浏览器范围**：以 Chrome/Edge/Safari 最新版及移动端 WebKit 为主，IE 不予考虑。

## 7. 下一步（用户确认后）

1. 用户审阅报告并勾选需要修复的项。
2. 针对选中项制定修复计划，明确文件、改动点、验证方式。
3. 实施修复并运行 `npm run build` 与手动验证。
