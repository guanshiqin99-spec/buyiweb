# Tasks

## 小程序端：单词卡学习页（基建全有，成本最低，优先做）

- [x] Task 1: 新建 pages/learn/index 单词卡学习页面
  - [x] SubTask 1.1: 在 app.json 注册 pages/learn/index（位置在 pages/quiz/index 之后）
  - [x] SubTask 1.2: 创建 pages/learn/index.js，照 [Learn.vue](file:///d:/BuyiDictionaryWeb/buyi-dictionary-vue/src/views/Learn.vue) 逻辑实现：contentApi.listByType('dictionary') 拉词、currentIndex 切换、isFlipped 翻转、view/review 记录去重（recordedVisitIds/recordedReviewIds 两个 Set）
  - [x] SubTask 1.3: 创建 pages/learn/index.wxml，结构：学习统计条 + 进度条 + 翻转卡片容器（card-front 正面布依语+音标 / card-back 背面中文+英文）+ 底部四按钮（发音/收藏/复习/下一词）
  - [x] SubTask 1.4: 创建 pages/learn/index.wxss，实现 3D 翻转（perspective + transform-style: preserve-3d + backface-visibility: hidden + rotateY），复用 [pages/vocabulary/index.wxss](file:///d:/BuyiDictionaryWeb/BuyiDictionaryApp-main/BuyiDictionaryApp-main/pages/vocabulary/index.wxss) 的卡片与按钮样式基调
  - [x] SubTask 1.5: 发音功能复用 [pages/vocabulary/index.js](file:///d:/BuyiDictionaryWeb/BuyiDictionaryApp-main/BuyiDictionaryApp-main/pages/vocabulary/index.js) 的 InnerAudioContext 封装（initAudio/playAtIndex/onUnload 销毁）
  - [x] SubTask 1.6: 登录门槛处理：getApp().globalData.isLogin 判断，未登录点击收藏/复习弹 wx.showToast('请先登录后再收藏/复习')，不发请求

## 小程序端：关联展项 API（半小时，文化馆依赖项，可并行）

- [x] Task 2: 在 utils/api.js 补 cultureExhibitsApi
  - [x] SubTask 2.1: 在 [utils/api.js](file:///d:/BuyiDictionaryWeb/BuyiDictionaryApp-main/BuyiDictionaryApp-main/utils/api.js) 新增 cultureExhibitsApi.detail(slug)，调用 GET /miniapp/culture-exhibits/:slug（接口已存在）

## 小程序端：文化馆页（分纹样区与声调区，纹样区优先）

- [x] Task 3: 新建 pages/culture/index 文化馆页面骨架与纹样区
  - [x] SubTask 3.1: 在 app.json 注册 pages/culture/index
  - [x] SubTask 3.2: 复制 Web [src/data/tones.js](file:///d:/BuyiDictionaryWeb/buyi-dictionary-vue/src/data/tones.js) 到小程序 utils/tones.js（纯静态数据，六个声调 55/11/53/31/24/33）
  - [x] SubTask 3.3: 拷贝 Web 端图片 bouyei-batik-atmosphere.png、bouyei-nature.jpg、bouyei-craft.jpg 到小程序 assets/images/
  - [x] SubTask 3.4: 创建 pages/culture/index.js，内含 patterns 数据（蜡染/斗纹布/铜鼓十二调三张卡的 title/label/summary/detail/sourceTitle/sourceUrl，照 [Culture.vue](file:///d:/BuyiDictionaryWeb/buyi-dictionary-vue/src/views/Culture.vue#L46-L80) 的静态数据搬）+ openPattern/closePattern + copySourceUrl（wx.setClipboardData）
  - [x] SubTask 3.5: 创建 pages/culture/index.wxml，结构：hero 区 + 纹样卡网格（3 张卡，点击弹详情）+ 详情弹窗（summary + detail + sourceTitle + 复制链接按钮）+ 声调区占位
  - [x] SubTask 3.6: 创建 pages/culture/index.wxss，纹样卡与弹窗样式

- [x] Task 4: 文化馆声调区（声调钢琴 + 发声 + 曲线图）
  - [x] SubTask 4.1: 预生成 6 个调值轮廓 wav 文件（55/11/53/31/24/33，每个几百毫秒），放 assets/audio/tones/。可用 Node 脚本基于 Web [toneSynth.js](file:///d:/BuyiDictionaryWeb/buyi-dictionary-vue/src/utils/toneSynth.js) 的频率参数生成，或用 Web 端 WebAudio 离线渲染导出
  - [x] SubTask 4.2: 在 pages/culture/index.js 补声调钢琴逻辑：tones 数据加载、selectedToneIndex、playTone(index) 用 InnerAudioContext 播放对应 wav、onUnload 销毁
  - [x] SubTask 4.3: 在 pages/culture/index.wxml 补声调钢琴区（6 个调键按钮，显示调值数字，点击播放）+ canvas 调值曲线图
  - [x] SubTask 4.4: 用 canvas 2d 重绘调值曲线（Web 端 [ToneChart.vue](file:///d:/BuyiDictionaryWeb/buyi-dictionary-vue/src/components/specific/ToneChart.vue) 的 SVG 逻辑改为 canvas 绘制：6 条起止频率连线，选中高亮）
  - [x] SubTask 4.5: 关联展项加载：onLoad 读 options.slug，调 cultureExhibitsApi.detail(slug)，失败显示 linkedExhibitError 不阻塞

## 小程序端：入口引导

- [x] Task 5: 在 pages/application 和 pages/mine 加入口
  - [x] SubTask 5.1: 在 [pages/application/index.wxml](file:///d:/BuyiDictionaryWeb/BuyiDictionaryApp-main/BuyiDictionaryApp-main/pages/application/index.wxml) feature-grid 增加"文化馆"和"单词卡学习"两张卡片
  - [x] SubTask 5.2: 在 pages/application/index.js 补 goToCulture / goToLearn 跳转方法（wx.navigateTo）
  - [x] SubTask 5.3: 在 [pages/mine/index.wxml](file:///d:/BuyiDictionaryWeb/BuyiDictionaryApp-main/BuyiDictionaryApp-main/pages/mine/index.wxml) 增加"单词卡学习"入口项
  - [x] SubTask 5.4: 在 pages/mine/index.js 补 goToLearn 跳转方法

## Web 端：词典页浏览全部入口

- [x] Task 6: Dictionary.vue 新增浏览模式
  - [x] SubTask 6.1: 在 [Dictionary.vue](file:///d:/BuyiDictionaryWeb/buyi-dictionary-vue/src/views/Dictionary.vue) script 增加 requestMode（'search' | 'browse'）、browsePage、browseTotalPages 状态
  - [x] SubTask 6.2: 新增 mapBrowseResults 函数，适配 contentApi.list 返回的 {items, total, totalPages} 格式（与 mapResults 的 {dictionary,phrases,proverbs} 不同）
  - [x] SubTask 6.3: 新增 runBrowse(page) 方法，调用 contentApi.list(activeFilter, {page, pageSize:20})，结果走 mapBrowseResults
  - [x] SubTask 6.4: 在筛选区 UI 增加"浏览全部"按钮，仅当 activeFilter 为 phrase/proverb 且 searchQuery 为空时可见
  - [x] SubTask 6.5: 浏览模式与搜索模式互斥：searchQuery 变化时自动切回 search 模式并清空浏览结果
  - [x] SubTask 6.6: 浏览模式分页 UI：顶部显示"共 X 条，第 N/M 页"+ 上一页/下一页按钮
  - [x] SubTask 6.7: 浏览结果复用 result-row 列表与 entry-detail 详情面板交互

# Task Dependencies

- Task 4（声调区）依赖 Task 3（文化馆骨架）完成
- Task 3 的 SubTask 3.4（关联展项）依赖 Task 2（cultureExhibitsApi）完成，但纹样区不依赖，可先行
- Task 1（单词卡）、Task 2（API）、Task 3 纹样区部分、Task 6（Web 浏览）相互无依赖，可并行
- Task 5（入口）依赖 Task 1 和 Task 3 页面存在后才有意义，但代码可先写
