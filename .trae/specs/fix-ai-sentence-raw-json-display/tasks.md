# Tasks

- [x] Task 1: 后端 sentence prompt 增加纯文本输出约束
  - [x] 修改 `BuyiDictionaryApp-main/BuyiDictionaryApp-main/backend/src/modules/miniapp-agent/miniapp-agent.service.ts` 中 `prompts.sentence`（约 196 行）：在原有"造例句+中文翻译+简要语法说明，150字以内"要求上，追加"直接输出纯文本，逐行给出例句、翻译与语法说明，禁止返回 JSON、代码围栏或任何 Markdown 格式"
  - [x] 确认不改动 `quiz` / `related` 两个 prompt 及其他逻辑（git diff 确认该文件仅 196 行 1 处改动）
- [x] Task 2: Web 前端 AI 造句结果格式化
  - [x] 在 `buyi-dictionary-vue/src/utils/` 新增 `aiSentenceFormat.js`，导出 `formatAiSentence(content)`：剥离 ```json/``` 围栏 → 尝试 `JSON.parse` 提取例句/翻译/语法说明（英文键 `sentence`/`translation`/`grammar_note` 与中文键 `例句`/`翻译`/`语法说明`）→ 拼为带中文标签的多行文本 → 解析失败回退原文；空值返回空字符串
  - [x] 在 `buyi-dictionary-vue/src/components/specific/DictionaryEntryDetail.vue` 的 AI 造句渲染处应用 `formatAiSentence`（第 84 行 `{{ formatAiSentence(aiSentenceState.content) || '正在组织例句…' }}`），导入方式对齐该文件现有 import 风格
  - [x] 在 `buyi-dictionary-vue/tests/` 新增 `aiSentenceFormat.test.js`，实际覆盖 9 类场景（超出要求的 6 类），并已登记进 `package.json` 的 `test` 脚本；npm test 108/108 通过
- [x] Task 3: 小程序 AI 造句结果格式化
  - [x] 在 `BuyiDictionaryApp-main/BuyiDictionaryApp-main/pages/query/index.js` 的 `onAISentence` 中实现 `_formatAiSentence` 方法（第 296-330 行），onDelta/onDone 写入 `aiSentence` 前应用
  - [x] 保持 `aiSentenceError`、`aiSentenceLoading` 等现有字段与交互不变，`pages/query/index.wxml` 未改动；`node --check` 语法通过

# Task Dependencies
- Task 1、Task 2、Task 3 相互独立，可并行实施
- 验证顺序建议：Task 2 单测通过后，配合 Task 1 的后端改动做 Web 端手工验证；Task 3 在微信开发者工具中手工验证
