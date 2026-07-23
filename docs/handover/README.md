# handover — 决赛前交接文件夹

> 生成时间：2026-07-23，最后更新：2026-07-24。本文件夹是一次全库核查（前端、后端、部署配置、冗余、安全）的产出，供后续对话/Agent 执行。

| 文件 | 内容 | 交给谁 |
|------|------|--------|
| [01-冗余文件清理清单.md](01-冗余文件清理清单.md) | 可删/需确认/必须保留三级清单，含 git 追踪状态与执行顺序 | 清理任务的执行者 |
| [02-重大漏洞与修复清单.md](02-重大漏洞与修复清单.md) | 按严重度排序的漏洞清单（含已实测的线上 API 断裂、密码泄露） | 用户本人 + 修复执行者 |
| [03-交接提示词.md](03-交接提示词.md) | 三段可直接复制的任务提示词（修线上链路 / 清理 / 功能增强） | 下一个对话或 Agent |

功能优化的完整方案见 [../决赛冲刺优化方案.md](../决赛冲刺优化方案.md)（已更新到 v2，以 v2 修订为准）。

## 三件事的优先级

1. **修线上 API（P0-0）** —— 线上站点后端功能现在是断的，比一切优化都急。
2. **V2 密码处置** —— `upload_frontend.py` 里的 SSH 密码已进 git 历史，删文件后必须改服务器密码。
3. 清理与功能增强可并行推进，功能增强严格按优化方案 v2 执行。

## 已完成的修复

- **V3 — Vercel 弱 JWT_SECRET**（2026-07-23）：已删除 `backend/vercel.json`，通过 Vercel CLI 下线并删除 `backend`（backend-nine-alpha-35.vercel.app）和 `buyi-dictionary-vue`（buyi-dictionary-vue.vercel.app）两个 Vercel 项目，项目列表已确认为空。风险已消除。
- **小程序 AI 导览员弹窗遮挡导航栏**（2026-07-23）：`components/agent-panel/agent-panel.js` 新增 `_toggleTabBar` 方法，面板展开时 `wx.hideTabBar`、关闭时 `wx.showTabBar`，并通过 `app.eventBus` 广播 `tabbar:hide/show`；`agent-panel.wxss` 输入区 `padding-bottom` 改为 `calc(24rpx + env(safe-area-inset-bottom))` 适配全面屏安全区。详见 `待修改问题清单.md` 第 6 项与 `CHANGELOG.md` Unreleased 段。
