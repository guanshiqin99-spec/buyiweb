# API 参考文档

> 本文档列出后端 NestJS 暴露的所有 HTTP 端点，分为小程序、后台管理、公共接口三组。
>
> 完整的 OpenAPI 文档请访问后端启动后的 <http://127.0.0.1:3000/api/docs>（Swagger UI）。

---

## 一、通用约定

### 1.1 基础地址

- 开发环境：`http://127.0.0.1:3000/api`
- 生产环境：`https://your-domain.com/api`

### 1.2 请求头

| 头部 | 说明 | 示例 |
|------|------|------|
| `Content-Type` | 请求体类型 | `application/json`、`multipart/form-data` |
| `Authorization` | JWT 令牌（鉴权接口必填） | `Bearer eyJhbGc...` |

### 1.3 响应格式

成功响应统一包装：

```json
{
  "code": 0,
  "message": "ok",
  "data": { ... }
}
```

错误响应：

```json
{
  "code": 40001,
  "message": "参数校验失败",
  "details": [{ "field": "username", "message": "不能为空" }]
}
```

### 1.4 分页参数

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `page` | number | 1 | 页码 |
| `pageSize` | number | 20 | 每页条数 |

分页响应：

```json
{
  "list": [...],
  "total": 100,
  "page": 1,
  "pageSize": 20
}
```

### 1.5 状态码

| 状态码 | 含义 |
|--------|------|
| 200 | 成功 |
| 400 | 参数错误 |
| 401 | 未授权（token 失效或缺失） |
| 403 | 禁止访问（权限不足） |
| 404 | 资源不存在 |
| 429 | 请求过于频繁 |
| 500 | 服务器错误 |

---

## 二、小程序接口（`/api/miniapp/*`）

> 面向小程序与 Web 前端，鉴权使用 `MiniappJwtGuard`，token 通过 `Authorization: Bearer <token>` 传递。

### 2.1 认证（`/miniapp/auth`）

| 方法 | 路径 | 鉴权 | 说明 |
|------|------|------|------|
| POST | `/miniapp/auth/wechat-login` | 否 | 微信小程序登录（code → openid） |
| POST | `/miniapp/auth/web-login` | 否 | Web 端账号密码登录 |
| POST | `/miniapp/auth/register` | 否 | 注册新用户 |
| POST | `/miniapp/auth/refresh` | refresh token | 刷新 access token |
| POST | `/miniapp/auth/logout` | 是 | 退出登录（session 立即失效） |

**登录响应**：

```json
{
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc...",
  "userInfo": {
    "id": 1,
    "username": "user1",
    "avatar": "https://..."
  }
}
```

### 2.2 首页（`/miniapp/home`）

| 方法 | 路径 | 鉴权 | 说明 |
|------|------|------|------|
| GET | `/miniapp/home` | 否 | 首页轮播、推荐、统计 |

### 2.3 用户信息（`/miniapp/me`）

| 方法 | 路径 | 鉴权 | 说明 |
|------|------|------|------|
| GET | `/miniapp/me` | 是 | 获取当前用户信息 |

### 2.4 词条（`/miniapp/dictionary`）

| 方法 | 路径 | 鉴权 | 说明 |
|------|------|------|------|
| GET | `/miniapp/dictionary` | 否 | 词条列表（分页） |
| GET | `/miniapp/dictionary/:id` | 否 | 词条详情 |

### 2.5 短语（`/miniapp/phrases`）

| 方法 | 路径 | 鉴权 | 说明 |
|------|------|------|------|
| GET | `/miniapp/phrases` | 否 | 短语列表 |
| GET | `/miniapp/phrases/:id` | 否 | 短语详情 |

### 2.6 谚语（`/miniapp/proverbs`）

| 方法 | 路径 | 鉴权 | 说明 |
|------|------|------|------|
| GET | `/miniapp/proverbs` | 否 | 谚语列表 |
| GET | `/miniapp/proverbs/:id` | 否 | 谚语详情 |

### 2.7 民歌（`/miniapp/songs`）

| 方法 | 路径 | 鉴权 | 说明 |
|------|------|------|------|
| GET | `/miniapp/songs` | 否 | 民歌列表 |
| GET | `/miniapp/songs/:id` | 否 | 民歌详情（含音频地址） |

### 2.8 文化展项（`/miniapp/culture-exhibits`）

| 方法 | 路径 | 鉴权 | 说明 |
|------|------|------|------|
| GET | `/miniapp/culture-exhibits` | 否 | 文化展项列表 |
| GET | `/miniapp/culture-exhibits/:id` | 否 | 展项详情 |

### 2.9 综合搜索（`/miniapp/search`）

| 方法 | 路径 | 鉴权 | 说明 |
|------|------|------|------|
| GET | `/miniapp/search` | 否 | 全局搜索（词条/短语/谚语/民歌） |
| GET | `/miniapp/search/suggest` | 否 | 搜索建议词 |
| GET | `/miniapp/search/hot` | 否 | 热门搜索 |
| GET | `/miniapp/search/mine` | 是 | 我的搜索历史 |

**搜索参数**：

```text
GET /miniapp/search?q=你好&page=1&pageSize=20&type=all
```

| 参数 | 说明 |
|------|------|
| `q` | 关键词 |
| `type` | `all` / `dictionary` / `phrases` / `proverbs` / `songs` |

### 2.10 收藏（`/miniapp/favorites`）

| 方法 | 路径 | 鉴权 | 说明 |
|------|------|------|------|
| GET | `/miniapp/favorites` | 是 | 收藏列表 |
| POST | `/miniapp/favorites/toggle` | 是 | 切换收藏状态 |
| DELETE | `/miniapp/favorites` | 是 | 清空收藏 |

**切换收藏**：

```json
// 请求
POST /miniapp/favorites/toggle
{
  "contentType": "dictionary",
  "contentId": 1
}

// 响应
{
  "favorited": true
}
```

### 2.11 学习记录（`/miniapp/learning-records`）

| 方法 | 路径 | 鉴权 | 说明 |
|------|------|------|------|
| GET | `/miniapp/learning-records` | 是 | 学习记录列表 |
| GET | `/miniapp/learning-records/stats` | 是 | 学习统计 |
| POST | `/miniapp/learning-records` | 是 | 创建学习记录 |
| DELETE | `/miniapp/learning-records` | 是 | 清空记录 |

### 2.12 答题（`/miniapp/quiz`）

| 方法 | 路径 | 鉴权 | 说明 |
|------|------|------|------|
| GET | `/miniapp/quiz` | 否 | 获取题库 |
| POST | `/miniapp/quiz/attempts` | 是 | 提交答题 |
| GET | `/miniapp/quiz/attempts` | 是 | 我的答题记录 |

### 2.13 徽章（`/miniapp/badges`）

| 方法 | 路径 | 鉴权 | 说明 |
|------|------|------|------|
| GET | `/miniapp/badges` | 是 | 我的徽章列表 |

### 2.14 用户设置（`/miniapp/settings`）

| 方法 | 路径 | 鉴权 | 说明 |
|------|------|------|------|
| GET | `/miniapp/settings` | 是 | 获取用户设置 |
| PUT | `/miniapp/settings` | 是 | 更新用户设置 |

### 2.15 AI 助手（`/miniapp/agent`）

| 方法 | 路径 | 鉴权 | 说明 |
|------|------|------|------|
| POST | `/miniapp/agent/ask` | 是 | AI 问答（SSE 流式） |

**请求示例**：

```text
POST /miniapp/agent/ask
Authorization: Bearer <token>
Content-Type: application/json

{
  "question": "布依族民歌有什么特点？",
  "context": "culture"
}
```

**响应（SSE 流式）**：

```text
data: {"type":"delta","content":"布依族民歌"}

data: {"type":"delta","content":"以好花红调为代表"}

data: {"type":"done"}
```

---

## 三、后台管理接口（`/api/admin/*`）

> 面向运营管理后台，鉴权使用 `AdminJwtGuard` + `RolesGuard`（RBAC），权限通过 `@RequirePermission` 装饰器声明。

### 3.1 管理员认证（`/admin/auth`）

| 方法 | 路径 | 鉴权 | 说明 |
|------|------|------|------|
| POST | `/admin/auth/login` | 否 | 管理员登录 |
| POST | `/admin/auth/refresh` | refresh token | 刷新 token |
| POST | `/admin/auth/logout` | 是 | 退出 |

### 3.2 内容管理（`/admin/{dictionary,phrases,proverbs,songs}`）

每个内容类型支持相同接口：

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/admin/dictionary` | 列表（分页、筛选） |
| GET | `/admin/dictionary/:id` | 详情 |
| POST | `/admin/dictionary` | 创建 |
| PUT | `/admin/dictionary/:id` | 更新 |
| DELETE | `/admin/dictionary/:id` | 删除 |
| GET | `/admin/dictionary/template` | 下载 Excel 模板 |
| POST | `/admin/dictionary/import-preview` | 上传 Excel 预览 |
| POST | `/admin/dictionary/import` | 正式导入 |

### 3.3 媒体上传（`/admin/media`）

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/admin/media/upload` | 上传图片或音频 |

**请求**：`multipart/form-data`

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `file` | File | 是 | 文件 |
| `kind` | string | 是 | `image` 或 `audio` |

**限制**：

- 单文件最大 10MB
- 图片：`image/jpeg`、`image/png`、`image/webp`、`image/gif`
- 音频：`audio/mpeg`、`audio/mp3`、`audio/wav`、`audio/x-wav`、`audio/mp4`、`audio/aac`、`audio/ogg`

### 3.4 仪表盘（`/admin/dashboard`）

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/admin/dashboard/stats` | 关键指标统计 |
| GET | `/admin/dashboard/trends` | 趋势数据 |

### 3.5 用户管理（`/admin/users`）

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/admin/users` | 用户列表 |
| PUT | `/admin/users/:id` | 更新用户 |
| DELETE | `/admin/users/:id` | 禁用用户 |

### 3.6 文化展项管理（`/admin/culture-exhibits`）

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/admin/culture-exhibits` | 列表 |
| POST | `/admin/culture-exhibits` | 创建 |
| PUT | `/admin/culture-exhibits/:id` | 更新 |
| DELETE | `/admin/culture-exhibits/:id` | 删除 |

---

## 四、公共接口

### 4.1 健康检查

| 方法 | 路径 | 鉴权 | 说明 |
|------|------|------|------|
| GET | `/api/health` | 否 | 存活检查（liveness） |
| GET | `/api/ready` | 否 | 就绪检查（readiness） |

**响应**：

```json
{
  "status": "ok",
  "timestamp": "2026-07-21T10:00:00.000Z",
  "uptime": 3600,
  "database": "connected"
}
```

### 4.2 Swagger 文档

- 地址：`/api/docs`
- 仅在 `ENABLE_SWAGGER=true`（开发默认）时启用
- 生产环境建议关闭

### 4.3 后台管理页面

- 地址：`/admin-web/`
- 由 NestJS 通过 `@nestjs/serve-static` 提供
- 是一个静态前端 SPA

---

## 五、前端 API 封装

Web 前端在 [`buyi-dictionary-vue/src/utils/api.js`](../buyi-dictionary-vue/src/utils/api.js) 中封装了所有接口调用：

| API 对象 | 方法 | 对应端点 |
|---------|------|---------|
| `authApi` | login / register / logout | `POST /miniapp/auth/*` |
| `homeApi` | get | `GET /miniapp/home` |
| `meApi` | get | `GET /miniapp/me` |
| `settingsApi` | get / update | `GET/PUT /miniapp/settings` |
| `searchApi` | search / searchMine / suggest / hot | `GET /miniapp/search*` |
| `contentApi` | list / getDetail / listMine | `GET /miniapp/{dictionary,phrases,proverbs,songs}` |
| `favoritesApi` | list / toggle / clear | `GET/POST/DELETE /miniapp/favorites` |
| `recordsApi` | list / stats / create / clear | `GET/POST/DELETE /miniapp/learning-records` |
| `badgesApi` | list | `GET /miniapp/badges` |
| `healthApi` | check | `GET /health` |
| `agentApi` | askStream | `POST /miniapp/agent/ask`（SSE 流式） |

调用示例：

```javascript
import { searchApi } from '@/utils/api'

const results = await searchApi.search({
  q: '你好',
  type: 'all',
  page: 1,
  pageSize: 20
})
```

---

## 六、限流与安全

### 6.1 限流策略

后端 `common/http/rate-limit.ts` 定义了限流规则：

- 登录接口：每个 IP 每分钟 10 次
- 注册接口：每个 IP 每分钟 5 次
- 一般接口：每个用户每分钟 60 次

超过限制返回 `429 Too Many Requests`。

### 6.2 登录失败锁定

`auth-security/login-lockout.service.ts`：

- 同一账号连续失败 5 次后锁定 15 分钟
- 锁定期间即使密码正确也拒绝登录

### 6.3 请求头安全

通过 `helmet` 中间件添加：

- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `Strict-Transport-Security`（HTTPS 时）
- `Content-Security-Policy`

---

## 七、错误码参考

| 错误码 | 含义 |
|--------|------|
| 0 | 成功 |
| 40001 | 参数校验失败 |
| 40101 | 未授权（token 无效或过期） |
| 40102 | refresh token 无效 |
| 40301 | 权限不足 |
| 40401 | 资源不存在 |
| 40901 | 资源冲突（如用户名已存在） |
| 42201 | 业务校验失败 |
| 42901 | 请求过于频繁 |
| 50001 | 服务器内部错误 |
