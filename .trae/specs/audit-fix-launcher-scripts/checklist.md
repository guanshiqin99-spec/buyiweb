# Checklist

## 启动后端.bat / 启动前端.bat 审阅
- [x] `启动后端.bat` 所有路径以 `%~dp0` 派生，无硬编码盘符/绝对路径
- [x] `启动后端.bat` 含 Node.js 检查（`node -v`，失败报错退出）
- [x] `启动后端.bat` 含 `node_modules` 缺失时自动 `npm install`
- [x] `启动后端.bat` 运行时 SQLite 拷贝逻辑（`buyi-local.sqlite` → `buyi-runtime.sqlite`，回退到根 `buyi_dictionary.db`）正确
- [x] `启动前端.bat` 所有路径以 `%~dp0` 派生，无硬编码盘符/绝对路径
- [x] `启动前端.bat` 含 Node.js 检查与 `node_modules` 自动安装
- [x] `启动后端.bat`、`启动前端.bat` 核心逻辑未被修改（仅审阅确认）

## 根目录 start.bat 删除
- [x] 根目录 `d:\BuyiDictionaryWeb\start.bat` 已删除
- [x] `d:\BuyiDictionaryWeb\buyi-dictionary-vue\start.bat` 仍保留（位于前端目录内、可正常运行）

## 启动竞赛包.bat —— 依赖检查与环境准备
- [x] 新增 Node.js 可用性检查（`node -v`，失败则报错并 `pause` 退出）
- [x] 后端 `node_modules` 缺失时自动 `npm install`，失败则报错退出
- [x] 前端 `node_modules` 缺失时自动 `npm install`，失败则报错退出
- [x] 保留 `if not defined` 环境变量默认值策略（NODE_ENV/DB_TYPE/CORS_ORIGIN/JWT_SECRET/WECHAT_MOCK_MODE 等不覆盖已有值）
- [x] 保留运行时 SQLite 拷贝逻辑（从 `buyi-local.sqlite` 或根 `buyi_dictionary.db` 拷贝到 `buyi-runtime.sqlite`）
- [x] 所有路径以 `%~dp0` 派生，无硬编码盘符/绝对路径

## 启动竞赛包.bat —— 健康检查替换固定等待
- [x] 原 `timeout /t 3 /nobreak >nul` 固定等待已移除
- [x] 后端窗口启动后，新增 `http://127.0.0.1:3000/api/health` 轮询循环（PowerShell `Invoke-WebRequest`）
- [x] 健康检查有最大重试上限（默认 60 次 × 2 秒），不会无限挂起
- [x] 后端健康检查超时时打印明确错误并退出，不继续打开浏览器
- [x] 后端就绪后轮询前端 `http://127.0.0.1:5173` 可达性（最大 30 次 × 1 秒，超时仅警告不阻断）

## 启动竞赛包.bat —— 自动打开浏览器
- [x] 两个服务就绪后执行 `start "" "http://127.0.0.1:5173"` 打开默认浏览器
- [x] 浏览器仅在后端健康检查通过后打开（不依赖固定定时器）
- [x] 启动器窗口打印两个服务访问地址与「浏览器已打开」提示，保留 `pause`

## 路径相对性核查
- [x] 修改后的 `启动竞赛包.bat` 所有路径均由 `%~dp0` 派生，无硬编码盘符/绝对路径
- [x] `start "title" /D "%BACKEND%"` 与 `/D "%FRONTEND%"` 工作目录参数正确指向相对路径派生目录

## 实机启动验证（可选，需用户授权运行 .bat）
- [ ] 双击 `启动竞赛包.bat` 后，后端窗口、前端窗口依次出现
- [ ] 浏览器自动打开 `http://127.0.0.1:5173` 且页面正常加载（前端经 vite 代理访问后端 `/api`）
- [ ] 关闭后端/前端窗口后，无残留进程占用 3000/5173 端口
