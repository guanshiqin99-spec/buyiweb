# Web 与小程序前端验收审计 Spec

## Why

决赛交付在即，需以产品经理与测试工程师双视角对 Web 端（`buyi-dictionary-vue`）与微信小程序端（`BuyiDictionaryApp-main`）进行一次完整验收审计，识别真实可复现的 bug 与功能缺口，先输出审计报告，再按优先级执行修复，确保线上链路稳定与体验一致。

## What Changes

- 对 Web 端 13 个视图、6 个 store、网络层（axios + SSE + SW）进行审计并修复 P0/P1/P2 级 bug
- 对小程序 15 个页面、5 个组件、2 个云函数、8 个工具模块进行审计并修复 P0/P1/P2 级 bug
- 仅做最小改动修复真实 bug，不重构、不新增功能、不动现有正常逻辑
- 不修改依赖环境配置的问题（HTTP IP、trycloudflare 临时域名、后端 CORS）——在报告中标注但不执行

## Impact

- 受影响代码：
  - Web：`buyi-dictionary-vue/src/utils/authInterceptor.js`、`src/views/Settings.vue`、`src/stores/favorites.js`、`src/stores/auth.js`、`public/learning-reminder-sw.js`
  - Mini：`cloudfunctions/apiProxy/index.js`、`pages/player-detail/index.js`、`pages/login/login.js`、`app.js`、`pages/query/index.js`、`pages/vocabulary/index.js`、`pages/home/index.js`、`pages/home/index.wxml`、`utils/api.js`
- 不影响后端、数据库、部署脚本
- 不修改现有正常功能的行为

---

# 审计报告

## 一、Web 前端审计（`buyi-dictionary-vue`）

### P0 致命

#### W-P0-1 401 鉴权失败重定向在 hash 路由下完全失效
- 位置：`buyi-dictionary-vue/src/utils/authInterceptor.js:10-18`
- 现象：项目使用 `createWebHashHistory`（`src/router/index.js:9`），URL 形如 `http://host/#/login`。但 `clearAuthAndRedirect()` 写的是 `window.location.pathname !== '/login'`（hash 路由下 pathname 永远是 `/`，判断恒为 true）与 `window.location.href = '/login'`（整页跳转到真实路径 `/login`，绕过 Vue Router）。
- 后果：refreshToken 失效时，触发 `clearAuthAndRedirect()` 后整页跳转 `/login`，静态部署无 SPA fallback 时直接 404；有 fallback 时落到根路径，路由进入 `home` 而非 `login`。用户看到首页而非登录页，且本地 token 已清空，所有需鉴权接口继续 401。
- 复现：清空 `localStorage.refreshToken`，保留过期 `token`，刷新页面触发任意需 token 接口 → 401 → 跳转到首页而非登录页。

### P1 高

#### W-P1-1 设置页"学习提醒"开关完全无效
- 位置：`buyi-dictionary-vue/src/views/Settings.vue:138-142`（开关绑定 `settings.notifications`）
- 现象：`Settings.vue` 仅对 `settings.theme` 做了即时 `watch`，没有任何代码 `import` 或调用 `configureLearningReminder`（全局检索确认无调用点）。`main.js:30` 只调用 `initLearningReminder()`，它仅在 `ENABLED_KEY` 已为 `'true'` 时调度，开关切换不会写入该 key。
- 后果：用户打开"学习提醒"→ 保存 → 不申请通知权限、不写 ENABLED_KEY、不调度定时器，功能 100% 不生效。

#### W-P1-2 收藏状态跨页面/跨账号不同步
- 位置：`buyi-dictionary-vue/src/stores/favorites.js`、消费方 `src/views/Songs.vue:222-226`、`src/views/Learn.vue:139`
- 现象：
  - `fetchFavorites` 仅 `Favorites.vue:17` 在 `onMounted` 调用，`Songs.vue`/`Learn.vue`/`Dictionary.vue` 均未在挂载时拉取收藏列表。
  - `favorites.js` 未注册 `AUTH_SESSION_CLEARED_EVENT` 监听；`auth.js` 的 `logout()` 也未清空 favorites store。
- 后果：
  1. **hydrate 缺失**：登录后直接进 `/songs`，store 为空 → 所有歌曲心形显示"未收藏"，即使该用户确实收藏过。
  2. **跨账号残留**：用户 A 登出后 favorites store 仍保留 A 的收藏；用户 B 登录后直接进 `/songs`，心形显示 A 的收藏状态。
- 复现：账号 A 收藏若干歌曲 → 登出 → 账号 B 登录 → 直奔 `/songs` → 部分歌曲心形呈已收藏。

#### W-P1-3 SSE 流式请求未接入 401 token 刷新
- 位置：`buyi-dictionary-vue/src/utils/agentStream.js:7,13,70,76`
- 现象：`askStream`/`generateStream` 用原生 `fetch` 直接取 `localStorage.token`，与 `authInterceptor` 的 401 自动刷新/队列重放体系完全解耦。
- 后果：token 过期时使用智能体问答 / AI 造句 / 五题挑战，直接 `throw new Error('智能体请求失败 (401)…')`，而 axios 请求却能自动恢复。两套链路行为不一致。
- 处置：本次**不修复**（改动较大、需重设计 SSE 鉴权包装，且 token 有效期通常覆盖会话），在报告中标注为已知问题，赛后再处理。

### P2 中

#### W-P2-1 学习提醒通知点击在 hash 路由下落到首页
- 位置：`buyi-dictionary-vue/public/learning-reminder-sw.js:22,27,30`
- 现象：`notificationclick` 中 `targetUrl` 默认 `/learn`，但应用是 hash 路由，真实学习页地址是 `/#/learn`。
- 后果：点通知 → 打开根路径 `/learn`（无 hash）→ 路由解析为 home。被 W-P1-1 掩盖，修复 W-P1-1 后暴露。

#### W-P2-2 收藏切换本地状态依赖后端字段兼容
- 位置：`buyi-dictionary-vue/src/stores/favorites.js:68`
- 现象：`favorited = result?.isFavorited ?? result?.favorited ?? result?.data?.isFavorited ?? result?.data?.favorited`。若后端 toggle 返回体无上述字段，`favorited` 为 `undefined` → 强制移除该项，即使后端实际状态是"已收藏"。
- 后果：本地心形/列表与后端真实状态相反。

#### W-P2-3 远程音频 CORS 缺失时频谱静默失效
- 位置：`buyi-dictionary-vue/src/components/specific/AudioPlayer.vue:36`、`src/stores/player.js:245-270`
- 现象：`<audio crossorigin="anonymous">` + `createMediaElementSource`，远端音频无 CORS 时媒体被污染，analyser 全零，无错误提示。
- 处置：依赖后端 CORS 配置，本次**不修复**，报告中标注。

### P3 低（本次不修复，仅记录）

- W-P3-1：`authInterceptor.js:8` 残留 TODO 注释
- W-P3-2：25 处 `console.error` 散落未走 `logger.js`
- W-P3-3：401 刷新成功仍被 `api.js` 拦截器记为错误（拦截器注册顺序副作用）
- W-P3-4：`Culture.vue`/`Quiz.vue`/`Settings.vue` 硬编码外链来源 URL（非密钥）

### 已核查无问题项

- 路由死链/遗漏：13 条路由覆盖全部视图，含 catch-all 兜底至 `NotFound.vue`
- `requiresAuth` 守卫正确，`Login.vue` 消费 `redirect` query 并做开放重定向防护
- `AudioPlayer` 在 `App.vue` 持久挂载，导航不触发 `onUnmounted`，无播放状态丢失
- SSE `AbortController` 取消语义正确，无 reader 泄漏
- 表单校验/空状态/loading/错误态在 Login/Favorites/Settings 齐全
- 深色模式 `[data-theme="dark"]` + CSS 变量切换，`main.js` init 防闪烁
- skip-link、aria-label/aria-live、`:focus-visible` 轮廓普遍存在
- 移动端响应式断点适配完整，触控目标 ≥36px

---

## 二、小程序前端审计（`BuyiDictionaryApp-main`）

### P0 致命

#### M-P0-1 apiProxy 云函数 GET 请求完全丢失查询参数
- 位置：`cloudfunctions/apiProxy/index.js:34-40`
- 现象：`request()` 对 GET 请求不拼接 query string，`buildTargetUrl(path)` 只拼接 `BACKEND_BASE + path`：
```js
const isGet = String(method).toUpperCase() === 'GET';
if (data && !isGet) { body = JSON.stringify(data); }  // GET 时 data 被忽略
```
- 影响：`runtime-config.js:14` 中 `enabledEnvVersions: ['develop','trial','release']`，所有环境均走云函数代理。所有带参数的 GET 请求参数全部丢失：
  - `contentApi.search(keyword, page, pageSize)` → 搜索无关键词，永远返回首页结果
  - `contentApi.suggest(keyword)` → 联想无关键词
  - `contentApi.listByType(type, page, pageSize, keyword)` → 分页参数丢失，永远第 1 页
  - `favoritesApi.list()` / `recordsApi.list(page)` / `quizApi.list()` 等
- 复现：任意环境执行搜索或翻页，后端收到的 URL 无 query string。

### P1 高

#### M-P1-1 player-detail 从分享链接打开时播放错误歌曲
- 位置：`pages/player-detail/index.js:16-37, 73-75`
- 现象：`onLoad` 从 URL 参数（title/image/audio）构建 `song` 对象用于展示，但 `onTogglePlay` 调用 `getApp().togglePlay()`，操作的是 `globalData.playerState.currentSong`，而非 URL 传入的歌曲。页面从未调用 `getApp().playSong(song, ...)` 注入。
- 后果：从分享卡片打开 player-detail → 点播放 → 播放上一次的歌曲或无反应。

#### M-P1-2 apiProxy 后端地址使用 HTTP + 裸 IP（环境配置问题）
- 位置：`cloudfunctions/apiProxy/index.js:12`
- 现象：`BACKEND_BASE = process.env.BACKEND_BASE || 'http://39.96.81.132:80/api'`，Bearer Token 明文传输。
- 处置：依赖生产后端 HTTPS 地址，本次**不修复**，报告中标注，待后端地址确定后联动更新。

#### M-P1-3 生产与开发共用临时 Cloudflare Tunnel URL（环境配置问题）
- 位置：`utils/runtime-config.js:20-21`
- 现象：`development` 与 `production` 均为 `https://casting-object-link-hide.trycloudflare.com/api`，临时隧道会过期失效。
- 处置：依赖生产后端地址，本次**不修复**，报告中标注。

#### M-P1-4 多个 InnerAudioContext 并发冲突
- 位置：`pages/query/index.js:33`、`pages/vocabulary/index.js:88`、`app.js:412`
- 现象：`app.js` 全局 `_player`、`query` 独立 `audioContext`、`vocabulary` 独立 `_audioCtx`，三者互不感知，无互斥。
- 后果：query 页播放词条音频后导航到 song 页播放民歌，两条音频同时播放。
- 处置：互斥逻辑改动较大，本次**不修复**（与 M-P2-3 onHide 暂停一起处理可缓解），报告中标注。

#### M-P1-5 登录成功后 userInfo 被 finalUserInfo 覆盖，丢失 id 等字段
- 位置：`pages/login/login.js:110-124`
- 现象：`app.updateLoginState(payload.user, ...)` 已写入 `safeUser`（含 `id, nickName, nickname, avatarUrl, phoneNumber`），紧接着代码又用 `finalUserInfo`（仅含 `nickname, avatarUrl, openid`）覆盖 `globalData.userInfo` 与 `loginState.userInfo`。
- 后果：`mine/index.js:106` 等处依赖 `userInfo.id`，覆盖后 id 丢失。

### P2 中

#### M-P2-1 全局播放器缺少 onError 处理
- 位置：`app.js:417-455`
- 现象：`_initPlayer()` 注册了 onPlay/onPause/onStop/onEnded/onTimeUpdate/onCanplay，但没有 `onError`。
- 后果：音频 URL 无效或网络异常时，状态卡在"播放中"，UI 显示暂停按钮但无声音，无反馈。

#### M-P2-2 obeyMuteSwitch = true 导致静音模式下民歌无法播放
- 位置：`app.js:413`、`pages/vocabulary/index.js:89`
- 现象：`player.obeyMuteSwitch = true`。
- 后果：用户手机静音/振动模式时民歌不发声。作为音乐类应用应设为 `false`。

#### M-P2-3 页面导航离开时音频未暂停（onHide 未处理）
- 位置：`pages/query/index.js`（无 onHide）、`pages/vocabulary/index.js`（无 onHide）
- 后果：`navigateTo` 跳转新页面时原页面只触发 `onHide` 不触发 `onUnload`，`audioContext` 不被销毁，音频继续后台播放。

#### M-P2-4 suggestTimer 未在页面卸载/隐藏时清除
- 位置：`pages/home/index.js:16,99`、`pages/query/index.js:26,96`
- 后果：用户输入后快速返回，定时器仍触发 `this.setData`，在已销毁页面上调用 setData 产生告警。

#### M-P2-5 401 并发可能多次跳转登录页
- 位置：`utils/api.js:60-67, 164-166`
- 现象：`redirectToLogin()` 仅检查当前页面是否为 login，多个请求同时 401 时 `wx.navigateTo` 异步，可能多次 push login 页。

#### M-P2-6 搜索建议下拉可能无法选中（bindblur 先于 catchtap）
- 位置：`pages/home/index.wxml:27,35`、`pages/query/index.wxml`
- 现象：输入框 `bindblur="onHideSuggestions"` 立即隐藏下拉，blur 先于 tap 触发，建议项 tap 时下拉已隐藏。
- 后果：部分机型上点击建议项无反应。

#### M-P2-7 首页建议类型标签对 songs 类型错误显示为"谚"
- 位置：`pages/home/index.wxml:37`
```xml
[{{item.type === 'dictionary' ? '词' : item.type === 'phrase' ? '句' : '谚'}}]
```
- 后果：`item.type === 'song'` 时显示"谚"，应为"歌"。

#### M-P2-8 所有列表页 onShow 每次全量拉取数据，无缓存
- 位置：`pages/song/index.js:19-28`、`pages/phrases/index.js:18-21`、`pages/proverbs/index.js:18-21`、`pages/vocabulary/index.js:20-22`
- 处置：属优化项非 bug，本次**不修复**，报告中标注。

#### M-P2-9 media URL 直连后端域名，可能不在 request 合法域名白名单
- 位置：`utils/content-mapper.js:41-53`
- 处置：依赖生产域名白名单配置，本次**不修复**，报告中标注。

#### M-P2-10 player-detail 无歌词滚动实现
- 位置：`pages/player-detail/index.wxml:21-24`
- 处置：属功能新增非 bug 修复，本次**不修复**，报告中标注。

### P3 低（本次不修复，仅记录）

- M-P3-1：`pages/application/index` 是死页面，无任何入口导航到它
- M-P3-2：`utils/favSongs.js` 完全未使用（死代码）
- M-P3-3：`cloudfunctions/login` 是死代码
- M-P3-4：`console.log` 残留（含敏感信息，`app.js:108,121,132`、`pages/login/login.js:88`）
- M-P3-5：`login.js` 中 `const app` 重复声明（:53, :109）
- M-P3-6：`custom-nav` 的 `transparent` 属性未声明但被传入
- M-P3-7：`agent-panel` 对话历史不跨页共享
- M-P3-8：apiProxy 错误消息误导
- M-P3-9：apiProxy requestStream 流式结束未收到 done 事件仍当作成功
- M-P3-10：`app.js:608` `globalData.apiBases.production` 为占位符

### 已核查无问题项

- `app.json` pages 列表 15 项与实际文件一致；tabBar `custom: true` 配合 `custom-tab-bar` 实现正确
- `navigationStyle: custom` 全局生效，所有页面使用 `custom-nav` 适配状态栏
- quiz AI 失败降级十题库逻辑合理
- eventBus 所有订阅在 `onLoad`/`attached` 注册、`onUnload`/`detached` 解绑，无明显内存泄漏
- 5 个组件中 `agent-panel`/`custom-nav`/`swipe-item`/`word-card` 复用合理

---

## 三、修复范围汇总

本次执行修复 13 项（P0×2、P1×4、P2×7），不修复 9 项（环境配置 4 项、功能新增 1 项、优化项 1 项、P3 代码质量 14 项合并归档）。

### 将修复

| ID | 端 | 优先级 | 标题 |
|----|----|--------|------|
| W-P0-1 | Web | P0 | hash 路由下 401 重定向失效 |
| W-P1-1 | Web | P1 | 学习提醒开关无效 |
| W-P1-2 | Web | P1 | 收藏状态跨页面/跨账号不同步 |
| W-P2-1 | Web | P2 | SW 通知点击 hash 路由落点 |
| W-P2-2 | Web | P2 | 收藏 toggle 字段缺失回退 |
| M-P0-1 | Mini | P0 | apiProxy GET 请求丢参数 |
| M-P1-1 | Mini | P1 | player-detail 分享链接播放错误歌曲 |
| M-P1-5 | Mini | P1 | 登录后 userInfo 被覆盖 |
| M-P2-1 | Mini | P2 | 播放器缺少 onError |
| M-P2-2 | Mini | P2 | obeyMuteSwitch=true 静音无法播放 |
| M-P2-3 | Mini | P2 | onHide 未暂停音频 |
| M-P2-4 | Mini | P2 | suggestTimer 未清除 |
| M-P2-5 | Mini | P2 | 401 并发多次跳转登录页 |
| M-P2-6 | Mini | P2 | 搜索建议 blur 竞态 |
| M-P2-7 | Mini | P2 | 首页 songs 类型标签错误 |

### 不修复（已知问题，赛后处理）

| ID | 端 | 原因 |
|----|----|------|
| W-P1-3 | Web | SSE 鉴权包装需重设计，改动较大 |
| W-P2-3 | Web | 依赖后端 CORS 配置 |
| M-P1-2 | Mini | 依赖生产后端 HTTPS 地址 |
| M-P1-3 | Mini | 依赖生产后端 HTTPS 地址 |
| M-P1-4 | Mini | 互斥逻辑改动较大，M-P2-3 可缓解 |
| M-P2-8 | Mini | 优化项非 bug |
| M-P2-9 | Mini | 依赖生产域名白名单 |
| M-P2-10 | Mini | 功能新增非 bug 修复 |
| P3 全部 | 双端 | 代码质量与死代码清理，赛后迭代 |

## ADDED Requirements

### Requirement: Web 401 鉴权重定向在 hash 路由下正确落点
The system SHALL 在 token 失效且 refresh 失败时，使用 Vue Router 实例 `push` 到 `login` 路由（携带 `redirect` query），而非整页跳转到 `/login` 真实路径。
#### Scenario: token 过期且 refresh 失败
- **WHEN** 任意 axios 请求收到 401 且 `tryRefresh()` 失败
- **THEN** 路由跳转到 `/#/login?redirect=<原路径>`，不触发整页刷新，不落到首页

### Requirement: Web 学习提醒开关真实生效
The system SHALL 在用户切换"学习提醒"开关并保存时，调用 `configureLearningReminder(enabled, { requestPermission: true })`，写入 `ENABLED_KEY`，开启时申请通知权限、调度定时器，关闭时取消调度。
#### Scenario: 开启学习提醒
- **WHEN** 用户在设置页打开"学习提醒"并保存
- **THEN** 浏览器请求 Notification 权限，`localStorage.learning-reminder-enabled` 写入 `'true'`，当晚 20:00 触发通知
#### Scenario: 关闭学习提醒
- **WHEN** 用户关闭开关并保存
- **THEN** 取消已调度定时器，`ENABLED_KEY` 写入 `'false'`

### Requirement: Web 收藏状态在登录后 hydrate 且登出后清空
The system SHALL 在登录成功后调用 `favoritesStore.fetchFavorites()` 拉取云端收藏；在 `AUTH_SESSION_CLEARED_EVENT` 触发时清空本地 `favorites.value`。
#### Scenario: 登录后直进 Songs 页
- **WHEN** 用户登录后直接导航到 `/songs`
- **THEN** 心形图标根据云端收藏状态正确显示
#### Scenario: 账号切换
- **WHEN** 用户 A 登出，用户 B 登录后直进 `/songs`
- **THEN** 不显示 A 的收藏残留

### Requirement: Web 收藏 toggle 字段缺失时回退到 fetchFavorites
The system SHALL 在 toggle 接口返回体缺失 `isFavorited`/`favorited` 字段时，调用 `fetchFavorites()` 以真实状态为准，而非强制移除。
#### Scenario: 后端 toggle 返回非标准字段
- **WHEN** toggle 接口返回 `{}` 或非标准字段
- **THEN** 本地状态调用 `fetchFavorites()` 重新拉取，与后端一致

### Requirement: Web SW 通知点击在 hash 路由下落到学习页
The system SHALL 在 `learning-reminder-sw.js` 的 `notificationclick` 中将 `targetUrl` 设置为包含 hash 的路径（`/#/learn`）。
#### Scenario: 点击学习提醒通知
- **WHEN** 用户点击学习提醒通知
- **THEN** 打开 `/#/learn`，路由进入 Learn 页而非 Home

### Requirement: Mini apiProxy GET 请求透传查询参数
The system SHALL 在 `cloudfunctions/apiProxy/index.js` 的 `request()` 中，对 GET 请求将 `data` 序列化为 query string 拼接到 `targetUrl`。
#### Scenario: 搜索请求
- **WHEN** 小程序调用 `contentApi.search('你好', 1, 20)` 经云函数代理
- **THEN** 后端收到 `GET /search?keyword=你好&page=1&pageSize=20`
#### Scenario: 分页请求
- **WHEN** 调用 `contentApi.listByType('song', 2, 20)`
- **THEN** 后端收到 `GET /content/song?page=2&pageSize=20`

### Requirement: Mini player-detail 从分享链接打开时播放正确歌曲
The system SHALL 在 `pages/player-detail/index.js` 的 `onLoad` 中，当从 URL 参数构建 song 后，若 `getApp().globalData.playerState.currentSong` 与 URL 歌曲 id 不一致，调用 `getApp().playSong(song, ...)` 注入播放器。
#### Scenario: 从分享卡片打开
- **WHEN** 用户从分享卡片打开 player-detail 并点击播放
- **THEN** 播放的是分享卡片指定的歌曲，而非上一次播放的歌曲

### Requirement: Mini 登录后 userInfo 不被覆盖
The system SHALL 在 `pages/login/login.js` 中移除 `app.updateLoginState(payload.user, ...)` 之后的 `finalUserInfo` 覆盖写入，保留 `updateLoginState` 写入的完整 `safeUser`。
#### Scenario: 登录后访问 mine 页
- **WHEN** 用户登录后进入 mine 页
- **THEN** `userInfo.id` 存在，统计接口可正常调用

### Requirement: Mini 全局播放器注册 onError 并关闭 obeyMuteSwitch
The system SHALL 在 `app.js` 的 `_initPlayer()` 中注册 `onError` 回调（重置 `isPlaying`、`playState`，toast 提示"播放失败"），并将 `obeyMuteSwitch` 设为 `false`。`pages/vocabulary/index.js` 同步设为 `false`。
#### Scenario: 音频 URL 无效
- **WHEN** 播放音频时 URL 无效或网络异常
- **THEN** 播放器状态重置为停止，toast 提示"播放失败，请稍后重试"
#### Scenario: 手机静音模式
- **WHEN** 用户手机处于静音/振动模式
- **THEN** 民歌仍正常发声

### Requirement: Mini query/vocabulary 页 onHide 暂停音频
The system SHALL 在 `pages/query/index.js` 与 `pages/vocabulary/index.js` 增加 `onHide` 生命周期，暂停并销毁本地 `audioContext`。
#### Scenario: 导航离开 query 页
- **WHEN** 用户在 query 页播放词条音频后 navigateTo 其他页面
- **THEN** 词条音频立即停止

### Requirement: Mini home/query 页 suggestTimer 在卸载/隐藏时清除
The system SHALL 在 `pages/home/index.js` 与 `pages/query/index.js` 的 `onUnload`/`onHide` 中 `clearTimeout(this.suggestTimer)`。
#### Scenario: 输入后快速返回
- **WHEN** 用户在搜索框输入后快速返回
- **THEN** 不触发已销毁页面的 setData

### Requirement: Mini 401 并发跳转登录页节流
The system SHALL 在 `utils/api.js` 的 `redirectToLogin()` 中增加模块级 `isRedirecting` 标志，防止并发 401 多次 push login 页。
#### Scenario: 多个请求同时 401
- **WHEN** mine 页同时发起 `meApi.get()` 与 `History.list()` 且均返回 401
- **THEN** 仅 push 一次 login 页

### Requirement: Mini 搜索建议下拉延迟隐藏避免 blur/tap 竞态
The system SHALL 在 `pages/home/index.js` 与 `pages/query/index.js` 的 `onHideSuggestions` 中使用 `setTimeout(..., 150)` 延迟隐藏下拉，并在 `onUnload` 中清除该 timer。
#### Scenario: 点击建议项
- **WHEN** 用户点击搜索建议下拉中的某项
- **THEN** 建议项的 tap 事件先触发，下拉层在 tap 后再隐藏

### Requirement: Mini 首页建议 songs 类型标签正确显示"歌"
The system SHALL 在 `pages/home/index.wxml:37` 修正三元表达式，`item.type === 'song'` 时显示"歌"。
#### Scenario: 搜索建议返回 songs 类型
- **WHEN** 搜索建议返回 `item.type === 'song'`
- **THEN** 标签显示"[歌]"而非"[谚]"

## MODIFIED Requirements

### Requirement: 鉴权失败处理（Web）
原实现使用 `window.location.pathname` 判断与 `window.location.href` 整页跳转。修改为使用注入的 `router` 实例 `push` 到 `login` 路由，保留 `redirect` query，并增加模块级 `isRedirecting` 防并发重复跳转。

### Requirement: 收藏 store 生命周期（Web）
原实现 `favorites.js` 不监听登出事件，`auth.js` 的 `logout()` 不清空 favorites。修改为 `favorites.js` 在模块初始化时注册 `AUTH_SESSION_CLEARED_EVENT` 监听清空本地状态，`auth.js` 的 `setSession(null)` 触发该事件。

## REMOVED Requirements

无。
