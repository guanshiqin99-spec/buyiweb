# AI 语音跟读评测（发音闯关）Spec

## Why

布依语是濒危语言，现有应用只能"看"和"听"（词典、音频、选择题 Quiz），缺少"开口说"的闭环。本项目新增 AI 语音跟读评测：用户跟读布依语词句 → ASR 语音识别 → 与目标文本做发音相似度打分，并与 Quiz 融合成"发音闯关"模式。发音题素材直接来自真实词典/短语数据，同时补上 Quiz 依赖 AI 出题、无常驻题库的短板（一箭双雕）。

答辩叙事：**"AI 帮助抢救濒危语言的最后一环——开口说。"**

## 总体设计

```
用户看布依语词句（buyiText 拉丁拼写 + 中文释义）
  → 点击"开始跟读"，录音并 ASR 识别
      小程序：微信同声传译插件（免费，lang=zh_CN，返回汉字）
      Web 端：Web Speech API（SpeechRecognition，lang=zh-CN，返回汉字）
  → POST /api/miniapp/pronunciation/score { targetText, recognizedText }
  → 后端统一评分：pinyin-pro 将识别汉字转无声调拼音
      → 与 buyiText 拉丁拼写规范化（小写、去标点、按空格切音节）
      → 音节级 Levenshtein 编辑距离 → similarity = 1 - dist/max(len)
      → score = round(similarity × 100)（百分制）
  → 前端展示得分 + 识别内容 + 分档反馈
  → 闯关结束：成绩复用 quiz-attempts 持久化（mode='pronunciation'）
```

评分逻辑放后端的原因：两端（小程序/Web）算法完全一致、可单元测试、可答辩演示"AI 打分"能力；后端已内置 `pinyin-pro@^3.27.0` 依赖，无需新增包。

## What Changes

### 后端（NestJS，`BuyiDictionaryApp-main/BuyiDictionaryApp-main/backend`）

- 新增 `miniapp-pronunciation` 模块：
  - `GET /miniapp/pronunciation/questions?count=5`：从 `dictionary_entries` + `phrases` 随机抽取已发布、适合跟读的条目（`buyiText` 音节数 ≤ 4 且长度 ≤ 24 字符），返回 `{ items: [{ id, kind, buyiText, zhText, description, audioUrl }] }`（`audioUrl` 仅词典词条可能有，用于"听标准发音"）。无需登录。
  - `POST /miniapp/pronunciation/score`：入参 `{ targetText, recognizedText }`，出参 `{ score(0-100), similarity(0-1), feedback, targetSyllables, recognizedSyllables }`。无需登录（游客可练）。评分 service 独立成纯函数便于单测。
- `QuizAttempt` 实体新增 `mode` 列（`varchar(20)`，默认 `'culture'`），新增 migration（SQLite 风格 `ALTER TABLE ... ADD COLUMN`，与现有 `1722000000000-add-quiz-attempts.ts` 一致）。
- `CreateQuizAttemptDto` 新增可选 `mode` 字段（`'culture' | 'pronunciation'`，缺省 `'culture'`）；`MiniappQuizService.create` 增加分支校验：
  - `culture`（默认）：保持现有逻辑不变（`score === correctCount × 10`）。
  - `pronunciation`：`answers` 每项含 `points`（0-10 整数，`round(similarity×10)`）与 `correct`（`points >= 6`），校验 `score === Σpoints` 且 `correctCount === 通过题数`。
  - `serialize` 返回 `mode`；answers 明细 sanitizer 扩展保留 `type/points/similarity/recognizedText`（均截断），敏感/超长内容照旧裁剪。
- `app.module.ts` 注册新模块。

### Web 端（Vue 3，`buyi-dictionary-vue`）

- 新增 `src/views/Pronunciation.vue` 页面 + 路由 `/pronunciation`（无需登录），页面结构与 `Quiz.vue` 对齐（intro → question → result 三阶段，复用全局样式变量）：
  - 能力检测：`window.SpeechRecognition || window.webkitSpeechRecognition`，不支持时 intro 提示"请使用 Chrome / Edge 浏览器"并禁用开始按钮。
  - 每题展示 `buyiText`（大字号）+ `zhText`；有 `audioUrl` 时提供"听发音"按钮（`<audio>` 播放）。
  - "开始跟读"：`recognition.start()`，`lang='zh-CN'`、`interimResults=true` 实时显示中间结果；`onresult` 取 final 文本后调评分接口。
  - 麦克风权限被拒：捕获错误并提示到浏览器设置中开启。
  - 结果反馈：百分制分数、相似度、识别出的内容、分档文案（≥90 发音标准 / ≥75 不错 / ≥60 接近 / <60 再试一次）。
  - 结束页：每题 `round(similarity×10)` 计分、总分与通过题数；保存到 `localStorage('buyi_pronunciation_attempts')`（保留 20 条），登录态再同步 `quizApi.create({ mode:'pronunciation', ... })`（复用现有接口与每日任务联动 `notifyUserProgressUpdated('quiz','quiz')`）。
- `src/utils/api.js` 新增 `pronunciationApi`（`questions()`、`score(data)`），复用现有 axios 实例。
- `src/views/Quiz.vue` intro 增加次按钮"发音闯关 →"（RouterLink 至 `/pronunciation`），说明文案一句。
- （可选，低优先）`Record.vue` 对 `mode='pronunciation'` 的成绩显示"发音闯关"标签。

### 小程序端（`BuyiDictionaryApp-main/BuyiDictionaryApp-main`）

- `app.json`：
  - `pages` 注册新页面 `pages/pronunciation/index`。
  - 新增 `plugins` 段声明微信同声传译插件：`"WechatSI": { "version": "0.3.5", "provider": "wx069ba97219f66d99" }`（版本以微信插件市场最新为准）。
  - **运营前提（非代码）**：需在微信公众平台后台"设置-第三方设置-插件管理"中申请添加"同声传译"插件（免费）。
- 新页面 `pages/pronunciation/index.*`（js/wxml/wxss/json），风格对齐现有 Quiz 页（复用 `card/btn/porcelain-bg-page` 等公共样式与 `custom-nav` 组件）：
  - 录音识别：`requirePlugin('WechatSI').getRecordRecognitionManager()`，`start({ duration: 6000, lang: 'zh_CN' })`；`onRecognize` 展示中间结果、`onStop` 取最终结果调评分接口、`onError` 兜底提示。
  - 录音授权：`wx.authorize({ scope: 'scope.record' })`，拒绝时引导 `wx.openSetting`。
  - 有 `audioUrl` 时用 `wx.createInnerAudioContext()` 提供"听发音"。
  - 结束保存：`wx.setStorageSync('pronunciationAttempts')`（保留 20 条），登录态 `quizApi.create({ mode:'pronunciation', ... })`，并触发 `notifyUserProgressUpdated('quiz','quiz')`。
- `utils/api.js` 新增 `pronunciationApi`（`questions()`、`score(payload)`），复用现有 `get/post` 封装（云函数 `apiProxy` 为通用路径转发，新接口自动透传，无需改动云函数）。
- `pages/quiz/index.wxml` intro 增加次按钮"发音闯关"→ `wx.navigateTo('/pages/pronunciation/index')`。

## Impact

- Affected specs: 无（新能力，不与其他 spec 冲突）。
- Affected code:
  - 后端：`src/modules/miniapp-pronunciation/**`（新增）、`src/entities/quiz-attempt.entity.ts`、`src/modules/miniapp-quiz/**`、`src/migrations/**`、`src/app.module.ts`
  - Web：`src/views/Pronunciation.vue`（新增）、`src/views/Quiz.vue`、`src/utils/api.js`、`src/router/index.js`
  - 小程序：`pages/pronunciation/index.*`（新增）、`pages/quiz/index.wxml`、`utils/api.js`、`app.json`
- 不修改现有文化答题（culture 模式）任何前后端行为，`mode` 缺省 `'culture'` 完全向后兼容，旧客户端成绩照常提交。
- 无 **BREAKING** 变更。

## ADDED Requirements

### Requirement: 发音题库接口
系统 SHALL 提供 `GET /miniapp/pronunciation/questions`，从已发布的词典词条与短语中随机抽取适合跟读的布依语素材（音节数 ≤ 4、拼写长度 ≤ 24），每题含布依语拼写、中文释义及可选标准发音音频地址，游客可访问。

#### Scenario: 正常抽题
- **WHEN** 客户端请求 `?count=5`
- **THEN** 返回 5 道不重复的发音题（id/kind/buyiText/zhText/description/audioUrl）

#### Scenario: 参数越界
- **WHEN** `count` 缺省或非法
- **THEN** 使用默认值 5，并限制在 1-10 区间，不报错

### Requirement: 发音相似度评分
系统 SHALL 提供 `POST /miniapp/pronunciation/score`，将 ASR 识别出的汉字文本经 pinyin-pro 转为无声调拼音后，与目标布依语拉丁拼写做音节级编辑距离比较，返回百分制分数、相似度、分档反馈与双方音节序列。

#### Scenario: 完全匹配
- **WHEN** targetText 为 `na`，识别结果为汉字"那"（拼音 na）
- **THEN** similarity=1、score=100、feedback 为"发音标准"档

#### Scenario: 未识别到语音
- **WHEN** recognizedText 为空或纯标点
- **THEN** score=0、similarity=0，feedback 提示"没有听清，请再试一次"，接口不报错

#### Scenario: 部分匹配
- **WHEN** 目标 `mang bai rux`，识别出"芒摆如"（mang bai ru）
- **THEN** similarity 介于 0-1 之间，score 与分档反馈与相似度一致

### Requirement: 发音闯关（Web 端）
Web 端 SHALL 提供 `/pronunciation` 发音闯关页面：展示布依语词句 → Web Speech API 录音识别 → 调后端评分 → 逐题反馈，结束展示总分并保存成绩（本地 + 登录后同步）。不支持语音识别的浏览器 SHALL 明确提示并禁用入口。

#### Scenario: Chrome 完整闯关
- **WHEN** 用户在 Chrome 打开发音闯关，完成 5 题跟读
- **THEN** 每题显示得分与反馈，结束页展示总分（每题 round(similarity×10) 分），成绩保存并（登录态）同步账号

#### Scenario: 浏览器不支持
- **WHEN** 浏览器无 SpeechRecognition API
- **THEN** 页面提示"请使用 Chrome / Edge 浏览器"，开始按钮禁用，不白屏不报错

### Requirement: 发音闯关（小程序端）
小程序端 SHALL 提供 `pages/pronunciation/index` 发音闯关页面：微信同声传译插件录音识别 → 调后端评分 → 逐题反馈与总分保存。录音权限被拒 SHALL 引导用户前往设置开启；插件初始化失败 SHALL 友好提示且不影响 Quiz 原功能。

#### Scenario: 正常跟读
- **WHEN** 用户授权麦克风并对着词卡跟读
- **THEN** 实时显示识别中间结果，松手/停止后显示得分、识别内容与分档反馈

#### Scenario: 拒绝录音授权
- **WHEN** 用户拒绝 `scope.record`
- **THEN** 弹窗引导前往设置开启，页面不崩溃

### Requirement: Quiz 发音闯关入口
两端 Quiz 页 intro SHALL 提供"发音闯关"入口按钮，跳转各自发音闯关页面；原"文化答题"入口与流程不受影响。

#### Scenario: 从 Quiz 进入发音闯关
- **WHEN** 用户在 Quiz 首页点击"发音闯关"
- **THEN** 跳转发音闯关页面（Web `/pronunciation`，小程序 `pages/pronunciation/index`）

## MODIFIED Requirements

### Requirement: 答题成绩提交校验（/miniapp/quiz-attempts）
原逻辑：`score` 必须等于 `correctCount × 10`，answers 仅含选择题字段。
修改后：`CreateQuizAttemptDto` 增加可选 `mode`（缺省 `'culture'`）。`culture` 模式保持原校验不变；`pronunciation` 模式校验 `score === Σ answers[i].points`（points 为 0-10 整数）且 `correctCount === points≥6 的题数`。明细 sanitizer 额外保留发音题字段（type/points/similarity/recognizedText，均截断限长）。`serialize` 输出 `mode` 字段；历史数据 `mode` 为默认值 `'culture'`。

#### Scenario: 旧客户端提交（向后兼容）
- **WHEN** 不带 `mode` 字段提交选择题成绩
- **THEN** 走原校验逻辑，行为与线上完全一致

#### Scenario: 发音闯关成绩提交
- **WHEN** 提交 `{ mode:'pronunciation', score:38, correctCount:4, totalQuestions:5, answers:[{ points:8, correct:true, ... }, ...] }` 且 Σpoints=38
- **THEN** 保存成功，明细与 mode 正确落库

#### Scenario: 发音成绩造假校验
- **WHEN** pronunciation 模式 `score` 与 Σpoints 不符
- **THEN** 返回 400"答题成绩与答案明细不一致"

## REMOVED Requirements

无。
