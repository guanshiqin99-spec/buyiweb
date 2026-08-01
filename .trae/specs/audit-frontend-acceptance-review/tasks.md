# Tasks

## 阶段 1：P0 致命 bug 修复（Web 与 Mini 独立可并行）

- [x] Task 1: Web 修复 401 鉴权重定向在 hash 路由下失效（W-P0-1）
  - [ ] SubTask 1.1: 修改 `buyi-dictionary-vue/src/utils/authInterceptor.js`，`clearAuthAndRedirect()` 不再使用 `window.location.pathname`/`window.location.href`，改为使用注入的 `router` 实例 `router.push({ name: 'login', query: { redirect: router.currentRoute.value.fullPath } })`
  - [ ] SubTask 1.2: 修改 `buyi-dictionary-vue/src/main.js` 中 `installAuthInterceptor(api, authStore)` 调用，追加传入 `router` 实例
  - [ ] SubTask 1.3: 在 `authInterceptor.js` 增加模块级 `isRedirecting` 标志，防止并发 401 多次 push
  - [ ] SubTask 1.4: 验证 token 过期场景下路由正确跳转到 `/#/login?redirect=...`，不触发整页刷新

- [x] Task 2: Mini 修复 apiProxy 云函数 GET 请求丢失查询参数（M-P0-1）
  - [ ] SubTask 2.1: 修改 `cloudfunctions/apiProxy/index.js` 的 `request()` 函数，对 GET 请求将 `data` 序列化为 query string 拼接到 `targetUrl`（使用 `encodeURIComponent`，跳过 `null`/`undefined`/空字符串值）
  - [ ] SubTask 2.2: 验证 `contentApi.search('你好', 1, 20)` 经云函数后端收到 `GET /search?keyword=你好&page=1&pageSize=20`
  - [ ] SubTask 2.3: 验证 `contentApi.listByType('song', 2, 20)`、`favoritesApi.list()`、`recordsApi.list(2)` 等 GET 接口参数正确透传
  - [ ] SubTask 2.4: 验证 POST/PUT 请求 body 不受影响

## 阶段 2：P1 高优先级修复（独立可并行）

- [x] Task 3: Web 修复学习提醒开关无效（W-P1-1）
  - [ ] SubTask 3.1: 修改 `buyi-dictionary-vue/src/views/Settings.vue`，`import { configureLearningReminder } from '@/utils/learningReminder'`
  - [ ] SubTask 3.2: 在 `Settings.vue` 增加 `watch(() => settings.value.notifications, (enabled) => { ... })`，开启时调用 `configureLearningReminder(true, { requestPermission: true })` 并 catch 权限被拒/不支持；关闭时调用 `configureLearningReminder(false)`
  - [ ] SubTask 3.3: 验证开关切换即时生效（写入 `localStorage.learning-reminder-enabled`），保存设置后状态持久化
  - [ ] SubTask 3.4: 验证关闭开关时已调度定时器被取消

- [x] Task 4: Web 修复收藏状态跨页面/跨账号不同步（W-P1-2）
  - [ ] SubTask 4.1: 修改 `buyi-dictionary-vue/src/stores/favorites.js`，在模块初始化时注册 `AUTH_SESSION_CLEARED_EVENT` 监听，触发时清空 `favorites.value` 为 `[]`
  - [ ] SubTask 4.2: 修改 `buyi-dictionary-vue/src/stores/auth.js` 的 `setSession(null)` / `logout()` 逻辑，确认会 dispatch `AUTH_SESSION_CLEARED_EVENT`（若未 dispatch 则补发）
  - [ ] SubTask 4.3: 修改 `buyi-dictionary-vue/src/views/Login.vue` 登录成功后调用 `favoritesStore.fetchFavorites()` hydrate
  - [ ] SubTask 4.4: 验证登录后直进 `/songs` 心形状态正确
  - [ ] SubTask 4.5: 验证账号 A 登出 → 账号 B 登录后直进 `/songs` 不显示 A 的残留

- [x] Task 5: Mini 修复 player-detail 从分享链接打开时播放错误歌曲（M-P1-1）
  - [ ] SubTask 5.1: 修改 `pages/player-detail/index.js` 的 `onLoad`，从 URL 参数构建 `song` 后，若 `getApp().globalData.playerState.currentSong` 的 id 与 URL 歌曲 id 不一致（或 currentSong 为空），调用 `getApp().playSong(song, { fromShare: true })` 注入播放器
  - [ ] SubTask 5.2: 验证从分享卡片打开 player-detail 后点击播放，播放的是分享的歌曲
  - [ ] SubTask 5.3: 验证从 song 页正常 navigateTo player-detail 时行为不回归（currentSong 一致时不重新注入）

- [x] Task 6: Mini 修复登录后 userInfo 被 finalUserInfo 覆盖（M-P1-5）
  - [ ] SubTask 6.1: 修改 `pages/login/login.js` 的 `doLogin`，移除 `app.updateLoginState(payload.user, ...)` 之后的 `app.globalData.userInfo = finalUserInfo` 与 `loginState.userInfo = finalUserInfo` 两行覆盖写入
  - [ ] SubTask 6.2: 若 `finalUserInfo` 中含 `openid` 字段且 `safeUser` 中没有，则仅合并 `openid` 而非整体覆盖（`app.globalData.userInfo.openid = finalUserInfo.openid`）
  - [ ] SubTask 6.3: 验证登录后 `mine` 页 `userInfo.id` 存在，统计接口正常调用

## 阶段 3：P2 中优先级修复（独立可并行）

- [x] Task 7: Web 修复 SW 通知点击在 hash 路由下落到首页（W-P2-1）
  - [ ] SubTask 7.1: 修改 `buyi-dictionary-vue/public/learning-reminder-sw.js` 的 `notificationclick`，将 `targetUrl` 从 `/learn` 改为 `${self.registration.scope}#/learn`（或相对 `/#/learn`）
  - [ ] SubTask 7.2: 验证点击通知后打开的窗口路由进入 Learn 页

- [x] Task 8: Web 修复收藏 toggle 字段缺失时强制移除（W-P2-2）
  - [ ] SubTask 8.1: 修改 `buyi-dictionary-vue/src/stores/favorites.js` 的 `toggleFavorite`，当 `favorited` 为 `undefined`（后端返回体缺失字段）时，调用 `await fetchFavorites()` 以真实状态为准，而非强制移除
  - [ ] SubTask 8.2: 验证后端 toggle 返回 `{}` 时本地状态与后端一致

- [x] Task 9: Mini 修复播放器缺少 onError 与 obeyMuteSwitch=true（M-P2-1、M-P2-2）
  - [ ] SubTask 9.1: 修改 `app.js` 的 `_initPlayer()`，将 `player.obeyMuteSwitch = true` 改为 `false`
  - [ ] SubTask 9.2: 在 `_initPlayer()` 中注册 `player.onError((err) => { ... })`，重置 `playerState.isPlaying = false`、`playerState.playState = 'stopped'`，`wx.showToast({ title: '播放失败，请稍后重试', icon: 'none' })`，并广播事件通知 UI 更新
  - [ ] SubTask 9.3: 修改 `pages/vocabulary/index.js:89` 的 `obeyMuteSwitch = true` 改为 `false`
  - [ ] SubTask 9.4: 验证音频 URL 无效时播放器状态重置且 toast 提示
  - [ ] SubTask 9.5: 验证手机静音模式下民歌正常发声

- [x] Task 10: Mini 修复 query/vocabulary 页 onHide 未暂停音频 + suggestTimer 未清除（M-P2-3、M-P2-4）
  - [ ] SubTask 10.1: 修改 `pages/query/index.js`，新增 `onHide` 生命周期，暂停并销毁 `this.audioContext`（`audioContext.stop()`、`audioContext.destroy()`、置空）
  - [ ] SubTask 10.2: 修改 `pages/vocabulary/index.js`，新增 `onHide`，暂停并销毁 `this._audioCtx`
  - [ ] SubTask 10.3: 修改 `pages/home/index.js` 与 `pages/query/index.js`，在 `onUnload` 与 `onHide` 中 `clearTimeout(this.suggestTimer)`
  - [ ] SubTask 10.4: 验证 query 页播放词条音频后 navigateTo 其他页面，音频立即停止
  - [ ] SubTask 10.5: 验证搜索框输入后快速返回不触发已销毁页面的 setData

- [x] Task 11: Mini 修复 401 并发多次跳转登录页 + 搜索建议 blur/tap 竞态（M-P2-5、M-P2-6）
  - [ ] SubTask 11.1: 修改 `utils/api.js` 的 `redirectToLogin()`，增加模块级 `isRedirecting` 标志，进入时若已为 true 则直接 return，跳转完成后在 success/fail 回调中重置
  - [ ] SubTask 11.2: 修改 `pages/home/index.js` 与 `pages/query/index.js` 的 `onHideSuggestions`，使用 `setTimeout(() => { this.setData({ showSuggestions: false }); }, 150)` 延迟隐藏
  - [ ] SubTask 11.3: 在上述两页 `onUnload` 中 `clearTimeout(this.hideSuggestTimer)`
  - [ ] SubTask 11.4: 验证 mine 页同时发起多个 401 请求时仅 push 一次 login 页
  - [ ] SubTask 11.5: 验证点击搜索建议项时 tap 事件先触发，下拉在 tap 后再隐藏

- [x] Task 12: Mini 修复首页建议 songs 类型标签错误显示为"谚"（M-P2-7）
  - [ ] SubTask 12.1: 修改 `pages/home/index.wxml:37` 的三元表达式，增加 `item.type === 'song' ? '歌'` 分支
  - [ ] SubTask 12.2: 验证搜索建议返回 `song`/`dictionary`/`phrase`/`proverb` 类型时标签正确显示

## 阶段 4：回归验证

- [x] Task 13: Web 端回归验证
  - [ ] SubTask 13.1: `npm run build` 0 errors、0 new warnings
  - [ ] SubTask 13.2: `npm run test` 所有现有测试通过
  - [ ] SubTask 13.3: 验证 token 过期场景下路由正确跳转到 `/#/login?redirect=...`，不落到首页
  - [ ] SubTask 13.4: 验证学习提醒开关切换即时生效，关闭后定时器取消
  - [ ] SubTask 13.5: 验证登录后直进 `/songs` 心形状态正确，账号切换无残留
  - [ ] SubTask 13.6: 验证 SW 通知点击打开 Learn 页
  - [ ] SubTask 13.7: 验证后端 toggle 返回非标准字段时本地状态与后端一致
  - [ ] SubTask 13.8: 验证主题切换、词典搜索、答题、学习记录、收藏、登录/登出无回归

- [x] Task 14: 小程序端回归验证
  - [ ] SubTask 14.1: 验证 home/query/song/favorite/mine/setting/phrases/proverbs/quiz/record/vocabulary/player-detail/login 所有页面渲染正常
  - [ ] SubTask 14.2: 验证搜索（带关键词）、翻页（带 page 参数）、联想（带 keyword）参数正确透传
  - [ ] SubTask 14.3: 验证从分享卡片打开 player-detail 后播放正确歌曲
  - [ ] SubTask 14.4: 验证登录后 `mine` 页 `userInfo.id` 存在
  - [ ] SubTask 14.5: 验证音频 URL 无效时 toast 提示且状态重置；静音模式下民歌正常发声
  - [ ] SubTask 14.6: 验证 query/vocabulary 页 navigateTo 离开后音频停止
  - [ ] SubTask 14.7: 验证搜索框输入后快速返回无 setData 告警
  - [ ] SubTask 14.8: 验证多个 401 并发仅 push 一次 login 页
  - [ ] SubTask 14.9: 验证点击搜索建议项时 tap 正常触发
  - [ ] SubTask 14.10: 验证首页建议 songs 类型标签显示"[歌]"
  - [ ] SubTask 14.11: 验证微信授权登录、token 刷新、退出登录链路无回归
  - [ ] SubTask 14.12: 验证浅色/深色模式切换在所有页面生效

# Task Dependencies

- Task 1、Task 2 互相独立，可并行
- Task 3、Task 4 独立，可与 Task 1 并行（Web 端不同文件）
- Task 5、Task 6 独立，可与 Task 2 并行（Mini 端不同文件）
- Task 7、Task 8 独立，依赖 Task 4 完成收藏 store 改造后验证
- Task 9、Task 10、Task 11、Task 12 互相独立，可并行
- Task 13 依赖 Task 1、Task 3、Task 4、Task 7、Task 8（Web 端全部修改）
- Task 14 依赖 Task 2、Task 5、Task 6、Task 9、Task 10、Task 11、Task 12（Mini 端全部修改）
