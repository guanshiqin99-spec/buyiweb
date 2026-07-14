# Tasks

- [x] Task 1: 抓取最新版 Web Interface Guidelines 作为审查基准
  - [x] SubTask 1.1: 通过 WebFetch 拉取 https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md
  - [x] SubTask 1.2: 确认规则清单完整（含反模式扫描）
- [x] Task 2: 复查入口与布局层
  - [x] SubTask 2.1: 审查 `src/App.vue`、`src/main.js`、`index.html`
  - [x] SubTask 2.2: 审查 `src/components/layout/AppHeader.vue`、`AppFooter.vue`
- [x] Task 3: 复查视图层（叙事页）
  - [x] SubTask 3.1: 审查 `src/views/Home.vue`（Hero、CTA、计数动画、导航语义）
  - [x] SubTask 3.2: 审查 `src/views/Songs.vue`（IntersectionObserver 清理、Hero 图、歌曲时长）
  - [x] SubTask 3.3: 审查 `src/views/Culture.vue`（减少动效兜底、`&nbsp;`、图片语义）
- [x] Task 4: 复查视图层（工具页）
  - [x] SubTask 4.1: 审查 `src/views/Dictionary.vue`（搜索 URL 同步、结果项语义、收藏状态、focus-visible）
  - [x] SubTask 4.2: 审查 `src/views/Learn.vue`（学习记录顺序、翻转卡片语义、aria-live、timer 清理）
  - [x] SubTask 4.3: 审查 `src/views/Login.vue`（表单 label、autocomplete、错误聚焦、提交态）
  - [x] SubTask 4.4: 审查 `src/views/Settings.vue`、`src/views/Profile.vue`、`src/views/Favorites.vue`、`src/views/Record.vue`
  - [x] SubTask 4.5: 审查 `src/views/Quiz.vue`
- [x] Task 5: 复查通用与专用组件
  - [x] SubTask 5.1: 审查 `src/components/common/PageShell.vue`、`ToolPageShell.vue`、`FloatingParticles.vue`
  - [x] SubTask 5.2: 审查 `src/components/common/SearchBar.vue`、`SearchModal.vue`（label、aria-live、键盘、overscroll-behavior）
  - [x] SubTask 5.3: 审查 `src/components/specific/AgentPanel.vue`、`AudioPlayer.vue`、`AudioSpectrum.vue`、`BarChart.vue`、`PatternDecoration.vue`、`ToneChart.vue`、`TonePiano.vue`
  - [x] SubTask 5.4: 抽查 `src/components/icons/*.vue`（aria-hidden、focusable）
- [x] Task 6: 复查样式与工具
  - [x] SubTask 6.1: 审查 `src/assets/styles/variables.css`、`main.css`、`liquid-glass.css`（transition 属性显式化、outline、prefers-reduced-motion 兜底）
  - [x] SubTask 6.2: 审查 `src/utils/liquidGlass.js`、`src/utils/pointerGlow.js`（observer/timer 清理、reduced-motion 分支）
  - [x] SubTask 6.3: 抽查 `src/router/index.js` 与 `src/stores/*.js`
- [x] Task 7: 与旧报告对照并分类
  - [x] SubTask 7.1: 对照 `web-frontend-guidelines-review-report.md` 逐条判定 已修复 / 残留 / 不再适用
  - [x] SubTask 7.2: 标记本次发现的新引入问题及优先级
- [x] Task 8: 输出最终验收报告
  - [x] SubTask 8.1: 按 `file:line` 格式汇总残留问题与新引入问题
  - [x] SubTask 8.2: 给出最终签收建议（通过 / 有条件通过 / 不通过）与阻塞项

# Task Dependencies

- Task 1 是所有后续审查任务的前提
- Task 2 / 3 / 4 / 5 / 6 相互独立，可并行
- Task 7 依赖 Task 2-6 完成
- Task 8 依赖 Task 7 完成
