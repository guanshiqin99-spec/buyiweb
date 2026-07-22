# AI 导览员响应失败解决方案

## 问题摘要

AI 导览员在阿里云生产环境（`39.105.222.204`）响应失败，前端显示"抱歉，智能体响应失败，请稍后重试"。

用户所述"SSH 无法实现流式响应"经排查**并非流式传输协议（SSE）问题，而是 DeepSeek API 密钥在生产环境未配置导致的静默失败**：

- `deploy/.env` 第 21 行 `DEEPSEEK_API_KEY=`（空值）
- 后端 `isConfigured()` 返回 `false` → 控制器直接返回 `{type:'error', message:'智能体服务暂未配置'}`
- 前端 `agentStream.js` 收到 error 事件 → `agent.js` store 显示通用失败文案
- 本地开发正常（`backend/.env` 有有效密钥），故用户误以为是部署/传输层问题

次要风险：Nginx SSE 缓冲配置不一致、CORS 配置冲突、缺少 API Key 启动校验。本方案一并修复以防复发。

## 当前状态分析

### AI 导览员调用链路
```
AgentPanel.vue → agentStore.send() → askStream() [fetch + ReadableStream]
  → POST /api/miniapp/agent/ask [SSE, text/event-stream]
  → Nginx /api/ 反代 → backend:3000
  → MiniappAgentController.ask() → isConfigured() 检查
  → [key 为空] 返回 {type:'error'}  ← 失败发生在这里
  → [key 有值] MiniappAgentService.streamChat() → DeepSeek API (stream:true)
```

### 根因定位（按确定性排序）

| # | 根因 | 证据 | 影响 |
|---|------|------|------|
| 1 | **DEEPSEEK_API_KEY 生产环境为空** | `deploy/.env:21` 空值；`upload_backend.py:50` 上传时排除 `.env` 文件 | AI 导览员 100% 失败，返回"未配置"错误 |
| 2 | **runtime-validation 未校验 API Key** | `runtime-validation.ts` 无 `DEEPSEEK_API_KEY` 检查 | 后端正常启动，失败静默，难以诊断 |
| 3 | **Nginx SSE 配置不一致** | `buyi-dictionary-vue/nginx.conf`（Docker 版）缺 `proxy_buffering off`；`config_nginx_http.py` 有配置但未 reload；`setup_nginx.py` reload 但无前端静态服务 | 若 Key 修复后，Docker 部署场景 SSE 仍可能被缓冲（后端已设 `X-Accel-Buffering: no` 可部分缓解） |
| 4 | **CORS_ORIGIN=\* + credentials=true** | `deploy/.env:10`；`main.ts:30-32` | W3C 禁止组合；同源 Web 前端不受影响，但跨端（小程序/其他域名）会失败 |

### 部署拓扑（基于内存与脚本推断）
- 前端：阿里云 ECS 宿主 Nginx（80 端口）提供 `/var/www/buyi-web` 静态文件，HTTP IP 直连
- 后端：阿里云 ECS 上运行（Docker 或直连），监听 `127.0.0.1:3000`
- Nginx `/api/` 反代到 `127.0.0.1:3000/api/`
- 前端生产构建 `VITE_API_BASE_URL=/api`（同源，无 CORS 问题）

## 拟定修改

### 修改 1：填充 DEEPSEEK_API_KEY（核心修复）
**文件**：`deploy/.env`
**改动**：第 21 行 `DEEPSEEK_API_KEY=` → `DEEPSEEK_API_KEY=<从本地 backend/.env 取已验证可用的密钥>`
**原因**：使后端 `isConfigured()` 返回 true，AI 导览员能正常调用 DeepSeek
**部署**：修改后需重建后端容器（`docker-compose up -d --force-recreate backend`）或重启后端进程

### 修改 2：补充 API Key 启动校验（防复发）
**文件**：`backend/src/config/runtime-validation.ts`
**改动**：在 `validateEnvironmentOrThrow` 函数的 `requireValue` 调用区块（第 55-63 行附近）新增：
```typescript
requireValue(errors, 'DEEPSEEK_API_KEY', env.DEEPSEEK_API_KEY);
```
**原因**：生产环境若遗漏 API Key，后端启动即报错退出，而非静默运行后 AI 功能不可用
**注意**：仅生产环境（`NODE_ENV=production`）触发校验，不影响开发

### 修改 3：统一并修复 Nginx SSE 配置（预防性）
**文件 A**：`buyi-dictionary-vue/nginx.conf`（Docker web 容器版）
**改动**：在 `location /api/ {}` 块（第 14-21 行）内追加 SSE 优化指令：
```nginx
location /api/ {
    proxy_pass http://backend:3000/;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    # SSE 流式响应优化
    proxy_buffering off;
    proxy_cache off;
    proxy_read_timeout 300s;
    proxy_send_timeout 300s;
    chunked_transfer_encoding on;
}
```
**原因**：Docker 部署场景下确保 SSE 不被缓冲

**文件 B**：`config_nginx_http.py`（宿主 Nginx 版，当前生产使用）
**改动**：在脚本末尾 `nginx -t` 测试通过后（第 100-101 行之后），补充启用站点 + reload 逻辑（当前脚本只写入文件不启用不重载）：
```python
# 启用站点
run_cmd(ssh, "ln -sf /etc/nginx/sites-available/buyi-backend /etc/nginx/sites-enabled/buyi-backend")
run_cmd(ssh, "rm -f /etc/nginx/sites-enabled/default")
# 重载
stdin, stdout, stderr = ssh.exec_command('systemctl reload nginx')
print(stdout.read().decode(), stderr.read().decode())
```
**原因**：当前脚本写入配置后未启用站点、未 reload，导致配置可能未生效。该脚本内容已含 `proxy_buffering off`，只需补全启用步骤

### 修改 4：修复 CORS 配置（预防性）
**文件**：`deploy/.env`
**改动**：第 10 行 `CORS_ORIGIN=*` → `CORS_ORIGIN=http://39.105.222.204`
**原因**：`origin: ['*']` + `credentials: true` 是 W3C 禁止组合。改为具体来源（同源 Web 前端地址），避免跨端请求被浏览器拒绝
**注意**：Web 前端同源访问不依赖 CORS，此项主要保障小程序/其他客户端

### 修改 5：改进前端错误提示（UX 优化）
**文件**：`buyi-dictionary-vue/src/stores/agent.js`
**改动**：`onError` 回调（第 81-89 行）区分错误类型，当收到"未配置"类错误时显示更准确的提示：
```javascript
onError: (err) => {
  this.loading = false
  this._controller = null
  const msg = err?.message || ''
  if (!this.messages[agentIndex].text) {
    if (msg.includes('未配置') || msg.includes('联系管理员')) {
      this.messages[agentIndex].text = '智能体服务暂未配置，请联系管理员开通 AI 问答功能。'
    } else {
      this.messages[agentIndex].text = '抱歉，智能体响应失败，请稍后重试。'
    }
  } else {
    this.messages[agentIndex].text += '\n\n[响应中断]'
  }
  console.error('[agent] 响应失败:', err)
}
```
**原因**：当前所有错误都显示"响应失败"，无法区分"服务未配置"与"网络异常"，增加诊断难度

## 假设与决策

1. **部署方式假设**：基于内存记录（前端部署到阿里云 Nginx、HTTP IP 直连）与 `config_nginx_http.py`/`setup_nginx.py` 脚本，推断生产使用宿主 Nginx + 后端（Docker 或直连）。执行阶段第一步将 SSH 诊断确认。
2. **API Key 来源**：复用本地 `backend/.env` 中已验证的 DeepSeek 密钥。若该密钥已过期/限流，需用户申请新密钥。
3. **最小改动原则**：核心修复仅修改 1 行（`deploy/.env` 的 API Key），其余为预防性加固，遵循用户偏好。
4. **不改动 SSE 协议本身**：前端 fetch + reader、后端 res.write 的 SSE 实现正确，无需重写。

## 验证步骤

### 步骤 1：SSH 诊断（确认根因与部署方式）
```bash
# 确认后端运行方式
docker ps | grep buyi            # Docker 部署？
ps aux | grep node               # 直连部署？
# 确认 API Key 是否传入后端
docker exec buyi-backend env | grep DEEPSEEK_API_KEY   # Docker
# 或 cat /root/buyi-backend/.env | grep DEEPSEEK        # 直连
# 确认 Nginx 实际生效配置
nginx -T 2>/dev/null | grep -A5 "location /api/"
# 确认后端日志中的错误
docker logs buyi-backend --tail 50 2>&1 | grep -i agent
```

### 步骤 2：应用修改 1-5（本地文件改动）

### 步骤 3：重新部署
- 若 Docker 部署：在 `deploy/` 目录执行 `docker-compose up -d --force-recreate backend`
- 若直连部署：重新上传 backend（`upload_backend.py`）并在服务器创建含 API Key 的 `.env`，重启进程
- 若 Nginx 配置需更新：运行修复后的 `config_nginx_http.py`（含 reload）

### 步骤 4：端到端验证
```bash
# 1. 直接测试后端 SSE 端点（绕过 Nginx，确认 Key 生效）
curl -N -X POST http://127.0.0.1:3000/api/miniapp/agent/ask \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <valid-token>" \
  -d '{"question":"布依族有哪些节日？"}'
# 预期：逐行收到 data: {"type":"delta","content":"..."} 流式输出

# 2. 通过 Nginx 测试（确认反代不缓冲）
curl -N -X POST http://39.105.222.204/api/miniapp/agent/ask \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <valid-token>" \
  -d '{"question":"布依族有哪些节日？"}'
# 预期：同样逐行流式输出，非一次性返回

# 3. 浏览器实测
# 打开 http://39.105.222.204 → 点击 AI 导览员 → 提问"布依族主要分布在哪里？"
# 预期：逐字流式显示回答，无"响应失败"提示
```

### 步骤 5：校验启动拦截
- 临时清空 `deploy/.env` 的 `DEEPSEEK_API_KEY` → 重启后端 → 预期启动报错"缺少必要环境变量 DEEPSEEK_API_KEY"（验证修改 2 生效）→ 恢复 Key
