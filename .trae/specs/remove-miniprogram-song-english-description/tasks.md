# Tasks

- [x] Task 1: 移除小程序歌曲列表英文介绍标签位
  - [x] SubTask 1.1: 修改 `BuyiDictionaryApp-main/BuyiDictionaryApp-main/pages/song/index.wxml` 第 67-70 行的 `record-meta` 块 —— 删除 `<text class="play-count">{{item.genre || item.description || '布依民歌'}}</text>` 这一行，仅保留 `<text class="duration">{{item.durationText || '--:--'}}</text>`
  - [x] SubTask 1.2: 确认 `record-meta` flex 布局（`index.wxss:273` 的 `display:flex; gap:24rpx;`）在仅剩 duration 子元素时显示正常，无需额外调整样式
  - [x] SubTask 1.3: 确认英雄卡片 `hero-record-card`（固定中文文案）与 `record-artist`（artist/zhText）行未引入英文，无需改动

## 阶段 2：验证

- [x] Task 2: 端到端验证
  - [x] SubTask 2.1: 小程序歌曲列表加载 9 首歌曲，每张唱片卡「歌名 + 歌手」下方仅显示时长，不再出现英文 description 整句
  - [x] SubTask 2.2: 时长显示正常（来自 `item.durationText`），duration 为空时显示 `--:--`
  - [x] SubTask 2.3: 点击歌曲仍可正常跳转播放详情页，播放功能不受影响
  - [x] SubTask 2.4: 收藏按钮、加载更多、分享功能正常

# Task Dependencies
- Task 2 依赖 Task 1 完成
