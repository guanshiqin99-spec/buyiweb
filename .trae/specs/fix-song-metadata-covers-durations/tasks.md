# Tasks

## 阶段 1：后端实体与迁移（可并行启动）

- [x] Task 1: 给 Song 实体新增 duration 字段
  - [x] SubTask 1.1: 修改 `BuyiDictionaryApp-main/BuyiDictionaryApp-main/backend/src/entities/song.entity.ts` — 新增 `@Column({ type: 'int', nullable: true }) duration!: number | null;`
  - [x] SubTask 1.2: 修改 `BuyiDictionaryApp-main/BuyiDictionaryApp-main/backend/src/modules/content/content.service.ts` 的 `serialize` 方法 — 在 SONG 分支输出 `duration: song.duration`
  - [x] SubTask 1.3: 新建 migration 文件 `backend/src/migrations/1731000000000-add-song-duration.ts` — `ALTER TABLE songs ADD COLUMN duration INT NULL`
- [x] Task 2: 读取本地音频文件真实时长
  - [x] SubTask 2.1: 在本地使用 ffprobe 或 Node.js 读取 9 个音频文件时长（秒）
    - `buyi_audio/buyi-lulonghu.mp3`
    - `buyi_audio/buyi-wujian.mp3`
    - `buyi_audio/tuomie-buyi-lujiaxing.mp3`
    - `buyi_audio/xiaoamei-buyi-lujiaxing.mp3`
    - `buyi_audio/maliaolei-wangxingfei-wangyufan.mp3`
    - `buyi_audio/maliaolei-wangxingfei-others.mp3`
    - `original_assets_backup/backend_audio_original/huiyouge.MP3`
    - `original_assets_backup/backend_audio_original/fenshoudiao.MP3`
    - `original_assets_backup/backend_audio_original/yushuiqing.MP3`
  - [x] SubTask 2.2: 记录 9 首歌曲的时长映射表，供后续种子脚本使用

## 阶段 2：数据库清理与种子脚本（依赖阶段 1）

- [x] Task 3: 重写 `sync_songs_online.py` 为 9 首真实歌曲
  - [x] SubTask 3.1: 删除占位假歌曲（id=1/2/3，hau mbou / gaen hau / mbou ra）
  - [x] SubTask 3.2: 重排 9 首真实歌曲数据（id=1-9），每首包含 title/artist/coverUrl/audioUrl/duration
  - [x] SubTask 3.3: 统一艺术家名"吴建"（非"吴渐"）
  - [x] SubTask 3.4: 为每首歌曲匹配语义合适的封面（参考本地 `backend/uploads/covers/` 9 张图）
- [x] Task 4: 修正 `seed-more-songs.ts`
  - [x] SubTask 4.1: 移除会友歌/分手调/鱼水情的重复种子（已由 `sync_songs_online.py` 统一处理），或将该脚本标记为废弃

## 阶段 3：服务器资源同步（依赖阶段 2，可与阶段 4 并行）

- [x] Task 5: 上传封面与音频文件到阿里云服务器
  - [x] SubTask 5.1: 上传 9 张封面图到 `/opt/buyi-dictionary/backend/uploads/covers/`
  - [x] SubTask 5.2: 上传 9 个音频文件到 `/opt/buyi-dictionary/backend/uploads/buyi_audio/`（注意 huiyouge.MP3/fenshoudiao.MP3/yushuiqing.MP3 需保持原文件名）
  - [x] SubTask 5.3: 验证 nginx 静态资源可通过 `http://39.96.81.132/uploads/covers/xxx.jpg` 与 `http://39.96.81.132/uploads/buyi_audio/xxx.mp3` 访问
- [x] Task 6: 在服务器执行数据库同步
  - [x] SubTask 6.1: SSH 到 `39.96.81.132`，执行 `sync_songs_online.py` 同步 9 首歌曲
  - [x] SubTask 6.2: 执行 migration `npx typeorm migration:run` 或手动 `ALTER TABLE songs ADD COLUMN duration INT NULL`
  - [x] SubTask 6.3: 验证 `SELECT id, title, artist, audioUrl, coverUrl, duration FROM songs ORDER BY id;` 返回 9 行真实数据
  - [x] SubTask 6.4: 验证后端服务正常（`curl http://39.96.81.132:3000/miniapp/songs` 返回 9 首歌曲且含 duration 字段）

## 阶段 4：小程序前端修复（可与阶段 3 并行）

- [x] Task 7: 修复小程序歌曲列表硬编码
  - [x] SubTask 7.1: 修改 `pages/song/index.wxml` 第 76 行 — 移除 `03:{{42 - index * 5 > 9 ? 42 - index * 5 : '15'}}` 硬编码公式，改为 `{{item.durationText}}`
  - [x] SubTask 7.2: 修改 `pages/song/index.wxml` 第 75 行 — 移除假播放次数 `{{12 - index > 0 ? 12 - index : 2}}.{{index % 9}}万`，改为显示真实来源或移除该字段
  - [x] SubTask 7.3: 修改 `pages/song/index.wxml` 第 71 行 — 移除硬编码 tag `{{index === 0 ? '迎宾歌' : (index % 2 !== 0 ? '山歌' : '劳动歌')}}`，改为 `{{item.genre || item.description || '布依民歌'}}`
  - [x] SubTask 7.4: 在 `pages/song/index.js` 的 `loadSongs` 中，对每首歌曲计算 `durationText`（格式化 mm:ss），写入 `mapContent` 或单独处理
- [x] Task 8: 修复小程序 `content-mapper.js` 透传 duration
  - [x] SubTask 8.1: 修改 `BuyiDictionaryApp-main/BuyiDictionaryApp-main/utils/content-mapper.js` 的 `mapContent` — 增加 `duration: item.duration ?? null` 字段
  - [x] SubTask 8.2: 增加 `formatDuration` 工具函数（秒 → mm:ss），在 `mapContent` 中输出 `durationText`

## 阶段 5：Web 前端修复（可与阶段 3/4 并行）

- [x] Task 9: 修复 Web `playableSongs.js` 透传 duration
  - [x] SubTask 9.1: 修改 `buyi-dictionary-vue/src/data/playableSongs.js` 的 `toPlayableSong` — 增加 `duration: item.duration ?? null`
  - [x] SubTask 9.2: 增加 `formatDuration` 工具函数并导出
- [x] Task 10: 修复 Web `Songs.vue` 列表显示真实时长
  - [x] SubTask 10.1: 修改 `Songs.vue` 第 154 行 — 将 `'实录'` 占位文案改为 `formatDuration(song.duration)`，当 duration 为 null 时显示 `'—'`
  - [x] SubTask 10.2: 播放中歌曲保持使用 `playerStore.formattedDuration`（实时更新），未播放歌曲使用 `song.duration` 静态值

## 阶段 6：验证

- [x] Task 11: 端到端验证
  - [x] SubTask 11.1: 阿里云服务器后端服务正常（`curl http://39.96.81.132/api/health` 返回 200）
  - [x] SubTask 11.2: `curl http://39.96.81.132/api/miniapp/songs` 返回 9 首歌曲，每首含 duration/coverUrl/audioUrl
  - [x] SubTask 11.3: 浏览器访问 `http://39.96.81.132/uploads/covers/cover_wanfenglin_01.jpg` 返回 200 图片
  - [x] SubTask 11.4: 浏览器访问 `http://39.96.81.132/uploads/buyi_audio/buyi-lulonghu.mp3` 返回 200 音频
  - [x] SubTask 11.5: Web 端 `npm run build` 0 errors
  - [x] SubTask 11.6: Web 端歌曲列表显示 9 首真实歌曲，封面加载正常，时长显示真实值
  - [x] SubTask 11.7: 小程序歌曲列表显示 9 首真实歌曲，封面加载正常，时长显示真实值（非 03:42/03:37 假数据）
  - [ ] SubTask 11.8: Web 端播放任一歌曲，音频可正常播放，播放器进度条与时长同步（需用户实测）
  - [ ] SubTask 11.9: 小程序播放任一歌曲，音频可正常播放（需用户实测）

# Task Dependencies
- Task 1、Task 2 互相独立，可并行
- Task 3 依赖 Task 1（duration 字段）、Task 2（时长数据）
- Task 4 依赖 Task 3（避免重复种子）
- Task 5 独立（资源上传）
- Task 6 依赖 Task 1（migration）、Task 3（种子脚本）、Task 5（资源就绪）
- Task 7、Task 8 互相独立，可并行（小程序修复）
- Task 9、Task 10 互相独立，可并行（Web 修复）
- Task 7/8/9/10 可与 Task 5/6 并行
- Task 11 依赖全部上游任务
