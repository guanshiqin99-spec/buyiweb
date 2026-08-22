# Tasks

- [x] Task 1: 修改后端 `getMiniappHomeData` 移除封面过滤并补充 targetUrl 字段
  - [ ] SubTask 1.1: 在 [backend/src/modules/content/content.service.ts](file:///d:/BuyiDictionaryWeb/BuyiDictionaryApp-main/BuyiDictionaryApp-main/backend/src/modules/content/content.service.ts) 的 `getMiniappHomeData` 方法中，移除 `.filter((item) => !!item.coverUrl)` 这一行
  - [ ] SubTask 1.2: 在 map 回调返回对象中补充 `targetUrl: '/pages/song/index'` 字段
  - [ ] SubTask 1.3: 保留 `.slice(0, 5)` 截取前 5 首，保留 `image: item.coverUrl`（可能为 null）
  - [ ] SubTask 1.4: 验证后端测试 [backend/test/content.e2e-spec.ts:275-283](file:///d:/BuyiDictionaryWeb/BuyiDictionaryApp-main/BuyiDictionaryApp-main/backend/test/content.e2e-spec.ts#L275-L283) 中关于 banners 只取含封面歌曲的断言需相应更新（允许 image 为 null）

- [x] Task 2: 修改小程序前端 `loadHomeData` 修复兜底判断与图片兜底
  - [ ] SubTask 2.1: 在 [pages/home/index.js](file:///d:/BuyiDictionaryWeb/BuyiDictionaryApp-main/BuyiDictionaryApp-main/pages/home/index.js) 的 `loadHomeData` try 分支中，将兜底判断从 `Array.isArray(payload && payload.banners)` 改为 `Array.isArray(payload && payload.banners) && payload.banners.length > 0`
  - [ ] SubTask 2.2: 在 `setData({ bannerItems })` 之前，对 bannerItems 数组每个 item 做 `item.image = item.image || '/assets/images/banner1.jpg'` 兜底（确保 wxml 中 `wx:if="{{item.image}}"` 始终为 true，banner 背景图正常显示）
  - [ ] SubTask 2.3: catch 分支保持现有默认数据不变（已有 image: '/assets/images/banner1.jpg'）

- [x] Task 3: 验证 wxml 与 wxss 无需改动
  - [ ] SubTask 3.1: 确认 [pages/home/index.wxml:74](file:///d:/BuyiDictionaryWeb/BuyiDictionaryApp-main/BuyiDictionaryApp-main/pages/home/index.wxml#L74) `wx:if="{{bannerItems.length}}"` 在 bannerItems 非空时正常渲染
  - [ ] SubTask 3.2: 确认 [pages/home/index.wxml:82](file:///d:/BuyiDictionaryWeb/BuyiDictionaryApp-main/BuyiDictionaryApp-main/pages/home/index.wxml#L82) swiper 组件 `autoplay`/`interval`/`circular` 属性配置正确
  - [ ] SubTask 3.3: 确认 [pages/home/index.wxml:86](file:///d:/BuyiDictionaryWeb/BuyiDictionaryApp-main/BuyiDictionaryApp-main/pages/home/index.wxml#L86) image 标签 `wx:if="{{item.image}}"` 在 image 兜底后始终为 true

# Task Dependencies
- Task 2 独立于 Task 1（前端兜底逻辑不依赖后端改动，可并行）
- Task 3 依赖 Task 1 和 Task 2 完成后做整体验证
