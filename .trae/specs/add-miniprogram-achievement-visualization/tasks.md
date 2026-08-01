# Tasks

## 阶段 1：API 层与工具函数（无 UI 依赖，可并行）

- [x] Task 1: 在 utils/api.js 封装 badgesApi 与 recordsApi.stats
  - [ ] SubTask 1.1: 在 `BuyiDictionaryApp-main/BuyiDictionaryApp-main/utils/api.js` 的 `recordsApi` 对象中新增 `stats()` 方法，调用 `get('/miniapp/learning-records/stats', null, { needAuth: true, showError: false })`
  - [ ] SubTask 1.2: 新增 `const badgesApi = { list() { return get('/miniapp/badges', null, { needAuth: true, showError: false }); } }`
  - [ ] SubTask 1.3: 在 `module.exports` 中导出 `badgesApi`
  - [ ] SubTask 1.4: 验证 `recordsApi.stats()` 返回 `{todayCount, totalCount, streakDays, typeCounts}`，`badgesApi.list()` 返回 `{items, total, unlockedCount}`

- [x] Task 2: 新增 utils/userProgress.js（今日类型计数）
  - [ ] SubTask 2.1: 创建 `utils/userProgress.js`，定义 `DAILY_TYPE_COUNTS_STORAGE_KEY = 'buyi:daily-type-counts'` 与 `USER_PROGRESS_UPDATED_EVENT = 'user-progress:updated'`
  - [ ] SubTask 2.2: 实现 `getLocalDateKey(now)` 返回 `YYYY-MM-DD`（用本地时区）
  - [ ] SubTask 2.3: 实现 `getTodayTypeCounts()` 读取 `wx.getStorageSync`，若 `date` 与今日不一致返回 `{}`
  - [ ] SubTask 2.4: 实现 `recordTodayActivity(contentType)` 递增当日对应类型计数并写回存储
  - [ ] SubTask 2.5: 实现 `notifyUserProgressUpdated(source, contentType)`，内部调用 `recordTodayActivity` 并通过 `getApp().eventBus.emit(USER_PROGRESS_UPDATED_EVENT)` 通知
  - [ ] SubTask 2.6: 实现 `normalizeLearningStats(stats)` 兼容后端 today/total/streak 与 todayCount/totalCount/streakDays 字段
  - [ ] SubTask 2.7: 实现 `normalizeBadge(badge)` 与 `normalizeBadgesResponse(response)` 统一徽章字段为 `isUnlocked/unlocked/locked`

- [x] Task 3: 新增 utils/dailyTasks.js（每日任务）
  - [ ] SubTask 3.1: 创建 `utils/dailyTasks.js`，实现 `getDailyTasks(stats)`，优先使用 `stats.todayTypeCounts`，回退到 `stats.typeCounts`
  - [ ] SubTask 3.2: 返回 3 项任务：查 3 词（`/pages/query/index?focus=1`）/ 听 2 首歌（`/pages/song/index`）/ 完成 1 轮答题（`/pages/quiz/index?start=1`）
  - [ ] SubTask 3.3: 每项含 `{title, target, current, completed, link}`，`completed = current >= target`

- [x] Task 4: 新增 utils/learningSuggestion.js（学习建议引擎）
  - [ ] SubTask 4.1: 创建 `utils/learningSuggestion.js`，移植 Web 端 13 条规则建议引擎
  - [ ] SubTask 4.2: 链接改为小程序路由：`/pages/query/index?focus=1`、`/pages/song/index`、`/pages/quiz/index?start=1`、`/pages/culture/index`、`/pages/learn/index`、`/pages/record/index`
  - [ ] SubTask 4.3: `generateSuggestions(stats)` 按优先级降序、去重、最多返回 3 条 `{text, link, icon, priority, key}`
  - [ ] SubTask 4.4: 复用 `utils/content-mapper.js` 的 `getTypeLabel` 替代 Web 端 `getContentLabel`

## 阶段 2：可视化组件（独立可并行）

- [x] Task 5: 新增 components/bar-chart/（柱状图）
  - [ ] SubTask 5.1: 创建 `components/bar-chart/{index.js,index.json,index.wxml,index.wxss}`，`index.json` 声明 `"component": true`
  - [ ] SubTask 5.2: `index.js` 在 `properties` 中声明 `data: {type: Array, value: []}` 与 `title: {type: String, value: '学习类型分布'}`
  - [ ] SubTask 5.3: 在 `data` 中计算 `maxValue/totalCount/hasData`，`observers` 监听 `data` 变化重新计算
  - [ ] SubTask 5.4: `index.wxml` 渲染标题、Y 轴刻度（5 档）、网格线、柱子（`style="height:{{item.count/maxValue*100}}%"`）、柱顶数值、底部类目名、图例
  - [ ] SubTask 5.5: `index.wxss` 使用全局 CSS 变量（`--color-brand`/`--color-text-primary` 等），柱子用 `linear-gradient(to top, var(--color-brand), var(--color-brand-light))` + `animation: barGrow 0.6s`
  - [ ] SubTask 5.6: 空数据显示「暂无学习分布数据」占位

- [x] Task 6: 新增 components/radar-chart/（雷达图）
  - [ ] SubTask 6.1: 创建 `components/radar-chart/{index.js,index.json,index.wxml,index.wxss}`
  - [ ] SubTask 6.2: `properties.data: {type: Object, value: {}}`，5 维度固定为 dictionary/phrase/proverb/song/quiz
  - [ ] SubTask 6.3: 在 `attached`/`observers` 中计算各维度比值与多边形顶点坐标（中心 150,120，半径 90，5 等分角度）
  - [ ] SubTask 6.4: `index.wxml` 用 `<view>` + 绝对定位 + `clip-path: polygon(...)` 渲染同心五边形网格、数据面、轴线、顶点标签
  - [ ] SubTask 6.5: 数据面用 `background: rgba(品牌色, 0.25)` + `border: 1px solid 品牌色`
  - [ ] SubTask 6.6: 全零数据显示「暂无数据」提示，不渲染数据面

- [x] Task 7: 新增 components/heat-map/（热力图）
  - [ ] SubTask 7.1: 创建 `components/heat-map/{index.js,index.json,index.wxml,index.wxss}`
  - [ ] SubTask 7.2: `properties.records: {type: Array, value: []}`
  - [ ] SubTask 7.3: 在 `observers` 中按 `record.createdAt` 聚合为 `{dateKey: count}`，生成近 12 周（84 天）的格子数组，每格 `{dateKey, count, level(0-4), monthLabel, dayLabel}`
  - [ ] SubTask 7.4: `index.wxml` 渲染月份标签行 + 7 行（周一到周日）× 12 列格子，每格 `class="heat-cell level-{{cell.level}}"`，含 `wx:if` 月份标签
  - [ ] SubTask 7.5: `index.wxss` 定义 `level-0` 到 `level-4` 五档颜色（浅灰到品牌色深色）
  - [ ] SubTask 7.6: 空记录渲染全 level-0 格子，不报错

- [x] Task 8: 新增 components/badge-motif/（徽章纹样）
  - [ ] SubTask 8.1: 创建 `components/badge-motif/{index.js,index.json,index.wxml,index.wxss}`
  - [ ] SubTask 8.2: `properties.pattern: {type: String, value: 'batik'}` 与 `locked: {type: Boolean, value: false}` 与 `size: {type: Number, value: 44}`
  - [ ] SubTask 8.3: `index.wxml` 用 `<image>` 渲染 base64 内联 SVG，根据 `pattern` 选择蜡染旋花/铜鼓纹/织锦纹三种纹样
  - [ ] SubTask 8.4: 准备 3 个 SVG 字符串（batik：8 瓣旋花；drum：同心圆 + 放射线；weaving：菱形网格），base64 编码后内联到 `data` 字段
  - [ ] SubTask 8.5: `locked=true` 时 `image` 加 `filter: grayscale(1)` 与 `opacity: 0.55` 样式

## 阶段 3：分享卡组件（依赖 Task 1 的 stats 数据结构）

- [x] Task 9: 新增 components/share-card/（成就分享卡导出）
  - [ ] SubTask 9.1: 创建 `components/share-card/{index.js,index.json,index.wxml,index.wxss}`
  - [ ] SubTask 9.2: `index.wxml` 包含隐藏的 `<canvas type="2d" id="shareCanvas" style="width:300px;height:400px;">` 与预览弹窗（`wx:if="{{previewVisible}}"`）
  - [ ] SubTask 9.3: 预览弹窗显示生成的 `<image src="{{tempFilePath}}" mode="aspectFit">` + 「保存到相册」「转发给好友」「取消」三个按钮
  - [ ] SubTask 9.4: `index.js` 实现 `generate(options)` 方法：用 `wx.createSelectorQuery().select('#shareCanvas').node()` 获取 canvas 节点，绘制 1200×1600 图片（深蓝渐变背景 + 蜡染纹样 + 标题 + 3 项统计卡 + 站点署名）
  - [ ] SubTask 9.5: 绘制完成后调用 `wx.canvasToTempFilePath` 生成临时路径，设置 `data.tempFilePath` 与 `previewVisible: true`
  - [ ] SubTask 9.6: 实现 `onSaveToAlbum` 调用 `wx.saveImageToPhotosAlbum`，失败时若为授权拒绝则 `wx.showModal` 引导 `wx.openSetting`
  - [ ] SubTask 9.7: 实现 `onShareToFriend` 设置 `data.shareImageUrl`，触发页面 `onShareAppMessage` 使用该 `imageUrl`（通过 `triggerEvent` 通知页面）
  - [ ] SubTask 9.8: `methods` 暴露 `share(options)` 供页面调用，内部调用 `generate` 后展示预览
  - [ ] SubTask 9.9: 绘制函数参考 Web `ShareCard.vue` 的 `drawBatikPattern`/`drawWrappedText`/`roundedRectPath` 逻辑，适配小程序 Canvas 2D API

## 阶段 4：mine 页集成（依赖 Task 1-9）

- [x] Task 10: mine 页 json 引入组件
  - [ ] SubTask 10.1: 修改 `pages/mine/index.json` 的 `usingComponents`，引入 `bar-chart`、`radar-chart`、`badge-motif`、`share-card`

- [ ] Task 11: mine 页 js 扩展数据与逻辑
  - [ ] SubTask 11.1: 修改 `pages/mine/index.js`，引入 `badgesApi`、`recordsApi`、`generateSuggestions`、`getDailyTasks`、`getTodayTypeCounts`、`notifyUserProgressUpdated`、`USER_PROGRESS_UPDATED_EVENT`
  - [ ] SubTask 11.2: 在 `data` 中新增 `learnStats: {todayCount:0, totalCount:0, streakDays:0, typeCounts:{}}`、`todayTypeCounts: {}`、`badges: []`、`suggestions: []`、`dailyTasks: []`、`selectedBadge: null`、`isExporting: false`、`shareCardRef: null`
  - [ ] SubTask 11.3: 新增 `refreshProfileProgress()` 方法，并行调用 `meApi.get()` + `recordsApi.stats()` + `badgesApi.list()`，更新 `learnStats/badges/suggestions/dailyTasks/todayTypeCounts`
  - [ ] SubTask 11.4: 在 `onLoad` 中订阅 `USER_PROGRESS_UPDATED_EVENT` 与既有 `favorites:changed`/`history:changed` 事件
  - [ ] SubTask 11.5: 在 `onShow` 中调用 `refreshProfileProgress()`（保留现有 `syncAppearance` 与 tabBar 逻辑）
  - [ ] SubTask 11.6: 新增 `openBadge(e)`/`closeBadge()` 方法控制徽章详情弹窗
  - [ ] SubTask 11.7: 新增 `exportAchievement()` 方法，调用 `this.selectComponent('#shareCard').share({title, stats, filename})`
  - [ ] SubTask 11.8: 新增 `onShareAppMessage()` 返回 `{title, path, imageUrl: this.data.shareImageUrl}`（供 share-card 转发使用）
  - [ ] SubTask 11.9: 新增 `onSuggestionTap(e)` 与 `onTaskTap(e)` 方法，根据 `link` 调用 `wx.navigateTo` 或 `wx.switchTab`
  - [ ] SubTask 11.10: 新增 `badgeMotif(badge)` 辅助方法，根据 `badge.code/name/description` 映射到 batik/drum/weaving（与后端 `pattern` 字段一致时直接用）

- [x] Task 12: mine 页 wxml 追加成就区块
  - [ ] SubTask 12.1: 在 `pages/mine/index.wxml` 的「学习成长」卡片（`.growth-card`）下方、文化菜单卡（`.culture-menu-card`）上方，新增 `wx:if="{{isLogin}}"` 包裹的成就区块
  - [ ] SubTask 12.2: 追加学习概览仪表盘：4 卡（今日学习/累计学习/连续打卡/收藏词汇），用 `.card` + `.stat-card` 既有样式
  - [ ] SubTask 12.3: 追加学习建议卡：`wx:for="{{suggestions}}"` 渲染最多 3 条，每条 `bindtap="onSuggestionTap" data-link="{{item.link}}"`，含 emoji 图标 + 文本 + 箭头
  - [ ] SubTask 12.4: 追加每日任务卡：标题 + 完成数/总数 + `wx:if="{{allDailyTasksCompleted}}"` 完成横幅 + `wx:for="{{dailyTasks}}"` 任务列表（标题 + 进度文本 + 进度条 + 「去完成/再学一次」按钮）
  - [ ] SubTask 12.5: 追加成就分享卡导出按钮：「分享学习成就」 + 「导出成就卡片」按钮 `bindtap="exportAchievement"`
  - [ ] SubTask 12.6: 追加徽章墙：标题 + 「已解锁 X / Y」 + `wx:for="{{badges}}"` 网格，每枚 `<badge-motif pattern="{{item.pattern}}" locked="{{!item.isUnlocked}}" />` + 名称 + 状态标签，`bindtap="openBadge" data-badge="{{item}}"`
  - [ ] SubTask 12.7: 追加徽章详情弹窗：`wx:if="{{selectedBadge}}"`，含遮罩层 `bindtap="closeBadge"`、大图徽章、名称、描述、解锁时间或解锁提示、关闭按钮
  - [ ] SubTask 12.8: 追加柱状图 `<bar-chart data="{{typeChartData}}" />` + 雷达图 `<radar-chart data="{{learnStats.typeCounts}}" />`
  - [ ] SubTask 12.9: 在 wxml 末尾（agent-panel 之前）追加 `<share-card id="shareCard" />`

- [x] Task 13: mine 页 wxss 追加成就样式
  - [ ] SubTask 13.1: 在 `pages/mine/index.wxss` 末尾追加成就区块样式，复用既有 `.card`/`.porcelain-bg-page`/CSS 变量
  - [ ] SubTask 13.2: 新增 `.stats-dashboard`/`.stat-card-dashboard`/`.suggestion-card`/`.daily-tasks`/`.achievement-export`/`.badge-wall`/`.badge-grid`/`.badge-item`/`.badge-locked`/`.badge-unlocked`/`.badge-modal-overlay`/`.badge-modal` 等样式类
  - [ ] SubTask 13.3: 徽章已解锁用品牌色描边 + 浅色光晕，未解锁用虚线边框 + 灰度 + `opacity: 0.55`
  - [ ] SubTask 13.4: 弹窗用 `position: fixed; inset: 0;` + `backdrop-filter: blur(6px)` + `animation: badge-modal-fade 180ms`
  - [ ] SubTask 13.5: 确保深色模式（`.page.dark`）下成就区块颜色同步调整

## 阶段 5：record 页集成（依赖 Task 1-7）

- [x] Task 14: record 页 json 引入组件
  - [ ] SubTask 14.1: 修改 `pages/record/index.json` 的 `usingComponents`，引入 `heat-map`、`radar-chart`

- [x] Task 15: record 页 js 扩展数据与逻辑
  - [ ] SubTask 15.1: 修改 `pages/record/index.js`，引入 `recordsApi`、`generateSuggestions`
  - [ ] SubTask 15.2: 在 `data` 中新增 `typeCounts: {}`、`suggestions: []`
  - [ ] SubTask 15.3: 在 `refreshRecords` 方法中追加调用 `recordsApi.stats()`，将 `typeCounts` 写入 `data`，并用 `generateSuggestions({totalCount: stats.total, todayCount: stats.today, streakDays: stats.streak, typeCounts})` 生成建议
  - [ ] SubTask 15.4: 失败时 `typeCounts` 与 `suggestions` 置空，不阻塞主流程
  - [ ] SubTask 15.5: 新增 `onSuggestionTap(e)` 方法跳转

- [ ] Task 16: record 页 wxml 追加可视化区块
  - [ ] SubTask 16.1: 在 `pages/record/index.wxml` 的「进度条」卡片（`.progress-card`）之后、「最近学习」（`.recent-section`）之前，新增 `wx:if="{{isLogin}}"` 包裹的可视化区块
  - [ ] SubTask 16.2: 追加热力图卡：`<view class="card viz-card"><heat-map records="{{records}}" /></view>`
  - [ ] SubTask 16.3: 追加雷达图卡：`<view class="card viz-card"><radar-chart data="{{typeCounts}}" /></view>`
  - [ ] SubTask 16.4: 追加学习建议卡：`wx:for="{{suggestions}}"` 渲染最多 3 条，`bindtap="onSuggestionTap"`

- [x] Task 17: record 页 wxss 追加可视化样式
  - [ ] SubTask 17.1: 在 `pages/record/index.wxss` 末尾追加 `.viz-card` 样式（`padding: 24rpx; border-radius: 24rpx;` 复用 `.card`）
  - [ ] SubTask 17.2: 新增 `.suggestion-card` 样式（与 mine 页一致或抽到 `app.wxss` 共享）
  - [ ] SubTask 17.3: 确保深色模式下可视化卡片颜色正常

## 阶段 6：联动与回归验证

- [x] Task 18: 学习行为联动今日类型计数
  - [ ] SubTask 18.1: 在 `utils/learningHistory.js` 的 `add` 方法成功后调用 `notifyUserProgressUpdated('learning-record', contentType)`（替代当前 `emitChange` 或并存）
  - [ ] SubTask 18.2: 在 quiz 页答题完成调用 `quizApi.create` 后，调用 `notifyUserProgressUpdated('quiz', 'quiz')`
  - [ ] SubTask 18.3: 验证 mine 页监听到 `user-progress:updated` 事件后刷新 `todayTypeCounts` 与每日任务进度

- [x] Task 19: 小程序端回归验证
  - [x] SubTask 19.1: 验证 mine 页现有用户卡、统计卡、学习成长、菜单卡、文化签句、Agent Panel 渲染正常
  - [x] SubTask 19.2: 验证 mine 页新增仪表盘、建议卡、每日任务、分享卡导出、徽章墙、柱状图、雷达图在登录态正常显示
  - [x] SubTask 19.3: 验证未登录态不显示成就区块，仅显示用户卡 + 「点击登录」
  - [x] SubTask 19.4: 验证 record 页现有统计大卡、进度条、最近学习、历史轨迹渲染正常
  - [x] SubTask 19.5: 验证 record 页新增热力图、雷达图、建议卡在登录态正常显示
  - [x] SubTask 19.6: 验证徽章详情弹窗打开/关闭、ESC/点击遮罩关闭
  - [x] SubTask 19.7: 验证分享卡导出：生成预览 → 保存到相册（含授权拒绝兜底）→ 转发给好友
  - [x] SubTask 19.8: 验证每日任务跨天重置：模拟前一天计数 → 第二天进入 mine 页进度归零
  - [x] SubTask 19.9: 验证浅色/深色模式下所有新区块颜色正常
  - [x] SubTask 19.10: 验证词典搜索、收藏切换、学习记录写入、答题、民歌播放等既有功能无回归

# Task Dependencies

- Task 1-4 互相独立，可并行
- Task 5-8 互相独立，可并行（不依赖 Task 1-4）
- Task 9 独立（不依赖其他 Task，但生成数据结构参考 Task 1）
- Task 10-13（mine 页）依赖 Task 1-9 全部完成
- Task 14-17（record 页）依赖 Task 1-7 完成（不需要 share-card 与 badge-motif）
- Task 18 依赖 Task 2、Task 11、Task 15 完成
- Task 19 依赖 Task 1-18 全部完成
