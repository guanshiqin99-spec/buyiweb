# Checklist

## 后端改动验证
- [x] [backend/src/modules/content/content.service.ts](file:///d:/BuyiDictionaryWeb/BuyiDictionaryApp-main/BuyiDictionaryApp-main/backend/src/modules/content/content.service.ts) `getMiniappHomeData` 中已移除 `.filter((item) => !!item.coverUrl)` 过滤
- [x] `getMiniappHomeData` 的 map 回调返回对象包含 `targetUrl: '/pages/song/index'` 字段
- [x] `image` 字段保持 `item.coverUrl`（未在后端做本地路径兜底，避免耦合小程序包内资源）
- [x] `.slice(0, 5)` 截取逻辑保留，最多返回 5 个 banner

## 前端改动验证
- [x] [pages/home/index.js](file:///d:/BuyiDictionaryWeb/BuyiDictionaryApp-main/BuyiDictionaryApp-main/pages/home/index.js) `loadHomeData` try 分支兜底判断已改为 `Array.isArray(payload && payload.banners) && payload.banners.length > 0`
- [x] bannerItems 在 setData 之前每个 item 的 `image` 字段已做兜底（`item.image || '/assets/images/banner1.jpg'`）
- [x] catch 分支默认数据保持不变（已有 image: '/assets/images/banner1.jpg' 和 targetUrl: '/pages/song/index'）
- [x] `/assets/images/banner1.jpg` 文件确实存在于小程序包内（已确认存在）

## wxml/wxss 无需改动验证
- [x] [pages/home/index.wxml:74](file:///d:/BuyiDictionaryWeb/BuyiDictionaryApp-main/BuyiDictionaryApp-main/pages/home/index.wxml#L74) `wx:if="{{bannerItems.length}}"` 在 bannerItems 非空时正常渲染轮播图区域
- [x] [pages/home/index.wxml:82](file:///d:/BuyiDictionaryWeb/BuyiDictionaryApp-main/BuyiDictionaryApp-main/pages/home/index.wxml#L82) swiper 组件 autoplay/interval/circular 配置正确
- [x] [pages/home/index.wxml:86](file:///d:/BuyiDictionaryWeb/BuyiDictionaryApp-main/BuyiDictionaryApp-main/pages/home/index.wxml#L86) image 标签在 image 兜底后始终渲染（`wx:if="{{item.image}}"` 为 true）

## 点击跳转验证
- [x] [pages/home/index.js:77](file:///d:/BuyiDictionaryWeb/BuyiDictionaryApp-main/BuyiDictionaryApp-main/pages/home/index.js#L77) `handleBannerTap` 中 tabUrls 数组包含 `/pages/song/index`，点击 banner 走 switchTab 分支
- [x] 点击 banner 不再出现"页面正在建设中"错误提示

## 场景覆盖验证
- [x] 场景1：数据库有已发布歌曲但 coverUrl 全为 null → 后端返回非空 banners（image 为 null），前端兜底显示 banner1.jpg，轮播图正常渲染
- [x] 场景2：数据库无已发布歌曲 → 后端返回空 banners，前端走默认数据分支，显示 1 条"布依迎客歌"默认 banner
- [x] 场景3：数据库部分歌曲有 coverUrl → 有封面的显示真实封面，无封面的兜底显示 banner1.jpg

## 不影响现有功能验证
- [x] web 端 Songs 页面封面显示不受影响（web 走 `/content/song` 列表接口，不走 `/miniapp/home`）
- [x] 小程序 song 页面（[pages/song/index](file:///d:/BuyiDictionaryWeb/BuyiDictionaryApp-main/BuyiDictionaryApp-main/pages/song/index)）不受影响
- [x] 后端 e2e 测试 [content.e2e-spec.ts:275-283](file:///d:/BuyiDictionaryWeb/BuyiDictionaryApp-main/BuyiDictionaryApp-main/backend/test/content.e2e-spec.ts#L275-L283) 中关于 banners 结构的断言通过（如断言"只取含封面歌曲"需更新为"取前 5 首已发布歌曲"）
