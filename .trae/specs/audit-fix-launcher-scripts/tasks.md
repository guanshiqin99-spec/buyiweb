# Tasks

- [x] Task 1: 审阅 `启动后端.bat` 与 `启动前端.bat`，确认无需改动
  - [x] SubTask 1.1: 确认 `启动后端.bat` 路径已相对（`%~dp0` + `cd /d` 后相对子路径）、含 Node.js 检查、含 `node_modules` 自动安装、运行时 DB 拷贝逻辑正确
  - [x] SubTask 1.2: 确认 `启动前端.bat` 路径已相对、含 Node.js 检查、含 `node_modules` 自动安装；记录 `npm run dev` 与竞赛包中 `--host 127.0.0.1` 的细微差异（vite.config `host:true` 下行为等价，不修改）
  - [x] SubTask 1.3: 删除根目录 `start.bat`（历史遗留重复损坏脚本，在根目录运行 vite 会失败），保留 `buyi-dictionary-vue\start.bat`（位于前端目录内、可正常运行）

- [x] Task 2: 增强 `启动竞赛包.bat` —— 依赖检查与环境准备
  - [x] SubTask 2.1: 在现有路径变量（`ROOT`/`BACKEND`/`FRONTEND`/`SOURCE_DB`/`RUNTIME_DB`）基础上，新增 Node.js 可用性检查（`node -v`，失败则报错退出）
  - [x] SubTask 2.2: 新增后端 `node_modules` 缺失检测：若 `%BACKEND%\node_modules` 不存在，则在后端目录执行 `npm install`，失败则报错退出
  - [x] SubTask 2.3: 新增前端 `node_modules` 缺失检测：若 `%FRONTEND%\node_modules` 不存在，则在前端目录执行 `npm install`，失败则报错退出
  - [x] SubTask 2.4: 保留既有运行时 SQLite 拷贝逻辑与 `if not defined` 环境变量默认值策略，不改动

- [x] Task 3: 增强 `启动竞赛包.bat` —— 健康检查替换固定等待
  - [x] SubTask 3.1: 删除 `timeout /t 3 /nobreak >nul` 固定等待
  - [x] SubTask 3.2: 在 `start` 后端窗口之后，新增后端健康检查循环：用 PowerShell `Invoke-WebRequest` 轮询 `http://127.0.0.1:3000/api/health`，最大重试 60 次、每次间隔 2 秒，超时则报错退出
  - [x] SubTask 3.3: 后端就绪后，新增前端可达性轮询：轮询 `http://127.0.0.1:5173`（最大重试 30 次 × 1 秒），超时则仅打印警告但不阻断（前端窗口已开，可由用户手动访问）

- [x] Task 4: 增强 `启动竞赛包.bat` —— 自动打开浏览器
  - [x] SubTask 4.1: 在前端可达后，执行 `start "" "http://127.0.0.1:5173"` 打开默认浏览器
  - [x] SubTask 4.2: 在启动器窗口打印两个服务的访问地址与「浏览器已打开」提示，随后保留 `pause` 以维持启动器窗口

- [x] Task 5: 路径相对性核查
  - [x] SubTask 5.1: 通读修改后的 `启动竞赛包.bat`，确认所有路径均由 `%~dp0` 派生，无硬编码盘符/绝对路径
  - [x] SubTask 5.2: 确认 `start "title" /D "%BACKEND%"` 与 `/D "%FRONTEND%"` 的工作目录参数正确指向相对路径派生的目录

- [ ] Task 6: 实际启动验证（可选，需用户授权运行 .bat）
  - [ ] SubTask 6.1: 双击运行 `启动竞赛包.bat`，确认后端窗口、前端窗口依次出现
  - [ ] SubTask 6.2: 确认浏览器自动打开 `http://127.0.0.1:5173` 且页面可正常加载（前端通过 vite 代理访问后端 `/api`）
  - [ ] SubTask 6.3: 关闭后端/前端窗口，确认无残留进程占用 3000/5173 端口

# Task Dependencies
- Task 3、Task 4 依赖 Task 2（依赖检查在前）
- Task 5 依赖 Task 2、3、4（核查在修改完成后进行）
- Task 6 依赖 Task 5（核查通过后再实机验证）
