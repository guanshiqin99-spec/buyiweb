# 「我的」页面布局优化

## Summary

针对小程序 `pages/mine` 页面成就体系上线后暴露的布局问题——统计数字三处重复、区块标题图标同质化、6 张卡扁平堆叠无节奏、分享导出孤儿卡、高频入口埋底——进行信息架构重排与视觉层次收敛。**不删任何功能、不动任何 JS 业务逻辑**，只做 WXML 结构合并/重排 + WXSS 样式调整 + 图标重新分配。

## Current State Analysis

### 当前页面区块顺序（8 个区块 + 菜单 + 签句）
1. `user-card-premium` 用户卡
2. `porcelain-stat-card` 瓷片统计卡（累计收藏 / 学习记录）
3. `growth-card` 学习成长卡（连续学习 / 已学习词汇）
4. `achievement-section` 成就区块（含 6 张子卡）：
   - `stats-dashboard` 学习概览（今日/累计/连续/收藏 4 数字）
   - `suggestion-card` 学习建议
   - `daily-tasks` 每日任务
   - `achievement-export` 成就分享导出（仅 2 按钮）
   - `badge-wall` 徽章墙
   - `chart-card` 学习分布（柱状图+雷达图）
5. `culture-menu-card` 功能菜单
6. `culture-footer` 文化签句

### 核心问题
| 问题 | 表现 | 影响 |
|------|------|------|
| 统计数字三处重复 | 收藏数出现在 porcelain-stat、growth、dashboard；学习记录数同；连续天数出现在 growth、dashboard | 顶部 3 张卡都在秀数字，视觉焦点涣散 |
| header 图标同质化 | 学习成长/学习概览/学习建议/学习分布 4 张卡都用 `trend-up.svg` | 扫视分不清区块 |
| 分享导出孤儿卡 | `achievement-export` 仅含 2 个按钮，夹在任务与徽章之间 | 打断节奏 |
| 高频入口埋底 | 「单词卡学习」在菜单第 2 项 | 操作路径长 |
| 无分组节奏 | 6 张成就子卡平铺 | 缺乏「今日/成长」语义分组 |

### JS 依赖（不可破坏）
`index.js` 中被 WXML 引用的 bindtap/bindshare 方法：`onAvatarTap`、`toFavAndRecord`、`toRecord`、`onSuggestionTap`、`onTaskTap`、`exportAchievement`、`openBadge`、`closeBadge`、`goToLearn`、`toSettings`、`showAbout`、`onShareCardReady`、`exportAchievement`。data 字段：`stats.{favoriteCount,learningRecordCount,streak}`、`learnStats.{todayCount,totalCount,streakDays,typeCounts,favoriteCount}`、`suggestions`、`dailyTasks`、`dailyTasksCompletedCount`、`allDailyTasksCompleted`、`badges`、`unlockedBadgeCount`、`totalBadgeCount`、`typeChartData`、`selectedBadge`、`isExporting`、`isLogin`、`userInfo`。

### 可用图标资源（19 个 SVG，无新增）
`trend-up` `star` `shield-check-white` `shield-check` `settings` `info` `flame` `clock` `check-circle` `mine` `song` `favorite` `app` `home` `trash` `heart-active` `heart` `play` `pause` `search`

## Proposed Changes

### 目标结构（5 区块 + 菜单 + 签句，净减 3 张卡）
```
1. user-card-premium         用户卡（保留不动）
2. 【今日】stats-dashboard   学习概览（合并 porcelain-stat + growth + dashboard，4 数字单行小号版）
3. 【今日】daily-tasks       每日任务（前置）
4. 【今日】suggestion-card   学习建议
5. 【成长】badge-wall        徽章墙（header 右侧加「导出/分享」按钮 ← 吸收 achievement-export）
6. 【成长】chart-card        学习分布（柱状图+雷达图）
7. culture-menu-card        功能菜单（「单词卡学习」置顶 + 主色高亮）
8. culture-footer           文化签句（保留）
```

### 文件 1：`pages/mine/index.wxml`

**改动 A：删除 `porcelain-stat-card` 整块（第 27-50 行）**
- 原因：累计收藏/学习记录 2 个数字将合并进 `stats-dashboard`
- 注意：保留 `toFavAndRecord`、`toRecord` 两个跳转行为，迁移到合并后的 dashboard 对应数字上

**改动 B：删除 `growth-card` 整块（第 52-76 行）**
- 原因：连续学习/已学习词汇 2 个数字与 dashboard 重复
- 注意：`toRecord` 跳转保留，迁移到 dashboard 对应数字

**改动 C：重写 `stats-dashboard`（第 81-105 行）**
- 合并 3 张统计卡的 4 个数字为一行 4 格小号版：连续打卡 / 今日学习 / 累计学习 / 收藏词汇
- 每格加 `bindtap`：连续打卡→`toRecord`、今日学习→`toRecord`、累计学习→`toRecord`、收藏词汇→`toFavAndRecord`
- 数字字号从 52rpx 降到 40rpx（弱化数字霸权，让徽章墙成视觉焦点）
- 加 section 标题「今日学习」在卡上方（用 `.section-title` 新类）

**改动 D：调整成就子卡顺序**
- 原顺序：dashboard → suggestion → daily-tasks → export → badge-wall → chart
- 新顺序：dashboard → daily-tasks → suggestion → badge-wall → chart

**改动 E：删除 `achievement-export` 整块（第 158-166 行）**
- 原因：仅 2 按钮，吸收进 `badge-wall` header
- 注意：`exportAchievement` bindtap 与 `open-type="share"` 按钮迁移到徽章墙 header

**改动 F：改造 `badge-wall` header（第 169-174 行）**
- header 右侧从「已解锁 X/Y」文字，改为「已解锁 X/Y」+ 两个小图标按钮（导出 + 分享）
- 导出按钮：`bindtap="exportAchievement"` `loading="{{isExporting}}"` `disabled="{{isExporting}}"`
- 分享按钮：`open-type="share"`
- 图标用 `star.svg`（导出）和 `favorite.svg`（分享）的轻量版本，或用文字「导出 / 分享」胶囊按钮

**改动 G：功能菜单调整（第 222-258 行）**
- 「单词卡学习」从第 2 项移到第 1 项，「学习记录」顺延为第 2 项
- 「单词卡学习」项加 `menu-item-highlight` 类做主色高亮（左侧加 4rpx 主色竖条 + 浅主色背景）

**改动 H：加 section 分组标题**
- 在 dashboard 卡前加：`<view class="section-title">今日学习</view>`
- 在 badge-wall 卡前加：`<view class="section-title">成长沉淀</view>`
- 在 culture-menu-card 前加：`<view class="section-title">更多功能</view>`

### 文件 2：`pages/mine/index.wxss`

**改动 A：删除 `.porcelain-stat-card` 及其子样式（第 181-254 行）**
- 包括 `.stat-item` `.stat-icon-wrap` `.stat-icon` `.stat-data` `.stat-num` `.stat-title` `.stat-divider-cloud` 及 dark 变体

**改动 B：删除 `.growth-card` 及其子样式（第 256-354 行）**
- 包括 `.growth-content` `.growth-item` `.growth-icon` `.growth-label` `.growth-value` `.growth-num` `.growth-unit` `.growth-desc` 及 dark 变体

**改动 C：删除 `.achievement-export` 及其子样式（第 672-684 行）**
- 包括 `.export-btn` 相关

**改动 D：改造 `.stat-card-dashboard`（第 482-516 行）**
- `.stat-card-dashboard-row` 改为 `justify-content: space-between` 单行 4 格（原 2x2）
- `.stat-card-dashboard` 的 `flex: 0 0 48%` 改为 `flex: 1`（4 等分），`padding` 从 `28rpx 16rpx` 减到 `20rpx 8rpx`
- `.stat-card-num` 字号从 `52rpx` 改为 `40rpx`
- 加 `.stat-card-tap` 类表示可点击（`active` 态 opacity 0.7）

**改动 E：新增 `.section-title` 样式**
```css
.section-title {
  font-size: 26rpx;
  font-weight: 600;
  color: var(--color-text-secondary);
  letter-spacing: 4rpx;
  padding: 32rpx 40rpx 16rpx;
  display: flex;
  align-items: center;
}
.section-title::before {
  content: '';
  width: 6rpx;
  height: 24rpx;
  background: var(--color-primary);
  border-radius: 3rpx;
  margin-right: 16rpx;
}
```

**改动 F：新增 `.badge-wall-actions` 样式（徽章墙 header 按钮组）**
```css
.badge-wall-actions {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 12rpx;
}
.badge-action-btn {
  font-size: 22rpx;
  padding: 6rpx 20rpx;
  border-radius: var(--radius-capsule);
  background: rgba(22, 100, 217, 0.08);
  color: var(--color-primary);
  border: none;
  line-height: 1.6;
}
.badge-action-btn::after { border: none; }
.page.dark .badge-action-btn { background: rgba(255, 255, 255, 0.08); }
.badge-action-btn[disabled] { opacity: 0.5; }
```
- 原 `.badge-count` 保留但移到 actions 内部第一个元素

**改动 G：新增 `.menu-item-highlight` 样式**
```css
.menu-item-highlight {
  position: relative;
  background: linear-gradient(90deg, rgba(22, 100, 217, 0.06) 0%, transparent 100%);
}
.menu-item-highlight::before {
  content: '';
  position: absolute;
  left: 0;
  top: 16rpx;
  bottom: 16rpx;
  width: 6rpx;
  background: var(--color-primary);
  border-radius: 3rpx;
}
.page.dark .menu-item-highlight {
  background: linear-gradient(90deg, rgba(90, 169, 255, 0.1) 0%, transparent 100%);
}
```

**改动 H：徽章未解锁样式微调（第 726-736 行）**
- `.badge-locked` 的 `opacity: 0.55` 改为 `opacity: 0.7`，`filter: grayscale(0.8)` 改为 `filter: grayscale(0.5)`
- 原因：原值过暗，引导性弱；新值保留原色 50% 透明 + 50% 灰度，更引导解锁

### 文件 3：`pages/mine/index.js`
- **不改动任何业务逻辑**
- 仅清理上轮 spec 提到的「未使用的 `notifyUserProgressUpdated` 导入」（第 8 行）——可选，若担心回归可保留

## Assumptions & Decisions

1. **不新增图标资源**：用现有 19 个 SVG 重新分配。学习概览保留 `trend-up`，学习建议改用 `info`，每日任务保留 `check-circle`，徽章墙保留 `star`，学习分布保留 `trend-up`（与概览同图标但分属不同 section，可接受）。
2. **合并统计卡保留所有跳转行为**：原 porcelain-stat 的「累计收藏→toFavAndRecord」「学习记录→toRecord」、原 growth 的「连续学习→toRecord」「已学习词汇→toRecord」全部迁移到合并后的 dashboard 4 个数字格上。
3. **section 标题用文字 + 主色竖条**：不引入新纹样分隔线，保持轻量。
4. **徽章墙 header 按钮用文字胶囊**：不用图标按钮，避免图标语义混淆。
5. **「单词卡学习」置顶高亮**：用左侧主色竖条 + 浅主色渐变背景，不改变菜单项结构。
6. **不处理 spec 提到的 5 个轻微观察项**（share-card 深色模式、quiz 弱网、badge-motif base64 等），它们与本轮布局优化无关。
7. **不改动 `index.json`**：组件依赖不变。

## Verification Steps

1. **结构完整性**：编译预览，确认页面加载无报错，8 个区块按新顺序渲染。
2. **跳转行为回归**：
   - 点击用户卡 → 未登录跳登录页 / 已登录 toast
   - 点击概览卡 4 个数字 → 分别跳记录页/收藏页
   - 点击每日任务「去完成」→ 跳对应 link
   - 点击学习建议项 → 跳对应 link
   - 点击徽章 → 弹出详情弹窗
   - 点击徽章墙 header「导出」→ 触发 exportAchievement
   - 点击徽章墙 header「分享」→ 触发 open-type=share
   - 点击菜单项 → 分别跳记录/学习/设置/关于
3. **数据展示**：
   - 概览卡 4 个数字正确显示（连续/今日/累计/收藏）
   - 徽章墙解锁数正确
   - 柱状图/雷达图正常渲染
4. **深色模式**：手动切深色，确认 section 标题、徽章墙按钮、菜单高亮项、徽章未解锁态在深色下可读。
5. **未登录态**：`isLogin=false` 时，achievement-section 整块隐藏（原 `wx:if="{{isLogin}}"` 保留），概览卡显示 0。
6. **回归无破坏**：对比改动前后，确认 `index.js` 所有 data 字段仍在 WXML 中被正确消费，无孤儿字段。
