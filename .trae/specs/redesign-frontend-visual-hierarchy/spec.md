# 前端动效语言重塑 Spec

## Why

`buyi-dictionary-vue` 当前动效层次混乱、装饰过度：液玻高光随滚动高频变化、背景粒子漂浮感强、光标光晕全站泛化、首页同时叠加 prelude、粒子、视差与 reveal，导致页面显得廉价且分散注意力。本次优化以 frontend-skill 的「动效服务层级，而非制造噪音」为原则，把动效收敛为 2-3 个有明确目的的动画系统。

## What Changes

- 统一动效节奏：建立 `duration-fast(150ms)` / `duration-base(250ms)` / `duration-slow(500ms)` 三档时长，缓动统一为 `ease-out` 或品牌自定义贝塞尔曲线。
- Hero 入场序列：首页 Hero 文字与 CTA 以 stagger 方式淡入/上滑，时长 ≤ 700ms，避免 prelude 与 Hero 动画冲突。
- 滚动叙事：各 section 使用 IntersectionObserver 触发 reveal，动画仅执行一次，避免反复触发造成烦躁。
- 深度与视差：叙事页（Home/Songs/Culture）保留背景视差，但系数降至 0.08-0.12；工具页关闭视差与粒子。
- 操作反馈：核心 CTA 与按钮使用微妙的 scale/brightness/shadow 变化，过渡 ≤ 200ms，不使用大幅位移或发光。
- 粒子与光标光晕降噪：粒子数量上限收紧、透明度降低、旋转幅度减半；光标光晕仅在桌面核心操作按钮上生效，触屏与工具页禁用。
- 减少动效兜底：所有 reveal、粒子、光标光晕、视差在 `prefers-reduced-motion: reduce` 下停止或隐藏。
- 保持可访问性：焦点管理、错误聚焦、键盘交互等已有逻辑不被破坏。

## Impact

- 受影响能力：首页 Hero 与展区动效、各页面滚动揭示、按钮悬停反馈、背景粒子与光标光晕行为、视差滚动。
- 受影响代码：`src/assets/styles/variables.css`、`src/assets/styles/main.css`、`src/assets/styles/liquid-glass.css`、`src/components/common/PageShell.vue`、`src/components/common/FloatingParticles.vue`、`src/utils/pointerGlow.js`、`src/utils/liquidGlass.js`、`src/views/Home.vue`、`src/views/Dictionary.vue`、`src/views/Login.vue`、`src/views/Settings.vue`、`src/views/Profile.vue`、`src/views/Favorites.vue`、`src/views/Record.vue`、`src/views/Learn.vue`、`src/views/Songs.vue`、`src/views/Culture.vue`。

## Requirements

### Requirement: 统一动效节奏系统

The system SHALL provide a three-tier timing system and apply it consistently across all transitions and animations.

#### Scenario: 时长与缓动

- **WHEN** 设计微交互（按钮 hover、开关、焦点环）
- **THEN** 使用 `--duration-fast: 150ms`，缓动 `ease-out`
- **WHEN** 设计内容揭示、卡片状态切换
- **THEN** 使用 `--duration-base: 250ms`，缓动 `cubic-bezier(0.22, 0.61, 0.36, 1)`
- **WHEN** 设计 Hero 入场、页面切换、重大状态变化
- **THEN** 使用 `--duration-slow: 500ms`，缓动 `cubic-bezier(0.22, 0.61, 0.36, 1)`
- **WHEN** 使用 stagger 序列
- **THEN** 子元素间隔 80-120ms，总序列不超过 700ms

### Requirement: Hero 入场序列

The system SHALL animate the Home Hero text and CTA as a single entrance sequence.

#### Scenario: 首页首次进入

- **WHEN** 用户进入首页且未开启减少动效
- **THEN** 品牌名、标题、正文、CTA 依次以淡入 + 轻微上滑（translateY: 16px → 0）出现
- **THEN** 整个序列时长 ≤ 700ms，stagger 间隔 80-120ms
- **THEN** 动画开始前元素处于可见的最终位置（避免布局抖动）

### Requirement: 滚动揭示

The system SHALL reveal sections on scroll with a restrained, one-shot animation.

#### Scenario: 滚动进入视口

- **WHEN** 用户滚动页面，section 进入视口
- **THEN** section 以淡入 + 轻微上滑出现，时长 250-400ms
- **THEN** 同一元素只触发一次 reveal，反复滚动不再重新播放
- **WHEN** 用户开启减少动效
- **THEN** 元素直接呈现，不播放 reveal 动画

### Requirement: 操作反馈

The system SHALL provide subtle hover/active feedback for all primary actions.

#### Scenario: 按钮与链接交互

- **WHEN** 用户 hover 核心 CTA 按钮
- **THEN** 仅出现 brightness(1.05)、轻微 scale(1.02) 或阴影加深之一，过渡 ≤ 200ms
- **WHEN** 用户 active/点击
- **THEN** 出现 scale(0.98) 或亮度降低，过渡 ≤ 150ms
- **THEN** 禁止使用大幅 translateY、强烈发光或颜色突变

### Requirement: 背景粒子与光标光晕降噪

The system SHALL reduce particle and cursor-glow intensity and scope.

#### Scenario: 粒子效果

- **WHEN** 页面渲染背景粒子
- **THEN** 默认数量 ≤ 8，透明度较当前降低 30-50%，旋转幅度从 360° 降至 180°
- **WHEN** 页面为工具页（Dictionary/Settings/Profile/Favorites/Record/Learn）
- **THEN** 默认关闭粒子或仅保留 ≤ 4 个极淡粒子

#### Scenario: 光标光晕

- **WHEN** 用户设备为桌面（pointer: fine）
- **THEN** 光标光晕仅跟随核心操作按钮，透明度 ≤ 0.10
- **WHEN** 用户设备为触屏（pointer: coarse）或页面为工具页
- **THEN** 光标光晕隐藏
- **WHEN** 用户开启减少动效
- **THEN** 光标光晕隐藏

### Requirement: 液玻镜面动效降级

现有液玻动效 SHALL 从「高频镜面跟随」改为「低频次、微偏移」的质感提示。

- **GIVEN** 任意 `.liquid-glass-*` 元素
- **WHEN** 用户滚动页面
- **THEN** `scrollShift` 最大偏移量减半，滚动停止后归位系数从 0.88 调至 0.92，让镜面归位更慢更稳
- **WHEN** 用户 hover
- **THEN** 仅允许极微弱的光斑移动，禁止大幅闪烁或强光扫过

### Requirement: 视差与氛围动效降级

现有背景视差 SHALL 仅保留在叙事页，并降低强度。

- **GIVEN** Home、Songs、Culture 页面
- **WHEN** 用户滚动
- **THEN** 背景视差系数 0.08-0.12，且 `prefers-reduced-motion: reduce` 时固定背景
- **GIVEN** Dictionary、Settings、Profile、Favorites、Record、Learn 页面
- **WHEN** 使用 `PageShell`
- **THEN** 关闭背景视差与粒子，背景保持静态

## Tasks

- [ ] Task 1: 建立统一动效节奏系统
  - [ ] SubTask 1.1: 在 `variables.css` 中定义 `--duration-fast: 150ms`、`--duration-base: 250ms`、`--duration-slow: 500ms` 与品牌缓动曲线 token
  - [ ] SubTask 1.2: 在 `main.css` 中清理现有散落动画时长，统一替换为三档 token
  - [ ] SubTask 1.3: 定义 `reveal`、`float`、`pulse` 等通用 keyframes 并统一引用
- [ ] Task 2: 实现首页 Hero 入场序列
  - [ ] SubTask 2.1: 在 `Home.vue` 中为品牌名、标题、正文、CTA 添加 stagger 入场类（淡入 + translateY 16px→0）
  - [ ] SubTask 2.2: 控制总时长 ≤ 700ms，stagger 间隔 80-120ms
  - [ ] SubTask 2.3: 与 prelude 动画错峰，避免两者同时强竞争注意力；若 prelude 启用，Hero 入场在 prelude 结束后触发
- [ ] Task 3: 统一滚动 reveal 行为
  - [ ] SubTask 3.1: 创建或复用单一 reveal 工具（指令/composable/utility），使用 IntersectionObserver
  - [ ] SubTask 3.2: 替换各页面中各自实现的 reveal 逻辑，统一触发条件与动画参数
  - [ ] SubTask 3.3: 设置 reveal 仅触发一次，threshold 0.15-0.25，时长 250-400ms
  - [ ] SubTask 3.4: 在 `prefers-reduced-motion: reduce` 下直接给目标元素加 `.is-visible`，跳过 observer
- [ ] Task 4: 优化按钮与核心操作反馈
  - [ ] SubTask 4.1: 为 `.primary-action`、`.outline-action`、`.text-link`、搜索按钮等定义 hover/active 样式
  - [ ] SubTask 4.2: hover 仅使用 brightness(1.05)、scale(1.02) 或阴影加深之一，过渡 ≤ 200ms
  - [ ] SubTask 4.3: active 使用 scale(0.98) 或亮度降低，过渡 ≤ 150ms
  - [ ] SubTask 4.4: 移除按钮 hover 时的大幅 translateY 与强烈发光
- [ ] Task 5: 背景粒子与光标光晕降噪
  - [ ] SubTask 5.1: 在 `FloatingParticles.vue` 中降低默认透明度 30-50%、旋转幅度从 360° 降至 180°、默认数量 ≤ 8
  - [ ] SubTask 5.2: 在 `PageShell.vue` 中增加工具页关闭粒子或降低密度（≤ 4）的逻辑
  - [ ] SubTask 5.3: 在 Dictionary、Settings、Profile、Favorites、Record、Learn 页面关闭或显著降低粒子
  - [ ] SubTask 5.4: 在 `pointerGlow.js` 中限制光晕仅作用于桌面端核心操作按钮，触屏与工具页隐藏
  - [ ] SubTask 5.5: 在 `prefers-reduced-motion: reduce` 下隐藏粒子与光标光晕
- [ ] Task 6: 优化视差与液玻镜面动效
  - [ ] SubTask 6.1: 在 `PageShell.vue` 中将叙事页视差系数从 0.15 降至 0.08-0.12，工具页关闭视差
  - [ ] SubTask 6.2: 在 `liquidGlass.js` 中降低 `scrollShift` 最大偏移量，归位系数从 0.88 调至 0.92
  - [ ] SubTask 6.3: 在 `liquid-glass.css` 中降低 hover 光斑移动幅度，禁止强光扫过效果
- [ ] Task 7: 可访问性与构建验证
  - [ ] SubTask 7.1: 复核搜索模态焦点、词典结果键盘选中、登录错误聚焦、Canvas 替代文本未被破坏
  - [ ] SubTask 7.2: 运行 `npm run build`，确保 0 errors、0 new warnings
  - [ ] SubTask 7.3: 运行 `npm run test`，确保无回归

## Task Dependencies

- Task 3 can run in parallel with Task 1
- Task 4 depends on Task 1
- Task 5 depends on Task 2 部分完成（确定页面性格）
- Task 6 depends on Task 5
- Task 7 depends on all above tasks

## Checklist

- [ ] `variables.css` 已定义 `--duration-fast`、`--duration-base`、`--duration-slow` 与品牌缓动 token
- [ ] `main.css` 中散落动画时长已统一替换为三档 token
- [ ] `Home.vue` Hero 品牌名、标题、正文、CTA 有 stagger 入场动画，总时长 ≤ 700ms
- [ ] Hero 入场与 prelude 动画错峰，不抢注意力
- [ ] 单一 reveal 工具/指令已创建或复用，统一各页面 reveal 行为
- [ ] reveal 仅触发一次，threshold 0.15-0.25，时长 250-400ms
- [ ] `prefers-reduced-motion: reduce` 下 reveal 直接显示，不播放动画
- [ ] 核心 CTA hover 使用 brightness/scale/shadow 之一，过渡 ≤ 200ms
- [ ] 核心 CTA active 使用 scale(0.98) 或亮度降低，过渡 ≤ 150ms
- [ ] 已移除按钮 hover 的大幅 translateY 与强烈发光
- [ ] `FloatingParticles.vue` 默认数量 ≤ 8、透明度降低 30-50%、旋转幅度 180°
- [ ] 工具页（Dictionary/Settings/Profile/Favorites/Record/Learn）粒子关闭或 ≤ 4
- [ ] 光标光晕仅桌面核心操作按钮生效，触屏与工具页隐藏
- [ ] `prefers-reduced-motion: reduce` 下粒子与光标光晕隐藏
- [ ] 叙事页（Home/Songs/Culture）视差系数 0.08-0.12
- [ ] 工具页使用 `PageShell` 时关闭视差
- [ ] `liquidGlass.js` 中 `scrollShift` 最大偏移量减半，归位系数调至 0.92
- [ ] `liquid-glass.css` hover 光斑移动幅度降低，无强光扫过
- [ ] 搜索模态焦点、词典结果键盘选中、登录错误聚焦、Canvas 替代文本未被破坏
- [ ] `npm run build` 0 errors、0 new warnings
- [ ] 测试无回归
