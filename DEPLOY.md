# 部署文档：单台香港 ECS + Cloudflare DNS（零备案）

## 架构

```
评委浏览器          微信小程序
   │                   │
   │ https://www.buyitech.asia
   ▼                   ▼
Cloudflare DNS（仅解析，灰云，不代理 → 零延迟）
   │
   ▼
阿里云香港 ECS（2核4G，200GB/月免费流量）
公网 IP: 8.217.224.53
   │
   ├─ Caddy :443/:80（自动 HTTPS 证书 - Let's Encrypt）
   │   ├─ /            → 前端静态文件（Vue dist）
   │   ├─ /api         → NestJS :3000
   │   └─ /uploads     → NestJS :3000（音频 /buyi_audio/*.MP3）
   │
   ├─ NestJS 后端（PM2 守护）
   ├─ MySQL 8.0（Docker 容器，仅 127.0.0.1 暴露）
   └─ uploads/buyi_audio/*.MP3
```

**为什么这是最优解：**
- 香港不受大陆备案制度管 → **零备案**
- 单台服务器同源 → **无 CORS、无跨域**
- Cloudflare 仅做 DNS → **零延迟**
- 全部走 200GB 免费流量 → **零成本**
- 试用约 40 天覆盖到 8月底 → **比赛够用**

---

## 服务器信息

| 项目 | 值 |
|------|---|
| 实例 ID | i-j6cgl0oz8krisoz5iei2Z |
| 地域 | 中国香港 |
| 公网 IP | 8.217.224.53 |
| 私网 IP | 172.16.153.204 |
| 规格 | ecs.e-c1m2.large（2核4G） |
| 系统 | Ubuntu 22.04 64位 |
| 带宽 | 100 Mbps 按流量 |
| root 密码 | gsq060606.@ |

---

## 代码已就绪（无需再动）

| 文件 | 改动 |
|------|------|
| [buyi-dictionary-vue/.env.production](file:///d:/BuyiDictionaryWeb/buyi-dictionary-vue/.env.production) | `VITE_API_BASE_URL=/api`（同源相对路径） |
| [BuyiDictionaryApp-main/utils/runtime-config.js](file:///d:/BuyiDictionaryWeb/BuyiDictionaryApp-main/BuyiDictionaryApp-main/utils/runtime-config.js) | API → `https://www.buyitech.asia/api`，关闭 callContainer |
| [BuyiDictionaryApp-main/utils/content-mapper.js](file:///d:/BuyiDictionaryWeb/BuyiDictionaryApp-main/BuyiDictionaryApp-main/utils/content-mapper.js) | 音频 URL 自动补全为完整地址 |

---

## 执行步骤

### 步骤 1：Cloudflare DNS

Cloudflare 控制台 → DNS → Records 添加：

| 类型 | 名称 | 内容 | 代理状态 |
|------|------|------|---------|
| A | `www` | `8.217.224.53` | **仅 DNS（灰云）** |

### 步骤 2：SSH 修复后登录

```bash
ssh root@8.217.224.53
# 密码：gsq060606.@
```

### 步骤 3：服务器基础环境

```bash
# 基础包
apt update && apt upgrade -y
apt install -y git curl wget vim ufw

# 防火墙
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

# Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs
npm install -g pm2

# Caddy（自动 HTTPS）
apt install -y debian-keyring debian-archive-keyring apt-transport-https
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | tee /etc/apt/sources.list.d/caddy-stable.list
apt update && apt install -y caddy

# 项目目录
mkdir -p /opt/buyi-dictionary/frontend
mkdir -p /opt/buyi-dictionary/backend
```

### 步骤 4：MySQL（Docker）

```bash
cat > /opt/buyi-dictionary/docker-compose.yml << 'EOF'
version: '3.8'
services:
  mysql:
    image: mysql:8.0
    container_name: buyi-mysql
    restart: always
    environment:
      MYSQL_ROOT_PASSWORD: Buyi@Dict2026
      MYSQL_DATABASE: buyi_dictionary
      MYSQL_USER: buyi
      MYSQL_PASSWORD: Buyi@Dict2026
    ports:
      - "127.0.0.1:3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql
    command: --character-set-server=utf8mb4 --collation-server=utf8mb4_unicode_ci
volumes:
  mysql_data:
EOF

cd /opt/buyi-dictionary && docker compose up -d
```

### 步骤 5：上传后端代码（本地 PowerShell）

```powershell
scp -r d:/BuyiDictionaryWeb/BuyiDictionaryApp-main/BuyiDictionaryApp-main/backend/* root@8.217.224.53:/opt/buyi-dictionary/backend/

# 音频文件（注意路径）
scp -r d:/BuyiDictionaryWeb/BuyiDictionaryApp-main/BuyiDictionaryApp-main/backend/uploads/* root@8.217.224.53:/opt/buyi-dictionary/backend/uploads/
```

### 步骤 6：后端启动

```bash
cd /opt/buyi-dictionary/backend
npm install
npm run build

cat > /opt/buyi-dictionary/backend/.env << 'EOF'
NODE_ENV=production
PORT=3000
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USERNAME=buyi
DB_PASSWORD=Buyi@Dict2026
DB_DATABASE=buyi_dictionary
DB_SYNC=true
JWT_SECRET=buyi-dict-jwt-secret-2026-change-me
JWT_EXPIRES_IN=7d
MEDIA_PUBLIC_BASE_URL=https://www.buyitech.asia/uploads
APP_PUBLIC_BASE_URL=https://www.buyitech.asia
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
EOF

pm2 start dist/main.js --name buyi-backend
pm2 save && pm2 startup
```

### 步骤 7：构建并上传前端（本地 PowerShell）

```powershell
cd d:/BuyiDictionaryWeb/buyi-dictionary-vue
npm run build
scp -r d:/BuyiDictionaryWeb/buyi-dictionary-vue/dist/* root@8.217.224.53:/opt/buyi-dictionary/frontend/
```

### 步骤 8：Caddy 配置（单域名同时服务前端 + API + 音频）

```bash
cat > /etc/caddy/Caddyfile << 'EOF'
www.buyitech.asia {
    root * /opt/buyi-dictionary/frontend
    file_server

    reverse_proxy /api/* localhost:3000
    reverse_proxy /uploads/* localhost:3000

    try_files {path} /index.html
}
EOF

systemctl enable caddy && systemctl restart caddy
```

### 步骤 9：数据初始化

```bash
ssh root@8.217.224.53
cd /opt/buyi-dictionary/backend
npm run seed
```

### 步骤 10：小程序后台配置

微信公众平台 → 开发管理 → 开发设置 → 服务器域名：

| 类型 | 填写 |
|------|------|
| request 合法域名 | `https://www.buyitech.asia` |
| downloadFile 合法域名 | `https://www.buyitech.asia` |

---

## 验证清单

| 验证项 | 方法 |
|--------|------|
| DNS | `nslookup www.buyitech.asia` 返回 8.217.224.53 |
| HTTPS | 浏览器访问 `https://www.buyitech.asia` 绿锁 |
| API | `curl https://www.buyitech.asia/api/health` 返回 JSON |
| 音频 | 浏览器访问 `https://www.buyitech.asia/uploads/buyi_audio/huiyouge.MP3` 直接播放 |
| Web 搜索 | 前端搜索词条返回数据 |
| Web 播放 | 前端播放民歌出声 |
| 小程序搜索 | 小程序搜索词条返回数据 |
| 小程序播放 | 小程序播放民歌出声 |

---

## 成本

| 项目 | 费用 |
|------|------|
| 阿里云香港 ECS（试用） | ¥0 |
| 流量 200GB/月 | ¥0 |
| Cloudflare DNS | ¥0 |
| Let's Encrypt 证书 | ¥0 |
| **总计** | **¥0** |
