# Tasks

- [x] Task 1: 重写播放详情页 WXML 结构
  - [x] SubTask 1.1: 顶部加「● 正在播放」脉冲点 + 标题区，歌手名套半透明胶囊标签
  - [x] SubTask 1.2: 唱片区改为 CSS 真黑胶结构（纹路面 + 封面 + 中心铜鼓钉 + 外圈高光边）
  - [x] SubTask 1.3: 歌词区包玻璃卡（backdrop-filter + 圆角细边框），布依语暖金、中文白 78%
  - [x] SubTask 1.4: 控制区弃 emoji，改 CSS 几何图形图标（三角/双竖线/上下首符号）
  - [x] SubTask 1.5: slider block 加白描边，时间用等宽数字，底部加 safe-area 内边距

- [x] Task 2: 重写播放详情页 WXSS 视觉
  - [x] SubTask 2.1: bg-mask 改两层靛蓝渐变（`#0B2A4A → #123B6B`）+ 极淡蜡染 radial 暗纹
  - [x] SubTask 2.2: 唱片用 `repeating-radial-gradient` 画黑胶纹路，中心铜鼓钉，外圈金属高光
  - [x] SubTask 2.3: 标题改纯白 + 文字阴影，弃用 `--color-primary-dark`
  - [x] SubTask 2.4: 播放钮固定青花蓝 `#1664D9` 实底 + 暖金描边光晕，不引用主题变量
  - [x] SubTask 2.5: 玻璃歌词卡 backdrop-filter + 圆角细边框
  - [x] SubTask 2.6: CSS 绘制三角/双竖线/上下首符号图标

- [x] Task 3: 补齐深色模式适配
  - [x] SubTask 3.1: `.page.dark .bg-mask` 压暗约 50%
  - [x] SubTask 3.2: `.page.dark .cover-border` / `.sub-btn` 边框提到 `rgba(255,255,255,0.18)`
  - [x] SubTask 3.3: `.page.dark` 玻璃卡背景提亮、边框提亮
  - [x] SubTask 3.4: slider 在深色模式轨道提亮（WXML 通过 data 绑定或 CSS 覆盖）
  - [x] SubTask 3.5: 验证播放钮在深色模式保持青花蓝实底可见

- [x] Task 4: 无障碍与动效
  - [x] SubTask 4.1: 封面旋转动画包 `@media (prefers-reduced-motion: reduce)` 禁用
  - [x] SubTask 4.2: 切换播放状态时旋转有过渡不硬切
  - [x] SubTask 4.3: 暂停时封面 `grayscale(0.2)` 状态反馈

- [x] Task 5: 回归验证
  - [x] SubTask 5.1: 浅色模式视觉走查（标题/唱片/歌词/控件/ slider）
  - [x] SubTask 5.2: 深色模式视觉走查（同上 + 按钮可见性）
  - [x] SubTask 5.3: 播放/暂停/seek/上下首功能不回归（不动 index.js 逻辑）
  - [x] SubTask 5.4: 分享卡片入口与 onShareAppMessage 仍正常

# Task Dependencies
- Task 2 依赖 Task 1（WXML 结构先就位）
- Task 3、Task 4 可与 Task 2 并行编写但需基于同一 WXSS 文件
- Task 5 依赖 Task 1-4 全部完成
