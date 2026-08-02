# 代码审查计划（Review Plan）

> 适用阶段：功能基本完成，进入发布前审查与测试
> 创建时间：2026-08-02
> 配套文档：[TEST_PLAN.md](TEST_PLAN.md) / [测试指南](../../docs/TESTING.md) / [系统架构](../../ARCHITECTURE.md)

---

## 一、审查目标与方式

| 项 | 说明 |
|----|------|
| 目标 | 在发布前找出 P0（阻断上线）/ P1（必须修复）/ P2（择机修复）问题 |
| 范围 | 后端 `BuyiDictionaryApp-main/BuyiDictionaryApp-main/backend/`、Web 前端 `buyi-dictionary-vue/`、微信小程序 `BuyiDictionaryApp-main/BuyiDictionaryApp-main/`、部署配置（Cloudflare Functions / Nginx / docker-compose / 云函数） |
| 方式 | 逐模块代码走查 + 静态扫描 + 针对性测试验证 |
| 判定标准 | 安全与数据完整性问题一律 P0；影响主流程/多端一致性的为 P1；代码卫生、可维护性为 P2 |

使用方式：逐项勾选，`[ ]` 未审查，`[x]` 已通过，`[!]` 发现问题（记录到文末问题台账）。

---

## 二、P0 安全审查（先于一切）

### 2.1 认证与授权
- [ ] `JwtAuthGuard` / `MiniappJwtGuard` / `AdminJwtGuard` 是否覆盖所有应受保护的路由（逐个 controller 核对，警惕漏标 `@Public` 或漏加 guard）
- [ ] 小程序 `/miniapp/agent/generate` 免登录设计是否符合预期（生成类接口是否应限流/审计）
- [ ] token 是否含过期时间；refresh token 是否可轮换、是否绑定 session
- [ ] `AuthSession` 登出后令牌是否立即失效（已有 e2e 覆盖，需复查实现）
- [ ] 管理员 RBAC：`RolesGuard` 与 `@RequirePermission` 是否覆盖所有 `/api/admin/*` 写操作
- [ ] 登录失败锁定（`auth-security`）：阈值、锁定时长、是否可被暴力破解绕过（并发请求绕过计数）
- [ ] 越权：普通用户 token 访问 admin 接口、A 用户访问 B 用户数据（learning-records / favorites / settings 的 `userId` 是否一律取自 `@CurrentUser` 而非请求体）

### 2.2 输入与注入
- [ ] DTO 校验：所有 `@Body()` 是否挂了 `class-validator`，`whitelist: true` 是否全局生效
- [ ] SQL 注入：`buildKeywordWhere` 使用 TypeORM `Like` 参数化，审查是否还有任何字符串拼接查询
- [ ] XSS：前端 `v-html` 使用点逐一排查（重点：词条详情、AI 回复渲染、运营后台富文本）
- [ ] 路径穿越：媒体上传的 `filename` / `originalname` 是否被净化，`uploads/` 静态服务是否限制目录
- [ ] Excel 导入（`xlsx`）：公式注入（单元格以 `=` 开头）、超大数据文件（文件大小上限）、畸形文件是否会导致 OOM

### 2.3 敏感信息
- [ ] `.env` 是否已加入 `.gitignore`；仓库内是否有残留密钥（`git log` 全历史扫描 `JWT_SECRET`、`DEEPSEEK_API_KEY`、MySQL 密码）
- [ ] 后端响应是否脱敏（`PII` 拦截器：手机号、openid、password hash 不外泄）
- [ ] `WechatService` code2session 的 `appid`/`secret` 是否只存在于服务端环境变量
- [ ] AI 服务：提问/历史是否包含用户隐私，日志是否记录完整 prompt

### 2.4 传输与访问控制
- [ ] 生产 Nginx 是否只放行必要端口；3000 是否不对公网开放
- [ ] Cloudflare Functions 代理：`FORWARDED_REQUEST_HEADERS` 白名单是否足够；是否可被用作任意 URL 代理（`BACKEND_URL` 拼接是否防注入）
- [ ] 媒体资源 URL 是否走 HTTPS；`uploads/` 目录是否禁止执行脚本

---

## 三、P0 数据与一致性

- [ ] 唯一约束：`dictionary/phrase/proverb` 的 `(buyiText, zhText)` 与 `song.title` 是否有数据库层唯一索引（与导入 upsert 逻辑一致）
- [ ] 级联删除：删除词条/民歌后，`favorite`、`learning_record`、`content_culture_link` 是否清理或保留（避免孤儿数据/404）
- [ ] 收藏 toggle 并发：同一用户同一内容并发 toggle 是否会重复插入或丢失状态
- [ ] 学习记录与徽章统计的原子性：`streak` 计算是否依赖 `createdAt` 时区（服务器时区 vs 客户端时区）
- [ ] 分页边界：`page=0` / `pageSize=10000` / 负数 page 是否被 DTO 钳制
- [ ] SQLite（开发）与 MySQL（生产）行为差异：`LIKE` 大小写、`ON DUPLICATE KEY`、`CASE WHEN` 排序是否两端一致
- [ ] `zhSortKey`（pinyin-pro）在更新/导入时是否始终重建，避免排序键过期

---

## 四、后端代码审查（NestJS）

- [ ] 依赖注入：所有 `Repository` 是否经 `@InjectRepository`，禁止 `getRepository` 全局单例混用
- [ ] 错误处理：service 层是否统一抛 Nest 标准异常；`catch` 是否吞掉关键错误（重点：`miniapp-learning-records.list` 的 `catch {}` 分支）
- [ ] N+1 查询：`listPublished` 中 `serializeWithRelatedExhibits` 对每条记录查关联展项，列表接口是否造成 N+1（≥20 条时观察）
- [ ] 事务：导入、徽章解锁、收藏等写多表的操作是否有事务包裹
- [ ] 异步安全：`streamChat` / `streamGenerate` 的 SSE 在客户端断开后是否释放连接与上游请求（`AbortController` 传播）
- [ ] `@Res()` 手动接管响应后，是否漏掉异常路径的 `finish()`（连接泄漏）
- [ ] 日志：`Logger` 使用是否规范；错误是否含足够上下文（userId、requestId）
- [ ] 死代码/遗留：`api/`、`test-serverless.js`、`upload.js`、`reset_admin.js` 是否仍是生产入口或应清理
- [ ] 定时/启动副作用：`SEED_ON_BOOT` 在生产是否关闭；`init-admin` 脚本是否可被重复执行导致弱口令重建

---

## 五、前端代码审查（Vue 3）

- [ ] 路由守卫：`requiresAuth` 覆盖是否完整；未登录访问受保护页是否重定向且不泄漏数据
- [ ] Pinia 状态：`auth` token 是否只存 `localStorage`（XSS 可读性评估）；登出/401 是否清空 `favorites`、`player`、`search` 等全部会话态（跨账号残留）
- [ ] 401 刷新队列：`authInterceptor` 并发刷新是否只发一次 refresh；队列重放是否保序
- [ ] 组件清理：`AudioPlayer`、`AgentPanel`、`liquidGlass` 的 `addEventListener`/`IntersectionObserver`/`AbortController` 是否在 `onUnmounted` 释放（内存泄漏）
- [ ] 可访问性：图标按钮是否有 `aria-label`；键盘操作（TonePiano 1-6）是否可聚焦；对比度是否满足 WCAG AA（重点：液态玻璃浅色背景 + 白字）
- [ ] 响应式：860px 断点下 `DictionaryEntryDetail` 弹窗、表格/图表组件是否溢出
- [ ] 数据容错：接口字段新旧兼容逻辑（`isFavorited`/`favorited` 等）是否都具备兜底，后端字段变更时前端是否优雅降级
- [ ] 构建产物：`vite build` 警告（chunk 大小、循环依赖）；懒加载路由是否按页面拆分
- [ ] 无障碍降级：`prefers-reduced-motion` 是否尊重（动画/粒子/液态玻璃）
- [ ] 性能：首页首屏请求数、图片懒加载、列表虚拟化（Songs 页大列表）

---

## 六、微信小程序审查

- [ ] 云函数 `apiProxy`：SSE 累积是否断流超时（60s 限制 vs 长回答）；非 agent 路径是否透传 body
- [ ] 登录链路：`wx.login` → code2session → token 持久化 → 401 刷新 → 登出清理，是否全链路闭环（已有实现，需真机验证）
- [ ] 本地存储：`loginState`、`dailyTypeCounts` 等 key 是否与 Web 端命名冲突或跨用户残留
- [ ] 封面兜底：`covers` 本地目录缺失时回退 `banner1.jpg` 是否符合预期（待办项 2）
- [ ] 组件生命周期：`agent-panel` 的 `wx.hideTabBar/showTabBar` 在 `detached`/页面切换时是否恢复
- [ ] 兼容性：基础库版本、`safe-area-inset-bottom`、深色模式适配
- [ ] 分包与体积：`assets/images` 未压缩图片是否拖慢启动

---

## 七、性能与稳定性

- [ ] 接口压测基线（见 TEST_PLAN 第六节）：`/api/health`、`/api/miniapp/search`、`/api/miniapp/home`
- [ ] 数据库索引：`learning_record(userId, createdAt)`、`favorite(userId)`、`content` 表 `isPublished + sortOrder + zhSortKey` 复合索引是否建立
- [ ] 慢查询：MySQL slow log 是否开启（生产）
- [ ] 内存：Excel 大文件导入是否流式解析；SSE 长连接数量是否设上限
- [ ] 缓存：`/api/miniapp/home`、词典列表是否有缓存策略（当前无缓存，评估必要性）

---

## 八、部署与运维

- [ ] 环境变量清单：生产 `.env` 与 `docs/DEPLOYMENT.md` 是否一致（`BACKEND_URL`、`AI_PROVIDER`、`JWT_SECRET` 等）
- [ ] 备份：MySQL 定时备份策略是否存在并演练过
- [ ] 监控：PM2 日志轮转、cloudflared systemd 自恢复、健康检查告警
- [ ] 回滚：`dist/` 与后端 `dist/` 是否可由 CI 一键回滚到上一版本
- [ ] HTTPS 证书：Cloudflare 代理 + 源站是否全链路加密
- [ ] 发布流程：`sealos-build.bat`、docker-compose 与生产部署文档是否同步（存在双轨，需确认以哪个为准）

---

## 九、问题台账（2026-08-02 首轮）

| # | 级别 | 模块 | 问题 | 状态 |
|---|------|------|------|------|
| R-01 | P0 | 后端 `miniapp-learning-records.service.ts:47` | `serialized.title` 类型错误（TS2339），导致 `tsc --noEmit` 与 `nest build` 失败、e2e 无法运行 | ✅ 已修复（`content.service.ts` 新增 `SerializedContent` 显式返回类型），2026-08-02 |
| R-02 | P1 | 后端测试覆盖 | 141 个 ts 源文件仅 1 个单元测试，核心模块（auth/搜索/内容）缺单元级覆盖 | ⏳ 待补充（见 TEST_PLAN） |
| R-03 | P2 | 小程序 | 本地 `assets/images/covers` 目录缺失，封面完全依赖后端（待修改问题清单第 2 项） | ⏳ 待定 |
| R-04 | P2 | 前端 | 三个 0 字节占位文件 `tests/__verify_*.mjs` 应清理 | ✅ 已清理，2026-08-02 |
| R-05 | P0 | 后端 `admin-auth.service.ts` / `miniapp-auth.service.ts` | **refresh token 轮换失效**：`issueTokens` 签发的 refresh token 无随机因子，同秒内登录与刷新签发完全相同 token，旧 token 永不失效（e2e 实测旧 token 二次刷新返回 201） | ✅ 已修复：signAsync 增加 `jwtid: randomUUID()`，旧 token 复用返回 401，2026-08-02 |
| R-06 | P1 | 后端 `content.service.ts buildKeywordWhere` / `suggestAll` | **民歌标题/歌手不可搜索**：搜索只匹配 buyiText/zhText/enText/description，用户搜歌名或歌手名空结果；联想接口 `suggestAll` 更是不返回 songs 类别 | ✅ 已修复：SONG 类型增加 `title`/`artist` LIKE 条件；`suggestAll` 补上 songs 类别与 title/artist 匹配（e2e 已覆盖歌名/歌手联想命中），2026-08-02 |
| R-07 | P1 | 后端 `seed.service.ts` | **seed 竞态**：`onApplicationBootstrap` 未返回 Promise，`app.init()` 时 admin 可能尚未创建，首个请求偶发 401（e2e 第一个用例实测复现） | 🟡 测试侧已加就绪轮询缓解；生产侧建议改为返回 `this.seedAsync()` 让启动等待 seed 完成 |
| R-08 | P2 | 前端构建 | `vite:singlefile` 将 JS/CSS 全内联，`dist/index.html` 达 24.2MB（gzip 17.9MB），首屏加载压力大 | ✅ 已修复：移除 singlefile 与 `inlineDynamicImports`，恢复路由懒加载 + `manualChunks` 分包（vue-vendor/axios/vendor）。首屏 JS 传输降至约 100KB（降 ~180x），preview 实测页面渲染与懒加载正常，2026-08-02 |

> 新增发现问题时按 R-09、R-10 续编，修复后更新状态并注明日期。
