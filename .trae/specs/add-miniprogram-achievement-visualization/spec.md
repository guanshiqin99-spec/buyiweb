# 小程序端成就体系与记录页可视化 Spec

## Why

后端 `miniapp-badges` 模块与 `/miniapp/learning-records/stats` 接口早已就绪（返回 6 枚徽章定义与 todayCount/totalCount/streakDays/typeCounts 完整统计），但小程序端 `utils/api.js` 既未封装 `badgesApi` 也未封装 `recordsApi.stats()`，导致 Web 端 Profile.vue / Record.vue 已有的「徽章墙 + 每日任务 + 学习建议 + 柱状图/雷达图 + 成就分享卡导出 + 热力图」整套学习闭环在小程序端完全缺失。这是本次差异化功能补齐中**最大的一块**，需以最小改动、不破坏现有 mine/record 页面功能为前提，将 Web 端能力对齐到小程序，并采用布依族非遗视觉语言（蜡染/铜鼓/织锦纹样 + 瓷釉卡片）实现。

## What Changes

### 小程序端 API 层补齐（utils/api.js）
- 在 [utils/api.js](file:///d:/BuyiDictionaryWeb/BuyiDictionaryApp-main/BuyiDictionaryApp-main/utils/api.js) 新增 `badgesApi.list()`，调用 `GET /miniapp/badges`
- 在 `recordsApi` 新增 `stats()`，调用 `GET /miniapp/learning-records/stats`
- 在 `module.exports` 导出 `badgesApi`

### 小程序端工具函数移植（utils/，从 Web 端 port 并适配 wx 存储）
- 新增 [utils/learningSuggestion.js](file:///d:/BuyiDictionaryWeb/BuyiDictionaryApp-main/BuyiDictionaryApp-main/utils/learningSuggestion.js)：移植 Web 端 13 条规则建议引擎，链接改为小程序路由（`/pages/query/index?focus=1` 等）
- 新增 [utils/dailyTasks.js](file:///d:/BuyiDictionaryWeb/BuyiDictionaryApp-main/BuyiDictionaryApp-main/utils/dailyTasks.js)：3 项每日任务（查 3 词 / 听 2 歌 / 答题 1 轮）
- 新增 [utils/userProgress.js](file:///d:/BuyiDictionaryWeb/BuyiDictionaryApp-main/BuyiDictionaryApp-main/utils/userProgress.js)：今日类型计数，用 `wx.setStorageSync`/`wx.getStorageSync` 替代 localStorage，跨天自动重置；提供 `notifyUserProgressUpdated` 通过 `getApp().eventBus` 通知

### 小程序端可视化组件（components/，纯 WXML/WXSS/Canvas，无第三方库）
- 新增 `components/bar-chart/`：柱状图组件，接收 `data: [{category, count}]`，纯 WXSS 渲染（参照 Web BarChart.vue）
- 新增 `components/radar-chart/`：雷达图组件，接收 `data: {dictionary, phrase, proverb, song, quiz}`，5 维度，纯 WXSS/CSS polygon 渲染
- 新增 `components/heat-map/`：热力图组件，接收 `records`，按日期聚合渲染近 12 周格子（参照 Web HeatMap.vue）
- 新增 `components/badge-motif/`：徽章纹样组件，根据 `pattern`（batik/drum/weaving）渲染对应布依族纹样 SVG（base64 内联）
- 新增 `components/share-card/`：分享卡组件，使用 `<canvas type="2d">` 绘制学习报告，通过 `wx.canvasToTempFilePath` 导出，支持保存到相册与转发给好友

### 小程序端 mine 页集成成就体系（pages/mine/）
- 在现有「学习成长」卡片下方新增以下区块，**不改动**用户卡、统计卡、菜单卡、文化签句等现有结构：
  - 学习概览仪表盘（今日/累计/连续/收藏 4 卡）
  - 学习建议卡（最多 3 条，可点击跳转）
  - 每日任务卡（3 项任务 + 进度条 + 完成横幅）
  - 成就分享卡导出按钮（调用 share-card 组件）
  - 徽章墙（6 枚徽章网格 + 已解锁/未解锁状态 + 点击弹窗详情）
  - 学习类型分布柱状图 + 雷达图

### 小程序端 record 页集成可视化（pages/record/）
- 在现有「数据统计大卡」下方新增以下区块，**不改动**进度条、最近学习、历史轨迹等现有结构：
  - 学习热力图（近 12 周）
  - 学习雷达图（5 维度）
  - 学习建议卡（最多 3 条）

## Impact

- **Affected specs**: 无（独立新增功能，不修改既有 spec）
- **Affected code**:
  - 小程序 utils：`utils/api.js`（追加 badgesApi + recordsApi.stats）、新增 `utils/learningSuggestion.js`、`utils/dailyTasks.js`、`utils/userProgress.js`
  - 小程序 components：新增 `components/bar-chart/`、`components/radar-chart/`、`components/heat-map/`、`components/badge-motif/`、`components/share-card/`
  - 小程序 pages：`pages/mine/index.{js,wxml,wxss,json}`、`pages/record/index.{js,wxml,wxss,json}`
  - 后端：**零改动**（`miniapp-badges` 模块与 `/miniapp/learning-records/stats` 接口均已存在）

## ADDED Requirements

### Requirement: 小程序 badgesApi 封装
小程序 `utils/api.js` SHALL 导出 `badgesApi`，其 `list()` 方法调用 `GET /miniapp/badges`（needAuth），返回后端 `{items, total, unlockedCount}` 结构。

#### Scenario: 已登录用户拉取徽章
- **WHEN** 已登录用户进入 mine 页
- **THEN** 调用 `badgesApi.list()` 返回 6 枚徽章定义，每枚含 `code/name/description/pattern/locked/unlocked/unlockedAt`
- **AND** 已解锁徽章 `unlocked === true` 且 `unlockedAt` 为 ISO 时间字符串

### Requirement: 小程序 recordsApi.stats 封装
小程序 `recordsApi` SHALL 新增 `stats()` 方法，调用 `GET /miniapp/learning-records/stats`（needAuth），返回 `{todayCount, totalCount, streakDays, typeCounts}`。

#### Scenario: 拉取学习统计
- **WHEN** 已登录用户进入 mine/record 页
- **THEN** `recordsApi.stats()` 返回 `typeCounts` 含 `dictionary/phrase/proverb/song` 四键
- **AND** `todayCount/totalCount/streakDays` 为非负整数

### Requirement: 小程序学习建议引擎
小程序 `utils/learningSuggestion.js` SHALL 导出 `generateSuggestions(stats)`，移植 Web 端 13 条规则，按优先级降序返回最多 3 条 `{text, link, icon, key}`，`link` 为小程序页面路径。

#### Scenario: 全新用户首次进入
- **WHEN** `stats.totalCount === 0`
- **THEN** 返回单条建议「从一个布依语词开始你的第一次学习」，`link` 为 `/pages/query/index?focus=1`

#### Scenario: 今日尚未学习
- **WHEN** `stats.todayCount === 0` 且 `totalCount > 0`
- **THEN** 返回的建议中包含「复习一个词开启今日学习」（工作日）或「听一首民歌唤醒学习节奏」（周末）

### Requirement: 小程序每日任务
小程序 `utils/dailyTasks.js` SHALL 导出 `getDailyTasks(stats)`，返回 3 项任务：查 3 词 / 听 2 首歌 / 完成 1 轮答题，每项含 `{title, target, current, completed, link}`。

#### Scenario: 今日已查 2 词
- **WHEN** `stats.todayTypeCounts.dictionary === 2`
- **THEN** 「查 3 个词」任务 `current === 2`、`completed === false`、`link` 为 `/pages/query/index?focus=1`

#### Scenario: 全部任务完成
- **WHEN** 三项任务 `completed` 均为 `true`
- **THEN** mine 页显示完成横幅「今日任务已全部完成，明日继续加油！」

### Requirement: 小程序今日类型计数
小程序 `utils/userProgress.js` SHALL 使用 `wx.setStorageSync('buyi:daily-type-counts', {date, counts})` 维护今日类型计数，跨天自动重置；`notifyUserProgressUpdated(source, contentType)` 通过 `getApp().eventBus.emit('user-progress:updated')` 通知。

#### Scenario: 跨天重置
- **WHEN** 用户在前一天学习后，第二天打开 mine 页
- **THEN** `getTodayTypeCounts()` 检测到存储 `date` 与今日不一致，返回空对象 `{}`
- **AND** 每日任务进度归零

### Requirement: 小程序柱状图组件
`components/bar-chart/` SHALL 接收 `data` 属性（`[{category, count}]`），纯 WXSS 渲染柱状图，含 Y 轴刻度、网格线、柱顶数值、图例，柱高按 `count/maxValue` 比例计算。

#### Scenario: 渲染 4 类学习分布
- **WHEN** 传入 `data=[{category:'词条',count:12},{category:'常用语',count:5},{category:'谚语',count:3},{category:'民歌',count:8}]`
- **THEN** 渲染 4 根柱子，最高柱（词条 12）满高，其余按比例
- **AND** 每根柱顶显示数值，底部显示类目名

#### Scenario: 空数据
- **WHEN** 传入 `data=[]`
- **THEN** 显示「暂无学习分布数据」占位文案

### Requirement: 小程序雷达图组件
`components/radar-chart/` SHALL 接收 `data` 属性（`{dictionary, phrase, proverb, song, quiz}`），渲染 5 维度雷达图，使用 CSS polygon 绘制数据面，含同心网格、轴线标签。

#### Scenario: 渲染 5 维学习分布
- **WHEN** 传入 `data={dictionary:10, phrase:5, proverb:3, song:8, quiz:2}`
- **THEN** 渲染 5 边形网格 + 数据面（半透明品牌色填充）
- **AND** 5 个顶点标注「词汇/短语/谚语/民歌/答题」

#### Scenario: 全零数据
- **WHEN** 传入全 0 数据
- **THEN** 不渲染数据面，仅渲染网格与标签，显示「暂无数据」提示

### Requirement: 小程序热力图组件
`components/heat-map/` SHALL 接收 `records` 属性（学习记录数组），按日期聚合并渲染近 12 周的格子热力图，颜色深浅表示当日学习量。

#### Scenario: 渲染近 12 周
- **WHEN** 传入含 30 天记录的 `records`
- **THEN** 渲染 7 行 × 12 列格子，有学习的日期显示品牌色（深浅按量分级），无学习日期显示浅灰
- **AND** 顶部显示月份标签，左侧显示周一到周日标签

#### Scenario: 空记录
- **WHEN** 传入空 `records`
- **THEN** 渲染全灰格子，不报错

### Requirement: 小程序徽章纹样组件
`components/badge-motif/` SHALL 接收 `pattern` 属性（`batik|drum|weaving`）与 `locked` 布尔属性，渲染对应布依族纹样（蜡染旋花/铜鼓纹/织锦纹），未解锁时灰度 + 半透明。

#### Scenario: 已解锁蜡染徽章
- **WHEN** `pattern='batik'` 且 `locked=false`
- **THEN** 渲染品牌色蜡染旋花纹样，清晰可见

#### Scenario: 未解锁铜鼓徽章
- **WHEN** `pattern='drum'` 且 `locked=true`
- **THEN** 渲染灰度铜鼓纹样，`opacity: 0.55`

### Requirement: 小程序成就分享卡导出
`components/share-card/` SHALL 使用 `<canvas type="2d">` 绘制学习报告（深蓝渐变背景 + 蜡染纹样 + 标题 + 3 项统计卡 + 站点署名），通过 `wx.canvasToTempFilePath` 导出临时图片路径，提供「保存到相册」与「转发给好友」两个动作。

#### Scenario: 用户点击导出成就卡片
- **WHEN** 用户在 mine 页点击「导出成就卡片」按钮
- **THEN** share-card 组件在 canvas 上绘制 1200×1600 图片
- **AND** 调用 `wx.canvasToTempFilePath` 生成临时文件路径
- **AND** 弹出预览弹窗，提供「保存到相册」（调用 `wx.saveImageToPhotosAlbum`）与「转发给好友」（设置 `onShareAppMessage` 的 `imageUrl`）按钮

#### Scenario: 保存到相册授权拒绝
- **WHEN** 用户点击「保存到相册」但拒绝相册授权
- **THEN** 提示「请在设置中开启相册权限」，并提供 `wx.openSetting` 引导

### Requirement: 小程序 mine 页徽章墙
mine 页 SHALL 在登录态显示徽章墙区块，展示 6 枚徽章（4 已解锁 + 2 未解锁等任意组合），每枚徽章含纹样图标、名称、状态标签；点击徽章弹出详情弹窗显示名称、描述、解锁时间或解锁提示。

#### Scenario: 点击已解锁徽章
- **WHEN** 用户点击已解锁的「七日不辍」徽章
- **THEN** 弹出详情弹窗，显示徽章大图、名称「七日不辍」、描述「连续学习 7 天」、解锁时间「2026年X月X日」

#### Scenario: 点击未解锁徽章
- **WHEN** 用户点击未解锁的「月学不辍」徽章
- **THEN** 弹出详情弹窗，显示灰度徽章、名称、描述、提示「继续学习以解锁此徽章」

### Requirement: 小程序 mine 页学习概览仪表盘
mine 页 SHALL 在登录态显示 4 卡统计仪表盘（今日学习/累计学习/连续打卡/收藏词汇），数据来自 `recordsApi.stats()` 与 `meApi.get()`。

#### Scenario: 加载统计
- **WHEN** 已登录用户进入 mine 页
- **THEN** 并行调用 `meApi.get()` + `recordsApi.stats()` + `badgesApi.list()`
- **AND** 4 卡显示对应数值，加载失败时显示 0 不阻塞页面

### Requirement: 小程序 record 页热力图与雷达图
record 页 SHALL 在登录态显示热力图区块与雷达图区块，数据来自 `recordsApi.list()` 返回的记录与 `recordsApi.stats()` 返回的 `typeCounts`。

#### Scenario: 渲染可视化
- **WHEN** 已登录用户进入 record 页
- **THEN** 在「数据统计大卡」下方渲染热力图（近 12 周）与雷达图（5 维度）
- **AND** 数据为空时显示占位文案，不报错

## MODIFIED Requirements

### Requirement: 小程序 mine 页
mine 页 SHALL 在现有「学习成长」卡片下方追加以下区块，**保留**现有用户卡、统计卡、菜单卡、文化签句、Agent Panel 不变：
1. 学习概览仪表盘（4 卡统计）
2. 学习建议卡（最多 3 条可点击跳转）
3. 每日任务卡（3 项 + 进度条 + 完成横幅）
4. 成就分享卡导出按钮
5. 徽章墙（6 枚网格 + 点击弹窗）
6. 学习类型分布柱状图 + 雷达图
7. 监听 `user-progress:updated` 事件刷新今日类型计数与统计

### Requirement: 小程序 record 页
record 页 SHALL 在现有「进度条」与「最近学习」之间追加以下区块，**保留**现有统计大卡、最近学习横滑、历史轨迹列表不变：
1. 学习热力图（近 12 周）
2. 学习雷达图（5 维度）
3. 学习建议卡（最多 3 条可点击跳转）
4. 数据源沿用 `History.list()` 返回的 `records` 与 `stats`，并额外调用 `recordsApi.stats()` 获取 `typeCounts`

### Requirement: 小程序 utils/api.js
`utils/api.js` SHALL 在 `recordsApi` 新增 `stats()` 方法，并新增 `badgesApi` 对象，二者均 `needAuth: true`，并在 `module.exports` 导出 `badgesApi`。

## REMOVED Requirements

无（本次为纯新增，不删除任何既有功能）
