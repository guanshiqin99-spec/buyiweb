# 修正歌曲封面、数目与时长 Spec

## Why
部署完成后，Web 与小程序端歌曲列表出现三类严重不符：
1. **数目不符**：数据库中存在 3 首无真实音频的占位假歌曲（id=1/2/3，hau mbou / gaen hau / mbou ra），同时 `seed-more-songs.ts` 又单独种子 3 首（会友歌/分手调/鱼水情），导致列表条目数与"可播放曲目数"严重不一致。
2. **封面不符**：阿里云服务器 `/opt/buyi-dictionary/backend/uploads/covers/` 目录可能缺失 9 张封面图；占位假歌曲与封面语义不匹配。
3. **时长不符**：小程序 `pages/song/index.wxml:76` 硬编码假时长公式 `03:{{42 - index * 5 > 9 ? 42 - index * 5 : '15'}}`；后端 `song.entity.ts` 无 `duration` 字段，无法下发真实时长。

## What Changes
- **后端**：给 `Song` 实体新增 `duration` 字段（int，秒），新增 TypeORM migration；在 `ContentService.serialize` 中输出 `duration`。
- **数据库清理**：删除 3 首占位假歌曲（id=1/2/3，无 audioUrl 的 hau mbou / gaen hau / mbou ra）；将真实 9 首歌曲（6 首随包 + 3 首会友歌/分手调/鱼水情）的 `duration` 字段写入真实音频时长。
- **艺术家名统一**：将"吴渐"统一为"吴建"（与 web `playableSongs.js` fallbackMeta 一致）。
- **资源上传**：将本地 9 张封面图与 9 个音频文件上传至阿里云服务器 `/opt/buyi-dictionary/backend/uploads/covers/` 与 `/uploads/buyi_audio/`，并验证 nginx 静态资源可访问。
- **小程序修复**：移除 `pages/song/index.wxml` 中硬编码的假时长公式与假播放次数公式，改用 `item.duration` 真实字段；移除硬编码 tag 公式，改用后端返回的 `description` 或 `genre`。
- **Web 修复**：`Songs.vue` 列表项在未播放时显示 `duration` 真实时长（格式化 mm:ss），替代"实录"占位文案；`playableSongs.js` 的 `toPlayableSong` 透传 `duration` 字段。

## Impact
- Affected specs: 无既有 spec 受影响（独立变更）
- Affected code:
  - `BuyiDictionaryApp-main/BuyiDictionaryApp-main/backend/src/entities/song.entity.ts`
  - `BuyiDictionaryApp-main/BuyiDictionaryApp-main/backend/src/modules/content/content.service.ts`（serialize 输出 duration）
  - `BuyiDictionaryApp-main/BuyiDictionaryApp-main/backend/src/migrations/`（新增 migration）
  - `BuyiDictionaryApp-main/BuyiDictionaryApp-main/pages/song/index.wxml`（移除硬编码公式）
  - `buyi-dictionary-vue/src/views/Songs.vue`（列表显示真实时长）
  - `buyi-dictionary-vue/src/data/playableSongs.js`（透传 duration）
  - `sync_songs_online.py`（重写为 9 首真实歌曲 + duration 字段）
  - 服务器 `/opt/buyi-dictionary/backend/uploads/covers/` 与 `/uploads/buyi_audio/` 目录

## ADDED Requirements
### Requirement: 歌曲时长字段
后端 `Song` 实体 SHALL 新增 `duration` 字段（int，单位秒，nullable），用于存储真实音频时长。

#### Scenario: 列表接口返回时长
- **WHEN** 前端调用 `GET /miniapp/songs` 或 `GET /content?type=song`
- **THEN** 每首歌曲对象包含 `duration` 字段（秒），未填写时为 null

### Requirement: 真实歌曲数据
数据库 SHALL 仅包含 9 首有真实音频文件的歌曲，移除 3 首无音频的占位条目。

#### Scenario: 占位歌曲被删除
- **WHEN** 数据库清理完成
- **THEN** `SELECT COUNT(*) FROM songs` 返回 9，且每首歌曲的 `audioUrl` 指向服务器真实存在的 mp3 文件

## MODIFIED Requirements
### Requirement: 小程序歌曲列表展示
小程序歌曲列表 SHALL 展示真实的 `duration`、`coverUrl`、`artist` 字段，移除所有基于 index 的硬编码公式。

#### Scenario: 时长真实
- **WHEN** 用户打开小程序歌曲页
- **THEN** 每首歌曲显示的时长来自后端 `duration` 字段（格式化为 mm:ss），不再使用 `42 - index * 5` 公式

#### Scenario: 封面真实
- **WHEN** 后端返回 `coverUrl` 指向服务器真实存在的图片
- **THEN** 小程序与 Web 端均能加载并显示封面，不再回退到 `/assets/images/banner1.jpg`

### Requirement: Web 歌曲列表展示
Web `Songs.vue` 列表项 SHALL 在未播放时显示真实时长，替代"实录"占位文案。

#### Scenario: 未播放歌曲显示时长
- **WHEN** 歌曲列表加载完成，且某首歌曲未被播放
- **THEN** 该歌曲行右侧显示格式化时长（mm:ss），数据来自 `song.duration`
