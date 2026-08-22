# 小程序播放详情页美化 Spec

## Why
小程序 `pages/player-detail/`（点击音乐后的播放页）视觉粗糙：黑胶假封面、emoji 控制按钮、刺眼亮蓝遮罩、与 `pages/song` 青花瓷语言脱节；同时整页 wxss 完全没有 `.page.dark` 覆盖规则，深色模式下标题、播放钮、slider、卡片边框对比度全部崩坏。需要统一为「蜡染留声机」沉浸页并补齐深色适配。

## What Changes
- 重做 `pages/player-detail/index.wxml` 结构：顶部「正在播放」脉冲点 + 标题胶囊、CSS 真黑胶唱片（纹路+中心铜鼓钉）、玻璃歌词卡、CSS 绘制播放控件。
- 弃用 emoji `⏮ ⏸ ▶ ⏭`，改 CSS 几何图形（三角/双竖线/上下首符号）。
- 重写 `pages/player-detail/index.wxss`：青花靛蓝沉浸背景 + 薯茛暖金点缀，复用 song 页色彩语言。
- 补齐 `.page.dark` 全套覆盖规则（背景压暗、玻璃边框提亮、slider 轨道提亮）。
- 播放钮改固定青花蓝 `#1664D9` 实底 + 暖金描边光晕，不再依赖主题变量（避免深色模式按钮隐形）。
- 标题改纯白 + 文字阴影，弃用 `--color-primary-dark`（深色模式下读不清）。
- 封面旋转动画尊重 `prefers-reduced-motion`，底部加 safe-area 内边距。
- **不改 `index.js` 播放逻辑**，仅可能新增一个 `reducedMotion` data 字段用于禁用动画。

## Impact
- Affected specs: 无（独立页面改造）。
- Affected code:
  - `BuyiDictionaryApp-main/BuyiDictionaryApp-main/pages/player-detail/index.wxml`
  - `BuyiDictionaryApp-main/BuyiDictionaryApp-main/pages/player-detail/index.wxss`
  - `BuyiDictionaryApp-main/BuyiDictionaryApp-main/pages/player-detail/index.js`（仅可选新增 reducedMotion 字段）

## ADDED Requirements

### Requirement: 蜡染留声机视觉
播放详情页 SHALL 呈现深靛蓝沉浸背景 + 薯茛暖金点缀的「蜡染留声机」风格，与 `pages/song` 青花瓷语言一致。

#### Scenario: 进入播放页
- **WHEN** 用户从歌曲列表点击任一民歌
- **THEN** 播放详情页显示深靛蓝渐变背景 + 模糊封面氛围，顶部有「● 正在播放」脉冲点，标题纯白带轻阴影，歌手名套半透明胶囊标签。

### Requirement: 真黑胶唱片视觉
封面区 SHALL 用 CSS `repeating-radial-gradient` 绘制黑胶纹路，中心有铜鼓钉饰小圆点，外圈金属高光边。

#### Scenario: 播放状态切换
- **WHEN** 音频开始播放
- **THEN** 唱片以 12s 线性旋转，封面光晕加强
- **WHEN** 音频暂停
- **THEN** 旋转停止，封面 `grayscale(0.2)` 做状态反馈，切换有过渡不硬切

### Requirement: CSS 绘制控件图标
控制按钮 SHALL 使用 CSS 几何图形（三角/双竖线/上下首符号），不使用 emoji。

#### Scenario: 渲染跨设备一致
- **WHEN** 在 iOS / Android / 开发者工具渲染播放页
- **THEN** 播放/暂停/上一首/下一首图标视觉一致，无 emoji 字体差异

### Requirement: 深色模式适配
播放详情页 SHALL 在浅色与深色主题下均可读，所有沉浸元素补齐 `.page.dark` 覆盖规则。

#### Scenario: 切换到深色模式
- **WHEN** 用户在设置页切换到深色主题并返回播放页
- **THEN** 背景再压暗约 50%，玻璃卡边框提到 `rgba(255,255,255,0.18)`，slider 轨道提亮可见，播放钮保持青花蓝实底可见，标题保持纯白可读

#### Scenario: 播放钮在深色模式可见
- **WHEN** 深色模式下查看播放钮
- **THEN** 按钮为固定青花蓝 `#1664D9` 实底 + 暖金描边光晕，不依赖 `--color-card-bg`/`--color-primary-dark` 主题变量

### Requirement: 无障碍动效
封面旋转 SHALL 尊重 `prefers-reduced-motion`。

#### Scenario: 系统开启减少动效
- **WHEN** 用户系统开启「减少动态效果」
- **THEN** 唱片不旋转，仍可通过播放钮图标识别播放状态

## MODIFIED Requirements

### Requirement: 播放页控制面板
原 slider `activeColor="#1664D9"` 硬编码、时间文字裸露无容器。
修改为：slider 主色统一青花蓝、block 加白描边、时间用等宽数字、整个控制区底部加 safe-area 内边距。播放钮固定青花蓝实底不依赖主题变量。

## REMOVED Requirements

### Requirement: Emoji 控制按钮
**Reason**: emoji 跨设备渲染丑且不一致。
**Migration**: 改用 CSS 几何图形绘制图标。

### Requirement: 假黑胶纯色边框
**Reason**: 12rpx 纯 `#111` 边框无纹理不像黑胶。
**Migration**: 改用 `repeating-radial-gradient` 绘制纹路 + 中心铜鼓钉。
