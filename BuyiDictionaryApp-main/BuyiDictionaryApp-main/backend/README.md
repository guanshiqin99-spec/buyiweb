# 布依词典后端

这是一个基于 `NestJS` 的微信小程序 + 管理后台后端，当前已经补齐最小生产标准所需的核心能力：

- 小程序接口：`/api/miniapp/*`
- 管理后台接口：`/api/admin/*`
- 健康检查：`/api/health`、`/api/ready`
- Swagger：`/api/docs`
- 管理后台静态入口：`/admin-web`
- access token + refresh token 双令牌
- session 级 logout，退出后旧 access token 立即失效
- Excel 模板下载、导入预览、批量导入
- 媒体上传大小和 MIME 校验
- 生产环境强校验、migration、管理员初始化脚本

## 开发启动

1. 复制 `.env.example` 为 `.env`
2. 安装依赖

```bash
npm install
```

3. 启动开发服务

```bash
npm run start:dev
```

4. 本地开发默认地址

- API：`http://127.0.0.1:3000/api`
- Swagger：`http://127.0.0.1:3000/api/docs`
- 管理后台：`http://127.0.0.1:3000/admin-web`

## 生产上线前必须做

1. 切换到 MySQL
2. 关闭 `DB_SYNCHRONIZE`
3. 关闭 `WECHAT_MOCK_MODE`
4. 关闭 `SEED_ON_BOOT`
5. 配置真实 `WECHAT_APP_ID / WECHAT_APP_SECRET`
6. 使用腾讯云 COS，不要用本地上传
7. 设置安全的 `JWT_SECRET`
8. 配置真实 `CORS_ORIGIN`

生产环境若仍保留不安全默认值，服务会直接拒绝启动。

## 数据库迁移

运行基线 migration：

```bash
npm run db:migrate
```

回滚最近一次 migration：

```bash
npm run db:revert
```

## 初始化管理员

生产环境默认不会再自动创建管理员。请显式执行：

```bash
npm run admin:init -- --username=admin --password=Admin@123456
```

再次执行同名账号会更新密码并保持为 `super_admin`。

## 认证接口

- 小程序登录：`POST /api/miniapp/auth/wechat-login`
- 小程序续期：`POST /api/miniapp/auth/refresh`
- 小程序退出：`POST /api/miniapp/auth/logout`
- 后台登录：`POST /api/admin/auth/login`
- 后台续期：`POST /api/admin/auth/refresh`
- 后台退出：`POST /api/admin/auth/logout`

说明：

- `logout` 会停用当前 session
- 停用后，旧 access token 和旧 refresh token 都不可再用

## 媒体上传限制

- 接口：`POST /api/admin/media/upload`
- 表单字段：`file`
- 附加字段：`kind=image|audio`
- 默认大小上限：`10MB`
- 图片白名单：`image/jpeg`、`image/png`、`image/webp`、`image/gif`
- 音频白名单：`audio/mpeg`、`audio/mp3`、`audio/wav`、`audio/x-wav`、`audio/mp4`、`audio/aac`、`audio/ogg`

## Excel 导入

模板下载接口：

- `/api/admin/dictionary/template`
- `/api/admin/phrases/template`
- `/api/admin/proverbs/template`
- `/api/admin/songs/template`

导入接口：

- `/api/admin/dictionary/import`
- `/api/admin/phrases/import`
- `/api/admin/proverbs/import`
- `/api/admin/songs/import`

导入预览接口：

- `/api/admin/dictionary/import-preview`
- `/api/admin/phrases/import-preview`
- `/api/admin/proverbs/import-preview`
- `/api/admin/songs/import-preview`

## 测试

```bash
npm test
```

```bash
npm run lint
```

```bash
npm run build
```
