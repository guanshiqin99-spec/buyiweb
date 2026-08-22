# Checklist

## 后端

- [x] `GET /miniapp/pronunciation/questions` 可返回随机发音题（id/kind/buyiText/zhText/description/audioUrl），素材来自已发布词典与短语，游客可访问
- [x] `POST /miniapp/pronunciation/score` 对完全匹配返回 score=100、空识别返回 score=0 且不报错
- [x] 评分逻辑：汉字经 pinyin-pro 转无声调拼音后与 buyiText 做音节级编辑距离，输出 similarity/score/feedback/双方音节序列
- [x] 评分核心函数有 jest 单测且通过（精确匹配/空识别/部分匹配/多音节，7 例全过）
- [x] QuizAttempt 新增 mode 列并附 migration（时间戳 1731000000000），历史数据默认 'culture'
- [x] 不带 mode 的旧请求走原校验逻辑，行为与线上完全一致（向后兼容，单测覆盖）
- [x] pronunciation 模式校验 score===Σpoints 且 correctCount===通过题数，造假数据返回 400（单测覆盖）
- [x] answers 明细保留 type/points/similarity/recognizedText（另保留 buyiText/zhText 供记录回看）且限长；serialize 返回 mode
- [x] `npm run lint`（tsc --noEmit）与 `npm test` 全部通过（7 套件 57/57）
- [x] app.module.ts 已注册 MiniappPronunciationModule

## Web 端

- [x] `/pronunciation` 路由可访问且无需登录，Pronunciation.vue 三阶段流程完整
- [x] SpeechRecognition 能力检测：不支持的浏览器提示使用 Chrome/Edge 并禁用开始按钮
- [x] 跟读时实时显示识别中间结果，结束后展示得分、识别内容与分档反馈
- [x] 麦克风权限被拒时友好提示，页面不崩溃
- [x] 有 audioUrl 的题目提供"听发音"播放
- [x] 成绩保存：本地 localStorage 保留 20 条；登录态同步 quiz-attempts（mode=pronunciation）并触发每日任务联动
- [x] Quiz.vue intro 有"发音闯关"入口且不影响原"开始答题"逻辑
- [x] `npm run build` 通过（Chrome 实机麦克风实测建议用户另行确认）

## 小程序端

- [x] app.json 注册 pages/pronunciation/index 并声明同声传译插件 WechatSI
- [x] 发音闯关页录音识别（zh_CN）逻辑完整：实时中间结果、停止后评分展示（模拟器/真机实测建议用户确认）
- [x] 拒绝 scope.record 时引导 openSetting，不崩溃
- [x] 插件初始化失败时友好兜底提示，Quiz 原功能不受影响
- [x] 有 audioUrl 的题目提供"听发音"播放
- [x] 成绩保存：本地存储保留 20 条；登录态同步 quiz-attempts（mode=pronunciation）
- [x] Quiz 页 intro 有"发音闯关"入口且不影响原答题流程
- [x] 语法与结构自查通过（node --check / JSON 校验 / wxml 标签配对核对；开发者工具编译建议用户确认）

## 回归

- [x] 两端原文化答题（AI 出题 + 经典题库降级）流程与成绩提交不受影响（git diff 逐字核验零改动）
- [x] 云函数 apiProxy 无需改动即可透传新接口（通用路径转发）
- [x] 未引入新的大体积依赖（后端复用已有 pinyin-pro）
