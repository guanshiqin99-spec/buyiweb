# Checklist

## 视觉结构
- [x] 顶部「● 正在播放」脉冲点存在且在播放时跳动
- [x] 标题纯白带轻阴影，不再引用 `--color-primary-dark`
- [x] 歌手名套半透明胶囊标签（呼应 song 页 hero-tags）
- [x] 唱片有 `repeating-radial-gradient` 黑胶纹路
- [x] 唱片中心有铜鼓钉饰小圆点
- [x] 唱片外圈有金属高光边
- [x] 歌词区为玻璃卡（backdrop-filter + 圆角细边框）
- [x] 歌词布依语暖金 `#E0A85A`、中文白 78%
- [x] 控制按钮为 CSS 几何图形，无 emoji
- [x] slider block 有白描边，时间为等宽数字

## 色彩语言
- [x] bg-mask 为靛蓝两层渐变（`#0B2A4A → #123B6B`），非刺眼亮蓝
- [x] bg-mask 叠极淡蜡染 radial 暗纹
- [x] 播放钮固定青花蓝 `#1664D9` 实底 + 暖金描边光晕
- [x] 播放钮不引用 `--color-card-bg` / `--color-primary-dark` 主题变量
- [x] 整页色彩与 `pages/song` 青花瓷语言一致

## 深色模式适配
- [x] `index.wxss` 存在 `.page.dark` 覆盖规则
- [x] 深色模式背景压暗约 50%
- [x] 深色模式 `.cover-border` / `.sub-btn` 边框提到 `rgba(255,255,255,0.18)`
- [x] 深色模式玻璃卡背景与边框提亮
- [x] 深色模式 slider 轨道可见
- [x] 深色模式播放钮保持青花蓝实底可见
- [x] 深色模式标题保持纯白可读

## 动效与无障碍
- [x] 播放时唱片 12s 线性旋转
- [x] 暂停时旋转停止，封面 `grayscale(0.2)` 反馈
- [x] 播放/暂停旋转切换有过渡不硬切
- [x] `prefers-reduced-motion: reduce` 下唱片不旋转
- [x] 底部有 safe-area 内边距

## 功能不回归
- [x] `index.js` 播放/暂停/seek/上下首逻辑未改动
- [x] onShareAppMessage / onShareTimeline 分享入口正常
- [x] 从分享链接打开播放页行为正常
- [x] 主题切换事件 `theme:changed` 仍被监听
