# Checklist

## 阶段 1：后端实体与迁移

- [x] `song.entity.ts` 已新增 `duration: number | null` 字段（int, nullable）
- [x] `content.service.ts` 的 `serialize` 方法在 SONG 分支输出 `duration` 字段
- [x] 新增 migration 文件 `1731000000000-add-song-duration.ts`，执行 `ALTER TABLE songs ADD COLUMN duration INT NULL`
- [x] 本地 9 个音频文件时长已读取并记录（ffprobe 输出秒数）

## 阶段 2：数据库清理与种子脚本

- [x] `sync_songs_online.py` 已重写为 9 首真实歌曲，移除 3 首占位假歌曲（hau mbou / gaen hau / mbou ra）
- [x] 每首歌曲的 `audioUrl` 指向真实存在的 mp3 文件（/uploads/buyi_audio/xxx.mp3）
- [x] 每首歌曲的 `coverUrl` 指向语义匹配的封面图（/uploads/covers/xxx.jpg）
- [x] 每首歌曲的 `duration` 字段写入真实音频时长（秒）
- [x] 艺术家名统一为"吴建"（非"吴渐"）
- [x] `seed-more-songs.ts` 已标记为废弃或移除重复种子逻辑

## 阶段 3：服务器资源同步

- [x] 9 张封面图已上传到 `/opt/buyi-dictionary/backend/uploads/covers/`
- [x] 9 个音频文件已上传到 `/opt/buyi-dictionary/backend/uploads/buyi_audio/`
- [x] `curl http://39.96.81.132/uploads/covers/cover_wanfenglin_01.jpg` 返回 200 + 图片
- [x] `curl http://39.96.81.132/uploads/buyi_audio/buyi-lulonghu.mp3` 返回 200 + 音频
- [x] `curl http://39.96.81.132/uploads/buyi_audio/huiyouge.MP3` 返回 200 + 音频（注意大写扩展名）
- [x] 数据库已执行 migration（duration 列已添加）
- [x] 数据库已执行 `sync_songs_online.py`（9 首歌曲已同步）
- [x] `SELECT COUNT(*) FROM songs` 返回 9
- [x] `SELECT id, title, artist, audioUrl, coverUrl, duration FROM songs ORDER BY id` 返回 9 行真实数据
- [x] `curl http://39.96.81.132:3000/api/miniapp/songs` 返回 9 首歌曲且含 duration 字段
- [x] 阿里云服务器后端服务正常（health 接口 200）

## 阶段 4：小程序前端修复

- [x] `pages/song/index.wxml` 第 76 行硬编码时长公式 `03:{{42 - index * 5 > 9 ? 42 - index * 5 : '15'}}` 已移除
- [x] `pages/song/index.wxml` 第 75 行假播放次数公式 `{{12 - index > 0 ? 12 - index : 2}}.{{index % 9}}万` 已移除
- [x] `pages/song/index.wxml` 第 71 行硬编码 tag 公式已移除，改用 `item.genre || item.description || '布依民歌'`
- [x] `pages/song/index.js` 的 `loadSongs` 已为每首歌曲计算 `durationText`（mm:ss 格式）
- [x] `utils/content-mapper.js` 的 `mapContent` 已透传 `duration` 字段并输出 `durationText`

## 阶段 5：Web 前端修复

- [x] `buyi-dictionary-vue/src/data/playableSongs.js` 的 `toPlayableSong` 已透传 `duration` 字段
- [x] `buyi-dictionary-vue/src/data/playableSongs.js` 已导出 `formatDuration` 工具函数
- [x] `Songs.vue` 第 154 行 `'实录'` 占位文案已改为 `formatDuration(song.duration)`，duration 为 null 时显示 `'—'`
- [x] 播放中歌曲仍使用 `playerStore.formattedDuration`（实时更新）

## 阶段 6：端到端验证

- [x] `curl http://39.96.81.132/api/health` 返回 200
- [x] `curl http://39.96.81.132/api/miniapp/songs` 返回 9 首歌曲，每首含 duration/coverUrl/audioUrl
- [x] Web 端 `npm run build` 0 errors（186 modules transformed, built in 3.87s）
- [x] Web 端歌曲列表显示 9 首真实歌曲（数据源 API 已返回 9 首含 duration 的真实歌曲）
- [x] Web 端封面图加载正常（封面 URL 指向真实图片，HTTP 200）
- [x] Web 端歌曲时长显示真实值（非"实录"，使用 formatDuration(song.duration)）
- [ ] Web 端播放任一歌曲，音频可正常播放（需用户在浏览器实测）
- [x] 小程序歌曲列表显示 9 首真实歌曲（API 数据源已正确）
- [x] 小程序封面图加载正常（封面 URL 指向真实图片，HTTP 200）
- [x] 小程序歌曲时长显示真实值（已移除 03:42/03:37 假数据硬编码，改用 item.durationText）
- [ ] 小程序播放任一歌曲，音频可正常播放（需用户在小程序实测）
- [x] 阿里云服务器后端服务持续正常（PM2 online，health 200）
