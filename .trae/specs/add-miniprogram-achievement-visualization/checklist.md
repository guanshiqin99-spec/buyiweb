# Checklist

## 阶段 1：API 层与工具函数

### Task 1: utils/api.js 封装 badgesApi 与 recordsApi.stats
- [ ] `utils/api.js` 的 `recordsApi` 新增 `stats()` 方法，调用 `GET /miniapp/learning-records/stats`
- [ ] `recordsApi.stats()` 设置 `needAuth: true, showError: false`
- [ ] 新增 `badgesApi` 对象，含 `list()` 方法调用 `GET /miniapp/badges`
- [ ] `badgesApi.list()` 设置 `needAuth: true, showError: false`
- [ ] `module.exports` 导出 `badgesApi`
- [ ] 未登录态调用抛出「请先登录」错误（沿用 `request` 的 `needAuth` 逻辑）

### Task 2: utils/userProgress.js
- [ ] 定义 `DAILY_TYPE_COUNTS_STORAGE_KEY = 'buyi:daily-type-counts'`
- [ ] 定义 `USER_PROGRESS_UPDATED_EVENT = 'user-progress:updated'`
- [ ] `getLocalDateKey(now)` 返回 `YYYY-MM-DD` 格式
- [ ] `getTodayTypeCounts()` 读取 `wx.getStorageSync`，跨天返回 `{}`
- [ ] `recordTodayActivity(contentType)` 递增计数并写回存储
- [ ] `notifyUserProgressUpdated(source, contentType)` 调用 `recordTodayActivity` 并 `eventBus.emit`
- [ ] `normalizeLearningStats(stats)` 兼容 today/total/streak 与 todayCount/totalCount/streakDays
- [ ] `normalizeBadge(badge)` 统一 `isUnlocked/unlocked/locked` 字段
- [ ] `normalizeBadgesResponse(response)` 处理 `items/list/Array` 三种返回形态

### Task 3: utils/dailyTasks.js
- [ ] `getDailyTasks(stats)` 优先使用 `stats.todayTypeCounts`，回退 `stats.typeCounts`
- [ ] 返回 3 项任务：查 3 词 / 听 2 首歌 / 完成 1 轮答题
- [ ] 每项含 `{title, target, current, completed, link}`
- [ ] `completed = current >= target`
- [ ] 链接为小程序路由：`/pages/query/index?focus=1`、`/pages/song/index`、`/pages/quiz/index?start=1`

### Task 4: utils/learningSuggestion.js
- [ ] 移植 Web 端 13 条规则（全新用户/今日未学/打卡中断/强度感知/分布均衡/弱项/阶段化/兴趣延伸/时段化/周末/连续奖励/达人导出）
- [ ] 所有 `link` 改为小程序页面路径
- [ ] `generateSuggestions(stats)` 按优先级降序排序
- [ ] 去重后最多返回 3 条
- [ ] 复用 `utils/content-mapper.js` 的 `getTypeLabel`

## 阶段 2：可视化组件

### Task 5: components/bar-chart/
- [ ] `index.json` 声明 `"component": true`
- [ ] `properties.data: {type: Array, value: []}`
- [ ] `properties.title: {type: String, value: '学习类型分布'}`
- [ ] `observers` 监听 `data` 重新计算 `maxValue/totalCount/hasData`
- [ ] wxml 渲染标题、Y 轴 5 档刻度、网格线、柱子、柱顶数值、底部类目名、图例
- [ ] 柱高 `style="height:{{item.count/maxValue*100}}%"`
- [ ] 柱子用 `linear-gradient(to top, var(--color-brand), var(--color-brand-light))`
- [ ] 空数据显示「暂无学习分布数据」
- [ ] 使用全局 CSS 变量，浅色/深色模式均正常

### Task 6: components/radar-chart/
- [ ] `properties.data: {type: Object, value: {}}`
- [ ] 5 维度固定：dictionary/phrase/proverb/song/quiz
- [ ] 计算各维度比值与多边形顶点坐标（中心 150,120，半径 90）
- [ ] wxml 用 `clip-path: polygon(...)` 渲染同心五边形网格
- [ ] 数据面用 `rgba(品牌色, 0.25)` 填充 + `1px solid 品牌色` 描边
- [ ] 5 个顶点标注「词汇/短语/谚语/民歌/答题」
- [ ] 全零数据不渲染数据面，显示「暂无数据」提示

### Task 7: components/heat-map/
- [ ] `properties.records: {type: Array, value: []}`
- [ ] 按 `record.createdAt` 聚合为 `{dateKey: count}`
- [ ] 生成近 12 周（84 天）格子数组
- [ ] 每格含 `{dateKey, count, level(0-4), monthLabel, dayLabel}`
- [ ] wxml 渲染月份标签行 + 7 行 × 12 列格子
- [ ] `level-0` 到 `level-4` 五档颜色（浅灰到品牌色深色）
- [ ] 空记录渲染全 level-0 格子，不报错

### Task 8: components/badge-motif/
- [ ] `properties.pattern: {type: String, value: 'batik'}`
- [ ] `properties.locked: {type: Boolean, value: false}`
- [ ] `properties.size: {type: Number, value: 44}`
- [ ] 准备 3 个 SVG：蜡染旋花（batik）、铜鼓纹（drum）、织锦纹（weaving）
- [ ] SVG base64 编码内联到 `data`
- [ ] `<image>` 根据 `pattern` 渲染对应 SVG
- [ ] `locked=true` 时 `filter: grayscale(1)` + `opacity: 0.55`

## 阶段 3：分享卡组件

### Task 9: components/share-card/
- [ ] `index.wxml` 含 `<canvas type="2d" id="shareCanvas">`
- [ ] 预览弹窗 `wx:if="{{previewVisible}}"`
- [ ] 弹窗含 `<image src="{{tempFilePath}}">` + 三个按钮
- [ ] `generate(options)` 用 `wx.createSelectorQuery().select('#shareCanvas').node()` 获取 canvas
- [ ] 绘制 1200×1600 图片：深蓝渐变背景 + 蜡染纹样 + 标题 + 3 项统计卡 + 站点署名
- [ ] 调用 `wx.canvasToTempFilePath` 生成临时路径
- [ ] `onSaveToAlbum` 调用 `wx.saveImageToPhotosAlbum`
- [ ] 授权拒绝时 `wx.showModal` 引导 `wx.openSetting`
- [ ] `onShareToFriend` 通过 `triggerEvent` 通知页面设置 `onShareAppMessage` 的 `imageUrl`
- [ ] 暴露 `share(options)` 方法供页面调用
- [ ] 绘制逻辑参考 Web `ShareCard.vue` 的 `drawBatikPattern`/`drawWrappedText`/`roundedRectPath`

## 阶段 4：mine 页集成

### Task 10: mine 页 json
- [ ] `pages/mine/index.json` 的 `usingComponents` 引入 `bar-chart`、`radar-chart`、`badge-motif`、`share-card`
- [ ] 路径正确（`/components/bar-chart/index` 等）

### Task 11: mine 页 js
- [ ] 引入 `badgesApi`、`recordsApi`、`generateSuggestions`、`getDailyTasks`、`getTodayTypeCounts`、`notifyUserProgressUpdated`、`USER_PROGRESS_UPDATED_EVENT`
- [ ] `data` 新增 `learnStats/todayTypeCounts/badges/suggestions/dailyTasks/selectedBadge/isExporting`
- [ ] `refreshProfileProgress()` 并行调用 `meApi.get()` + `recordsApi.stats()` + `badgesApi.list()`
- [ ] `onLoad` 订阅 `USER_PROGRESS_UPDATED_EVENT`
- [ ] `onShow` 调用 `refreshProfileProgress()`，保留 `syncAppearance` 与 tabBar 逻辑
- [ ] `openBadge(e)`/`closeBadge()` 控制弹窗
- [ ] `exportAchievement()` 调用 `this.selectComponent('#shareCard').share()`
- [ ] `onShareAppMessage()` 返回 `{title, path, imageUrl}`
- [ ] `onSuggestionTap(e)`/`onTaskTap(e)` 跳转
- [ ] `badgeMotif(badge)` 映射 pattern
- [ ] 现有 `refreshUser`/`toRecord`/`goToLearn`/`toFavAndRecord`/`onAvatarError`/`onAvatarTap`/`toSettings`/`showAbout` 不变

### Task 12: mine 页 wxml
- [ ] 成就区块位于 `.growth-card` 之后、`.culture-menu-card` 之前
- [ ] `wx:if="{{isLogin}}"` 包裹
- [ ] 学习概览仪表盘 4 卡
- [ ] 学习建议卡 `wx:for="{{suggestions}}"`
- [ ] 每日任务卡含完成横幅 + 任务列表 + 进度条
- [ ] 成就分享卡导出按钮 `bindtap="exportAchievement"`
- [ ] 徽章墙 `wx:for="{{badges}}"` + `<badge-motif>`
- [ ] 徽章详情弹窗 `wx:if="{{selectedBadge}}"`
- [ ] `<bar-chart data="{{typeChartData}}" />`
- [ ] `<radar-chart data="{{learnStats.typeCounts}}" />`
- [ ] `<share-card id="shareCard" />` 位于 agent-panel 之前
- [ ] 现有用户卡、统计卡、学习成长卡、菜单卡、文化签句、agent-panel 保留不变

### Task 13: mine 页 wxss
- [ ] 追加 `.stats-dashboard`/`.suggestion-card`/`.daily-tasks`/`.achievement-export`/`.badge-wall`/`.badge-grid`/`.badge-item`/`.badge-modal-overlay`/`.badge-modal` 样式
- [ ] 已解锁徽章：品牌色描边 + 浅色光晕
- [ ] 未解锁徽章：虚线边框 + 灰度 + `opacity: 0.55`
- [ ] 弹窗 `position: fixed; inset: 0;` + `backdrop-filter: blur(6px)`
- [ ] 弹窗动画 `badge-modal-fade 180ms`
- [ ] 深色模式（`.page.dark`）下颜色同步调整
- [ ] 复用既有 `.card`/`.porcelain-bg-page`/CSS 变量

## 阶段 5：record 页集成

### Task 14: record 页 json
- [ ] `pages/record/index.json` 的 `usingComponents` 引入 `heat-map`、`radar-chart`

### Task 15: record 页 js
- [ ] 引入 `recordsApi`、`generateSuggestions`
- [ ] `data` 新增 `typeCounts: {}`、`suggestions: []`
- [ ] `refreshRecords` 中追加调用 `recordsApi.stats()`
- [ ] `typeCounts` 写入 `data`
- [ ] `generateSuggestions` 用 `{totalCount: stats.total, todayCount: stats.today, streakDays: stats.streak, typeCounts}` 生成建议
- [ ] 失败时 `typeCounts`/`suggestions` 置空，不阻塞主流程
- [ ] `onSuggestionTap(e)` 跳转
- [ ] 现有 `refreshRecords`/`loadMore`/`onReachBottom`/`clearRecords`/`openDetail`/`toLogin` 逻辑不变

### Task 16: record 页 wxml
- [ ] 可视化区块位于 `.progress-card` 之后、`.recent-section` 之前
- [ ] `wx:if="{{isLogin}}"` 包裹
- [ ] `<heat-map records="{{records}}" />`
- [ ] `<radar-chart data="{{typeCounts}}" />`
- [ ] 学习建议卡 `wx:for="{{suggestions}}"`
- [ ] 现有统计大卡、进度条、最近学习、历史轨迹保留不变

### Task 17: record 页 wxss
- [ ] `.viz-card` 样式（复用 `.card`）
- [ ] `.suggestion-card` 样式
- [ ] 深色模式下颜色正常

## 阶段 6：联动与回归验证

### Task 18: 学习行为联动
- [ ] `utils/learningHistory.js` 的 `add` 成功后调用 `notifyUserProgressUpdated('learning-record', contentType)`
- [ ] quiz 页答题完成调用 `notifyUserProgressUpdated('quiz', 'quiz')`
- [ ] mine 页监听 `user-progress:updated` 事件后刷新 `todayTypeCounts` 与每日任务

### Task 19: 回归验证
- [ ] mine 页现有用户卡、统计卡、学习成长、菜单卡、文化签句、Agent Panel 渲染正常
- [ ] mine 页新增仪表盘、建议卡、每日任务、分享卡导出、徽章墙、柱状图、雷达图登录态正常
- [ ] 未登录态仅显示用户卡 + 「点击登录」，不显示成就区块
- [ ] record 页现有统计大卡、进度条、最近学习、历史轨迹正常
- [ ] record 页新增热力图、雷达图、建议卡登录态正常
- [ ] 徽章详情弹窗打开/关闭、点击遮罩关闭
- [ ] 分享卡导出：生成预览 → 保存到相册（含授权拒绝兜底）→ 转发给好友
- [ ] 每日任务跨天重置：前一天计数 → 第二天进入 mine 页进度归零
- [ ] 浅色/深色模式下所有新区块颜色正常
- [ ] 词典搜索、收藏切换、学习记录写入、答题、民歌播放等既有功能无回归
