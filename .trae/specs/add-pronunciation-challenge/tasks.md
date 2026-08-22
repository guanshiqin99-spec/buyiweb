# Tasks

## 后端（可并行：Task 1 与 Task 2 互不依赖）

- [x] Task 1: 后端发音评分与题库模块：新增 `miniapp-pronunciation` 模块（controller + service + module），提供题库随机抽取与发音相似度评分两个接口
  - [x] 1.1 评分核心：用 pinyin-pro（已在依赖中）将识别汉字转无声调拼音，与 buyiText 规范化（小写、去标点、按空格切音节）后做音节级 Levenshtein，产出 similarity/score(0-100)/分档 feedback/双方音节序列；纯函数独立可测
  - [x] 1.2 `GET /miniapp/pronunciation/questions?count=5`：union 抽取已发布且 buyiText 音节数 ≤4、长度 ≤24 的 dictionary_entries 与 phrases 随机条目，count 钳制在 1-10，无需登录
  - [x] 1.3 `POST /miniapp/pronunciation/score`：DTO 校验（targetText/recognizedText 非空限长），空识别返回 score 0 而非报错，无需登录
  - [x] 1.4 在 app.module.ts 注册模块；评分函数编写 jest 单测（精确匹配 / 空识别 / 部分匹配 / 多音节）
- [x] Task 2: quiz-attempts 支持发音闯关模式：扩展实体、迁移与提交校验，保持 culture 模式完全向后兼容
  - [x] 2.1 QuizAttempt 实体新增 `mode` 列（varchar(20)，默认 'culture'），新增 migration（ADD COLUMN 风格对齐现有 migration；时间戳最终采用 1731000000000 以避免与既有未注册 migration 撞号）
  - [x] 2.2 CreateQuizAttemptDto 新增可选 `mode`；service.create 按 mode 分支校验：culture 保持 `score===correctCount×10` 原逻辑；pronunciation 校验 `score===Σpoints`（points 0-10）且 `correctCount===points≥6 题数`
  - [x] 2.3 answers 明细 sanitizer 扩展保留 type/points/similarity/recognizedText（截断限长），另保留 buyiText/zhText 便于学习记录回看；serialize 返回 mode
  - [x] 2.4 补充/更新 service 单测覆盖两种 mode 与造假拒绝场景

## 前端（依赖 Task 1/2 完成后联调）

- [x] Task 3: Web 端发音闯关页面：新增 Pronunciation.vue + 路由 + API 封装
  - [x] 3.1 `src/utils/api.js` 新增 pronunciationApi（questions/score）
  - [x] 3.2 `src/views/Pronunciation.vue`：intro/question/result 三阶段，样式对齐 Quiz.vue；SpeechRecognition 能力检测（不支持时禁用并提示使用 Chrome/Edge）
  - [x] 3.3 跟读交互：lang=zh-CN、interimResults 实时显示中间结果；final 后调评分接口，展示百分制得分、识别内容、音节对比与分档反馈；麦克风权限被拒友好提示
  - [x] 3.4 有 audioUrl 的词条提供"听发音"播放按钮
  - [x] 3.5 结果保存：localStorage('buyi_pronunciation_attempts') 保留 20 条；登录态调用 quizApi.create({ mode:'pronunciation' }) 同步并触发每日任务联动
  - [x] 3.6 `src/router/index.js` 注册 `/pronunciation`（无需登录）
- [x] Task 4: Web 端 Quiz 入口：Quiz.vue intro 增加"发音闯关"次按钮（RouterLink 至 /pronunciation）及一句说明文案，不影响原"开始答题"逻辑

## 小程序端（依赖 Task 1/2 完成后联调，与 Task 3/4 可并行）

- [x] Task 5: 小程序发音闯关页面：新页面 + 同声传译插件接入 + API 封装
  - [x] 5.1 `utils/api.js` 新增 pronunciationApi（questions/score，复用现有 get/post 封装）
  - [x] 5.2 `app.json` 注册页面 `pages/pronunciation/index` 并声明同声传译插件（WechatSI, provider wx069ba97219f66d99，版本 0.3.5）
  - [x] 5.3 页面实现：intro/question/result 三阶段，样式复用 card/btn/porcelain-bg-page 公共类与 custom-nav；getRecordRecognitionManager 录音识别（lang zh_CN，onRecognize 实时显示、onStop 取终值评分、onError 兜底）
  - [x] 5.4 录音授权处理：wx.authorize scope.record，拒绝时引导 openSetting
  - [x] 5.5 有 audioUrl 时提供"听发音"（innerAudioContext）
  - [x] 5.6 结果保存：wx.setStorageSync('pronunciationAttempts') 保留 20 条；登录态 quizApi.create({ mode:'pronunciation' }) 同步并触发 notifyUserProgressUpdated
- [x] Task 6: 小程序 Quiz 入口：pages/quiz/index.wxml intro 增加"发音闯关"按钮（navigateTo 跳转），不影响原答题流程

## 验证

- [x] Task 7: 端到端验证与回归
  - [x] 7.1 后端：npm run lint（tsc --noEmit）通过；npm test 通过（全量 7 套件 57/57，含新评分单测 7 例与 quiz 双 mode 单测 6 例）
  - [x] 7.2 Web：npm run build 通过（200 模块，产出独立 Pronunciation chunk）；Chrome 手动实测留待用户环境确认（麦克风需真实设备）
  - [x] 7.3 小程序：语法与结构自查通过（node --check、JSON 校验、wxml 标签配对核对）；微信开发者工具编译与模拟器实测留待用户环境确认（插件需在 mp 后台申请）
  - [x] 7.4 回归：两端原文化答题流程与成绩提交不受影响（git diff 逐字核验，culture 模式逻辑零改动）

# Task Dependencies

- Task 1、Task 2 相互独立，可并行
- Task 3、Task 4 依赖 Task 1、Task 2（联调评分与成绩接口）
- Task 5、Task 6 依赖 Task 1、Task 2，与 Task 3、Task 4 可并行
- Task 7 依赖全部前置任务
