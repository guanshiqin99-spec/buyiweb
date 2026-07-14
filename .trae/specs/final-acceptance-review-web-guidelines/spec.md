# 最终验收审查 Spec

## Why

`buyi-dictionary-vue` 已基于 `web-frontend-guidelines-review-report.md` 与 `web-frontend-guidelines-fix-plan.md` 完成一轮整改。本次为最终验收：依据最新的 Vercel Web Interface Guidelines（来源：https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md）对全部关键页面与组件进行全量静态复查，确认既有问题已修复、未引入新问题、未发生回归，给出可签收的最终验收结论。

## What Changes

- 仅做只读审查，**不修改任何源代码**。
- 依据最新版 Web Interface Guidelines 对下列范围进行 `file:line` 格式的复查：
  - 可访问性（语义化标签、aria-label、键盘交互、装饰性图标 aria-hidden、aria-live）
  - 焦点状态（focus-visible、禁用 outline:none 裸奔、focus-within）
  - 表单（label、autocomplete、type/inputmode、提交态、错误聚焦、未保存提示）
  - 动效（prefers-reduced-motion、仅 transform/opacity、禁用 transition:all、可中断）
  - 排版（省略号、引号、不间断空格、加载态、tabular-nums、text-wrap:balance）
  - 内容处理（截断/换行、min-w-0、空状态、长内容）
  - 图片（width/height、loading=lazy、fetchpriority、alt）
  - 性能（虚拟列表、不在渲染期读布局、批量读写、preconnect、字体 preload）
  - 导航与状态（URL 反映状态、用 `<a>`/`<RouterLink>`、破坏性操作确认）
  - 触控（touch-action、tap-highlight、overscroll-behavior、autoFocus 审慎）
  - 安全区域、暗色模式、i18n、水合安全、Hover 状态、内容文案
  - 反模式扫描（user-scalable=no、onPaste preventDefault、transition:all、outline-none、div onClick、img 无尺寸、数组 .map 无虚拟化、输入无 label、图标按钮无 aria-label、硬编码日期/数字格式、autoFocus 滥用）
- 输出三类结论：
  1. **已修复**：对照旧报告确认已解决项
  2. **残留问题**：仍未修复或修复不完整的项
  3. **新引入问题**：本次整改中新产生的问题
- 给出最终签收建议（通过 / 有条件通过 / 不通过）。

## Impact

- 受影响能力：全部面向用户的页面与共享组件的可访问性、交互正确性、性能与可签收度。
- 受影响代码（只读审查范围）：
  - 入口与布局：`src/App.vue`、`src/main.js`、`index.html`、`src/components/layout/AppHeader.vue`、`src/components/layout/AppFooter.vue`
  - 视图：`src/views/Home.vue`、`src/views/Dictionary.vue`、`src/views/Learn.vue`、`src/views/Songs.vue`、`src/views/Culture.vue`、`src/views/Quiz.vue`、`src/views/Login.vue`、`src/views/Settings.vue`、`src/views/Profile.vue`、`src/views/Favorites.vue`、`src/views/Record.vue`
  - 通用组件：`src/components/common/PageShell.vue`、`src/components/common/ToolPageShell.vue`、`src/components/common/SearchBar.vue`、`src/components/common/SearchModal.vue`、`src/components/common/FloatingParticles.vue`
  - 专用组件：`src/components/specific/AgentPanel.vue`、`src/components/specific/AudioPlayer.vue`、`src/components/specific/AudioSpectrum.vue`、`src/components/specific/BarChart.vue`、`src/components/specific/PatternDecoration.vue`、`src/components/specific/ToneChart.vue`、`src/components/specific/TonePiano.vue`
  - 图标组件：`src/components/icons/*.vue`
  - 样式：`src/assets/styles/variables.css`、`src/assets/styles/main.css`、`src/assets/styles/liquid-glass.css`
  - 工具与 Store：`src/utils/liquidGlass.js`、`src/utils/pointerGlow.js`、`src/router/index.js`、`src/stores/*.js`

## Requirements

### Requirement: 全量只读复查

The system SHALL perform a read-only compliance review of all in-scope files against the latest Vercel Web Interface Guidelines.

#### Scenario: 复查每个文件

- **WHEN** 审查者读取任一受影响文件
- **THEN** 对照最新版指南的全部规则（Accessibility / Focus States / Forms / Animation / Typography / Content Handling / Images / Performance / Navigation & State / Touch & Interaction / Safe Areas & Layout / Dark Mode & Theming / Locale & i18n / Hydration Safety / Hover & Interactive States / Content & Copy / Anti-patterns）逐项检查
- **THEN** 输出 `file:line` 格式问题清单，按文件分组
- **THEN** 对通过项标注 `✓ pass`

### Requirement: 与旧报告对照

The system SHALL cross-reference findings against the previous review report and fix plan.

#### Scenario: 已修复 / 残留 / 新引入分类

- **WHEN** 审查者发现旧报告中标注的问题
- **THEN** 判定为「已修复」或「残留问题」，并给出依据（修复后的代码位置）
- **WHEN** 审查者发现旧报告未记录的新问题
- **THEN** 归入「新引入问题」，标注类别与优先级

### Requirement: 最终签收结论

The system SHALL produce a final acceptance verdict.

#### Scenario: 签收判定

- **WHEN** 复查完成
- **THEN** 给出签收建议：通过（无 P0/P1 残留）/ 有条件通过（仅 P2 残留）/ 不通过（存在 P0/P1 残留）
- **THEN** 列出必须修复的阻塞项（若有）

## Constraints

- 仅只读审查，不修改任何 `.vue`、`.js`、`.css` 源文件。
- 不删除、不回滚用户已有改动。
- 审查输出使用 `file:line` 格式，遵循 Web Interface Guidelines 指定的输出格式。
- 不创建任何文档文件（除 spec.md / tasks.md / checklist.md 外）。
