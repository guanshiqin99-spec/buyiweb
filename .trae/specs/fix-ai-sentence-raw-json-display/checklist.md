# Checklist

- [x] 后端 `prompts.sentence` 明确要求纯文本输出并禁止 JSON / 代码围栏 / Markdown（miniapp-agent.service.ts 第 196 行）
- [x] `quiz` / `related` 两类生成的 prompt 与逻辑未被改动（git diff 确认仅 sentence 一行变更）
- [x] Web 端新增 `formatAiSentence` 工具函数，覆盖围栏剥离、JSON 字段提取（英文键与中文键）、回退原文、空值安全（src/utils/aiSentenceFormat.js）
- [x] `DictionaryEntryDetail.vue` 的 AI 造句渲染应用了格式化（桌面详情与移动端弹窗共用组件，均生效；第 84 行）
- [x] Web 端"AI 学习辅助"区块不再出现 ```json 围栏、花括号或英文键名（带围栏 JSON 场景单测验证输出为「例句：…/翻译：…/语法说明：…」多行文本）
- [x] Web 端模型返回纯文本时展示效果与现状一致（纯文本场景单测验证原文透传）
- [x] 流式输出过程中不抛错、不中断，流结束后展示格式化结果（不完整 JSON 场景单测验证回退原文不抛错）
- [x] 新增 `aiSentenceFormat.test.js` 六类场景全部通过（实际覆盖 9 类场景，npm test 108/108 通过）
- [x] 小程序 `pages/query/index.js` 的 AI 例句展示完成同样格式化，wxml 与现有交互（loading/error/清除）不变（node --check 语法通过）
- [x] SSE 协议、接口路径与字段、其他正常功能未受影响（agentStream.js、miniapp-agent.controller.ts 零改动，SSE 协议 12 个既有用例全部通过）
