# 小程序页面重复标题优化方案 - The Implementation Plan

## [x] Task 1: 首页标题优化 - 清空导航栏标题
- **Priority**: high
- **Depends On**: None
- **Description**: 
  - 修改首页 `pages/home/index.wxml` 中的 `custom-nav` 组件，清空 `title` 属性
  - 保留页面主体 Hero 区的"布依语词典"大标题和副标题
- **Acceptance Criteria Addressed**: AC-1
- **Test Requirements**:
  - `programmatic` TR-1.1: 首页 `custom-nav` 的 `title` 属性为空字符串或省略
  - `programmatic` TR-1.2: 页面主体保留 `<text class="text-h1 hero-title">布依语词典</text>`
  - `human-judgement` TR-1.3: 首页导航栏区域无重复的"布依语词典"文字

## [x] Task 2: 常用语页标题优化 - 移除页面大标题
- **Priority**: high
- **Depends On**: None
- **Description**: 
  - 修改 `pages/phrases/index.wxml`，移除页面主体中的"常用语"大标题
  - 保留导航栏标题"常用语"
  - 保留副标题"高频实用的日常交流短句"，调整样式使其成为辅助说明
- **Acceptance Criteria Addressed**: AC-2
- **Test Requirements**:
  - `programmatic` TR-2.1: 页面不包含 `<text class="text-h1">常用语</text>`
  - `programmatic` TR-2.2: `custom-nav` 仍设置 `title="常用语"`
  - `human-judgement` TR-2.3: 页面副标题保留，且视觉层次合理

## [x] Task 3: 学习记录页标题优化 - 移除页面大标题
- **Priority**: high
- **Depends On**: None
- **Description**: 
  - 修改 `pages/record/index.wxml`，移除页面主体中的"学习记录"大标题
  - 保留导航栏标题"学习记录"
  - 保留"清空全部"按钮位置
- **Acceptance Criteria Addressed**: AC-3
- **Test Requirements**:
  - `programmatic` TR-3.1: 页面不包含 `<text class="text-h1">学习记录</text>`
  - `programmatic` TR-3.2: `custom-nav` 仍设置 `title="学习记录"`
  - `human-judgement` TR-3.3: "清空全部"按钮位置合理，不影响操作

## [x] Task 4: 谚语页标题优化 - 清空导航栏标题
- **Priority**: high
- **Depends On**: None
- **Description**: 
  - 修改 `pages/proverbs/index.wxml`，清空 `custom-nav` 的 `title` 属性
  - 保留页面主体的"趣味谚语"大标题和副标题
- **Acceptance Criteria Addressed**: AC-4
- **Test Requirements**:
  - `programmatic` TR-4.1: `custom-nav` 的 `title` 属性为空字符串
  - `programmatic` TR-4.2: 页面保留 `<text class="text-h1">趣味谚语</text>`
  - `human-judgement` TR-4.3: 页面大标题"趣味谚语"在视觉上足够突出

## [x] Task 5: 词汇发音页标题优化 - 清空导航栏标题
- **Priority**: high
- **Depends On**: None
- **Description**: 
  - 修改 `pages/vocabulary/index.wxml`，清空 `custom-nav` 的 `title` 属性
  - 保留页面主体的"词汇发音"大标题和副标题
- **Acceptance Criteria Addressed**: AC-5
- **Test Requirements**:
  - `programmatic` TR-5.1: `custom-nav` 的 `title` 属性为空字符串
  - `programmatic` TR-5.2: 页面保留 `<text class="text-h1">词汇发音</text>`
  - `human-judgement` TR-5.3: 页面大标题"词汇发音"在视觉上足够突出

## [x] Task 6: 文化馆页标题优化 - 清空导航栏标题
- **Priority**: high
- **Depends On**: None
- **Description**: 
  - 修改 `pages/culture/index.wxml`，清空 `custom-nav` 的 `title` 属性
  - 保留页面主体的"布依语文化馆"大标题和描述文字
- **Acceptance Criteria Addressed**: AC-6
- **Test Requirements**:
  - `programmatic` TR-6.1: `custom-nav` 的 `title` 属性为空字符串
  - `programmatic` TR-6.2: 页面保留 `<text class="hero-title">布依语文化馆</text>`
  - `human-judgement` TR-6.3: 页面大标题"布依语文化馆"在视觉上足够突出

## [x] Task 7: 验证其他页面保持不变
- **Priority**: medium
- **Depends On**: Task 1-6
- **Description**: 
  - 验证收藏、应用、单词卡学习、查词、我的、民歌页面未被修改
  - 确认这些页面的导航栏和标题保持原样
- **Acceptance Criteria Addressed**: AC-7
- **Test Requirements**:
  - `programmatic` TR-7.1: 收藏页面 `custom-nav title="收藏"` 保持不变
  - `programmatic` TR-7.2: 应用页面 `custom-nav title="应用"` 保持不变
  - `programmatic` TR-7.3: 单词卡学习页面 `custom-nav title="单词卡学习"` 保持不变
  - `programmatic` TR-7.4: 查词页面 `custom-nav title="查词"` 保持不变
  - `programmatic` TR-7.5: 我的页面 `custom-nav title="我的"` 保持不变
  - `programmatic` TR-7.6: 民歌页面 `custom-nav title=""` 保持不变

## [x] Task 8: 视觉一致性验证
- **Priority**: medium
- **Depends On**: Task 1-6
- **Description**: 
  - 检查所有优化页面的导航栏与内容区域视觉分离
  - 确保标题层级清晰，无视觉混乱
  - 验证深色模式兼容性
- **Acceptance Criteria Addressed**: AC-8
- **Test Requirements**:
  - `human-judgement` TR-8.1: 每个页面导航栏与内容区域有明确视觉分隔
  - `human-judgement` TR-8.2: 标题层级清晰，主次分明
  - `human-judgement` TR-8.3: 深色模式下标题依然清晰可读
