# Tasks

## 阶段 1：工具函数修复（无 UI 依赖，可并行）

- [x] Task 1: 修复 utils/userProgress.js 的 getTodayTypeCounts 返回值语义
  - [ ] SubTask 1.1: `if (!raw) return null;`（无存储返回 null，表示今日数据不存在，可回退）
  - [ ] SubTask 1.2: `if (parsed && parsed.date !== todayKey) return {};`（跨天返回空对象，表示今日有效但为 0，不回退）
  - [ ] SubTask 1.3: catch 分支 `return null;`（异常时返回 null）
  - [ ] SubTask 1.4: 同日正常返回 `parsed.counts || {}` 不变
  - [ ] SubTask 1.5: 排查所有 `getTodayTypeCounts()` 调用方（mine 页、dailyTasks 等），确认对 `null` 返回值容错（`null?.field` / `null && typeof null === 'object'` 等）

- [x] Task 2: 修复 utils/dailyTasks.js 的跨天回退逻辑
  - [ ] SubTask 2.1: `todayTypeCounts` 判断改为 `stats.todayTypeCounts != null && typeof stats.todayTypeCounts === 'object' ? stats.todayTypeCounts : null`（null/undefined 都视为 null）
  - [ ] SubTask 2.2: 计数取值改为 `todayTypeCounts ? (todayTypeCounts.dictionary ?? 0) : (fallbackTypeCounts.dictionary ?? 0)`（有今日数据时不回退，无今日数据才回退）
  - [ ] SubTask 2.3: 同样处理 songCount 与 quizCount
  - [ ] SubTask 2.4: 验证跨天场景：todayTypeCounts 为 `{}` 时，三任务 current 均为 0、completed 均为 false
  - [ ] SubTask 2.5: 验证老客户端场景：todayTypeCounts 为 `null` 时，回退到 fallbackTypeCounts

## 阶段 2：页面与组件修复（互相独立，可并行）

- [x] Task 3: 修复 record 页热力图初始数据不完整
  - [ ] SubTask 3.1: `pages/record/index.js` 的 `data` 新增 `heatmapRecords: []`
  - [ ] SubTask 3.2: 新增 `loadHeatmapRecords()` 方法，调用 `History.list(1, 500)` 拉取大 pageSize 覆盖近 12 周，结果写入 `heatmapRecords`；失败时静默置空，不阻塞主流程
  - [ ] SubTask 3.3: 在 `refreshRecords` 首页成功后（与 `loadStatsAndSuggestions` 并列）调用 `this.loadHeatmapRecords()`
  - [ ] SubTask 3.4: 未登录清空时同步清空 `heatmapRecords: []`
  - [ ] SubTask 3.5: `pages/record/index.wxml` 的 `<heat-map records="{{records}}" />` 改为 `<heat-map records="{{heatmapRecords}}" />`
  - [ ] SubTask 3.6: 保留现有列表分页逻辑（pageSize=20）不变

- [x] Task 4: 修复 share-card 深色模式不跟随手动主题
  - [ ] SubTask 4.1: `components/share-card/index.json` 新增 `"styleIsolation": "apply-shared"`（让页面 `.page.dark` 类样式能影响组件内元素）
  - [ ] SubTask 4.2: `components/share-card/index.wxss` 把 `@media (prefers-color-scheme: dark) { ... }` 块改为 `.page.dark` 前缀的后代选择器（如 `.page.dark .share-preview-modal { ... }`）
  - [ ] SubTask 4.3: 确保所有原 `@media` 内的规则（modal 背景、标题色、image 背景、ghost 按钮色）都迁移到 `.page.dark` 前缀下
  - [ ] SubTask 4.4: 验证浅色模式下弹窗样式不变

- [x] Task 5: 修复 quiz 页弱网下每日任务不计数
  - [ ] SubTask 5.1: `pages/quiz/index.js` 的 `persistResult` 方法中，删除 `quizApi.create` 成功后的 `notifyUserProgressUpdated('quiz', 'quiz')` 调用（line 236-240）
  - [ ] SubTask 5.2: 在 `if (!getApp().globalData.isLogin) { ... return; }` 之后、`this.setData({ saving: true, ... })` 之前，新增 `try { notifyUserProgressUpdated('quiz', 'quiz'); } catch (e) {}`（登录态本地存储成功后立即计数）
  - [ ] SubTask 5.3: 保留 `quizApi.create` 的 try/catch 与成功/失败提示不变
  - [ ] SubTask 5.4: 验证未登录态不调用 `notifyUserProgressUpdated`（每日任务是登录态功能）

## 阶段 3：回归验证

- [x] Task 6: 边角问题回归验证
  - [ ] SubTask 6.1: 验证 P1 跨天：模拟前日计数 → 第二天进入 mine 页，三任务 current=0、completed=false
  - [ ] SubTask 6.2: 验证 P1 老客户端：清空 `buyi:daily-type-counts` 存储，累计 typeCounts 有值时任务回退到累计
  - [ ] SubTask 6.3: 验证 P2 热力图：记录 > 20 条时进入 record 页，热力图初始即显示完整 12 周数据
  - [ ] SubTask 6.4: 验证 P2 深色模式：手动切换深色模式后导出分享卡，预览弹窗显示深色样式
  - [ ] SubTask 6.5: 验证 P2 弱网答题：模拟 `quizApi.create` 失败，每日任务"答题 1 轮"current 仍 +1
  - [ ] SubTask 6.6: 验证既有功能无回归：mine 页仪表盘/徽章墙/分享卡导出、record 页列表分页/进度条/最近学习、quiz 答题计分/本地存储/云端同步提示

# Task Dependencies
- Task 1 与 Task 2 有依赖：Task 2 的回退逻辑依赖 Task 1 的 `getTodayTypeCounts` 返回值语义（null vs {}）。建议 Task 1 先完成，Task 2 紧随
- Task 3、Task 4、Task 5 互相独立，可并行
- Task 6 依赖 Task 1-5 全部完成
