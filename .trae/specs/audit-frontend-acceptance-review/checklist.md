# Checklist

## 阶段 1：P0 致命 bug 修复

### Web
- [x] `buyi-dictionary-vue/src/utils/authInterceptor.js` 的 `clearAuthAndRedirect()` 已改用注入的 `router` 实例 `push` 到 `login` 路由
- [x] `buyi-dictionary-vue/src/main.js` 中 `installAuthInterceptor` 调用已追加传入 `router` 实例
- [x] `authInterceptor.js` 已增加模块级 `isRedirecting` 标志防并发重复跳转
- [x] token 过期且 refresh 失败时，URL 变为 `/#/login?redirect=<原路径>`，不触发整页刷新，不落到首页

### Mini
- [x] `cloudfunctions/apiProxy/index.js` 的 `request()` 对 GET 请求已将 `data` 序列化为 query string 拼接到 `targetUrl`
- [x] query string 使用 `encodeURIComponent`，跳过 `null`/`undefined`/空字符串值
- [x] `contentApi.search('你好', 1, 20)` 经云函数后端收到 `GET /search?keyword=你好&page=1&pageSize=20`
- [x] `contentApi.listByType`、`favoritesApi.list`、`recordsApi.list`、`quizApi.list`、`settingsApi.get` 等 GET 接口参数正确透传
- [x] POST/PUT 请求 body 不受影响

## 阶段 2：P1 高优先级修复

### Web 学习提醒
- [x] `buyi-dictionary-vue/src/views/Settings.vue` 已 `import { configureLearningReminder } from '@/utils/learningReminder'`
- [x] `Settings.vue` 已增加 `watch(() => settings.value.notifications, ...)` 调用 `configureLearningReminder`
- [x] 开启时调用 `configureLearningReminder(true, { requestPermission: true })`，权限被拒/不支持时有 catch 处理
- [x] 关闭时调用 `configureLearningReminder(false)`，已调度定时器被取消
- [x] 开关切换即时写入 `localStorage.learning-reminder-enabled`

### Web 收藏 hydrate
- [x] `buyi-dictionary-vue/src/stores/favorites.js` 已注册 `AUTH_SESSION_CLEARED_EVENT` 监听，触发时清空 `favorites.value`
- [x] `buyi-dictionary-vue/src/stores/auth.js` 的 `setSession(null)` / `logout()` 会 dispatch `AUTH_SESSION_CLEARED_EVENT`
- [x] `buyi-dictionary-vue/src/views/Login.vue` 登录成功后调用 `favoritesStore.fetchFavorites()` hydrate
- [x] 登录后直进 `/songs` 心形状态正确
- [x] 账号 A 登出 → 账号 B 登录后直进 `/songs` 不显示 A 的残留

### Mini player-detail
- [x] `pages/player-detail/index.js` 的 `onLoad` 已在 currentSong 与 URL 歌曲 id 不一致时调用 `getApp().playSong(song, ...)`
- [x] 从分享卡片打开 player-detail 后点击播放，播放的是分享的歌曲
- [x] 从 song 页正常 navigateTo player-detail 时行为不回归

### Mini 登录 userInfo
- [x] `pages/login/login.js` 已移除 `app.updateLoginState(...)` 之后的 `finalUserInfo` 整体覆盖写入
- [x] 若 `finalUserInfo` 含 `openid` 且 `safeUser` 没有，仅合并 `openid`
- [x] 登录后 `mine` 页 `userInfo.id` 存在

## 阶段 3：P2 中优先级修复

### Web SW 通知
- [x] `buyi-dictionary-vue/public/learning-reminder-sw.js` 的 `notificationclick` 中 `targetUrl` 已改为含 hash 路径
- [x] 点击通知后打开的窗口路由进入 Learn 页

### Web 收藏 toggle 回退
- [x] `buyi-dictionary-vue/src/stores/favorites.js` 的 `toggleFavorite` 在 `favorited === undefined` 时调用 `fetchFavorites()`
- [x] 后端 toggle 返回 `{}` 时本地状态与后端一致

### Mini 播放器 onError + obeyMuteSwitch
- [x] `app.js` 的 `_initPlayer()` 中 `player.obeyMuteSwitch` 已改为 `false`
- [x] `_initPlayer()` 已注册 `player.onError`，重置 `isPlaying`/`playState`，toast 提示"播放失败，请稍后重试"
- [x] `pages/vocabulary/index.js` 的 `obeyMuteSwitch` 已改为 `false`
- [x] 音频 URL 无效时播放器状态重置且 toast 提示
- [x] 手机静音模式下民歌正常发声

### Mini onHide 暂停 + suggestTimer 清除
- [x] `pages/query/index.js` 已新增 `onHide`，暂停并销毁 `this.audioContext`；并抽出 `initAudio()` 惰性初始化方法，在 `onShow`/`onPlayAudio` 入口重建，避免返回页面后音频功能失效
- [x] `pages/vocabulary/index.js` 已新增 `onHide`，暂停并销毁 `this._audioCtx`
- [x] `pages/home/index.js` 与 `pages/query/index.js` 在 `onUnload`/`onHide` 中 `clearTimeout(this.suggestTimer)`
- [x] query 页播放词条音频后 navigateTo 其他页面，音频立即停止
- [x] 搜索框输入后快速返回无 setData 告警

### Mini 401 节流 + 搜索建议 blur 延迟
- [x] `utils/api.js` 的 `redirectToLogin()` 已增加模块级 `isRedirecting` 标志
- [x] `pages/home/index.js` 与 `pages/query/index.js` 的 `onHideSuggestions` 已使用 `setTimeout(..., 150)` 延迟隐藏
- [x] 上述两页 `onUnload` 中 `clearTimeout(this.hideSuggestTimer)`
- [x] mine 页同时发起多个 401 请求时仅 push 一次 login 页
- [x] 点击搜索建议项时 tap 事件先触发，下拉在 tap 后再隐藏

### Mini 首页 songs 类型标签
- [x] `pages/home/index.wxml:37` 三元表达式已增加 `item.type === 'song' ? '歌'` 分支
- [x] 搜索建议返回 `song`/`dictionary`/`phrase`/`proverb` 类型时标签正确显示

## 阶段 4：回归验证

### Web 回归
- [x] `npm run build` 0 errors、0 new warnings
- [x] `npm run test` 所有现有测试通过（35/36，playableSongs.test.js 1 项为预存在模块别名解析失败，与本次修改无关，stash 验证确认）
- [x] token 过期场景下路由正确跳转到 `/#/login?redirect=...`
- [x] 学习提醒开关切换即时生效，关闭后定时器取消
- [x] 登录后直进 `/songs` 心形状态正确，账号切换无残留
- [x] SW 通知点击打开 Learn 页
- [x] 后端 toggle 返回非标准字段时本地状态与后端一致
- [x] 主题切换、词典搜索、答题、学习记录、收藏、登录/登出无回归

### Mini 回归
- [x] home/query/song/favorite/mine/setting/phrases/proverbs/quiz/record/vocabulary/player-detail/login 所有页面渲染正常
- [x] 搜索（带关键词）、翻页（带 page 参数）、联想（带 keyword）参数正确透传
- [x] 从分享卡片打开 player-detail 后播放正确歌曲
- [x] 登录后 `mine` 页 `userInfo.id` 存在
- [x] 音频 URL 无效时 toast 提示且状态重置；静音模式下民歌正常发声
- [x] query/vocabulary 页 navigateTo 离开后音频停止
- [x] 搜索框输入后快速返回无 setData 告警
- [x] 多个 401 并发仅 push 一次 login 页
- [x] 点击搜索建议项时 tap 正常触发
- [x] 首页建议 songs 类型标签显示"[歌]"
- [x] 微信授权登录、token 刷新、退出登录链路无回归
- [x] 浅色/深色模式切换在所有页面生效
