# 启动脚本审阅与竞赛包自动启动浏览器 Spec

## Why
当前 `启动竞赛包.bat` 能在新窗口中分别拉起后端 (`nest start --watch`) 与前端 (`vite`)，但存在三类问题：①不会自动打开浏览器，演示时还需手动复制 URL；②用固定的 `timeout /t 3` 等待后端就绪，而后端首次 TS 编译 + 数据播种往往需要 10–30 秒，固定等待不可靠；③缺少 Node.js 检查与 `node_modules` 自动安装（而 `启动后端.bat`/`启动前端.bat` 都有这两步），首次解压竞赛包时直接运行会失败。用户希望审阅三个启动脚本、把路径统一为脚本内相对路径，并让 `启动竞赛包.bat` 真正完成「启动后端 + 启动前端 + 自动打开浏览器」的闭环。

## What Changes
- 审阅 `启动后端.bat`、`启动前端.bat`、`启动竞赛包.bat`，确认问题清单（详见 Impact 与 ADDED/MODIFIED）。
- 增强 `启动竞赛包.bat`：
  - 新增 Node.js 可用性检查。
  - 新增后端 / 前端 `node_modules` 缺失时自动 `npm install`。
  - 用「带最大重试上限的健康检查循环」替换固定 `timeout /t 3`，轮询后端 `http://127.0.0.1:3000/api/health` 返回 200。
  - 后端就绪后再轮询前端 `http://127.0.0.1:5173` 可达。
  - 两个服务都就绪后，用 `start "" "http://127.0.0.1:5173"` 自动打开默认浏览器。
  - 健康检查失败时打印明确错误并退出，避免无限挂起。
- 路径策略：三个脚本均继续以 `%~dp0`（脚本所在目录）为基准构造子路径，**不引入任何硬编码绝对路径**；`启动后端.bat`/`启动前端.bat` 已是 `cd /d` 后使用相对子路径的风格，保持不变。`启动竞赛包.bat` 继续使用 `start /D` 指定工作目录的风格，仅补充上述增强项。
- 保留既有行为：环境变量已存在时不覆盖（`if not defined`）、运行时 SQLite 从 `buyi-local.sqlite` 或根 `buyi_dictionary.db` 拷贝、`cmd /k` 保留窗口以便演示期间查看日志。
- 不修改 `启动后端.bat`、`启动前端.bat` 的核心逻辑（仅审阅确认），不做破坏性变更。


## Impact
- Affected specs: 无（本仓库此前无启动脚本相关 spec）。
- Affected code:
  - `d:\BuyiDictionaryWeb\启动竞赛包.bat`（主要修改对象）
  - `d:\BuyiDictionaryWeb\启动后端.bat`（仅审阅，不改）
  - `d:\BuyiDictionaryWeb\启动前端.bat`（仅审阅，不改）
  - 依赖事实：后端健康检查端点 `GET /api/health`（`backend/src/modules/health/health.controller.ts`，全局前缀 `api`），后端端口 3000（`backend/src/main.ts`），前端端口 5173（`buyi-dictionary-vue/vite.config.js`，`host: true`）。
- 运行环境假设：Windows 10/11，自带 PowerShell（用于健康检查）；Node.js 18+。

## ADDED Requirements

### Requirement: 竞赛包一键启动闭环
`启动竞赛包.bat` SHALL 在双击运行后，依次完成：检查 Node.js → 准备后端/前端依赖 → 在独立窗口启动后端 → 在独立窗口启动前端 → 等待后端健康检查通过 → 等待前端可达 → 自动打开默认浏览器到前端地址。

#### Scenario: 首次解压竞赛包后双击运行
- **WHEN** 用户首次双击 `启动竞赛包.bat`（`node_modules` 尚未安装）
- **THEN** 脚本检测到后端/前端 `node_modules` 缺失，自动执行 `npm install`，安装成功后继续启动流程

#### Scenario: 服务正常就绪
- **WHEN** 后端 `http://127.0.0.1:3000/api/health` 在最大重试次数内返回 200，且前端 `http://127.0.0.1:5173` 可达
- **THEN** 脚本调用 `start "" "http://127.0.0.1:5173"` 打开默认浏览器，并在启动器窗口打印两个服务的访问地址

#### Scenario: 后端启动失败
- **WHEN** 后端健康检查在最大重试次数（默认 60 次 × 2 秒 ≈ 120 秒）内仍未通过
- **THEN** 脚本打印明确错误信息（提示查看后端窗口日志），不打开浏览器，以非零码退出

#### Scenario: 已存在的环境变量不被覆盖
- **WHEN** 用户预先设置了 `NODE_ENV`、`DB_TYPE`、`CORS_ORIGIN` 等环境变量
- **THEN** 脚本通过 `if not defined` 保留原值，仅对未设置的变量赋本地演示默认值

### Requirement: 路径全部相对脚本位置
所有启动脚本 SHALL 以 `%~dp0`（脚本自身所在目录）为基准构造路径，SHALL NOT 包含任何硬编码的盘符/绝对路径，确保整个项目目录整体移动后脚本仍可运行。

#### Scenario: 项目目录被整体移动或重命名
- **WHEN** 用户把 `d:\BuyiDictionaryWeb` 整体复制到 `e:\MyBuyi\` 后双击脚本
- **THEN** 脚本仍能正确定位 `BuyiDictionaryApp-main\BuyiDictionaryApp-main\backend` 与 `buyi-dictionary-vue` 子目录并成功启动

## MODIFIED Requirements

### Requirement: 启动竞赛包.bat 启动流程
原行为：拷贝运行时数据库 → `start` 后端窗口 → 固定 `timeout /t 3` → `start` 前端窗口 → `pause`。

修改后行为：Node.js 检查 → 拷贝运行时数据库 → 后端/前端依赖检查与自动安装 → `start` 后端窗口 → 健康检查循环等待后端 `/api/health` 200（带最大重试上限）→ `start` 前端窗口 → 轮询前端 5173 可达 → `start "" "http://127.0.0.1:5173"` 自动打开浏览器 → 打印访问地址 → `pause`。

不变的子行为：环境变量 `if not defined` 默认值策略、运行时 SQLite 拷贝逻辑、`cmd /k` 保留服务窗口、CORS/JWT/WECHAT_MOCK_MODE 等本地演示默认值。

## REMOVED Requirements

### Requirement: 根目录 start.bat
**Reason**: 根目录 `start.bat` 与 `buyi-dictionary-vue\start.bat` 内容完全相同，但它位于项目根目录，而根目录没有 `vite.config.js`、`index.html`、`src/`，在根目录运行 `npm run dev`（vite）会失败。该脚本是历史遗留的重复损坏文件，且与功能完整的 `启动前端.bat`/`启动竞赛包.bat` 重复，容易误导用户。
**Migration**: 用户改用 `启动前端.bat`（仅前端）或 `启动竞赛包.bat`（前后端 + 自动开浏览器）启动项目。注意：`buyi-dictionary-vue\start.bat` 因位于前端目录内、可正常运行，予以保留，不在本次删除范围。
