# UI 设计评估与优化建议执行计划

## 1. 摘要

本计划基于 `D:\BuyiDictionaryWeb\buyi-dictionary-vue\UI设计评估与优化建议.md`，使用 `web-design-guidelines`、`algorithmic-art`、`frontend-skill` 三个技能，对项目现有 UI 进行最后一轮收束：

1. 完成液体玻璃材质语义化（Hero / Content / Quiet）在所有页面的落地。
2. 完成页面背景与动效降噪。
3. 统一导航与组件形态。
4. 修复 Web Interface Guidelines 剩余合规问题。
5. 按实际落地结果重写一版优化后的 `UI设计评估与优化建议.md`。

范围限定在 `buyi-dictionary-vue/src/**/*`，不引入新依赖，不推翻现有架构。

## 2. 当前状态分析

### 2.1 已完成的优化（来自上下文与文件确认）

- **液体玻璃材质层级已建立**：`src/assets/styles/liquid-glass.css` 已定义 `.liquid-glass-hero`、`.liquid-glass-content`、`.liquid-glass-quiet`，并降低了默认高光、阴影与 hover 浮起幅度。
- **首页关键区域已降噪**：`src/views/Home.vue` 中 Hero 粒子数降至 8，统计卡改为 `.liquid-glass-quiet`，学习面板改为 `.liquid-glass-content`，文化卡移除 `.glow-card`。
- **页面壳层已降噪**：`src/components/common/PageShell.vue` 默认粒子密度降至 6，视差系数 0.15，渐变透明度简化，内容 stagger 延迟收敛到 0.2–0.6s。
- **粒子与光标光晕已降噪**：`src/components/common/FloatingParticles.vue` 透明度与移动端数量降低；`src/components/common/CursorGlow.vue` 光晕透明度降低。
- **交互性能优化**：`src/utils/liquidGlass.js` 增加 `RECT_TTL` 缓存，降低 `LERP`，避免高频 layout read。
- **Web Interface Guidelines 部分问题已修复**：`SearchModal.vue` 焦点陷阱与 `scrollIntoView`、`Dictionary.vue` 结果项改为 `<button>`、`AudioPlayer.vue` 装饰性 SVG 加 `aria-hidden`、`AppFooter.vue` 无动作按钮改为 `<span>` 等。

### 2.2 仍存在的核心问题

1. **`.glow-border` 与 `.glow-card` 仍存在过度发光**：`liquid-glass.css` 中 `.glow-border::before` 默认 hover 亮度 `opacity: 0.5`，`.glow-card .glow-effect` 在多处被误用为普通卡片的装饰。
2. **页面卡片材质语义不一致**：
   - `Settings.vue` 四个 `settings-group` 全部使用 `liquid-glass glow-card`。
   - `Profile.vue` 统计卡、图表卡、菜单列表全部使用 `glow-card`。
   - `Record.vue`、`Favorites.vue`、`Learn.vue` 中部分统计/列表卡材质层级偏高。
   - `Dictionary.vue` 中筛选药丸使用普通 `liquid-glass`，详情面板仍挂 `glow-card`。
   - `Login.vue` 登录卡使用 `liquid-glass glow-card`。
3. **背景与动效仍有调参空间**：`Settings.vue`、`Profile.vue`、`Favorites.vue`、`Record.vue`、`Learn.vue` 等工具/管理页仍使用 `PageShell` 默认或较高粒子密度，部分页面叠加背景图 + 遮罩 + 粒子，与“工具页以清晰可读为先”的建议冲突。
4. **Web Interface Guidelines 剩余问题**：
   - `Login.vue` 提交按钮在表单无效时禁用，且未聚焦首个错误字段。
   - `ToneChart.vue` canvas 缺少 `role="img"` 与替代文本。
   - `SearchModal.vue` 未使用 `aria-activedescendant` 关联活动建议项。
   - `AudioPlayer.vue` 收起态 `player-disc` 与内部播放按钮存在嵌套交互风险。
   - 多处仍存在硬编码 `rgba(27, 58, 92, ...)` / `rgba(255,255,255, ...)` 色值，深色模式下可读性异常。
5. **文档未更新**：现有 `UI设计评估与优化建议.md` 仍是“建议”形态，未反映已落地改动与剩余待办。

## 3. 待修改文件清单

- `src/assets/styles/liquid-glass.css`
- `src/components/common/PageShell.vue`
- `src/components/common/FloatingParticles.vue`
- `src/components/common/CursorGlow.vue`
- `src/components/common/SearchModal.vue`
- `src/components/common/SearchBar.vue`
- `src/components/layout/AppHeader.vue`
- `src/components/specific/AudioPlayer.vue`
- `src/components/specific/ToneChart.vue`
- `src/utils/liquidGlass.js`
- `src/views/Home.vue`
- `src/views/Dictionary.vue`
- `src/views/Login.vue`
- `src/views/Settings.vue`
- `src/views/Profile.vue`
- `src/views/Favorites.vue`
- `src/views/Record.vue`
- `src/views/Learn.vue`
- `src/views/Songs.vue`
- `src/views/Culture.vue`
- `UI设计评估与优化建议.md`（生成新版）

## 4. 分阶段实施计划

### Phase 0：技能复核（已完成）

1. **调用 `web-design-guidelines`**
   - 已拉取最新 `command.md`（来源：`https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md`）。
   - 已针对 `Login.vue`、`ToneChart.vue`、`AudioPlayer.vue`、`SearchModal.vue`、`AppHeader.vue`、`liquid-glass.css` 等关键文件做合规扫描。
   - **复核结果（需在本计划中修复）**：
     - `AudioPlayer.vue`：收起态 `player-disc` 外层 div 设置了 `cursor: pointer` 与 `outline: none`，但本身不是可聚焦/可点击元素，内部已存在 `disc-expand` 与 `disc-play` 两个真实按钮；应移除外层 div 的交互暗示。
     - `SearchModal.vue`：已具备焦点陷阱与 `scrollIntoView`，但缺少 `aria-activedescendant` 关联当前活动 `role="option"` 项；建议项未分配唯一 `id`。
     - `AppHeader.vue`：抽屉链接未补 `:focus-visible` 样式；导航链接在滚动/未滚动状态下的 `:focus-visible` 颜色对比度需根据背景切换。
     - 多处组件（`AudioPlayer.vue`、`AppHeader.vue`、`liquid-glass.css` 等）仍使用硬编码 `rgba(27, 58, 92, ...)` 与 `rgba(255, 255, 255, ...)`，深色模式下可能对比度异常。
     - `Login.vue` 已修复：提交按钮仅在 `isLoading` 时禁用，校验失败聚焦首个错误字段，后端错误后聚焦 `.form-error`；但样式中仍有少量硬编码色值需清理。
     - `ToneChart.vue` 已修复：`<canvas>` 已加 `role="img"`、`:aria-label="chartDescription"`，并渲染 `<span class="sr-only">` 文本替代。

2. **调用 `algorithmic-art`**
   - 该 Skill 面向“新建生成艺术（p5.js 哲学 + HTML 工件）”，不支持对现有 `FloatingParticles.vue`、`CursorGlow.vue`、`PageShell.vue`、`liquidGlass.js` 进行参数调参。
   - **决策**：按原有人工调参方案执行，不创建新的算法艺术工件。

3. **调用 `frontend-skill`**
   - 该 Skill 面向“创建视觉上强烈的落地页/网站/app”，要求从零开始构建 Hero→Support→Detail→CTA 结构，不支持对现有项目进行增量 UI 优化。
   - **决策**：fallback 为人工按本文档执行材质层级、动效降噪、页面性格差异化等优化。

### Phase 1：完成背景与动效降噪（Phase C 收尾）

#### 1.1 `src/assets/styles/liquid-glass.css`

- **`.glow-border` 降级**：
  - 默认光斑尺寸缩小、透明度降低：`opacity: 0` → hover 时 `opacity: 0.28`（而非 0.5）。
  - 仅在明确需要强调的组件（如登录卡、搜索弹窗）通过局部类覆盖，其他地方不启用。
- **`.glow-card .glow-effect` 降级**：
  - 光斑尺寸从 `140px` 缩至 `120px`，中心透明度从 `0.16` 降至 `0.10`，hover 透明度从 `0.85` 降至 `0.55`。
- **`.glow-hero .glow-effect` 降级**：
  - 尺寸保持 `220px`，中心透明度降至 `0.08`，hover 透明度降至 `0.45`。

#### 1.2 `src/components/common/PageShell.vue`

- 工具/管理页（Settings、Profile、Favorites、Record、Learn）传入 `:particle-density="4"` 或关闭粒子；叙事页（Home、Culture、Songs）保持 6。
- 检查 `.page-shell__content` 的 stagger 动画是否对 `<slot>` 内深层子元素产生不稳定的入场延迟；必要时改为仅对直接子元素生效。

#### 1.3 `src/components/common/FloatingParticles.vue`

- 保持当前低透明度，但进一步限制默认 `count` 上限：超过 8 时强制截断为 8。
- 动画 `floatUp` 的旋转幅度从 `360deg` 降至 `180deg`，减少“漂浮玩具感”。

#### 1.4 `src/components/common/CursorGlow.vue`

- 外层靛蓝光晕透明度从 `0.12` 降至 `0.08`。
- 内层铜色从 `0.06` 降至 `0.04`。
- 增加 `@media (pointer: coarse)` 隐藏，避免触屏设备无意义渲染。

#### 1.5 `src/utils/liquidGlass.js`

- 保持 `RECT_TTL` 与 `LERP=0.18`。
- 滚动停止后的 `scrollShift` 衰减系数从 `0.88` 调至 `0.92`，让镜面归位更慢、更稳。

### Phase 2：导航与组件形态统一（Phase D）

#### 2.1 `src/components/layout/AppHeader.vue`

- 统一交互反馈：
  - `.nav-link`、`.nav-auth-btn`、`.nav-burger` 的 `:focus-visible` 在未滚动状态下使用 `outline-color: rgba(255,255,255,0.85)`，滚动状态下使用 `var(--c-brand)`，确保对比度。
  - `.nav-link` hover/active 背景统一使用 `var(--c-brand-08)`，active 文字权重统一 `600`。
- 抽屉关闭后焦点已回到汉堡按钮，无需改动；仅验证 `:inert` 与 `:aria-hidden` 在关闭时生效。

#### 2.2 `src/components/common/SearchModal.vue`

- 材质：`.search-modal` 改为 `liquid-glass liquid-glass-hero`（重点层），移除 `glow-card`（或保留但降低 glow 强度）。
- 焦点：在现有焦点陷阱基础上，补充 `aria-activedescendant`：
  - 为当前活动 `.suggestion-item` 生成唯一 `id`。
  - 在 input 上动态设置 `:aria-activedescendant="activeDescendantId"`。
- 热键提示：底部 footer 改为更克制的 `var(--c-text-50)` 颜色。

#### 2.3 `src/components/common/SearchBar.vue`

- 保持 `liquid-glass` 但改为 `.liquid-glass-content`（强调可读）。
- 聚焦环：input 的 `focus-visible: outline: none` 改为 `outline: 2px solid var(--c-brand); outline-offset: 2px`（在父容器上），确保键盘用户可见焦点。
- 搜索按钮 hover 效果统一为 `filter: brightness(1.1)`，不使用 translateY。

#### 2.4 `src/components/specific/AudioPlayer.vue`

- 收起态 `player-disc` 不再作为可点击容器：移除整体 `@click`，仅保留内部 `disc-expand` 按钮用于展开、`disc-play` 按钮用于播放，消除嵌套交互冲突。
- 展开态 `audio-player` 保持 `liquid-glass liquid-glass-pill`，hover 覆盖样式保持 `translateX(-50%)` 不变。
- 装饰性 SVG 已全部加 `aria-hidden`，验证无遗漏。

### Phase 3：各页面卡片材质精修（Phase E）

按“重点层 Hero / 内容层 Content / 安静层 Quiet / 扁平列表 Flat”四级重新映射：

| 页面 | 元素 | 当前材质 | 目标材质 | 备注 |
|---|---|---|---|---|
| `Home.vue` | 搜索触发按钮 `.search-trigger` | 自定义玻璃 | 保持自定义，但降低透明度 | 已是 Hero 区核心 |
| `Home.vue` | 文化卡 `.culture-card` | `liquid-glass-content` | 保持 `content` | 已移除 glow |
| `Home.vue` | 学习面板 `.learn-panel` | `liquid-glass-content` | 保持 `content` | |
| `Home.vue` | 统计卡 `.stat-item` | `liquid-glass-quiet` | 保持 `quiet` | |
| `Dictionary.vue` | 筛选药丸 `.filter-pills` | `liquid-glass` | `.liquid-glass-quiet` | 工具化 |
| `Dictionary.vue` | 结果列表 `.result-item` | 透明扁平 | 保持扁平 | 已改为 button |
| `Dictionary.vue` | 详情面板 `.detail-panel` | `liquid-glass glow-card` | `liquid-glass-hero`（移除 glow-card） | 阅读焦点 |
| `Login.vue` | 登录卡 `.login-card` | `liquid-glass glow-card` | `liquid-glass-hero`（移除 glow-card） | 单屏唯一重点 |
| `Settings.vue` | 设置分组 `.settings-group` | `liquid-glass glow-card` | `liquid-glass-quiet` | 工具列表 |
| `Profile.vue` | 头像区 `.avatar-section` | `liquid-glass glow-card` | `liquid-glass-content`（移除 glow） | |
| `Profile.vue` | 统计卡 `.stat-card` | `liquid-glass glow-card` | `liquid-glass-quiet` | |
| `Profile.vue` | 图表卡 `.chart-card` | `liquid-glass glow-card` | `liquid-glass-content` | |
| `Profile.vue` | 菜单列表 `.menu-list` | `liquid-glass glow-card` | `liquid-glass-quiet` | |
| `Favorites.vue` | 摘要 `.fav-summary` | `liquid-glass glow-card` | `liquid-glass-content`（移除 glow） | |
| `Favorites.vue` | 空状态 `.fav-empty` | `liquid-glass` | `liquid-glass-quiet` | 空态更轻 |
| `Favorites.vue` | 列表项 `.fav-item` | `liquid-glass` | `liquid-glass-quiet` | |
| `Record.vue` | 统计卡 `.stat-card` | `liquid-glass glow-card` | `liquid-glass-quiet` | |
| `Record.vue` | 类型分布 `.type-breakdown` | `liquid-glass` | `liquid-glass-quiet` | |
| `Record.vue` | 空状态 `.record-empty` | `liquid-glass` | `liquid-glass-quiet` | |
| `Record.vue` | 记录项 `.record-item` | `liquid-glass` | `liquid-glass-quiet` | |
| `Learn.vue` | 统计条 `.learn-stats` | `liquid-glass glow-card` | `liquid-glass-content`（移除 glow） | |
| `Learn.vue` | 进度条 `.progress` | `liquid-glass glow-card` | `liquid-glass-quiet` | |
| `Learn.vue` | 卡片正面 `.card-front` | `liquid-glass` | `liquid-glass-hero` | 学习核心 |
| `Songs.vue` | 文化面板 `.culture-panel` | `liquid-glass` | `liquid-glass-content` | |
| `Culture.vue` | 纹样卡 `.pattern-card` | `liquid-glass` | `liquid-glass-quiet` | |

每个修改后需同步调整局部 CSS：移除多余的 `box-shadow` 覆盖、确保 `.liquid-glass-quiet` 无 hover 浮起、`.liquid-glass-hero` hover 仍保持克制。

### Phase 4：Web Interface Guidelines 剩余合规修复

1. **`src/views/Login.vue`**
   - 提交按钮 `:disabled="isLoading"` 仅加载时禁用；点击后先校验，校验失败时聚焦首个 `aria-invalid="true"` 的输入。
   - 后端返回错误后聚焦 `.form-error`（已部分实现，补充 `scrollIntoView` 或 `focus()`）。
   - 将硬编码 `rgba(27, 58, 92, ...)` / `rgba(255,255,255,...)` 替换为 `variables.css` token。

2. **`src/components/specific/ToneChart.vue`**
   - 为 `<canvas>` 添加 `role="img"`、`:aria-label="'布依语声调曲线图：' + toneDescriptions"`。
   - 在 canvas 旁渲染 `<span class="sr-only">` 提供数据表格文本替代。

3. **深色模式硬编码色值清理**
   - 扫描 `src/**/*.{vue,css}` 中所有 `rgba(27, 58, 92` 与裸 `rgba(255,255,255`。
   - 替换为 `variables.css` 中语义 token，必要时补充缺失的 `--c-*` 变量。

4. **减少动效兜底**
   - 所有使用 `IntersectionObserver` 的页面（`Home.vue`、`Dictionary.vue`、`Songs.vue`、`Culture.vue` 等）在 `prefers-reduced-motion: reduce` 下直接给 `.reveal-on-scroll` 加 `.is-visible`，不再创建 observer。
   - `Record.vue`、`Profile.vue`、`Favorites.vue` 若后续增加 reveal，也需同样兜底。

5. **焦点可见性**
   - 所有 `<button>`、`<a>`、`<input>`、`<select>`、自定义 slider 等交互元素补全 `:focus-visible` 样式，避免仅依赖浏览器默认。

### Phase 5：重写优化后文档

- 生成 `D:\BuyiDictionaryWeb\buyi-dictionary-vue\UI设计评估与优化建议-已落地.md`。
- 文档结构：
  1. 项目概述与优化目标。
  2. 已落地的设计决策（材质层级、动效降噪、页面性格、可访问性）。
  3. 各文件改动索引（按文件列出材质映射与关键代码行）。
  4. Web Interface Guidelines 合规状态。
  5. 仍建议后续迭代的事项（如更深入的暗色主题图片适配、服务端渲染、图片压缩等）。
  6. 验证清单。
- 保留原 `UI设计评估与优化建议.md` 不动，作为历史基线。

## 5. 假设与决策

- **范围限定**：仅修改前端 UI/样式/交互，不改动后端 API、不新增 npm 依赖。
- **技能调用方式**：`web-design-guidelines` 与 `algorithmic-art` 按技能规范调用；`frontend-skill` 若不支持现有项目优化，则 fallback 为人工按本计划执行。
- **文档策略**：保留原始建议文档，输出一版新的“已落地”文档。
- **浏览器支持**：假定目标浏览器支持 `inert`、`backdrop-filter`、`@media (hover: hover)`、`prefers-reduced-motion`。
- **深色模式**：优先复用现有 `variables.css` token，缺失时补充，不重构设计系统。

## 6. 验证步骤

每阶段完成后运行：

1. `npm run build`：必须 0 errors、0 new warnings。
2. `npm run dev` 手动验证：
   - 首页 `/`：Hero 粒子不密集、标题无呼吸动画、统计卡 quietly、文化卡无 glow。
   - 词典页 `/dictionary`：筛选药丸不抢眼、详情面板为重点层、结果项可用 Tab 和 Space 选中。
   - 登录页 `/login`：空表单提交按钮可用并聚焦首个错误；深色模式对比度正常。
   - 设置页 `/settings`：设置分组为安静层，退出登录有确认。
   - 个人中心 `/profile`：统计卡/菜单列表不发光，头像区为重点层。
   - 学习页 `/learn`：翻转卡为重点层，按钮有焦点环。
   - 民歌页 `/songs`：Hero 无玻璃overlay干扰，列表清晰。
   - 文化页 `/culture`：纹样卡安静，减少动效下内容可见。
3. 键盘走查：Tab 顺序合理，焦点可见，Esc 可关闭搜索模态/播放器展开态。
4. 系统“减少动效”开启后：所有 reveal、粒子、光标光晕、呼吸动画应停止或隐藏。
5. 深色模式切换：无硬编码蓝色残留，文字对比度 ≥ 4.5:1。
6. Lighthouse Accessibility 目标 ≥ 90。
