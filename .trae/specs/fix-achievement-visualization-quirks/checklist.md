# Checklist

## 阶段 1：工具函数修复

### Task 1: utils/userProgress.js getTodayTypeCounts 返回值语义
- [x] `if (!raw) return null;`（无存储返回 null）
- [x] `if (parsed && parsed.date !== todayKey) return {};`（跨天返回空对象）
- [x] catch 分支 `return null;`
- [x] 同日正常返回 `parsed.counts || {}` 不变
- [x] 排查调用方（mine 页、dailyTasks）对 null 容错

### Task 2: utils/dailyTasks.js 跨天回退逻辑
- [x] `todayTypeCounts` 判断用 `!= null` 兼容 null/undefined
- [x] 有今日数据（todayTypeCounts 非 null）时不回退，缺失字段当 0
- [x] 无今日数据（todayTypeCounts 为 null）时回退到 fallbackTypeCounts
- [x] 跨天场景：todayTypeCounts={} → 三任务 current=0、completed=false
- [x] 老客户端场景：todayTypeCounts=null → 回退到累计 typeCounts

## 阶段 2：页面与组件修复

### Task 3: record 页热力图初始数据
- [x] `data` 新增 `heatmapRecords: []`
- [x] 新增 `loadHeatmapRecords()` 调用 `History.list(1, 500)`
- [x] `refreshRecords` 首页成功后调用 `loadHeatmapRecords`
- [x] 未登录清空时同步清空 `heatmapRecords`
- [x] wxml `<heat-map records="{{heatmapRecords}}" />`
- [x] 列表分页 pageSize=20 不变

### Task 4: share-card 深色模式
- [x] `index.json` 新增 `"styleIsolation": "apply-shared"`
- [x] wxss `@media (prefers-color-scheme: dark)` 改为 `.page.dark` 前缀
- [x] 原 `@media` 内所有规则（modal/标题/image/ghost 按钮）迁移到 `.page.dark` 前缀
- [x] 浅色模式下弹窗样式不变

### Task 5: quiz 页弱网计数
- [x] 删除 `quizApi.create` 成功后的 `notifyUserProgressUpdated` 调用
- [x] 在 `if (!isLogin) return` 之后、`setData({ saving: true })` 之前新增 `notifyUserProgressUpdated('quiz', 'quiz')`
- [x] `quizApi.create` 的 try/catch 与提示不变
- [x] 未登录态不调用 `notifyUserProgressUpdated`

## 阶段 3：回归验证

### Task 6: 边角问题回归验证
- [x] P1 跨天：前日计数 → 第二天三任务 current=0、completed=false
- [x] P1 老客户端：清空存储后回退到累计 typeCounts
- [x] P2 热力图：记录 > 20 条时初始显示完整 12 周
- [x] P2 深色模式：手动切深色后分享卡预览弹窗跟随
- [x] P2 弱网答题：`quizApi.create` 失败时每日任务答题 current 仍 +1
- [x] 既有功能无回归：mine 页/record 页/quiz 页核心流程正常
