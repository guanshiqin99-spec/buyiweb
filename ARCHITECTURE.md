# 布依族词典 Web 前端架构文档

> 本文档供 AI 助手快速理解项目，减少重复探索的 token 消耗。最后更新：2026-07-10。

---

## 一、技术栈

- **框架**：Vue 3.4（Composition API + `<script setup>`）
- **构建**：Vite 5.4
- **状态**：Pinia 2.1（组合式 store 与选项式 store 混用）
- **路由**：Vue Router 4.2（History 模式）
- **HTTP**：Axios 1.6（拦截器 + 401 自动刷新 token）
- **样式**：原生 CSS 变量令牌系统，无 UI 框架
- **后端**：NestJS（独立项目，开发时 Vite 代理至 `http://127.0.0.1:3000`）

---

## 二、项目结构

```
src/
├── assets/
│   ├── images/          # 图片资源（注意：部分未压缩，见 Bug 清单）
│   └── styles/
│       ├── variables.css     # 设计令牌（颜色/字体/阴影/深色模式）
│       ├── liquid-glass.css  # 液态玻璃光学材质
│       └── main.css          # 基础排版 + skip-link
├── components/
│   ├── layout/          # AppHeader, AppFooter
│   ├── common/          # Card, CursorGlow, FloatingParticles, LiquidGlass, PageShell, SearchBar, SearchModal
│   └── specific/        # AgentPanel, AudioPlayer, BarChart, LearningCard, PatternDecoration, ToneChart, WordCard
├── views/               # 10 个页面（见路由表）
├── stores/              # 6 个 Pinia store（见状态管理）
├── router/index.js      # 路由 + 鉴权守卫 + 滚动行为
├── utils/
│   ├── api.js           # axios 实例 + API 封装（见 API 清单）
│   ├── cursorGlow.js    # 鼠标跟随光晕单例
│   └── liquidGlass.js   # 液态玻璃光学系统单例
├── App.vue              # 全局挂载：Header/Footer/AudioPlayer/AgentPanel/SearchModal/CursorGlow + "/" 热键
└── main.js              # createApp + 主题初始化（挂载前防闪烁）
```

---

## 三、路由与鉴权

| 路径 | 视图 | 鉴权 | 说明 |
|------|------|------|------|
| `/` | Home | 公开 | 首页，7 区块门户 |
| `/login` | Login | 公开 | 登录/注册切换 |
| `/dictionary` | Dictionary | 公开 | 综合搜索 + 双栏阅读 |
| `/culture` | Culture | 公开 | 静态文化展示 |
| `/songs` | Songs | 公开 | 民歌列表 + 播放 |
| `/learn` | Learn | **需登录** | 翻转卡学习 |
| `/profile` | Profile | **需登录** | 个人中心 |
| `/favorites` | Favorites | **需登录** | 收藏列表 |
| `/record` | Record | **需登录** | 学习记录 |
| `/settings` | Settings | **需登录** | 设置 |

- 鉴权守卫：`router.beforeEach` 检查 `meta.requiresAuth`，未登录跳 `/login?redirect=...`
- 滚动行为：新导航回顶，浏览器前进/后退保留位置
- 路由后置钩子：`nextTick(collectLiquidGlass)` 重新收集动态挂载的光学元素

---

## 四、状态管理（Pinia Stores）

### 1. auth.js（组合式）
- 状态：`token`、`refreshToken`、`userInfo`、`isLoading`
- 计算：`isLoggedIn`、`userName`
- 动作：`login`、`register`、`logout`、`fetchUserProfile`
- 持久化：手动同步 localStorage（token/refreshToken/userInfo）

### 2. player.js（组合式）
- 状态：`currentSong`、`isPlaying`、`currentTime`、`duration`、`isExpanded`、`isSeeking`
- 计算：`progress`、`formattedCurrentTime`、`formattedDuration`
- 动作：`playSong`、`togglePlay`、`stop`、`seekTo`、`beginSeek`、`endSeek`、`toggleExpand`、`expand`、`collapse`
- **注意**：进度推进用 `requestAnimationFrame` 模拟，**非真实音频播放**，时长硬编码 222 秒（3:42）

### 3. favorites.js（组合式）
- 状态：`favorites`、`isLoading`
- 计算：`favoriteCount`
- 动作：`fetchFavorites`、`toggleFavorite`、`clearFavorites`、`isFavorite`
- 后端为 toggle 模式，根据返回 `favorited` 布尔值同步本地列表

### 4. theme.js（选项式）
- 状态：`mode`（light/dark/auto）、`resolved`
- 动作：`init`、`onSystemChange`、`setMode`
- `applyTheme` 同步：`data-theme` 属性 + `color-scheme` + `<meta name="theme-color">`
- auto 模式监听 `matchMedia('(prefers-color-scheme: dark)')`

### 5. search.js（选项式）
- 状态：`isOpen`
- 动作：`open`、`close`
- 供 App.vue "/" 热键与 Home 触发器共享

### 6. agent.js（选项式）
- 状态：`isOpen`、`messages`、`contextPath`、`loading`、`_controller`
- 计算：`quickQuestions`（按路由返回场景化快捷提问）
- 动作：`open`、`close`、`setContext`、`ask`、`send`、`stop`、`reset`
- SSE 流式：`agentApi.askStream` + fetch reader，取最近 6 条历史

---

## 五、API 封装（utils/api.js）

- **baseURL**：`/api`（Vite 代理转发至后端）
- **请求拦截**：附带 `Authorization: Bearer <token>`
- **响应拦截**：解包 `response.data` + 401 自动刷新 token（队列重放）+ 错误状态码统一 console
- **401 刷新失败**：`clearAuthAndRedirect` 清理 localStorage 并跳 `/login`

| API 对象 | 方法 | 端点 |
|----------|------|------|
| `authApi` | login / register / logout | `POST /miniapp/auth/web-login` 等 |
| `homeApi` | get | `GET /miniapp/home` |
| `meApi` | get | `GET /miniapp/me` |
| `settingsApi` | get / update | `GET/PUT /miniapp/settings` |
| `searchApi` | search / searchMine / suggest / hot | `GET /miniapp/search*` |
| `contentApi` | list / getDetail / listMine | `GET /miniapp/{dictionary,phrases,proverbs,songs}` |
| `favoritesApi` | list / toggle / clear | `GET/POST/DELETE /miniapp/favorites` |
| `recordsApi` | list / stats / create / clear | `GET/POST/DELETE /miniapp/learning-records` |
| `badgesApi` | list | `GET /miniapp/badges` |
| `healthApi` | check | `GET /health` |
| `agentApi` | askStream | `POST /miniapp/agent/ask`（SSE 流式，fetch 读取）|

---

## 六、设计系统

### 6.1 令牌系统（variables.css）

**浅色 `:root`**：
- 背景：`--background: #F5F2EF`、`--c-bg-warm`、`--c-bg-silver`
- 文字：`--c-text: #1B3A5C`、`--c-text-85/70/60/50/35/10`（rgba 透明度梯度）
- 品牌：`--c-brand: #3A6B8C`、`--c-brand-light/dark`、`--c-brand-25/40/60/08/06`
- 强调：`--c-accent: #D4883A`
- 玻璃：`--c-glass: rgba(255,255,255,0.45)`、`--c-glass-nav`
- 阴影：`--shadow-xs/sm/md/lg/xl`、`--shadow-glow-brand/accent`
- 边框：`--border-fresnel`、`--inner-highlight`
- 字体：`--font-sans: 'DM Sans'`、`--font-serif: 'Noto Serif SC'`、`--font-mono: 'JetBrains Mono'`

**深色 `[data-theme="dark"]`**：
- 覆盖上述令牌，`color-scheme: dark`
- 背景变 `#0f1419`，文字变 `#E8E4E1`，品牌色提亮为 `#6BA3BE`
- 阴影改用 `rgba(0,0,0,...)`

### 6.2 液态玻璃材质（liquid-glass.css）

- `.liquid-glass`：核心材质类，`backdrop-filter: blur() saturate()` + 多层 inset box-shadow 菲涅尔高光
- CSS 变量驱动光标跟随：`--lg-mx`、`--lg-my`（镜面位置 %）、`--lg-edge-x`（边缘光偏移）、`--lg-spec`（高光强度）、`--lg-tint`（自适应着色）
- `.glow-card` / `.glow-hero`：内部 `.glow-effect` 元素跟随光标的径向光斑
- `.card-interactive`：交互卡片 hover 浮起 + 缩放（已用 `@media (hover: hover)` 限定，避免触屏粘性）
- hover 状态全部用 `@media (hover: hover)` 包裹
- 完整 `prefers-reduced-motion` 块禁用动画

### 6.3 光学系统（utils/liquidGlass.js）

- 单例，App.vue `onMounted` 调 `initLiquidGlass()`
- 收集 `.liquid-glass` 元素，绑定 `mousemove`（passive）更新 `--lg-mx/--lg-my`
- 自适应透明：基于元素在视口的位置调节 `--lg-tint`（顶部深、底部浅）
- 滚动视差：`scrollShift` 衰减循环，滚动停止后镜面缓缓归位
- rect 缓存：`_lgRect` 标记脏后懒重算，避免每次事件强制布局
- 触屏 / reduced-motion 不绑定
- 路由切换后 `collectLiquidGlass()` 重新收集动态挂载元素

### 6.4 字体加载

- `index.html` 中 `preconnect` fonts.googleapis.com / fonts.gstatic.com
- `<link rel="stylesheet">` 加载 DM Sans + Noto Serif SC（`display=swap`）
- 已从 main.css 移除阻塞渲染的 `@import`

---

## 七、视图功能速查

| 视图 | 核心功能 | 依赖 | 技术点 |
|------|----------|------|--------|
| Home | 7 区块门户 | search, auth, home/content/records/badges API | IntersectionObserver × 2、rAF 计数动画 |
| Dictionary | 综合搜索 + 双栏阅读 | favorites, auth, agent, search/records API | 400ms 防抖、URL query 同步、mapResults |
| Culture | 静态文化展示 | 无 | ToneChart canvas、PatternDecoration |
| Songs | 民歌列表 + 播放 | player, content API | 封面呼吸、波纹动画 |
| Learn | 翻转卡学习 | auth, favorites, content/records API | 3D 翻转、键盘无障碍、Promise.allSettled |
| Favorites | 收藏列表 | favorites store | 无特殊技术点 |
| Profile | 个人中心仪表盘 | auth, me/records/badges API | BarChart 可视化、徽章墙 |
| Record | 学习记录 | records API | Intl.DateTimeFormat |
| Settings | 分组设置 | auth, theme, settings API | toggle 开关、isSaving 防重复 |
| Login | 登录/注册 | auth store | 表单校验、aria-invalid、redirect 跳回 |

---

## 八、全局组件

| 组件 | 位置 | 职责 |
|------|------|------|
| AppHeader | layout | 固定顶部导航，滚动透明度变化，移动端抽屉 |
| AppFooter | layout | 页脚，功能链接 + 关于 |
| AudioPlayer | specific | 固定播放器，展开药丸条 / 收起小圆盘，支持鼠标 + 触屏 + 键盘 |
| AgentPanel | specific | AI 助手浮层，SSE 流式，焦点陷阱 + Escape 关闭 |
| SearchModal | common | 全局搜索弹窗，"/" 热键唤起，localStorage 历史 |
| CursorGlow | common | 鼠标跟随光晕，触屏/reduced-motion 不绑定 |
| PageShell | common | 页面外壳：视差背景 + overlay + 粒子 + 光学收集 |
| SearchBar | common | 搜索输入框 |
| FloatingParticles | common | 粒子背景，aria-hidden |
| ToneChart | specific | 声调曲线 canvas，watch 主题重绘 |
| BarChart | specific | 柱状图，role="img" + aria-label |
| PatternDecoration | specific | 民族纹样 SVG 装饰，全部 aria-hidden |

---

## 九、已知 Bug 与未完成项

### 9.1 未修复的 Bug

| ID | 位置 | 问题 | 影响 | 建议 |
|----|------|------|------|------|
| H1 | `src/assets/images/bg-vocabulary.jpg` | 1,437 KB 未压缩 | 词典页首屏延迟数秒 | 压缩至 200KB 以下 |
| H2 | `src/assets/images/bg-profile.png` | 916 KB PNG 未压缩 | 个人页首屏延迟 | 转 WebP |
| H3 | `src/assets/images/bg-phrases.jpg` | 616 KB 未压缩 | 短语页首屏延迟 | 压缩 |
| H4 | `src/assets/images/bouyei-nature.jpg` | 365 KB 偏大 | 文化页 | 压缩 |
| H5 | `src/assets/images/bouyei-textile.jpg` | 356 KB 偏大 | 文化页 | 压缩 |

### 9.2 架构性限制（非 Bug，需注意）

1. **播放器为模拟**：`player.js` 用 rAF 模拟进度推进，时长硬编码 222 秒，未接真实音频文件。接入真实音频需替换 `playSong` 逻辑与 `startProgress` 的 rAF 循环。
2. **后端未运行时**：所有 API 调用失败，页面显示加载/错误状态。UI 交互 Bug 不依赖后端。
3. **SSE 流式依赖后端**：`agentApi.askStream` 需后端 `/miniapp/agent/ask` 返回 `data: {"type":"delta","content":"..."}` 格式的 SSE 流。

### 9.3 已修复项（供参考，勿重复处理）

以下问题已在 2026-07-10 的 web-design-guidelines 审查中修复，无需再动：
- 翻转卡键盘不可达（Learn.vue、LearningCard.vue）→ 已加 role/tabindex/keydown
- 进度条触屏不可拖动（AudioPlayer.vue）→ 已加 touch 事件
- ToneChart 深色模式不重绘 → 已加 watch + nextTick
- ToneChart 重复 getComputedStyle → 已缓存为局部变量
- 深色模式硬编码颜色（AppHeader、Settings、Card、theme-color meta）→ 已加深色覆盖
- div+click 充当按钮（WordCard）→ 已加 role/tabindex/keydown
- `<a href="#">` 执行动作（Login、AppFooter）→ 已改 button
- 装饰 SVG 缺 aria-hidden → 已全部补
- skip-link 用 :focus → 已改 :focus-visible
- img 缺 width/height → 已补
- 字体 @import 阻塞 → 已移至 index.html preconnect + link
- 触屏粘性 hover → 已用 @media (hover: hover) 限定

---

## 十、开发约定

- **语言**：所有代码注释、文案、commit message 使用中文
- **样式**：使用 CSS 变量令牌，不硬编码颜色值；深色模式通过 `[data-theme="dark"]` 覆盖
- **组件**：`<script setup>` + Composition API 优先
- **无障碍**：交互元素需键盘可达（role/tabindex/keydown）；装饰性 SVG 加 `aria-hidden="true"`；图标按钮加 `aria-label`
- **动画**：遵循 `prefers-reduced-motion`；仅动画 `transform`/`opacity`；hover 用 `@media (hover: hover)` 限定
- **性能**：避免在 render 中读 layout；批量 DOM 读写；大列表（>50 项）需虚拟化
- **图片**：`<img>` 需显式 width/height；below-fold 用 `loading="lazy"`

---

## 十一、常用命令

```bash
npm install                # 安装依赖
npm run dev                # 开发服务器（默认 5173，占用则递增）
npm run build              # 生产构建 → dist/
npm run preview            # 预览构建产物
npm run lint               # ESLint 检查 + 自动修复
npm run format             # Prettier 格式化 src/
```
