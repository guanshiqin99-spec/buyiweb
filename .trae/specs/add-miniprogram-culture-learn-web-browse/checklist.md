# Checklist

## Web 端词典页浏览全部入口

- [x] Dictionary.vue 筛选区有"浏览全部"按钮，且仅在 activeFilter 为 phrase/proverb 且搜索框为空时可见
- [x] 点击"浏览全部"后调用 contentApi.list(type, {page:1, pageSize:20})，结果以 result-row 列表展示
- [x] 浏览模式下列表项点击能打开右侧 entry-detail 详情面板（与搜索模式行为一致）
- [x] 浏览模式顶部显示"共 X 条，第 N/M 页"且有上一页/下一页按钮
- [x] 在浏览模式下输入搜索词时，自动切回搜索模式并清空浏览结果
- [x] mapBrowseResults 正确适配 list 接口的 {items, total, totalPages} 格式（非 search 的分组格式）
- [x] 浏览模式与搜索模式互斥，不会同时出现两套结果

## 小程序单词卡学习页

- [x] app.json 已注册 pages/learn/index
- [x] 页面加载时调用 contentApi.listByType('dictionary') 拉取词汇
- [x] 卡片正面显示布依语原文 + 音标，点击 3D 翻转显示背面中文 + 英文
- [x] 翻转动画使用 perspective + rotateY + backface-visibility 实现，流畅无闪烁
- [x] 发音按钮调用 InnerAudioContext 播放 audioUrl，再次点击停止，按钮状态切换
- [x] 页面 onUnload 时销毁 InnerAudioContext（不泄漏音频实例）
- [x] 未登录用户点击收藏/复习弹 wx.showToast 提示，不发网络请求
- [x] 登录用户点击"下一词"时当前词写入 view 记录（recordedVisitIds 去重）
- [x] 登录用户点击"复习"写入 review 记录（recordedReviewIds 去重），重复点击提示"已复习过"
- [x] 学习统计条显示连续天数/累计学习/今日三项（来自 History.list stats）

## 小程序文化馆页

- [x] app.json 已注册 pages/culture/index
- [x] utils/tones.js 已从 Web 端复制，六个声调数据完整
- [x] 纹样卡区展示蜡染/斗纹布/铜鼓十二调三张卡，图片正常加载
- [x] 点击纹样卡弹出详情弹窗，显示 summary + detail + sourceTitle
- [x] 详情弹窗底部有"复制出处链接"按钮，点击调用 wx.setClipboardData 复制 sourceUrl
- [x] 复制成功后提示"链接已复制，可到浏览器打开"
- [x] 声调钢琴区有 6 个调键，点击播放对应 wav 音频
- [x] assets/audio/tones/ 下有 6 个调值轮廓 wav 文件（55/11/53/31/24/33）
- [x] 调值曲线图用 canvas 绘制，选中声调时对应轮廓高亮
- [x] 通过 ?slug=xxx 进入时调用 cultureExhibitsApi.detail(slug) 加载关联展项
- [x] 关联展项加载失败时显示提示但不阻塞页面其他内容
- [x] utils/api.js 已新增 cultureExhibitsApi.detail(slug) 方法

## 小程序入口引导

- [x] pages/application 的 feature-grid 有"文化馆"和"单词卡学习"两张卡片
- [x] 点击"文化馆"卡片 wx.navigateTo 跳转至 pages/culture/index
- [x] 点击"单词卡学习"卡片 wx.navigateTo 跳转至 pages/learn/index
- [x] pages/mine 有"单词卡学习"入口项，点击跳转 pages/learn/index

## 现有功能不受影响

- [x] Web 端 Dictionary.vue 原有搜索流程（输入词 → 出结果 → 点详情）行为不变
- [x] Web 端 Culture.vue 和 Learn.vue 不受影响
- [x] 小程序原有页面（phrases/proverbs/vocabulary/query 等）功能不变
- [x] 小程序 app.json 原有页面注册项不受影响，新页面追加在末尾
- [x] 后端无任何接口改动
