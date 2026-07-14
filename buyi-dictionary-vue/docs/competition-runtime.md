# 竞赛包运行说明

## 本地随包模式

双击仓库根目录的 `启动竞赛包.bat`。它会分别启动本地 Nest API 与 Vite 前端；前端默认以 `/api` 访问 Vite 代理，因此词典、文化展项、健康检查和媒体错误语义与线上模式一致。

- 健康检查：`http://127.0.0.1:3000/api/health`
- 前端：`http://127.0.0.1:5173`
- 后端本地数据库：`BuyiDictionaryApp-main/BuyiDictionaryApp-main/backend/buyi-local.sqlite`
- 随包音频：`buyi-dictionary-vue/public/audio`

首次运行如缺少依赖，请分别在两个项目目录执行 `npm install` 后再启动。

## 线上 API 模式

复制 `.env.example` 为 `.env.local`，并填写：

```env
VITE_API_BASE_URL=https://your-api.example.com/api
```

重新启动前端。不要在前端加入静态词典数据回退：服务请求失败应显示可重试的错误状态，以便录屏前发现部署问题。
