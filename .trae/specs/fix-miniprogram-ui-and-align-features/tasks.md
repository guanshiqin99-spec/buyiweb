# Tasks

## 阶段 1：P0 高危 Bug 修复（独立可并行）

- [x] Task 1: 修复 custom-nav 组件不渲染标题问题
  - [x] SubTask 1.1: 在 `components/custom-nav/custom-nav.js` 的 `properties` 中增加 `title: { type: String, value: '' }`
  - [x] SubTask 1.2: 修改 `components/custom-nav/custom-nav.wxml`，在合适位置渲染 `<text class="nav-title">{{title}}</text>`（仅当 title 非空时显示）
  - [x] SubTask 1.3: 创建 `components/custom-nav/custom-nav.wxss`，将 wxml 内联 style 抽离为 class，并定义 `.nav-title` 样式（字号 32rpx、颜色 `var(--color-text-primary)`、居中）
  - [x] SubTask 1.4: 在 `custom-nav.json` 中声明 `usingComponents` 不变，确认 wxss 引入方式
  - [x] SubTask 1.5: 扩大返回按钮点击区至 ≥ 88rpx × 88rpx（padding 调整，不改图标尺寸）
  - [x] SubTask 1.6: 验证 home/query/song/favorite/mine/setting/phrases/proverbs/quiz/record/vocabulary 等所有页面传入的 title 正常渲染

- [x] Task 2: 修复 quiz 选项按钮不可见问题
  - [x] SubTask 2.1: 修改 `pages/quiz/index.wxss`，将 `.option-btn` 的 `color: var(--color-text)` 改为 `color: var(--color-text-primary)`
  - [x] SubTask 2.2: 将 `.option-btn` 的 `background: var(--color-card)` 改为 `background: var(--color-card-bg)`
  - [x] SubTask 2.3: 验证浅色/深色模式下选项按钮文字与背景对比度 ≥ 4.5:1
  - [x] SubTask 2.4: 验证 `.option-btn.correct` 和 `.option-btn.wrong` 状态样式不受影响

- [x] Task 3: 修复 setting 页远程背景图加载失败
  - [x] SubTask 3.1: 检查 `assets/images/` 下是否存在 `bg-mountain-top.png`、`bg-wave-bottom.png` 本地资源
  - [x] SubTask 3.2: 修改 `pages/setting/index.wxss` 的 `.landscape-bg`，若本地资源存在则改用本地路径；否则改用 CSS `linear-gradient` 渐变替代
  - [x] SubTask 3.3: 移除 `pages/setting/index.wxss` 中所有 `my-buyi-dict.com` 域名引用
  - [x] SubTask 3.4: 验证浅色/深色模式下背景渲染正常（深色模式 `.page.dark .landscape-bg` 同步调整）

- [x] Task 4: 修复 player-detail 歌词溢出覆盖控制区
  - [x] SubTask 4.1: 修改 `pages/player-detail/index.wxss` 的 `.lyric-box`，将 `height: 120rpx` 改为 `min-height: 120rpx; max-height: 200rpx; overflow-y: auto;`
  - [x] SubTask 4.2: 验证短歌词（1 行）布局不变形，长歌词（3+ 行）在 max-height 内滚动
  - [x] SubTask 4.3: 验证歌词区与下方播放控制按钮无重叠

- [x] Task 5: 修复 mine 页用户昵称对比度不达标
  - [x] SubTask 5.1: 修改 `pages/mine/index.wxss`，移除 `.user-nickname-text` 的 `color: #1A3A69 !important` 覆盖
  - [x] SubTask 5.2: 确认 `.user-name` 的 `color: #fff` 在 `linear-gradient(135deg, #5D8FD6, #7FA9E4)` 背景上对比度 ≥ 4.5:1
  - [x] SubTask 5.3: 验证未登录态（默认昵称"布依访客"）显示正常

- [x] Task 6: 修复 setting 页清空操作无二次确认
  - [x] SubTask 6.1: 修改 `pages/setting/index.js`，在"清空云端收藏"处理函数中增加 `wx.showModal` 二次确认（标题"确认清空"，内容"此操作不可恢复，将清空所有云端收藏，是否继续？"）
  - [x] SubTask 6.2: 在"清空学习记录"处理函数中增加同样的 `wx.showModal` 二次确认
  - [x] SubTask 6.3: 用户点击确认后才执行原有清空逻辑，点击取消则不执行
  - [x] SubTask 6.4: 验证原有 `favoritesApi.clear()` / `recordsApi.clear()` 调用与 eventBus 通知逻辑不变

## 阶段 2：P1 高频体验修复（独立可并行）

- [x] Task 7: 修复 song 页 hero-dots 误导
  - [x] SubTask 7.1: 修改 `pages/song/index.wxml`，删除 `hero-dots` 元素（4 个静态指示点）
  - [x] SubTask 7.2: 同步删除 `pages/song/index.wxss` 中 `.hero-dots`、`.hero-dot`、`.hero-dot.active` 相关样式（若有）
  - [x] SubTask 7.3: 验证 hero 大卡视觉完整性不受影响

- [x] Task 8: 修复 home 页 banner-swiper 重复定义
  - [x] SubTask 8.1: 修改 `pages/home/index.wxss`，合并 `.banner-swiper` 的两次定义（保留 `height: 320rpx`）
  - [x] SubTask 8.2: 合并 `.banner-title`、`.banner-desc` 的两次定义，保留注释中预期的样式
  - [x] SubTask 8.3: 验证 home 页 Banner 轮播渲染正常

- [x] Task 9: 修复 quiz 页无放弃本场按钮
  - [x] SubTask 9.1: 修改 `pages/quiz/index.wxml`，在 `phase==='question'` 阶段顶部或右上角增加"放弃本场"按钮
  - [x] SubTask 9.2: 修改 `pages/quiz/index.js`，新增 `onAbandon` 方法，调用 `wx.showModal` 确认后 `wx.navigateBack`
  - [x] SubTask 9.3: 修改 `pages/quiz/index.wxss`，为放弃按钮添加样式（不抢眼，次级按钮风格）
  - [x] SubTask 9.4: 验证从 tabBar 直接进入 quiz 时 `navigateBack` 失败的兜底（改为 `switchTab` 跳 home）

- [x] Task 10: 修复 song 页"更多 >"死链接
  - [x] SubTask 10.1: 修改 `pages/song/index.wxml`，为"更多 >"元素绑定 `bindtap="onMoreSongs"`
  - [x] SubTask 10.2: 修改 `pages/song/index.js`，新增 `onMoreSongs` 方法，加载下一页数据（沿用现有分页逻辑）或滚动到列表区
  - [x] SubTask 10.3: 若无法实现"加载更多"，则移除"更多 >"元素避免误导

- [x] Task 11: 修复 setting 页"关于"死链接
  - [x] SubTask 11.1: 修改 `pages/setting/index.wxml`，为"关于布依语言文化计划"元素绑定 `bindtap="onAbout"`
  - [x] SubTask 11.2: 修改 `pages/setting/index.js`，新增 `onAbout` 方法，跳转至 mine 页的"关于"区域或弹出 `wx.showModal` 介绍
  - [x] SubTask 11.3: 若无对应落地页，则移除该菜单项避免误导

## 阶段 3：风格统一（独立可并行）

- [x] Task 12: 统一收藏图标为 ♥/♡
  - [x] SubTask 12.1: 修改 `pages/song/index.wxml`，将收藏按钮的 🪷 emoji 改为 `{{isFav ? '♥' : '♡'}}`
  - [x] SubTask 12.2: 同步调整 `pages/song/index.wxss` 中收藏按钮样式（字号、颜色与 query 页 `fav-icon` 一致）
  - [x] SubTask 12.3: 验证 song 页收藏切换视觉与 query/phrases/proverbs/record 页一致
  - [x] SubTask 12.4: 不修改 `components/word-card/word-card.wxml` 的 ★/☆（避免破坏词汇页视觉，留待后续）

- [x] Task 13: 扩大触摸目标至 ≥88rpx
  - [x] SubTask 13.1: 修改 `pages/query/index.wxss` 的 `.fav-icon`、`.audio-btn`，包裹 `min-width: 88rpx; min-height: 88rpx; display: flex; align-items: center; justify-content: center;`
  - [x] SubTask 13.2: 修改 `pages/home/index.wxss` 的 `.clear-btn`，扩大点击区至 ≥88rpx × 88rpx
  - [x] SubTask 13.3: 修改 `pages/song/index.wxss` 的 `.seal-fav-btn`，将宽高改为 88rpx × 88rpx
  - [x] SubTask 13.4: 修改 `pages/phrases/index.wxss` 和 `pages/proverbs/index.wxss` 的 `.fav-icon`，同步扩大点击区
  - [x] SubTask 13.5: 修改 `pages/login/login.wxss` 的 `.guest-link`，扩大 `padding` 至 `24rpx 48rpx`
  - [x] SubTask 13.6: 验证扩大点击区后视觉不破坏原有布局（按钮在卡片内不溢出）

## 阶段 4：功能对齐（独立可并行）

- [x] Task 14: 小程序 Agent Panel 扩展至 song/favorite/mine 页
  - [x] SubTask 14.1: 修改 `pages/song/index.json` 的 `usingComponents`，引入 `agent-panel`（若未引入）
  - [x] SubTask 14.2: 在 `pages/song/index.wxml` 末尾添加 `<agent-panel context="song" />`
  - [x] SubTask 14.3: 修改 `pages/favorite/index.json` 和 `index.wxml`，引入并添加 `<agent-panel context="favorite" />`
  - [x] SubTask 14.4: 修改 `pages/mine/index.json` 和 `index.wxml`，引入并添加 `<agent-panel context="mine" />`
  - [x] SubTask 14.5: 验证 Agent Panel 在新页面打开/关闭正常，eventBus 通信无冲突
  - [x] SubTask 14.6: 验证 Agent Panel FAB 位置不与 tabBar 重叠（`bottom: 200rpx` 仍合适）

- [x] Task 15: Web 端 Songs 页补收藏按钮
  - [x] SubTask 15.1: 修改 `src/views/Songs.vue`，在民歌列表项中添加收藏按钮（IconHeart / IconHeartFilled）
  - [x] SubTask 15.2: 引入 `useFavoritesStore`，调用 `isFavorite('song', song.id)` 判断收藏状态
  - [x] SubTask 15.3: 绑定点击事件 `@click="favoritesStore.toggleFavorite('song', song.id)"`，显示 toast 提示
  - [x] SubTask 15.4: 验证未登录态点击收藏按钮跳转登录页（沿用 store 现有逻辑）
  - [x] SubTask 15.5: 验证收藏状态在 Favorites 页同步

- [x] Task 16: Web 端 Settings 页补字体大小设置
  - [x] SubTask 16.1: 修改 `src/stores/theme.js`，新增 `fontSize` state（'small'|'medium'|'large'，默认 'medium'），持久化到 localStorage
  - [x] SubTask 16.2: 在 theme store 新增 `setFontSize(size)` action，应用 `document.documentElement.style.fontSize = { small: '14px', medium: '16px', large: '18px' }[size]`
  - [x] SubTask 16.3: 修改 `src/views/Settings.vue`，在"外观主题"区块下方新增"字体大小"区块，提供三档单选按钮
  - [x] SubTask 16.4: 修改 `src/main.js` 或 theme store 初始化逻辑，启动时从 localStorage 读取并应用 fontSize
  - [x] SubTask 16.5: 验证字体大小切换即时生效，刷新页面后保持设置
  - [x] SubTask 16.6: 验证不影响现有主题切换功能

## 阶段 5：回归验证

- [x] Task 17: 小程序端回归验证
  - [x] SubTask 17.1: 验证 home/query/song/favorite/mine/setting/phrases/proverbs/quiz/record/vocabulary/player-detail/login 所有页面渲染正常
  - [x] SubTask 17.2: 验证微信授权登录、token 刷新、退出登录链路无回归
  - [x] SubTask 17.3: 验证词典搜索、收藏切换、学习记录写入、答题测验功能正常
  - [x] SubTask 17.4: 验证民歌播放、上一首/下一首、进度拖动、播放详情页正常
  - [x] SubTask 17.5: 验证浅色/深色模式切换在所有页面生效
  - [x] SubTask 17.6: 验证 Agent Panel 在 6 个页面（home/query/quiz/song/favorite/mine）均能正常打开

- [x] Task 18: Web 端回归验证
  - [x] SubTask 18.1: `npm run build` 0 errors、0 new warnings
  - [x] SubTask 18.2: `npm run test` 所有现有测试通过
  - [x] SubTask 18.3: 验证 Songs 页收藏按钮工作正常，收藏状态在 Favorites 页同步
  - [x] SubTask 18.4: 验证 Settings 页字体大小切换生效，刷新后保持
  - [x] SubTask 18.5: 验证主题切换、登录/登出、词典搜索、答题、学习记录无回归

# Task Dependencies

- Task 1-16 互相独立，可并行
- Task 17 依赖 Task 1-14（小程序端所有修改）
- Task 18 依赖 Task 15、Task 16（Web 端修改）
