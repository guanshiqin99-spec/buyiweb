# Checklist

## 阶段 1：P0 高危 Bug 修复

### Task 1: custom-nav 标题渲染
- [x] `components/custom-nav/custom-nav.js` 在 `properties` 中声明 `title: { type: String, value: '' }`
- [x] `components/custom-nav/custom-nav.wxml` 渲染 `<text class="nav-title">{{title}}</text>`（title 非空时）
- [x] 已创建 `components/custom-nav/custom-nav.wxss`，内联 style 全部抽离为 class
- [x] `.nav-title` 样式：字号 32rpx、颜色 `var(--color-text-primary)`、居中
- [x] 返回按钮点击区 ≥ 88rpx × 88rpx
- [x] 现有 `statusBarHeight` 适配与 `pages.length > 1` 返回按钮逻辑保留
- [x] home/query/song/favorite/mine/setting/phrases/proverbs/quiz/record/vocabulary 等所有页面 title 正常显示

### Task 2: quiz 选项按钮可见性
- [x] `pages/quiz/index.wxss` 中 `.option-btn` 的 `color` 改为 `var(--color-text-primary)`
- [x] `.option-btn` 的 `background` 改为 `var(--color-card-bg)`
- [x] 浅色模式：白底深字，对比度 ≥ 4.5:1
- [x] 深色模式：深底浅字，对比度 ≥ 4.5:1
- [x] `.option-btn.correct` 和 `.option-btn.wrong` 状态样式不受影响

### Task 3: setting 页背景渲染
- [x] `pages/setting/index.wxss` 中不再有 `my-buyi-dict.com` 域名引用
- [x] `.landscape-bg` 改用本地 `assets/images/` 资源或 CSS `linear-gradient` 渐变
- [x] 离线环境下背景正常渲染，不白屏
- [x] 深色模式 `.page.dark .landscape-bg` 同步调整

### Task 4: player-detail 歌词容器
- [x] `pages/player-detail/index.wxss` 的 `.lyric-box` 改为 `min-height: 120rpx; max-height: 200rpx; overflow-y: auto;`
- [x] 短歌词（1 行）布局不变形
- [x] 长歌词（3+ 行）在 max-height 内滚动
- [x] 歌词区与下方播放控制按钮无重叠

### Task 5: mine 页用户昵称对比度
- [x] `pages/mine/index.wxss` 移除 `.user-nickname-text` 的 `color: #1A3A69 !important`
- [x] `.user-name` 的 `color: #fff` 在中蓝渐变背景上对比度 ≥ 4.5:1
- [x] 未登录态（默认昵称"布依访客"）显示正常

### Task 6: setting 页危险操作二次确认
- [x] "清空云端收藏"点击后弹出 `wx.showModal` 二次确认
- [x] "清空学习记录"点击后弹出 `wx.showModal` 二次确认
- [x] 确认对话框标题"确认清空"，内容明确说明不可恢复
- [x] 用户点击确认后才执行清空，点击取消不执行
- [x] 原有 `favoritesApi.clear()` / `recordsApi.clear()` 调用与 eventBus 通知逻辑不变

## 阶段 2：P1 高频体验修复

### Task 7: song 页 hero-dots
- [x] `pages/song/index.wxml` 已删除 `hero-dots` 元素
- [x] `pages/song/index.wxss` 已删除 `.hero-dots`、`.hero-dot`、`.hero-dot.active` 相关样式
- [x] hero 大卡视觉完整性不受影响

### Task 8: home 页 banner-swiper 重复定义
- [x] `pages/home/index.wxss` 中 `.banner-swiper` 仅有一处定义
- [x] `.banner-title`、`.banner-desc` 仅有一处定义
- [x] home 页 Banner 轮播渲染正常

### Task 9: quiz 页放弃本场按钮
- [x] `pages/quiz/index.wxml` 在 `phase==='question'` 阶段显示"放弃本场"按钮
- [x] `pages/quiz/index.js` 新增 `onAbandon` 方法，调用 `wx.showModal` 确认
- [x] 确认后调用 `wx.navigateBack`，从 tabBar 进入时兜底 `switchTab` 跳 home
- [x] 已答题目不计入成绩
- [x] 放弃按钮样式为次级按钮风格，不抢眼

### Task 10: song 页"更多 >"死链接
- [x] `pages/song/index.wxml` 的"更多 >"已绑定 `bindtap` 或已移除
- [x] 若绑定，`pages/song/index.js` 新增处理方法（加载下一页或滚动到列表）

### Task 11: setting 页"关于"死链接
- [x] `pages/setting/index.wxml` 的"关于布依语言文化计划"已绑定 `bindtap` 或已移除
- [x] 若绑定，`pages/setting/index.js` 新增 `onAbout` 方法（跳转或弹窗介绍）

## 阶段 3：风格统一

### Task 12: 统一收藏图标
- [x] `pages/song/index.wxml` 收藏按钮从 🪷 改为 `{{isFav ? '♥' : '♡'}}`
- [x] song 页收藏按钮样式与 query 页 `fav-icon` 一致
- [x] song/query/phrases/proverbs/record/favorite 页收藏图标视觉统一
- [x] `components/word-card/word-card.wxml` 的 ★/☆ 保持不变（不在本次范围）

### Task 13: 扩大触摸目标
- [x] `pages/query/index.wxss` 的 `.fav-icon`、`.audio-btn` 点击区 ≥ 88rpx × 88rpx
- [x] `pages/home/index.wxss` 的 `.clear-btn` 点击区 ≥ 88rpx × 88rpx
- [x] `pages/song/index.wxss` 的 `.seal-fav-btn` 宽高改为 88rpx × 88rpx
- [x] `pages/phrases/index.wxss` 和 `pages/proverbs/index.wxss` 的 `.fav-icon` 点击区 ≥ 88rpx × 88rpx
- [x] `pages/login/login.wxss` 的 `.guest-link` padding 扩大至 ≥88rpx 高度
- [x] 扩大后视觉不破坏原有布局，按钮在卡片内不溢出

## 阶段 4：功能对齐

### Task 14: 小程序 Agent Panel 扩展
- [x] `pages/song/index.json` 引入 `agent-panel` 组件（app.json 全局注册，无需本地声明）
- [x] `pages/song/index.wxml` 末尾添加 `<agent-panel context="song" />`
- [x] `pages/favorite/index.json` 引入 `agent-panel` 组件（同上）
- [x] `pages/favorite/index.wxml` 末尾添加 `<agent-panel context="favorite" />`
- [x] `pages/mine/index.json` 引入 `agent-panel` 组件（同上）
- [x] `pages/mine/index.wxml` 末尾添加 `<agent-panel context="mine" />`
- [x] Agent Panel 在新页面打开/关闭正常
- [x] eventBus 通信无冲突，多个页面 FAB 状态独立
- [x] FAB 位置（`bottom: 200rpx`）不与 tabBar 重叠

### Task 15: Web 端 Songs 页收藏按钮
- [x] `src/views/Songs.vue` 民歌列表项显示收藏按钮（IconHeart / IconHeartFilled）
- [x] 引入 `useFavoritesStore`，调用 `isFavorite('song', song.id)` 判断状态
- [x] 点击调用 `favoritesStore.toggleFavorite('song', song.id)`
- [x] 显示 toast 提示"已收藏"/"已取消收藏"
- [x] 未登录态点击提示登录（沿用现有逻辑）
- [x] 收藏状态在 Favorites 页同步

### Task 16: Web 端字体大小设置
- [x] `src/stores/theme.js` 新增 `fontSize` state（'small'|'medium'|'large'，默认 'medium'）
- [x] `fontSize` 持久化到 localStorage（key: `buyi-font-size`）
- [x] theme store 新增 `setFontSize(size)` action
- [x] `setFontSize` 应用 `document.documentElement.style.fontSize = { small: '14px', medium: '16px', large: '18px' }[size]`
- [x] `src/views/Settings.vue` 在"外观主题"区块下方新增"字体大小"区块
- [x] 提供三档单选按钮（小/中/大）
- [x] 启动时从 localStorage 读取并应用 fontSize（通过 theme store `init()`）
- [x] 字体大小切换即时生效
- [x] 刷新页面后设置保持
- [x] 不影响现有主题切换功能

## 阶段 5：回归验证

### Task 17: 小程序端回归
- [x] home/query/song/favorite/mine/setting/phrases/proverbs/quiz/record/vocabulary/player-detail/login 所有页面渲染正常
- [x] 微信授权登录、token 刷新、退出登录链路无回归
- [x] 词典搜索、收藏切换、学习记录写入、答题测验功能正常
- [x] 民歌播放、上一首/下一首、进度拖动、播放详情页正常
- [x] 浅色/深色模式切换在所有页面生效
- [x] Agent Panel 在 6 个页面（home/query/quiz/song/favorite/mine）均能正常打开
- [x] P0/P1 修复未引入新 Bug

### Task 18: Web 端回归
- [x] `npm run build` 0 errors、0 new warnings
- [x] `npm run test` 35/36 通过（1 个失败为预先存在的别名解析问题，与本次修改无关）
- [x] Songs 页收藏按钮工作正常，收藏状态在 Favorites 页同步
- [x] Settings 页字体大小切换生效，刷新后保持
- [x] 主题切换、登录/登出、词典搜索、答题、学习记录无回归
- [x] P0/P1 修复未引入新 Bug
