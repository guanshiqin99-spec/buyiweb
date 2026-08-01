# 小程序补齐文化馆与单词卡学习 + Web 浏览全部入口 Spec

## Why

经过两端功能对比，发现三类内容消费能力差异：
1. **短语/谚语浏览**：小程序 phrases/proverbs 页可分页浏览全部内容，Web 端 [Dictionary.vue](file:///d:/BuyiDictionaryWeb/buyi-dictionary-vue/src/views/Dictionary.vue) 只能搜索无"浏览全部"入口，这是内容消费能力的实质差异。
2. **文化展厅**：Web 端 [Culture.vue](file:///d:/BuyiDictionaryWeb/buyi-dictionary-vue/src/views/Culture.vue) 蜡染/斗纹布/铜鼓十二调非遗展项带来源标注，是 Web 独有卖点，小程序完全缺失。
3. **单词卡学习**：Web 端 [Learn.vue](file:///d:/BuyiDictionaryWeb/buyi-dictionary-vue/src/views/Learn.vue) 翻转卡 + 发音 + 收藏 + 复习 + 统计闭环，是 Web 独有卖点，小程序完全缺失。微信场景里学习类内容更刚需，应补齐。

本 spec 在**不破坏现有功能**前提下，Web 端补"浏览全部"入口，小程序端补两个新页面（文化馆、单词卡学习），让两端核心能力对齐。

## What Changes

### Web 端：词典页"浏览全部"入口（词典页内切换模式）
- 在 [src/views/Dictionary.vue](file:///d:/BuyiDictionaryWeb/buyi-dictionary-vue/src/views/Dictionary.vue) 筛选区增加"浏览全部"入口按钮
- 无搜索词时点击切换为分页列表模式，复用现有 `contentApi.list('phrase'|'proverb')`（[src/utils/api.js](file:///d:/BuyiDictionaryWeb/buyi-dictionary-vue/src/utils/api.js) 已有）
- 支持短语/谚语类型切换，与筛选 pills 联动
- 列表项复用现有 result-row 样式与详情面板交互
- 新增 `mapBrowseResults` 适配 list 接口返回格式（`{items, total, totalPages}` ≠ search 的 `{dictionary, phrases, proverbs}`）

### 小程序端：新增单词卡学习页（pages/learn/index）
- 新建 pages/learn/index 页面，[app.json](file:///d:/BuyiDictionaryWeb/BuyiDictionaryApp-main/BuyiDictionaryApp-main/app.json) 注册
- 翻转卡片：WXSS 3D `transform: rotateY` + `backface-visibility`，正面布依语+音标，背面中文+英文
- 真人发音：复用 [pages/vocabulary/index.js](file:///d:/BuyiDictionaryWeb/BuyiDictionaryApp-main/BuyiDictionaryApp-main/pages/vocabulary/index.js) 的 `InnerAudioContext` 封装
- 底部四按钮：发音/收藏/复习/下一词
- 学习统计条：连续天数/累计学习/今日（`History.list` stats）
- view/review 记录去重（对齐 Web Learn.vue 策略）
- 登录门槛：不登录可翻卡看内容，收藏/复习弹"请先登录"

### 小程序端：新增文化馆页（pages/culture/index）
- 新建 pages/culture/index 页面，app.json 注册
- 声调数据：复制 Web [src/data/tones.js](file:///d:/BuyiDictionaryWeb/buyi-dictionary-vue/src/data/tones.js) 到小程序 `utils/tones.js`
- 声调发声：预生成 6 个短 wav 音频文件（55/11/53/31/24/33 调值轮廓），放 `assets/audio/tones/`，用 `InnerAudioContext` 播放
- 声调钢琴：WXML/WXSS 组件，6 个调键，点击播放对应音频
- 调值曲线图：canvas 重绘（Web 端 SVG 改 canvas）
- 纹样卡：3 张静态卡（蜡染/斗纹布/铜鼓十二调），图片从 Web 端 `src/assets/images/` 拷贝到小程序 `assets/images/`
- 关联展品：[utils/api.js](file:///d:/BuyiDictionaryWeb/BuyiDictionaryApp-main/BuyiDictionaryApp-main/utils/api.js) 补 `cultureExhibitsApi.detail(slug)`
- 出处链接：复制链接方案（`wx.setClipboardData`），不跳转外部网页（规避 web-view 业务域名限制）

### 小程序端：入口引导
- [pages/application/index.wxml](file:///d:/BuyiDictionaryWeb/BuyiDictionaryApp-main/BuyiDictionaryApp-main/pages/application/index.wxml) 增加"文化馆"和"单词卡学习"两张卡片
- [pages/mine/index.wxml](file:///d:/BuyiDictionaryWeb/BuyiDictionaryApp-main/BuyiDictionaryApp-main/pages/mine/index.wxml) 增加学习入口

## Impact

- **Affected specs**: 无（独立新增功能，不修改既有 spec）
- **Affected code**:
  - Web 端：`src/views/Dictionary.vue`（新增浏览模式逻辑与 UI）
  - 小程序端新增：`pages/learn/`、`pages/culture/`、`utils/tones.js`、`assets/audio/tones/*.wav`、`assets/images/` 拷贝图片
  - 小程序端修改：`app.json`（注册页面）、`pages/application/index.wxml` + `.js`、`pages/mine/index.wxml` + `.js`、`utils/api.js`（补 cultureExhibitsApi）
  - 后端：无改动（`/miniapp/culture-exhibits/:slug` 接口已存在）

## ADDED Requirements

### Requirement: Web 端词典页浏览全部入口

Web 端 Dictionary.vue SHALL 在筛选区提供"浏览全部"入口按钮，当筛选类型为 phrase 或 proverb 且无搜索词时可见，点击后切换为分页列表模式展示该类型全部内容。

#### Scenario: 用户浏览全部短语
- **WHEN** 用户清空搜索框，筛选类型选"短语"，点击"浏览全部"按钮
- **THEN** 调用 `contentApi.list('phrase', { page: 1, pageSize: 20 })` 拉取第一页
- **AND** 结果区以 result-row 列表形式展示，点击列表项同样打开详情面板
- **AND** 顶部显示"共 X 条，第 1/Y 页"，支持翻页

#### Scenario: 浏览模式与搜索模式互斥
- **WHEN** 用户在浏览模式下输入搜索词
- **THEN** 自动退出浏览模式，回到搜索流程
- **AND** 浏览结果清空，执行搜索

#### Scenario: 浏览模式分页
- **WHEN** 用户在浏览模式下点击"下一页"
- **THEN** 调用 `contentApi.list(type, { page: nextPage })` 拉取下一页
- **AND** 列表替换为新页数据，selectedId 重置为第一条

### Requirement: 小程序单词卡学习页

小程序 SHALL 新增 pages/learn/index 页面，提供翻转卡片式词汇学习，包含发音、收藏、复习、统计闭环。

#### Scenario: 用户翻卡学习
- **WHEN** 用户进入学习页，点击卡片
- **THEN** 卡片以 3D 翻转动画显示背面（中文/英文释义）
- **AND** 正面显示布依语原文与音标

#### Scenario: 播放真人发音
- **WHEN** 用户点击"发音"按钮
- **THEN** 使用 `InnerAudioContext` 播放当前词条的 audioUrl
- **AND** 再次点击停止播放，按钮状态切换

#### Scenario: 未登录用户尝试收藏
- **WHEN** 未登录用户点击"收藏"或"复习"按钮
- **THEN** 弹出 `wx.showToast` 提示"请先登录后再收藏/复习"
- **AND** 不发起网络请求

#### Scenario: 登录用户切换下一词
- **WHEN** 登录用户点击"下一词"
- **THEN** 当前词写入 view 记录（本会话去重），索引前进一位
- **AND** 统计条今日+1，累计+1

#### Scenario: 标记复习
- **WHEN** 登录用户点击"复习"
- **THEN** 写入 review 记录（本会话同词去重）
- **AND** 提示"已加入复习清单"，重复点击提示"已复习过，无需重复添加"

### Requirement: 小程序文化馆页

小程序 SHALL 新增 pages/culture/index 页面，包含声调体验（钢琴+曲线图）和纹样展项（带来源标注），对齐 Web 端 Culture.vue 能力。

#### Scenario: 用户体验声调钢琴
- **WHEN** 用户在文化馆页点击某个声调键
- **THEN** 播放对应预生成 wav 音频
- **AND** 调值曲线图高亮该声调轮廓

#### Scenario: 用户查看纹样展项
- **WHEN** 用户点击"蜡染纹样"/"斗纹布"/"铜鼓十二调"卡片
- **THEN** 弹出详情弹窗，展示 summary + detail + sourceTitle
- **AND** 底部显示"复制出处链接"按钮

#### Scenario: 复制出处链接
- **WHEN** 用户点击"复制出处链接"
- **THEN** 调用 `wx.setClipboardData` 复制 sourceUrl
- **AND** 提示"链接已复制，可到浏览器打开"

#### Scenario: 加载关联展项
- **WHEN** 文化馆页通过 query 参数 `?slug=xxx` 进入
- **THEN** 调用 `cultureExhibitsApi.detail(slug)` 拉取关联展项
- **AND** 失败时显示"关联展项暂时无法载入"但不阻塞页面其他内容

### Requirement: 小程序入口引导

小程序 SHALL 在"应用"导航中心和"我的"页提供文化馆与单词卡学习的入口。

#### Scenario: 用户从应用中心进入
- **WHEN** 用户在 pages/application 点击"文化馆"卡片
- **THEN** `wx.navigateTo` 跳转至 pages/culture/index

#### Scenario: 用户从我的页进入
- **WHEN** 用户在 pages/mine 点击"单词卡学习"入口
- **THEN** `wx.navigateTo` 跳转至 pages/learn/index

## MODIFIED Requirements

### Requirement: app.json 页面注册

[app.json](file:///d:/BuyiDictionaryWeb/BuyiDictionaryApp-main/BuyiDictionaryApp-main/app.json) 的 pages 数组 SHALL 新增 `pages/learn/index` 和 `pages/culture/index` 两条注册项，位置放在 pages/quiz/index 之后、pages/setting/index 之前，保持工具类页面聚集。

### Requirement: Dictionary.vue 查询流程

Dictionary.vue SHALL 支持两种数据获取模式：
1. **搜索模式**（现有）：有搜索词时调用 `searchApi.search`，结果按 dictionary/phrases/proverbs 分组映射
2. **浏览模式**（新增）：无搜索词且用户主动点击"浏览全部"时调用 `contentApi.list`，结果为单一类型分页列表

两种模式通过 `requestMode` 状态（'search' | 'browse'）区分，互斥切换，复用同一 result-list 与 entry-detail UI。

## REMOVED Requirements

无。本 spec 仅新增功能，不移除任何现有能力。
