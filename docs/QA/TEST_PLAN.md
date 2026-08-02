# 测试计划（Test Plan）

> 适用阶段：功能基本完成，发布前系统测试
> 创建时间：2026-08-02
> 配套文档：[REVIEW_PLAN.md](REVIEW_PLAN.md) / [测试指南](../../docs/TESTING.md) / [API 参考](../../docs/API_REFERENCE.md)

---

## 一、测试范围与现状盘点

### 1.1 被测对象

| 端 | 位置 | 技术栈 |
|----|------|--------|
| Web 前端 | `buyi-dictionary-vue/` | Vue 3 + Vite + Pinia（13 路由 / 6 store / 23 utils） |
| NestJS 后端 | `BuyiDictionaryApp-main/BuyiDictionaryApp-main/backend/` | NestJS 11 + TypeORM + MySQL/SQLite |
| 微信小程序 | `BuyiDictionaryApp-main/BuyiDictionaryApp-main/` | 原生小程序 + 云函数 |
| 部署网关 | `buyi-dictionary-vue/functions/`、`cloudfunctions/apiProxy` | Cloudflare Pages Functions / 微信云函数 |

### 1.2 现有测试盘点（2026-08-02 实测）

| 位置 | 数量 | 结果 |
|------|------|------|
| 后端 `test/app.e2e-spec.ts` | 9 条（auth/favorites/learning/quiz/badges/Excel 导入/media 上传/health） | ✅ 14 用例全通过（含 runtime-validation） |
| 后端 `learning-stats.spec.ts` | 1 个文件 | ✅ 通过 |
| 前端 `tests/*.test.js` | 8 个文件 38 条 | ✅ 通过 |

### 1.3 覆盖缺口（自动化）

| 缺口 | 优先级 | 现状 |
|------|--------|------|
| 后端：鉴权与安全边界（未登录/越权/锁定/输入校验） | P0 | 仅部分散落在 e2e |
| 后端：内容查询 API（四类内容分页/详情/搜索/建议/首页） | P0 | 无独立覆盖 |
| 前端：agentStream SSE 流式解析 | P0 | 无（新增功能，最易回归） |
| 前端：favorites store 数据归一化 | P1 | 无 |
| 前端：agent store（上下文模板/流式渲染/停止） | P1 | 无 |
| 前端：dailyTasks / learningSuggestion / userProgress | P1 | 无 |
| 小程序：自动化 | P3 | 原生小程序无 CI 通道，转手动清单 |

---

## 二、分层策略与覆盖率目标

| 层级 | 工具 | 目标覆盖 |
|------|------|----------|
| 单元（后端 service/前端 utils/store） | Jest / node:test | 后端关键 service ≥ 70%，前端 utils ≥ 80% |
| 集成/端到端（后端 API） | Jest + supertest | 全部 17 类接口主路径 |
| 手动（小程序 + Web UI） | 真机/浏览器 | 见第四节清单 |

---

## 三、后端自动化用例清单

> 已实现：`test/app.e2e-spec.ts`（admin 登录/刷新/登出、miniapp 全链路、Excel 导入、media 上传、health）。
> 本次新增脚本：`test/security.e2e-spec.ts`、`test/content.e2e-spec.ts`。

### 3.1 安全与鉴权（security.e2e-spec.ts）— P0

| 用例 | 预期 |
|------|------|
| 无 token 访问 `/miniapp/favorites`、`/miniapp/me`、`/miniapp/settings` | 401 |
| 无 token 访问 `/admin/dashboard`、`/admin/dictionary` | 401 |
| 普通用户 token 访问 admin 接口 | 403 |
| 非法 token / 过期 token | 401 |
| 管理员错误密码连续 N 次 | 触发锁定，锁定期间正确密码也拒绝 |
| 刷新 token 复用（已轮换的 refreshToken 二次使用） | 401 |
| 登录后登出，旧 accessToken 立即失效 | 401 |
| `/miniapp/agent/ask` 未带 token | 401（guard 生效） |
| `/miniapp/agent/generate` 免登录可访问，非法 type 返回 400 | 400 |
| `/miniapp/agent/generate` 未配置 AI 时返回 SSE error 事件而非 500 崩溃 | 200 + `data: {"type":"error"}` |
| DTO 校验：`page=-1`、`pageSize=0`、超长 question、缺字段 | 400 |

### 3.2 内容查询（content.e2e-spec.ts）— P0

| 用例 | 预期 |
|------|------|
| 四类内容分页列表（dictionary/phrases/proverbs/songs），`page`/`pageSize`/`totalPages` 正确 | 200 + 分页字段 |
| 未发布内容对 miniapp 不可见（admin 侧可见） | 列表不含 isPublished=false |
| 关键词搜索（zhText / buyiText / enText）命中 | 结果含关键词 |
| 综合搜索 `/miniapp/search` 返回四类分组 + pagination | 结构正确 |
| `/miniapp/search/suggest` 中文优先排序、每类 ≤5 | 排序与数量 |
| 详情接口：存在返回、不存在 404 | 200 / 404 |
| `/miniapp/home` banners 仅含有封面歌曲、suggestions 去重 | 结构正确 |
| 边界：空关键词、特殊字符（`%`、`_`、引号） | 不报 500 |

### 3.3 后续建议补充（P1/P2，择机）

- `favorites` 并发 toggle 幂等（同请求连发两次）
- `learning-records` 跨用户隔离（A 的记录 B 不可见）
- Excel 导入：空文件、超大文件、公式注入单元格、错误 sheet 名
- 媒体：不支持的扩展名、路径穿越文件名、音频/图片类型混传
- 徽章：解锁条件边界（首次词条、7 天连续、50 次）

---

## 四、前端自动化用例清单（node:test）

### 4.1 本次新增

| 文件 | 覆盖点 |
|------|--------|
| `tests/agentStream.test.js` | SSE 分片解析（跨 chunk 拼接）、delta/done/error 事件、HTTP 非 200、无 body、AbortError 不触发 onError、token 附带 |
| `tests/favorites.test.js` | normalizeFavorite / normalizeFavoriteList 分组归一化、toggle 加/删/字段缺失回退拉取、clearFavorites、会话清除事件清空 |
| `tests/agent.test.js` | quickQuestions 上下文模板、send 历史截取 6 条、空问题忽略、loading 防重入、normalizeAgentText、stop/reset |
| `tests/dailyTasks.test.js` | 今日计数优先、fallback 累计计数、completed 边界（3/3）、异常值钳制 |
| `tests/userProgress.test.js` | 今日计数跨天重置、recordTodayActivity 递增、normalizeLearningStats 新旧字段、normalizeBadge 三种形态、notify 事件 |
| `tests/learningSuggestion.test.js` | 新用户引导、今日完成奖励、打卡中断、弱项推荐、主导类型失衡、阶段推荐、优先级排序去重、最多 3 条 |

### 4.2 已覆盖（回归保护）

`api / auth / contentTypes / navTonePolicy / playableSongs / player / quiz / tones`

### 4.3 手动/浏览器级（不写单测）

- liquidGlass 视差与光标跟随（依赖真实布局）
- Dictionary 移动端弹窗、AudioPlayer 真实音频、ShareCard 导出
- P0 不变量：导航栏对比度策略（已有自动化兜底）

---

## 五、手动测试清单

### 5.1 Web 端冒烟路径

- [ ] 首页 → 搜索 → 词条详情 → 收藏 → 个人中心查看收藏
- [ ] 未登录访问收藏/记录页 → 重定向登录 → 登录后回跳
- [ ] 声调交互：TonePiano 1-6 键 + 点击发声
- [ ] 播放器：播放/暂停/进度/上一首下一首/来源降级（远端失败切本地）
- [ ] AI 导览员：打开、提问、流式渲染、停止、刷新后状态
- [ ] 移动端（≤860px）：词条弹窗、底部导航、收藏按钮
- [ ] 学习任务三件套：查 3 词 / 听 2 歌 / 答 1 轮 后进度与建议刷新
- [ ] 暗色主题切换 + 各页面观感
- [ ] 404 页、路由直接输入、刷新深链

### 5.2 小程序真机清单

- [ ] 微信登录 → 授权 → 头像上传 → token 持久化 → 重启保持登录
- [ ] 首页轮播、词汇/短语/谚语/民歌浏览、收藏
- [ ] 播放器详情页（后台播放/锁屏）
- [ ] AI 导览员：面板展开隐藏 TabBar、关闭恢复、流式回复
- [ ] 答题：开始一轮、提交、结果、学习记录/徽章更新
- [ ] 学习记录页热力图/雷达图/学习建议
- [ ] 登出后旧数据不残留；切换账号数据隔离
- [ ] 弱网/断网：loading、错误提示、重试
- [ ] 不同机型（刘海屏安全区、小屏、深色模式）

### 5.3 管理后台（/admin-web）

- [ ] 登录、权限不足提示
- [ ] 内容 CRUD + Excel 导入（正常/缺列/重复/超长）
- [ ] 媒体上传（图片/音频/错误类型/超大）
- [ ] 仪表盘统计正确性

---

## 六、性能与稳定性测试

| 项 | 方法与指标 |
|----|-----------|
| 健康检查 | `autocannon -c 100 -d 10 /api/health`，P95 < 50ms，0 错误 |
| 搜索接口 | `autocannon -c 50 -d 10 '/api/miniapp/search?q=布依'`，P95 < 300ms |
| 首页 | `/api/miniapp/home` 100 并发 P95 < 200ms |
| 大列表 | `pageSize=100` 分页响应体大小、前端滚动帧率 |
| 稳定性 | 连续 30 分钟定时搜索+答题，无内存增长、无 5xx |

---

## 七、执行与报告规范

1. **自动化一键执行**：`powershell ./run-tests.ps1`（根目录，见下节），退出码 0 为全绿。
2. **手动测试**：每轮按 5.x 清单执行，结果记录为 `docs/QA/测试记录-YYYY-MM-DD.md`。
3. **缺陷管理**：发现的问题登记进 REVIEW_PLAN.md 问题台账，级别按"阻断上线/必须修复/择机"划分。
4. **发布门禁**：以下全部满足方可发布
   - 后端 `tsc --noEmit` 通过 + Jest 全绿
   - 前端 `node:test` 全绿 + `vite build` 成功
   - 手动冒烟（5.1 / 5.2）无 P0/P1
   - 安全审查（REVIEW_PLAN 第二节）无未关闭 P0

---

## 八、自动化脚本清单（本次交付）

| 脚本 | 位置 | 作用 |
|------|------|------|
| `security.e2e-spec.ts` | 后端 `test/` | 鉴权与安全边界 11 组用例（未授权/越权/轮换/锁定/SSE/DTO） |
| `content.e2e-spec.ts` | 后端 `test/` | 内容查询与搜索 8 组用例（分页/发布隔离/综合搜索/建议/详情/边界） |
| 6 个前端测试文件 | `buyi-dictionary-vue/tests/` | 见 4.1 |
| `run-tests.ps1` | 项目根目录 | 一键：后端 tsc + Jest、前端 node:test + 构建 |

## 九、2026-08-02 首轮执行结果

| 项 | 结果 |
|----|------|
| 后端 `tsc --noEmit` | ✅ 通过 |
| 后端 Jest（5 suite / 43 用例） | ✅ 通过（连跑 3 次稳定） |
| 前端 node:test（14 文件 / 99 用例） | ✅ 通过 |
| 前端 `vite build` | ✅ 通过（产物 24.2MB，见 REVIEW_PLAN R-08） |
| 测试驱动发现并修复 | R-01 编译错误、R-05 refresh 轮换失效（P0 安全）、R-06 民歌标题不可搜（P1） |
| 测试稳定性 | app.e2e 首用例 seed 竞态已加就绪轮询（R-07） |

> 后续每轮执行把结果追加到本表，问题登记进 REVIEW_PLAN 台账。
