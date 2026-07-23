# 安全策略

> 本文档说明项目的安全策略、生产环境检查清单与漏洞报告流程。
>
> 最后更新：2026-07-24
>
> ⚠️ 当前生产实际部署架构见 [`部署方案.md`](部署方案.md)（阿里云北京 ECS + Cloudflare Named Tunnel + Cloudflare Pages + 微信云函数代理）。本文档的检查清单已对齐该架构。

---

## 一、支持版本

| 版本 | 状态 | 安全更新 |
|------|------|----------|
| 1.0.x | ✅ 当前版本 | 支持 |
| < 1.0 | ❌ 已弃用 | 不支持 |

---

## 二、安全架构

### 2.1 鉴权机制

项目使用 **双令牌认证**：

| 令牌 | 用途 | 有效期 | 存储 |
|------|------|--------|------|
| Access Token | API 请求鉴权 | 短（15 分钟） | 内存 / localStorage |
| Refresh Token | 刷新 Access Token | 长（7 天） | localStorage |

**安全特性**：

- Access Token 通过 `Authorization: Bearer <token>` 头部传递
- Refresh Token 仅在刷新时使用，不参与业务请求
- logout 会停用当前 `AuthSession`，旧令牌立即失效
- 登录失败 5 次后账号锁定 15 分钟（`auth-security/login-lockout.service.ts`）

### 2.2 RBAC 权限模型

后台管理接口使用基于角色的访问控制：

| 角色 | 权限 |
|------|------|
| `super_admin` | 全部权限 |
| `admin` | 内容管理、用户管理 |
| `editor` | 仅内容管理 |

通过装饰器声明所需权限：

```typescript
@RequirePermission('dictionary:write')
@Post('/admin/dictionary')
createDictionary() { ... }
```

`RolesGuard` 自动校验当前用户的角色是否具备所需权限。

### 2.3 请求安全

通过 `helmet` 中间件添加安全头：

- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `Strict-Transport-Security`（仅 HTTPS）
- `Content-Security-Policy`
- `X-XSS-Protection`

### 2.4 CORS 策略

仅允许配置的来源访问。**生产实际值**（对齐 [`部署方案.md`](部署方案.md)）：

```env
CORS_ORIGIN=https://buyi-dictionary.pages.dev
```

开发环境默认允许 `http://localhost:5173`、`http://localhost:8080`。

> 注意：小程序走云函数 `apiProxy` 直连后端 IP，请求由微信服务器发起，**不受浏览器 CORS 限制**，因此 `CORS_ORIGIN` 只需配置 Web 前端域名。

### 2.5 限流策略

`common/http/rate-limit.ts` 定义：

| 接口 | 限制 |
|------|------|
| 登录 `/auth/login` | 每 IP 每分钟 10 次 |
| 注册 `/auth/register` | 每 IP 每分钟 5 次 |
| 其他接口 | 每用户每分钟 60 次 |

超限返回 `429 Too Many Requests`。

### 2.6 媒体上传安全

| 维度 | 限制 |
|------|------|
| 文件大小 | 最大 10MB |
| 图片 MIME | jpeg / png / webp / gif |
| 音频 MIME | mpeg / mp3 / wav / x-wav / mp4 / aac / ogg |
| 文件名 | 服务端重命名为 UUID，不保留原始文件名 |

### 2.7 PII 数据脱敏

`PiiMaskInterceptor` 自动对响应中的敏感字段脱敏：

- 手机号：保留前 3 后 4，中间 `****`
- 身份证号：保留前 4 后 4
- 邮箱：保留首字符与域名

### 2.8 数据库安全

- **ORM 防注入**：所有数据库操作通过 TypeORM 参数化查询，禁止字符串拼接 SQL
- **密码哈希**：使用 bcryptjs，cost factor = 10
- **生产环境建议禁用 synchronize**：通过 migration 管理结构。**注意**：当前生产 `.env` 实际仍写 `DB_SYNCHRONIZE=true`（见 [docs/handover/02-重大漏洞与修复清单.md](docs/handover/02-重大漏洞与修复清单.md) V5），赛前最稳做法是不改代码仅在 `.env` 显式写 `DB_SYNCHRONIZE=false` 关闭
- **生产环境禁用 seed**：避免覆盖真实数据

---

## 三、生产环境检查清单

部署到生产前，**必须**逐项确认：

### 3.1 后端配置

- [ ] `NODE_ENV=production`
- [ ] `JWT_SECRET` 已替换为 32+ 字符随机字符串：
  ```bash
  openssl rand -hex 32
  ```
- [ ] `DB_TYPE=mysql`（不再使用 sqljs）
- [ ] `DB_SYNCHRONIZE=false`
- [ ] `WECHAT_MOCK_MODE=false`
- [ ] `WECHAT_APP_ID` 与 `WECHAT_APP_SECRET` 为真实值
- [ ] `MEDIA_DRIVER=cos`（不再使用 local）
- [ ] `SEED_ON_BOOT=false`
- [ ] `ENABLE_SWAGGER=false`（生产关闭 API 文档）
- [ ] `CORS_ORIGIN` 已正确配置，未使用通配符 `*`

### 3.2 网络与证书（Cloudflare 通道）

- [ ] Cloudflare Pages 域名 `buyi-dictionary.pages.dev` 可访问（无需 ICP 备案，Cloudflare 提供 HTTPS）
- [ ] Cloudflare Named Tunnel `api.buyitech.asia` 状态 active（`systemctl status cloudflared`）
- [ ] 后端 `.env` 的 `CORS_ORIGIN=https://buyi-dictionary.pages.dev` 已配置
- [ ] 服务器安全组仅开放 22/80/443，3000 端口不对公网开放
- [ ] Nginx `client_max_body_size` ≥ 10MB
- [ ] HTTP 自动 301 跳转到 HTTPS（由 Cloudflare 强制）

### 3.3 数据库

- [ ] MySQL 使用强密码（不少于 16 字符）
- [ ] 数据库账号使用最小权限原则（仅授权业务库的 CRUD）
- [ ] 已配置数据库备份策略（每日全量 + binlog 增量）
- [ ] 已测试备份可恢复
- [ ] 已执行 migration，未开启 synchronize

### 3.4 微信小程序（云函数代理方案）

- [ ] 云函数 `apiProxy` 已上传并部署（微信开发者工具右键「上传并部署:云端安装依赖」）
- [ ] `cloudfunctions/apiProxy/index.js` 的 `BACKEND_BASE` 指向正确的后端地址（当前 `http://39.96.81.132:80/api`）
- [ ] `utils/runtime-config.js` 与 `cloudbaserc.json` 的 `envId` 一致
- [ ] `WECHAT_APP_ID` 与 `WECHAT_APP_SECRET` 与小程序后台一致
- [ ] **无需在微信公众平台配置合法 request 域名**（云函数代理绕开白名单限制）

### 3.5 媒体存储（当前生产用 local）

- [ ] `MEDIA_DRIVER=local`（当前生产实际值）
- [ ] `MEDIA_PUBLIC_BASE_URL=https://api.buyitech.asia/uploads`（通过 Cloudflare Tunnel 暴露）
- [ ] 服务器 `/opt/buyi-dictionary/backend/uploads/buyi_audio/` 音频文件存在
- [ ] **如切换 COS**：`MEDIA_DRIVER=cos`，COS 桶权限设为「私有读写」通过签名 URL 访问，`COS_PUBLIC_BASE_URL` 指向 CDN 加速域名，配置防盗链

### 3.6 日志与监控

- [ ] 后端日志输出到文件（PM2 自动）
- [ ] 日志轮转已配置（`pm2 install pm2-logrotate`）
- [ ] 服务器 CPU / 内存 / 磁盘监控告警
- [ ] API 健康检查纳入监控（`/api/health`）

### 3.7 AI 服务

- [ ] `DEEPSEEK_API_KEY` 仅存储在服务器环境变量，不入代码库
- [ ] AI 请求频率限制已启用
- [ ] AI 响应有内容缓存机制（`AgentCache` 实体）

---

## 四、环境变量管理

### 4.1 永远不要入仓库的变量

以下变量必须通过 `.env` 文件或服务器环境变量提供，**不得**写入代码或提交到仓库：

- `JWT_SECRET`
- `MYSQL_ROOT_PASSWORD`
- `MYSQL_PASSWORD`
- `WECHAT_APP_SECRET`
- `DEEPSEEK_API_KEY`
- `COS_SECRET_ID`
- `COS_SECRET_KEY`

`.gitignore` 已默认排除 `.env`、`.env.local`、`.env.production`。

### 4.2 仓库中提供的示例文件

| 文件 | 用途 |
|------|------|
| `.env.production.example` | 仓库根目录，生产部署示例 |
| `backend/.env.example` | 后端开发示例 |

复制示例文件后填入真实值：

```bash
cp .env.production.example .env
vim .env
```

---

## 五、漏洞报告流程

### 5.1 报告方式

如果发现安全漏洞，请 **不要** 在公开 Issue 中讨论，而是：

1. 发送邮件至项目维护者邮箱（详见 `package.json` 中的 `author`）
2. 邮件主题以 `[SECURITY]` 开头
3. 详细描述漏洞、复现步骤与影响范围

### 5.2 响应时间

| 阶段 | 时限 |
|------|------|
| 收到确认 | 24 小时内 |
| 初步评估 | 3 个工作日内 |
| 修复发布 | 严重漏洞 7 天内，一般漏洞 30 天内 |
| 公开披露 | 修复发布后 90 天 |

### 5.3 安全公告

安全修复会通过以下渠道公告：

- GitHub Security Advisories
- 项目 CHANGELOG.md 中标记 `安全` 类型的变更

---

## 六、常见安全风险与防护

### 6.1 SQL 注入

**防护**：所有数据库操作通过 TypeORM 参数化查询

```typescript
// ✅ 安全
userRepository.createQueryBuilder('u')
  .where('u.username = :username', { username })
  .getOne()

// ❌ 危险（禁止）
userRepository.query(`SELECT * FROM users WHERE username = '${username}'`)
```

### 6.2 XSS 跨站脚本

**防护**：

- Vue 默认对插值进行 HTML 转义
- 后端响应通过 `helmet` 添加 CSP 头
- 用户输入经 `class-validator` 校验后才入库

### 6.3 CSRF 跨站请求伪造

**防护**：

- API 鉴权依赖 `Authorization` 头部（非 Cookie），天然免疫 CSRF
- CORS 策略限制请求来源

### 6.4 文件上传攻击

**防护**：

- MIME 白名单校验
- 文件大小限制
- 服务端重命名为 UUID
- 不直接执行上传文件（存于静态目录）

### 6.5 暴力破解

**防护**：

- 登录失败 5 次后锁定 15 分钟
- IP 限流（每分钟 10 次）
- 密码强制强度（至少 8 字符，包含字母数字）

### 6.6 敏感信息泄露

**防护**：

- PII 字段自动脱敏
- 错误响应不暴露堆栈信息（生产环境）
- 日志中不输出 token、密码等敏感字段
- `.env` 文件不入仓库

### 6.7 依赖漏洞

定期检查依赖更新：

```bash
cd backend && npm audit
cd buyi-dictionary-vue && npm audit
```

发现严重漏洞及时升级：

```bash
npm audit fix
```

---

## 七、安全最佳实践

### 7.1 密码安全

- 使用 `bcryptjs`，cost factor 不低于 10
- 不存储明文密码
- 不限制密码长度上限（避免 DoS bcrypt）
- 推荐使用密码管理器生成

### 7.2 Token 安全

- Access Token 有效期不超过 15 分钟
- Refresh Token 有效期不超过 30 天
- logout 时立即失效，不等待自然过期
- 不在 URL 中传递 token

### 7.3 HTTPS 强制

- 生产环境必须使用 HTTPS
- HTTP 自动 301 跳转到 HTTPS
- HSTS 头部启用（`Strict-Transport-Security`）
- 证书有效期监控

### 7.4 最小权限原则

- 数据库账号仅授予业务库 CRUD 权限
- 后台账号按角色分配最小权限
- 服务器 SSH 仅允许密钥登录
- Nginx 不暴露内部端口

### 7.5 日志脱敏

日志中禁止输出：

- 用户密码
- 完整 token
- 微信 AppSecret
- 数据库密码
- COS SecretKey
- DeepSeek API Key

使用 `logger.js` 中的 `mask` 函数自动脱敏。
