# 生产部署说明

## 目标

- 后端部署到真实 HTTPS 域名
- 数据库使用 MySQL
- 媒体使用腾讯云 COS
- 小程序正式版连接真实 API
- 管理后台与 API 同域或受控跨域

## 推荐步骤

1. 准备 MySQL 数据库并创建生产库
2. 配置生产 `.env`
3. 执行 migration
4. 显式初始化管理员
5. 启动后端
6. 验证 `/api/health` 与 `/api/ready`
7. 更新小程序正式环境 API 地址

## 关键环境变量

```env
NODE_ENV=production
APP_PUBLIC_BASE_URL=https://api.example.com
JWT_SECRET=replace-with-a-long-random-secret
CORS_ORIGIN=https://admin.example.com

DB_TYPE=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USERNAME=buyi
DB_PASSWORD=replace-me
DB_NAME=buyi_dictionary
DB_SYNCHRONIZE=false

WECHAT_APP_ID=wx1234567890
WECHAT_APP_SECRET=replace-me
WECHAT_MOCK_MODE=false

MEDIA_DRIVER=cos
MEDIA_MAX_FILE_SIZE=10485760
COS_SECRET_ID=replace-me
COS_SECRET_KEY=replace-me
COS_BUCKET=replace-me
COS_REGION=ap-guangzhou
COS_PUBLIC_BASE_URL=https://cdn.example.com

SEED_ON_BOOT=false
ENABLE_SWAGGER=true
```

## 执行命令

安装依赖：

```bash
npm install
```

执行 migration：

```bash
npm run db:migrate
```

初始化管理员：

```bash
npm run admin:init -- --username=admin --password=replace-me
```

启动生产服务：

```bash
npm run build
npm run start:prod
```

## 上线后检查

- `GET /api/health` 返回 `200`
- `GET /api/ready` 返回 `200`
- 管理后台登录、刷新、退出正常
- 小程序正式版能真实微信登录
- 上传图片与音频成功
- 非法 MIME 和超大文件会被拒绝
