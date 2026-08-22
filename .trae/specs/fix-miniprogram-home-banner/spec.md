# 修复小程序首页轮播图不显示 Spec

## Why

小程序首页"精选专题"轮播图区域完全不渲染。根因链如下：
1. 后端 `/miniapp/home` 接口在 `getMiniappHomeData` 中使用 `.filter((item) => !!item.coverUrl)` 过滤歌曲，而数据库中所有歌曲的 `coverUrl` 字段均为 `null`（web 端能显示封面是因为前端做了 `coverUrl || imgAmbient` 兜底，并非数据库真有封面）。
2. 过滤后 `banners` 返回空数组 `[]`。
3. 前端 [pages/home/index.js:42](file:///d:/BuyiDictionaryWeb/BuyiDictionaryApp-main/BuyiDictionaryApp-main/pages/home/index.js#L42) 兜底判断 `Array.isArray(payload && payload.banners) ? payload.banners : [默认]` 失效——空数组也是数组，三元判断走 true 分支，直接采用空数组，**不走默认数据**。
4. [pages/home/index.wxml:74](file:///d:/BuyiDictionaryWeb/BuyiDictionaryApp-main/BuyiDictionaryApp-main/pages/home/index.wxml#L74) `wx:if="{{bannerItems.length}}"` 为 false，整个 banner 区域不渲染。

附带问题：即使 banner 非空，后端返回的 banner 对象**缺少 `targetUrl` 字段**，导致 [pages/home/index.js:74](file:///d:/BuyiDictionaryWeb/BuyiDictionaryApp-main/BuyiDictionaryApp-main/pages/home/index.js#L74) `handleBannerTap` 直接 return，点击无法跳转。

## What Changes

### 后端（最小改动，对齐 web 端兜底策略）
- 修改 [backend/src/modules/content/content.service.ts](file:///d:/BuyiDictionaryWeb/BuyiDictionaryApp-main/BuyiDictionaryApp-main/backend/src/modules/content/content.service.ts) 的 `getMiniappHomeData`：
  - **移除** `.filter((item) => !!item.coverUrl)` 过滤（让所有已发布歌曲都成为 banner 候选，取前 5 首）
  - 在 map 中**补充** `targetUrl: '/pages/song/index'` 字段（song 是 tabBar 页面，前端已特殊处理 switchTab）
  - `image` 字段保持 `item.coverUrl`（可能为 null），**不在后端兜底本地路径**，避免后端耦合小程序包内资源路径

### 小程序前端（修复兜底判断 + 图片兜底）
- 修改 [pages/home/index.js](file:///d:/BuyiDictionaryWeb/BuyiDictionaryApp-main/BuyiDictionaryApp-main/pages/home/index.js) 的 `loadHomeData`：
  - 兜底判断从 `Array.isArray(payload && payload.banners)` 改为 `Array.isArray(payload && payload.banners) && payload.banners.length > 0`，空数组走默认数据
  - 拿到 bannerItems 后，对每个 item 的 `image` 字段做兜底：`item.image = item.image || '/assets/images/banner1.jpg'`（对齐 web 端 `coverUrl || imgAmbient` 策略，使用小程序包内已有的 banner1.jpg）
  - catch 分支保持现有默认数据不变

## Impact
- Affected specs: 无既有 spec 受影响（独立变更，不与 `fix-song-metadata-covers-durations` 的封面资源上传冲突）
- Affected code:
  - `BuyiDictionaryApp-main/BuyiDictionaryApp-main/backend/src/modules/content/content.service.ts`（`getMiniappHomeData` 方法）
  - `BuyiDictionaryApp-main/BuyiDictionaryApp-main/pages/home/index.js`（`loadHomeData` 方法）
- 不修改 wxml/wxss（结构已正确，仅数据层问题）
- 不修改数据库（不依赖封面资源上传，前端兜底显示默认图）
- 不影响 web 端（web 端走 `/content/song` 列表接口，不走 `/miniapp/home`）

## ADDED Requirements

### Requirement: 轮播图默认显示
当后端歌曲数据无 `coverUrl` 时，小程序首页轮播图 SHALL 显示默认本地封面图（`/assets/images/banner1.jpg`），不 SHALL 因封面缺失而隐藏整个轮播图区域。

#### Scenario: 后端返回非空 banners 但 coverUrl 为 null
- **WHEN** `/miniapp/home` 返回 `banners: [{ id: 1, title: '会友歌', image: null, ... }]`
- **THEN** 小程序前端将 `image` 兜底为 `/assets/images/banner1.jpg`
- **AND** 轮播图正常渲染该 banner 项

#### Scenario: 后端返回空 banners
- **WHEN** `/miniapp/home` 返回 `banners: []`（如数据库无已发布歌曲）
- **THEN** 小程序前端走默认数据分支，显示 1 条"布依迎客歌"默认 banner
- **AND** 轮播图区域正常渲染

### Requirement: 轮播图点击跳转
后端返回的每个 banner 对象 SHALL 包含 `targetUrl` 字段，指向歌曲详情页。小程序前端点击 banner SHALL 通过 `switchTab` 跳转到 `/pages/song/index`（因 song 是 tabBar 页面）。

#### Scenario: 点击轮播图跳转
- **WHEN** 用户点击任意 banner 项
- **THEN** 调用 `wx.switchTab` 跳转到 `/pages/song/index`
- **AND** 不出现"页面正在建设中"错误提示

## MODIFIED Requirements

### Requirement: 首页轮播图数据来源
后端 `/miniapp/home` 接口 SHALL 将所有已发布歌曲（`isPublished: true`）作为 banner 候选，按 `listOrder` 排序取前 5 首，**不再过滤 `coverUrl` 为空的项**。每个 banner 对象 SHALL 包含：`id`、`contentType`、`title`、`subtitle`、`image`（可能为 null）、`buyiText`、`zhText`、`targetUrl`。

#### Scenario: 数据库歌曲无封面
- **WHEN** 数据库有 5 首已发布歌曲，全部 `coverUrl` 为 null
- **THEN** 后端返回 `banners` 数组包含 5 个对象
- **AND** 每个对象的 `image` 字段为 null
- **AND** 每个对象的 `targetUrl` 为 `/pages/song/index`

#### Scenario: 数据库歌曲部分有封面
- **WHEN** 数据库有 12 首已发布歌曲，其中 2 首 `coverUrl` 非空
- **THEN** 后端返回 `banners` 数组包含前 5 首（按 listOrder 排序），不优先返回有封面的
- **AND** 有封面的项 `image` 为真实 URL，无封面的项 `image` 为 null

## REMOVED Requirements

### Requirement: 过滤无封面歌曲
**Reason**: 导致轮播图完全不显示，与 web 端兜底策略不一致
**Migration**: 前端在数据层对 `image` 为 null 的项做本地默认图兜底，不再依赖后端过滤
