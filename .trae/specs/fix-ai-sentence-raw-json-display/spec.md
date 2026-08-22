# 修复 AI 造句结果原样显示 JSON 问题 Spec

## Why
AI 造句（DeepSeek 流式生成）有时不按预期返回纯文本，而是返回带 ```json 围栏的结构化 JSON（如 `{"sentence":"...","translation":"...","grammar_note":"..."}`）。前端把流式分片原样拼接后直接渲染，导致词条详情"AI 学习辅助"区块向用户展示原始 JSON 字符串（含围栏、花括号、英文键名），不可读且观感差。小程序查询页（AI 例句区块）存在完全相同的问题。

## What Changes
- 后端 `sentence` 类型 prompt 增加明确的纯文本输出约束：禁止 JSON、代码围栏和 Markdown 格式（一行改动）
- Web 前端新增 AI 造句结果格式化函数 `formatAiSentence(content)`：剥离 Markdown 代码围栏 → 若剩余内容为 JSON 对象则提取例句/翻译/语法说明等字段并转为带中文标签的可读多行文本 → 无法解析时回退为剥离围栏后的原文
- Web 端在 `DictionaryEntryDetail.vue` 渲染 AI 造句内容处应用该函数（桌面详情与移动端弹窗复用同一组件，一处生效）
- 小程序 `pages/query/index.js` 在写入 `aiSentence`（onDelta / onDone）前应用同样的格式化逻辑
- 为 Web 端格式化函数补充单元测试（对齐 `buyi-dictionary-vue/tests/` 现有测试风格）

## Impact
- Affected code:
  - 后端: `BuyiDictionaryApp-main/BuyiDictionaryApp-main/backend/src/modules/miniapp-agent/miniapp-agent.service.ts`（仅 `prompts.sentence` 一行）
  - Web: `buyi-dictionary-vue/src/utils/`（新增格式化工具）、`buyi-dictionary-vue/src/components/specific/DictionaryEntryDetail.vue`（渲染处）、`buyi-dictionary-vue/tests/`（新增测试）
  - 小程序: `BuyiDictionaryApp-main/BuyiDictionaryApp-main/pages/query/index.js`（`onAISentence` 内联同款格式化）
- 不改变 SSE 分片协议、接口路径、请求/响应字段，无 BREAKING
- 不影响 `quiz` / `related` 两类生成任务（它们本就要求 JSON，且已有各自的解析逻辑）

## ADDED Requirements

### Requirement: AI 造句结果展示格式化
系统 SHALL 在向用户展示 AI 造句内容之前对其进行格式化处理：先剥离 Markdown 代码围栏（```json / ```）；若剥离后内容能解析为 JSON 对象，则提取例句、翻译、语法说明等已知字段并转为带中文标签的可读文本；无法解析时按（剥离围栏后的）原文展示。

字段识别需覆盖常见键名（至少包含英文键 `sentence` / `translation` / `grammar_note`，及常见中文键如 `例句` / `翻译` / `语法说明`）。未知键的 JSON 对象按原文回退展示，不得抛错。

#### Scenario: 模型返回 JSON 围栏内容
- **WHEN** AI 造句返回形如 ` ```json {"sentence":"ndaelo","translation":"你好","grammar_note":"..."} ``` ` 的内容
- **THEN** "AI 学习辅助"区块显示带中文标签的可读文本（例句：ndaelo / 翻译：你好 / 语法说明：…），不再出现围栏符号或 JSON 花括号

#### Scenario: 模型返回纯文本
- **WHEN** AI 造句返回普通纯文本（按新 prompt 约束的正常情况）
- **THEN** 展示效果与现状一致，纯文本原样展示

#### Scenario: 流式输出尚未完成
- **WHEN** 造句仍在流式传输中，内容为不完整 JSON、暂时无法解析
- **THEN** 不抛错、不中断流式展示，显示剥离围栏后的渐进文本；流结束后展示正确格式化结果

#### Scenario: 格式化函数收到空值或非字符串
- **WHEN** `formatAiSentence` 收到空字符串、null / undefined
- **THEN** 返回空字符串，不抛错

## MODIFIED Requirements

### Requirement: AI 造句后端生成 prompt
（现有）`sentence` 类型 prompt 要求用指定布依语词造日常例句，给出中文翻译和简要语法说明，150 字以内。

修改为：在原有要求基础上，明确要求直接输出纯文本，逐行给出例句、翻译与语法说明，并显式禁止返回 JSON、代码围栏或任何 Markdown 格式。
