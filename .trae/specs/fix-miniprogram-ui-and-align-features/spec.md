# 小程序端 UI 修复与两端功能对齐 Spec

## Why

经过对小程序端和 Web 端的全面审查，发现小程序端存在 8 个高危 UI Bug（如 custom-nav 标题丢失、quiz 选项按钮因 CSS 变量未定义而不可见、setting 远程背景图加载失败等）直接影响功能可用性；同时两端在功能覆盖上存在 7+ 处差异（如 Web 端 Songs 页缺收藏按钮、Settings 缺字体大小、小程序 Agent Panel 覆盖页面少）。本 spec 旨在以**最小改动**修复高危 Bug 并补齐关键功能缺口，**严格保证现有功能不失效**。

## What Changes

### 小程序端 Bug 修复（P0 必修，影响功能可用性）
- 修复 [components/custom-nav/custom-nav.js](file:///d:/BuyiDictionaryWeb/BuyiDictionaryApp-main/BuyiDictionaryApp-main/components/custom-nav/custom-nav.js) 未声明 `title` 属性导致导航栏永远无标题
- 修复 [pages/quiz/index.wxss](file:///d:/BuyiDictionaryWeb/BuyiDictionaryApp-main/BuyiDictionaryApp-main/pages/quiz/index.wxss) 使用未定义 CSS 变量 `--color-text`/`--color-card` 导致选项按钮不可见
- 修复 [pages/setting/index.wxss](file:///d:/BuyiDictionaryWeb/BuyiDictionaryApp-main/BuyiDictionaryApp-main/pages/setting/index.wxss) 引用未备案远程域名背景图加载失败，改用本地资源或 CSS 渐变
- 修复 [pages/player-detail/index.wxss](file:///d:/BuyiDictionaryWeb/BuyiDictionaryApp-main/BuyiDictionaryApp-main/pages/player-detail/index.wxss) `lyric-box` 固定高度无 overflow 导致长歌词溢出覆盖控制区
- 修复 [pages/mine/index.wxss](file:///d:/BuyiDictionaryWeb/BuyiDictionaryApp-main/BuyiDictionaryApp-main/pages/mine/index.wxss) 用户昵称 `!important` 强制深蓝文字在中蓝背景上对比度不达 WCAG AA
- 修复 [pages/setting/index.js](file:///d:/BuyiDictionaryWeb/BuyiDictionaryApp-main/BuyiDictionaryApp-main/pages/setting/index.js) 清空收藏/学习记录无二次确认对话框

### 小程序端 Bug 修复（P1 高频体验）
- 修复 [pages/song/index.wxml](file:///d:/BuyiDictionaryWeb/BuyiDictionaryApp-main/BuyiDictionaryApp-main/pages/song/index.wxml) `hero-dots` 硬编码 4 个指示点但无 swiper 绑定，误导用户
- 修复 [pages/home/index.wxss](file:///d:/BuyiDictionaryWeb/BuyiDictionaryApp-main/BuyiDictionaryApp-main/pages/home/index.wxss) `.banner-swiper`/`.banner-title`/`.banner-desc` 重复定义两次
- 修复 [pages/quiz/index.wxml](file:///d:/BuyiDictionaryWeb/BuyiDictionaryApp-main/BuyiDictionaryApp-main/pages/quiz/index.wxml) 答题阶段无"放弃本场"按钮，从 tabBar 进入则无法退出
- 修复 [pages/song/index.wxml#L60](file:///d:/BuyiDictionaryWeb/BuyiDictionaryApp-main/BuyiDictionaryApp-main/pages/song/index.wxml) "更多 >" 死链接
- 修复 [pages/setting/index.wxml#L75-L78](file:///d:/BuyiDictionaryWeb/BuyiDictionaryApp-main/BuyiDictionaryApp-main/pages/setting/index.wxml) "关于布依语言文化计划" 死链接

### 小程序端风格统一（不破坏现有视觉）
- 统一收藏图标：将 [pages/song/index.wxml](file:///d:/BuyiDictionaryWeb/BuyiDictionaryApp-main/BuyiDictionaryApp-main/pages/song/index.wxml) 的 🪷 改为 ♥/♡，与 query/phrases/proverbs/record 一致
- 扩大触摸目标：将 `fav-icon`/`clear-btn`/`audio-btn`/`seal-fav-btn`/`guest-link` 点击区扩大到 ≥88rpx
- 抽离 [components/custom-nav/custom-nav.wxml](file:///d:/BuyiDictionaryWeb/BuyiDictionaryApp-main/BuyiDictionaryApp-main/components/custom-nav/custom-nav.wxml) 内联样式为独立 wxss 文件

### 两端功能对齐（仅补缺失，不改已有逻辑）
- **小程序端**：将 Agent Panel 入口扩展至 [pages/song/index.wxml](file:///d:/BuyiDictionaryWeb/BuyiDictionaryApp-main/BuyiDictionaryApp-main/pages/song/index.wxml)、[pages/favorite/index.wxml](file:///d:/BuyiDictionaryWeb/BuyiDictionaryApp-main/BuyiDictionaryApp-main/pages/favorite/index.wxml)、[pages/mine/index.wxml](file:///d:/BuyiDictionaryWeb/BuyiDictionaryApp-main/BuyiDictionaryApp-main/pages/mine/index.wxml)
- **Web 端**：在 [src/views/Songs.vue](file:///d:/BuyiDictionaryWeb/buyi-dictionary-vue/src/views/Songs.vue) 民歌列表项补收藏按钮（store 已支持 `song` 类型）
- **Web 端**：在 [src/views/Settings.vue](file:///d:/BuyiDictionaryWeb/buyi-dictionary-vue/src/views/Settings.vue) 补字体大小设置（小/中/大），通过 `document.documentElement.style.fontSize` 应用

## Impact

- **Affected specs**: 无（独立修复任务）
- **Affected code**:
  - 小程序：`components/custom-nav/`、`pages/quiz/`、`pages/setting/`、`pages/player-detail/`、`pages/mine/`、`pages/song/`、`pages/home/`、`pages/favorite/`、`app.wxss`
  - Web 端：`src/views/Songs.vue`、`src/views/Settings.vue`、`src/stores/theme.js`

## ADDED Requirements

### Requirement: 小程序导航栏标题渲染
小程序 custom-nav 组件 SHALL 接受 `title` 属性并在导航栏居中渲染标题文本，标题字号、颜色与全局设计系统一致。

#### Scenario: 页面传入 title
- **WHEN** 任意页面在 wxml 中使用 `<custom-nav title="词典查询" />`
- **THEN** 导航栏中间显示"词典查询"文本，字号 32rpx，颜色 `var(--color-text-primary)`

#### Scenario: 未传入 title
- **WHEN** 页面未传入 title 或 title 为空字符串
- **THEN** 导航栏不渲染标题区域，返回按钮与状态栏布局保持原样

### Requirement: 小程序 Quiz 选项按钮可见性
小程序 quiz 页 `.option-btn` SHALL 使用已定义的全局 CSS 变量 `--color-text-primary` 和 `--color-card-bg`，确保在浅色/深色模式下选项按钮文字与背景均可见。

#### Scenario: 浅色模式渲染
- **WHEN** 用户在浅色模式下进入 quiz 页
- **THEN** 选项按钮显示白色卡片背景 + 深色文字，对比度 ≥ 4.5:1

#### Scenario: 深色模式渲染
- **WHEN** 用户切换至深色模式
- **THEN** 选项按钮显示深色卡片背景 + 浅色文字，对比度 ≥ 4.5:1

### Requirement: 小程序 Setting 页背景渲染
小程序 setting 页背景 SHALL 使用本地资源或纯 CSS 渐变，不再依赖远程域名 `my-buyi-dict.com`。

#### Scenario: 离线环境
- **WHEN** 用户在无网络或域名未备案环境下进入 setting 页
- **THEN** 页面背景正常渲染（CSS 渐变或本地图片），不出现白屏

### Requirement: 小程序 Player Detail 歌词容器
小程序 player-detail 页 `lyric-box` SHALL 使用 `min-height` + `max-height` + `overflow-y: auto`，确保长歌词不溢出覆盖控制区。

#### Scenario: 长歌词渲染
- **WHEN** 当前播放民歌的歌词超过 2 行
- **THEN** lyric-box 高度自适应至 max-height 内滚动，不覆盖下方播放控制按钮

### Requirement: 小程序 Mine 页用户昵称对比度
小程序 mine 页用户昵称 SHALL 满足 WCAG AA 对比度标准（≥ 4.5:1）。

#### Scenario: 中蓝渐变背景
- **WHEN** 用户昵称在 `linear-gradient(135deg, #5D8FD6, #7FA9E4)` 背景上渲染
- **THEN** 文字颜色为白色 `#FFFFFF`，对比度 ≥ 4.5:1，移除 `!important` 深蓝覆盖

### Requirement: 小程序 Setting 页危险操作二次确认
小程序 setting 页"清空云端收藏"和"清空学习记录"操作 SHALL 调用 `wx.showModal` 进行二次确认。

#### Scenario: 用户点击清空收藏
- **WHEN** 用户点击"清空云端收藏"
- **THEN** 弹出模态对话框，标题"确认清空"，内容"此操作不可恢复，将清空所有云端收藏，是否继续？"，确认按钮为红色 `destructive` 风格
- **AND** 用户点击确认后才执行清空，点击取消则不执行

### Requirement: 小程序 Quiz 页放弃本场按钮
小程序 quiz 页答题阶段 SHALL 显示"放弃本场"按钮，点击后弹出确认对话框，确认后返回上一页。

#### Scenario: 用户中途放弃
- **WHEN** 用户在 `phase==='question'` 阶段点击"放弃本场"按钮
- **THEN** 弹出 `wx.showModal` 确认对话框
- **AND** 确认后调用 `wx.navigateBack`，已答题目不计入成绩

### Requirement: 小程序 Agent Panel 全页面覆盖
小程序 Agent Panel SHALL 在 home/query/quiz/song/favorite/mine 共 6 个主要页面提供入口。

#### Scenario: 用户在民歌页调用 AI
- **WHEN** 用户在 song 页点击右下角 Agent Panel FAB
- **THEN** Agent Panel 弹出，上下文为"民歌"，快捷提问模板为"这首民歌的文化背景是什么？"等

### Requirement: 统一收藏图标
小程序所有页面 SHALL 使用 ♥/♡ 字符或 `heart.svg`/`heart-active.svg` 表示收藏状态，不再使用 🪷 或 ★/☆。

#### Scenario: 民歌页收藏切换
- **WHEN** 用户在 song 页点击收藏按钮
- **THEN** 按钮图标在 ♥（已收藏）和 ♡（未收藏）之间切换，与 query 页保持一致

### Requirement: 触摸目标最小尺寸
小程序所有可点击图标按钮（fav-icon/clear-btn/audio-btn/seal-fav-btn/guest-link）SHALL 满足最小 88rpx × 88rpx 点击区域。

#### Scenario: 用户在小屏设备点击收藏
- **WHEN** 用户在 320pt 屏设备上点击 fav-icon
- **THEN** 实际可点击区域 ≥ 88rpx × 88rpx，点击容错率符合微信小程序设计规范

### Requirement: Web 端 Songs 页收藏按钮
Web 端 Songs.vue 民歌列表项 SHALL 显示收藏按钮，点击后调用 `favoritesStore.toggleFavorite('song', id)`，并同步收藏状态。

#### Scenario: 用户收藏民歌
- **WHEN** 用户在 Songs 页点击某民歌的收藏按钮
- **THEN** 按钮图标在 IconHeart 与 IconHeartFilled 之间切换
- **AND** favoritesStore.favorites 列表新增/移除该项
- **AND** 显示 toast 提示"已收藏"/"已取消收藏"

### Requirement: Web 端字体大小设置
Web 端 Settings.vue SHALL 提供字体大小三档设置（小/中/大），通过 `document.documentElement.style.fontSize` 应用，并持久化到 localStorage。

#### Scenario: 用户切换字体大小
- **WHEN** 用户在 Settings 页选择"大"字号
- **THEN** 整站根元素 font-size 设为 18px（中=16px / 小=14px）
- **AND** 设置持久化到 localStorage，刷新页面后保持
- **AND** theme store 同步状态

## MODIFIED Requirements

### Requirement: custom-nav 组件
custom-nav 组件 SHALL：
1. 接受 `title` 属性（String，默认空字符串）
2. 在 wxml 中渲染 `<text class="nav-title">{{title}}</text>` 当 title 非空时
3. 抽离内联样式为独立 `custom-nav.wxss` 文件
4. 返回按钮点击区扩大至 ≥ 88rpx × 88rpx
5. 保留现有的 statusBarHeight 适配与 pages.length > 1 返回按钮逻辑

### Requirement: 小程序 song 页 hero 区域
song 页 hero 区域 SHALL：
1. 移除硬编码的 4 个静态指示点 `hero-dots`，或改为 swiper 绑定数据驱动
2. "更多 >" 链接 SHALL 绑定 `bindtap` 跳转至完整曲库列表或移除该链接
3. 收藏按钮图标从 🪷 改为 ♥/♡
4. 收藏按钮点击区扩大至 ≥ 88rpx × 88rpx

### Requirement: 小程序 setting 页
setting 页 SHALL：
1. 背景改用 CSS 渐变或本地 `assets/images/` 资源，移除 `my-buyi-dict.com` 远程引用
2. "清空云端收藏"和"清空学习记录"操作增加 `wx.showModal` 二次确认
3. "关于布依语言文化计划"链接 SHALL 绑定跳转或移除

## REMOVED Requirements

### Requirement: 远程背景图依赖
**Reason**: 小程序 `my-buyi-dict.com` 域名未备案，CSS `background-image: url(https://...)` 加载失败导致背景白屏
**Migration**: 改用本地 `assets/images/bg-mountain-top.png`、`bg-wave-bottom.png`（若不存在则用 CSS linear-gradient 替代）

### Requirement: 硬编码 hero-dots 静态指示点
**Reason**: song 页 4 个指示点硬编码且无 swiper 绑定，误导用户以为可切换
**Migration**: 直接删除 `hero-dots` 元素，保留单张大卡视觉

### Requirement: 用户昵称 !important 深蓝覆盖
**Reason**: 中蓝背景上深蓝文字对比度 3.2:1 不达 WCAG AA
**Migration**: 移除 `!important` 覆盖，使用全局白色 `.user-name { color: #fff }`
