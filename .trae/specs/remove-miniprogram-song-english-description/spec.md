# 移除小程序歌曲列表英文介绍 Spec

## Why
小程序歌曲列表每张唱片卡的「歌名 + 歌手」下方标签位，直接渲染后端 `description` 字段。线上数据库中 id 1-6 的歌曲 `description` 是英文整句（如 "Buyi ethnic song by Lu Longhua, showcasing Buyi culture."），导致列表每首歌下方出现一大段英文介绍，与布依文化主题违和，用户体验差。

根因定位：
- 后端 `GET /api/miniapp/songs` 下发的歌曲对象包含 `description` 字段，id 1-6 为英文句子，id 7-9 为中文句子。
- 小程序 `pages/song/index.wxml:68` 将 `{{item.genre || item.description || '布依民歌'}}` 作为标签位渲染在歌名、歌手下方。
- `item.genre` 不存在（歌曲无 genre 字段），故直接回退到 `item.description`，英文整句被原样显示。

## What Changes
- **小程序前端**：移除 `pages/song/index.wxml` 第 68 行的 `play-count` 标签元素（`{{item.genre || item.description || '布依民歌'}}`），使唱片卡 `record-meta` 行仅保留时长，不再渲染 `description`，从根源上消除英文介绍。
- **不动数据库**：不修改后端数据，不修改 `content-mapper.js`，不影响搜索、Web 端及其他页面。
- **不动英雄卡片**：英雄卡片（`hero-record-card`）展示的是固定中文「布依文化采集」「传承布依文化 · 聆听山野回响」，无英文，无需改动。

## Impact
- Affected specs: 无既有 spec 受影响（`fix-song-metadata-covers-durations` 已完成，本变更为其后续优化）
- Affected code:
  - `BuyiDictionaryApp-main/BuyiDictionaryApp-main/pages/song/index.wxml`（移除第 68 行 play-count 元素）
  - `BuyiDictionaryApp-main/BuyiDictionaryApp-main/pages/song/index.wxss`（`.play-count` 选择器保留无害，不做强制清理，遵循最小改动）

## MODIFIED Requirements
### Requirement: 小程序歌曲列表唱片卡展示
小程序歌曲列表唱片卡 SHALL 仅展示歌名（title）、歌手（artist）、时长（duration）与收藏按钮，不再展示 `description` 字段，避免英文整句以标签形式出现在歌名歌手下方。

#### Scenario: 列表不再出现英文介绍
- **WHEN** 用户打开小程序歌曲页，列表加载完成
- **THEN** 每张唱片卡「歌名 + 歌手」下方仅显示时长（mm:ss），不再出现 `description` 英文整句（如 "Buyi ethnic song by Lu Longhua, showcasing Buyi culture."）

#### Scenario: 时长展示不受影响
- **WHEN** 列表渲染某首歌曲
- **THEN** `record-meta` 行仍显示 `item.durationText`（格式化 mm:ss），duration 为空时显示 `--:--`

#### Scenario: 其他页面与数据不受影响
- **WHEN** 后端 `description` 字段仍按原样下发
- **THEN** 搜索页、Web 端、收藏页等不依赖歌曲列表 `play-count` 标签的功能行为不变；`content-mapper.js` 仍透传 `description`，供其他场景使用
