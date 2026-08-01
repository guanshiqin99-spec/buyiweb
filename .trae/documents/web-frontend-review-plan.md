# Web 前端逻辑与 UI 问题审查修复计划

## 摘要

使用 `web-design-guidelines` 技能对 `buyi-dictionary-vue` 前端代码进行全面审查，识别当前仍存在的逻辑交互缺陷与 Web Interface Guidelines 规范 violations，并逐项修复。最终通过 `npm run build` 与关键页面手动验证。

## 当前状态分析

项目基于 Vue 3 + Vite + Pinia，已完成一轮设计与可访问性优化，但探索中仍发现以下问题类型：

1. **焦点与模态交互缺陷**：搜索模态焦点陷阱不自然，移动抽屉关闭时未正确隐藏。
2. **语义化与键盘可访问性**：部分可点击区域使用 `div`/`article` 而非按钮，缺少 Space 选择、焦点管理。
3. **深色模式适配残留**：搜索模态、登录页等仍使用硬编码 `rgba(27, 58, 92, ...)` 色值，暗色下可读性差。
4. **表单与破坏性操作规范**：登录提交按钮在无效即禁用，未聚焦首个错误；设置页退出登录无二次确认。
5. **Canvas/非文本内容可访问性**：声调图 canvas 缺少替代文本与 `role="img"`。

## 待审查文件清单

- `index.html`
- `src/App.vue`
- `src/main.js`
- `src/router/index.js`
- `src/assets/styles/main.css`
- `src/assets/styles/variables.css`
- `src/assets/styles/liquid-glass.css`
- `src/components/layout/AppHeader.vue`
- `src/components/layout/AppFooter.vue`
- `src/components/common/SearchBar.vue`
- `src/components/common/SearchModal.vue`
- `src/components/common/PageShell.vue`
- `src/components/specific/AudioPlayer.vue`
- `src/components/specific/ToneChart.vue`
- `src/components/specific/BarChart.vue`
- `src/components/specific/AgentPanel.vue`
- `src/views/Home.vue`
- `src/views/Dictionary.vue`
- `src/views/Learn.vue`
- `src/views/Login.vue`
- `src/views/Settings.vue`
- `src/views/Profile.vue`
- `src/views/Favorites.vue`
- `src/views/Songs.vue`
- `src/views/Culture.vue`
- `src/views/Record.vue`
- `src/stores/theme.js`

## 拟议修改

### 1. 搜索模态焦点与语义修复

**文件**：`src/components/common/SearchModal.vue`

- **问题**：`handleKeydown` 中对 `Tab` 强制 `preventDefault()` 并聚焦输入框，破坏自然 Tab 导航，Shift+Tab 也未处理。
- **修复**：移除 Tab 拦截，改为标准焦点顺序；保留 Esc / ↑↓ / Enter；为建议项使用 `<button>` 或 `role="option"` + 显式 `focus-visible` 样式。
- **问题**：建议项使用 `div` 绑定 `@click`，无原生键盘可触发性。
- **修复**：将 `.suggestion-item` 改为 `<button type="button">`，移除 cursor:pointer，保留视觉样式。

### 2. 移动端导航抽屉隐藏状态

**文件**：`src/components/layout/AppHeader.vue`

- **问题**：抽屉关闭时通过 `display:none` 隐藏，但未加 `aria-hidden="true"`/`inert`，辅助技术仍可能遍历到隐藏链接。
- **修复**：关闭时为抽屉容器添加 `:aria-hidden="!isDrawerOpen"` 与 `:inert="!isDrawerOpen"`（Vue 3 已透传 inert 布尔属性）。

### 3. 词典结果列表键盘交互

**文件**：`src/views/Dictionary.vue`

- **问题**：`.result-item` 为 `article[tabindex="0"]`，仅响应 Enter，未响应 Space，也无 `role="button"`/`aria-pressed`。
- **修复**：添加 `@keydown.space.prevent="selectItem(result)"`，并补充 `role="button"` 与 `:aria-pressed="result.id === selectedId"`。

### 4. 登录表单规范

**文件**：`src/views/Login.vue`

- **问题**：提交按钮 `:disabled="isLoading || !isValid"` 在表单无效时即禁用，不符合 Guidelines「Submit button stays enabled until request starts」。
- **修复**：仅当 `isLoading` 时禁用，点击后校验并聚焦第一个错误字段。
- **问题**：提交失败/校验失败时未聚焦首个错误。
- **修复**：在校验失败或后端返回错误后，将焦点移动到第一个 `aria-invalid="true"` 的输入或错误提示。

### 5. 设置页破坏性操作确认

**文件**：`src/views/Settings.vue`

- **问题**：退出登录按钮立即执行 `authStore.logout()`，无确认或撤销窗口。
- **修复**：点击后显示确认对话框（`window.confirm` 或自定义 modal），用户确认后再退出。

### 6. 声调图 Canvas 可访问性

**文件**：`src/components/specific/ToneChart.vue`

- **问题**：`<canvas>` 无 `role="img"`、无 `aria-label`，屏幕阅读器用户无法感知图表内容。
- **修复**：为 canvas 添加 `role="img"` 与 `:aria-label="布依语声调曲线图：..."`；将数据描述渲染为 visually hidden 文本作为替代内容。

### 7. 深色模式硬编码色值清理

**文件**：`src/components/common/SearchModal.vue`、`src/views/Login.vue`、`src/views/Dictionary.vue` 等

- **问题**：多处使用 `rgba(27, 58, 92, x)` 或 `rgba(255,255,255,x)` 硬编码，暗色主题下对比度/可读性异常。
- **修复**：替换为 `variables.css` 中语义化 token（如 `--c-text-70`、`--c-brand-08`、`--c-white-80` 等），必要时补充暗色 token。

### 8. 音频播放器嵌套可交互元素

**文件**：`src/components/specific/AudioPlayer.vue`

- **问题**：收起态 `player-disc` 为 `role="button"`，内部又嵌套 `disc-play` 按钮，存在嵌套交互冲突。
- **修复**：将 `player-disc` 改为非按钮容器（仅视觉与点击展开），保留内部播放按钮；为展开/折叠提供独立按钮或点击区域，确保单一职责。

### 9. 主题色 meta 初始值

**文件**：`index.html`、`src/stores/theme.js`

- **问题**：`index.html` 中 `theme-color` 固定为浅色 `#F5F2EF`，在深色默认/系统深色下首次渲染地址栏会闪白。
- **修复**：在 `theme.js` 的 `init()` 中，应用主题后立即同步 `meta[name="theme-color"]`（当前已实现），并在 `index.html` 中预留与 `prefers-color-scheme` 一致的默认值或内联脚本避免闪烁。

### 10. 图片与性能兜底

**文件**：`src/views/Home.vue`、`src/views/Culture.vue`、`src/views/Songs.vue`

- **问题**：hero/文化图片虽已有 `width/height`，但部分列表图片仍需检查是否显式尺寸与 `loading="lazy"`。
- **修复**：遍历所有 `<img>`，确保无 CLS 风险；对首屏外图片统一 `loading="lazy"`。

## 假设与决策

- **范围限定**：本次仅审查前端 UI/交互逻辑，后端 API 异常处理保持现状。
- **浏览器支持**：`inert` 属性在目标浏览器中可用；如需兼容旧版，可补充 `tabindex="-1"` 与 `aria-hidden` 组合。
- **暗色 token**：优先复用现有 `variables.css` token，缺失时再补充，不重构设计系统。
- **确认框**：设置页退出登录使用原生 `confirm` 以最小改动实现破坏性操作确认。

## 验证步骤

1. **构建验证**：运行 `npm run build`，确保 0 errors、0 warnings。
2. **搜索模态**：
   - `/` 唤起模态，Tab 可自然循环焦点；
   - ↑↓ 选择建议项，Enter 跳转；
   - Esc 关闭并恢复焦点。
3. **移动导航**：在 375px 视口下，打开/关闭抽屉，Tab 不会进入隐藏链接。
4. **词典页**：结果项可用 Tab 聚焦，Enter/Space 均可选中。
5. **登录页**：空表单提交时按钮可用，提交后聚焦首个错误字段；有效表单提交期间按钮禁用并显示 spinner 文本。
6. **设置页**：点击退出登录弹出确认，取消后保持登录态。
7. **声调图**：屏幕阅读器可读到图表描述；暗色/浅色切换后曲线重绘。
8. **音频播放器**：收起态点击圆盘展开，点击播放按钮不触发展开，焦点顺序正确。
9. **暗色模式**：切换系统/设置主题后，搜索模态、登录页、词典页文字对比度正常，无 hard-coded 蓝色残留。
