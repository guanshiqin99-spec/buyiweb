# 修复成就体系与可视化边角问题 Spec

## Why
小程序成就体系与记录页可视化上线后，回归发现 4 个真实问题：每日任务跨天错误继承累计进度（P1）、热力图初始数据不完整（P2）、分享卡预览弹窗不跟随手动深色模式（P2）、弱网答题每日任务不计数（P2）。本 spec 以最小改动修复这 4 个边角问题，不引入新功能。

## What Changes
- 修复 `dailyTasks.getDailyTasks` 跨天回退逻辑：今日数据为空对象 `{}` 时不再回退到累计 `typeCounts`
- 修复 `userProgress.getTodayTypeCounts` 返回值语义：无存储返回 `null`（可回退），跨天返回 `{}`（今日有效但为 0，不回退）
- 修复 `record` 页热力图初始数据：新增 `heatmapRecords` 独立字段，单独拉取大 pageSize 覆盖近 12 周
- 修复 `share-card` 深色模式：组件 json 开启 `apply-shared`，wxss 把 `@media (prefers-color-scheme)` 改为 `.page.dark` 前缀
- 修复 `quiz` 答题进度通知：登录态本地存储成功后立即 `notifyUserProgressUpdated`，不依赖云端同步成功

## Impact
- Affected specs: `add-miniprogram-achievement-visualization`
- Affected code:
  - `BuyiDictionaryApp-main/utils/dailyTasks.js`
  - `BuyiDictionaryApp-main/utils/userProgress.js`（`getTodayTypeCounts` 返回值语义变化，需确认所有调用方兼容 null）
  - `BuyiDictionaryApp-main/pages/record/index.js` + `index.wxml`
  - `BuyiDictionaryApp-main/components/share-card/index.json` + `index.wxss`
  - `BuyiDictionaryApp-main/pages/quiz/index.js`

## ADDED Requirements
（无新增需求，均为修复）

## MODIFIED Requirements

### Requirement: 每日任务跨天重置
每日任务的 `current` 必须基于"今日类型计数"，跨天后归零。仅当今日数据完全不存在（`null`，老客户端兼容）时才回退到累计 `typeCounts`；今日数据为空对象 `{}`（跨天重置后有效空计数）时不回退，`current` 为 0。

#### Scenario: 跨天后进入 mine 页
- **WHEN** 用户昨日有学习行为（今日计数已跨天重置为 `{}`），累计 typeCounts 为 `{dictionary:9, song:4, quiz:2}`
- **THEN** 三个每日任务 `current` 均为 0，`completed` 均为 false

#### Scenario: 老客户端首次使用（无今日计数存储）
- **WHEN** `getTodayTypeCounts()` 返回 `null`，累计 typeCounts 有值
- **THEN** 回退到累计 typeCounts，任务 `current` 显示累计值（兼容老客户端）

### Requirement: 记录页热力图数据完整性
热力图组件需要近 12 周（84 天）的记录数据。`record` 页应单独为热力图拉取足够覆盖 12 周的记录，不依赖列表分页的 20 条。

#### Scenario: 用户近 12 周记录超过 20 条
- **WHEN** 登录用户进入 record 页，历史记录总数 > 20
- **THEN** 热力图基于 `heatmapRecords`（拉取大 pageSize 覆盖 12 周）渲染，初始即显示完整 12 周热力，不漏掉较早日期

### Requirement: 分享卡预览弹窗跟随手动深色模式
分享卡预览弹窗的深色模式应通过应用主题类 `.page.dark` 切换，而非 `@media (prefers-color-scheme)`，确保手动切换深色模式时弹窗跟随。

#### Scenario: 手动切换深色模式后打开分享卡
- **WHEN** 用户在设置中手动选择深色模式（系统为浅色），点击导出成就卡
- **THEN** 预览弹窗背景、标题、取消按钮均显示深色样式

### Requirement: 答题完成后每日任务立即计数
登录态下，答题成绩本地存储成功后应立即通知 `user-progress:updated`，不依赖云端同步成功。

#### Scenario: 弱网下完成答题
- **WHEN** 登录用户完成一轮答题，本地存储成功，但 `quizApi.create` 因网络失败
- **THEN** 每日任务"完成 1 轮答题"`current` 仍 +1，mine 页任务进度刷新

## REMOVED Requirements
（无移除）
