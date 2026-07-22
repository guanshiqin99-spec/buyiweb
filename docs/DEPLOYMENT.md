# 部署指南

> 本文档说明如何将布依族词典项目部署到生产环境，覆盖 Web 前端、后端、数据库、Nginx 与 Docker 全流程。
>
> 最后更新：2026-07-21

---

## 一、部署方案对比

| 方案 | 适用场景 | 优点 | 缺点 |
|------|---------|------|------|
| Docker Compose | 中小规模、快速上线 | 一键启动、环境隔离 | 资源占用略高 |
| Nginx + PM2 + MySQL | 传统生产部署 | 性能最佳、运维成熟 | 配置繁琐 |
| 阿里云 / 腾讯云 ECS | 自建服务器 | 完全可控 | 需自行运维 |
| Vercel + 云数据库 | Serverless | 极简部署 | 不适合长连接 |

---

## 二、Docker Compose 一键部署（推荐）

### 2.1 准备环境变量

复制示例文件并填写真实值：

```bash
cp .env.production.example .env
```

`.env` 必须填写的字段：

```env
MYSQL_ROOT_PASSWORD=your-strong-mysql-root-password
MYSQL_DATABASE=buyi_dictionary
MYSQL_USER=buyi_user
MYSQL_PASSWORD=your-strong-mysql-user-password

APP_PUBLIC_BASE_URL=https://your-domain.com
JWT_SECRET=your-production-jwt-secret-at-least-32-characters
CORS_ORIGIN=https://your-domain.com,https://servicewechat.com

WECHAT_APP_ID=your-wechat-miniapp-app-id
WECHAT_APP_SECRET=your-wechat-miniapp-app-secret
WECHAT_MOCK_MODE=false

AI_PROVIDER=deepseek
DEEPSEEK_API_KEY=your-deepseek-api-key
AI_BASE_URL=https://api.deepseek.com
AI_MODEL=deepseek-chat
```

### 2.2 启动服务

```bash
docker compose up -d
```

启动后服务分布：

| 容器 | 端口 | 用途 |
|------|------|------|
| `buyi-mysql` | 3306 | MySQL 8.0 数据库 |
| `buyi-backend` | 3000 | NestJS 后端 |
| `buyi-web` | 8080 → 80 | Nginx 托管 Vue 静态文件 |

### 2.3 初始化数据库与管理员

首次启动后需手动执行：

```bash
# 执行数据库迁移
docker exec -it buyi-backend npm run db:migrate

# 初始化管理员账号
docker exec -it buyi-backend npm run admin:init -- --username=admin --password=YourStrongPassword
```

### 2.4 验证部署

```bash
# 健康检查
curl http://localhost:3000/api/health

# 访问后台
open http://localhost:8080/admin-web/

# 访问 Web 前端
open http://localhost:8080/
```

---

## 三、传统部署（Nginx + PM2 + MySQL）

### 3.1 服务器准备

**推荐配置**：

- Linux 服务器（Ubuntu 22.04 / CentOS 8+）
- 2 核 4G 内存起步
- 40GB 系统盘
- 已备案域名 + HTTPS 证书
- Node.js 20.x、MySQL 8.0、Nginx、PM2 已安装

### 3.2 上传代码

将项目上传到服务器，建议路径：

```text
/www/buyi-dictionary/
├── buyi-dictionary-vue/
├── BuyiDictionaryApp-main/
│   └── BuyiDictionaryApp-main/
│       └── backend/
└── docker-compose.yml
```

### 3.3 配置后端环境变量

进入后端目录，编辑 `.env`：

```bash
cd /www/buyi-dictionary/BuyiDictionaryApp-main/BuyiDictionaryApp-main/backend
cp .env.example .env
vim .env
```

生产环境必填项：

```env
NODE_ENV=production
PORT=3000
APP_PUBLIC_BASE_URL=https://your-domain.com
ENABLE_SWAGGER=false

# JWT（必须使用 32+ 字符的随机字符串）
JWT_SECRET=$(openssl rand -hex 32)

# CORS
CORS_ORIGIN=https://your-domain.com

# 数据库
DB_TYPE=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USERNAME=buyi_user
DB_PASSWORD=your-strong-password
DB_NAME=buyi_dictionary
DB_SYNCHRONIZE=false
DB_LOGGING=false

# 微信小程序
WECHAT_APP_ID=your-real-app-id
WECHAT_APP_SECRET=your-real-app-secret
WECHAT_MOCK_MODE=false

# 媒体存储
MEDIA_DRIVER=cos
MEDIA_PUBLIC_BASE_URL=https://cdn.your-domain.com
COS_SECRET_ID=your-cos-secret-id
COS_SECRET_KEY=your-cos-secret-key
COS_BUCKET=your-bucket-1250000000
COS_REGION=ap-beijing
COS_PUBLIC_BASE_URL=https://cdn.your-domain.com

# 种子数据（生产关闭）
SEED_ON_BOOT=false
DEFAULT_ADMIN_USERNAME=
DEFAULT_ADMIN_PASSWORD=

# AI 助手
AI_PROVIDER=deepseek
DEEPSEEK_API_KEY=your-deepseek-key
AI_BASE_URL=https://api.deepseek.com
AI_MODEL=deepseek-chat
```

### 3.4 安装依赖与构建

```bash
cd /www/buyi-dictionary/BuyiDictionaryApp-main/BuyiDictionaryApp-main/backend

npm install --production=false
npm run build
```

### 3.5 执行数据库迁移

```bash
npm run db:migrate
```

### 3.6 初始化管理员账号

```bash
npm run admin:init -- --username=admin --password=YourStrongPassword
```

### 3.7 用 PM2 启动后端

```bash
pm2 start dist/main.js --name buyi-backend
pm2 save
pm2 startup    # 按提示执行返回的命令
```

查看日志：

```bash
pm2 logs buyi-backend
pm2 status
```

### 3.8 构建并部署 Web 前端

```bash
cd /www/buyi-dictionary/buyi-dictionary-vue
npm install
npm run build
```

构建产物在 `dist/`，将其复制到 Nginx 静态目录：

```bash
sudo mkdir -p /var/www/buyi-web
sudo cp -r dist/* /var/www/buyi-web/
```

---

## 四、Nginx 配置

### 4.1 单域名方案（推荐）

```nginx
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /etc/nginx/ssl/your-domain.com.fullchain.pem;
    ssl_certificate_key /etc/nginx/ssl/your-domain.com.key.pem;
    ssl_protocols TLSv1.2 TLSv1.3;

    client_max_body_size 20m;

    # Web 前端静态文件
    root /var/www/buyi-web;
    index index.html;

    # SPA 路由回退
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API 请求转发给 NestJS
    location /api/ {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # 后台管理页面（由 NestJS 提供）
    location /admin-web/ {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
    }

    # 媒体资源（若使用本地存储）
    location /uploads/ {
        proxy_pass http://127.0.0.1:3000;
    }
}
```

### 4.2 双域名方案（前后端分域）

```nginx
# api.your-domain.com
server {
    listen 443 ssl http2;
    server_name api.your-domain.com;

    ssl_certificate /etc/nginx/ssl/api.fullchain.pem;
    ssl_certificate_key /etc/nginx/ssl/api.key.pem;

    client_max_body_size 20m;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# admin.your-domain.com
server {
    listen 443 ssl http2;
    server_name admin.your-domain.com;

    ssl_certificate /etc/nginx/ssl/admin.fullchain.pem;
    ssl_certificate_key /etc/nginx/ssl/admin.key.pem;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
    }
}

# your-domain.com（Web 前端）
server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /etc/nginx/ssl/web.fullchain.pem;
    ssl_certificate_key /etc/nginx/ssl/web.key.pem;

    root /var/www/buyi-web;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

### 4.3 启用 HTTPS

使用 Let's Encrypt 免费证书：

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

证书自动续期：

```bash
sudo crontab -e
# 添加：0 12 * * * /usr/bin/certbot renew --quiet
```

---

## 五、小程序部署

### 5.1 部署流程

1. 在微信公众平台完成小程序备案
2. 在「开发管理 → 开发设置 → 服务器域名」添加合法 request 域名：

   ```text
   https://your-domain.com
   ```

3. 修改小程序生产接口地址（`utils/runtime-config.js`）：

   ```text
   https://your-domain.com/api
   ```

4. 在微信开发者工具中上传代码
5. 提交审核
6. 审核通过后发布

### 5.2 上线前检查清单

- [ ] 小程序请求的是 HTTPS 域名（非 HTTP IP）
- [ ] 域名已正确解析到服务器
- [ ] Nginx 证书有效，浏览器访问不报错
- [ ] 微信公众平台已添加合法域名
- [ ] 后端 `WECHAT_MOCK_MODE=false`
- [ ] 后端已配置真实 `WECHAT_APP_ID` 与 `WECHAT_APP_SECRET`
- [ ] `MEDIA_DRIVER` 不再使用 `local`

---

## 六、Docker 镜像构建

### 6.1 前端镜像

[`buyi-dictionary-vue/Dockerfile`](../buyi-dictionary-vue/Dockerfile)：

```dockerfile
FROM node:20-alpine AS build
WORKDIR /app/web
COPY package*.json ./
RUN npm ci
COPY . ./
RUN npm run build

FROM nginx:alpine AS runtime
COPY --from=build /app/web/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### 6.2 后端镜像

详见 [`backend/Dockerfile`](../BuyiDictionaryApp-main/BuyiDictionaryApp-main/backend/Dockerfile)。

### 6.3 推送到镜像仓库（可选）

```bash
# 登录阿里云镜像仓库
docker login --username=your-username registry.cn-beijing.aliyuncs.com

# 构建并推送
docker build -t registry.cn-beijing.aliyuncs.com/your-namespace/buyi-backend:1.0.0 ./backend
docker push registry.cn-beijing.aliyuncs.com/your-namespace/buyi-backend:1.0.0
```

---

## 七、部署后验证

### 7.1 健康检查

```bash
curl https://your-domain.com/api/health
# 期望返回：{"status":"ok",...}
```

### 7.2 后台管理

浏览器访问：

```text
https://your-domain.com/admin-web/
```

使用初始化的管理员账号登录，检查：

- 词条列表能否显示
- 新建词条是否成功
- Excel 模板能否下载
- 媒体上传是否正常

### 7.3 Web 前端

浏览器访问：

```text
https://your-domain.com/
```

检查：

- 首页能否加载轮播图
- 词典搜索能否查到内容
- 民歌能否播放音频
- 登录注册是否正常
- 收藏与学习记录是否同步

### 7.4 小程序

使用微信开发者工具或真机预览，检查：

- 首页加载正常
- 搜索功能正常
- 登录与收藏同步
- 民歌播放正常

---

## 八、生产环境检查清单

部署完成后，对照下表逐项确认：

### 8.1 后端配置

- [ ] `NODE_ENV=production`
- [ ] `JWT_SECRET` 已替换为 32+ 字符随机字符串
- [ ] `DB_TYPE=mysql`（不再使用 sqljs）
- [ ] `DB_SYNCHRONIZE=false`
- [ ] `WECHAT_MOCK_MODE=false`
- [ ] `WECHAT_APP_ID` 与 `WECHAT_APP_SECRET` 为真实值
- [ ] `MEDIA_DRIVER=cos`（不再使用 local）
- [ ] `SEED_ON_BOOT=false`
- [ ] `ENABLE_SWAGGER=false`（生产关闭文档）
- [ ] `CORS_ORIGIN` 已正确配置

### 8.2 网络与证书

- [ ] 域名已备案并解析到服务器
- [ ] HTTPS 证书有效（Let's Encrypt 或云服务商）
- [ ] Nginx `client_max_body_size` ≥ 10MB
- [ ] HTTP 自动 301 跳转到 HTTPS

### 8.3 数据库

- [ ] MySQL 已设置强密码
- [ ] 数据库已备份策略
- [ ] 已执行 migration
- [ ] 管理员账号已初始化

### 8.4 微信小程序

- [ ] 公众平台已配置合法 request 域名
- [ ] 小程序生产接口地址为 HTTPS
- [ ] 已上传代码并通过审核

### 8.5 监控与日志

- [ ] PM2 已配置 `pm2 startup`
- [ ] 日志轮转已配置（`pm2 install pm2-logrotate`）
- [ ] 服务器监控告警已配置

---

## 九、回滚流程

### 9.1 应用回滚

```bash
# 1. 拉取旧版本代码
cd /www/buyi-dictionary
git fetch --all
git checkout <previous-tag>

# 2. 重新构建后端
cd BuyiDictionaryApp-main/BuyiDictionaryApp-main/backend
npm run build

# 3. 重启服务
pm2 restart buyi-backend

# 4. 重新构建前端
cd /www/buyi-dictionary/buyi-dictionary-vue
npm run build
sudo cp -r dist/* /var/www/buyi-web/
```

### 9.2 数据库回滚

```bash
cd BuyiDictionaryApp-main/BuyiDictionaryApp-main/backend
npm run db:revert    # 回滚最近一次 migration
```

> 数据库回滚有数据丢失风险，操作前务必先备份。

---

## 十、常用运维命令

```bash
# 查看服务状态
pm2 status
pm2 logs buyi-backend --lines 100

# 重启服务
pm2 restart buyi-backend

# 重载 Nginx 配置
sudo nginx -s reload

# 查看 MySQL 状态
sudo systemctl status mysql

# 查看磁盘占用
df -h
du -sh /var/www/buyi-web/

# 查看进程
ps aux | grep node

# 查看 3000 端口连接
ss -tunap | grep :3000
```
