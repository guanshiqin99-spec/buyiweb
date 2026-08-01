@echo off
chcp 65001 >nul
title 布依族词典 - 竞赛包下载与一键启动（远程覆盖本地）
setlocal EnableDelayedExpansion

rem ============================================================
rem  竞赛包下载与一键启动脚本（远程覆盖本地版）
rem  - 从 GitHub 同步 main 分支完整代码（含前后端 + 启动脚本）
rem  - 以远程完全覆盖本地（本地未提交修改将被丢弃）
rem  - 仅保留后端 .env（含 DEEPSEEK_API_KEY 等）与未跟踪资料
rem  - 安装依赖并一键启动前端(5173)与后端(3000)
rem ============================================================

rem ---------- 配置区 ----------
set "REPO_URL=https://github.com/guanshiqin99-spec/buyiweb.git"
set "BRANCH=main"
set "TARGET=D:\BuyiDictionaryWeb"
set "FRONTEND=%TARGET%\buyi-dictionary-vue"
set "BACKEND=%TARGET%\BuyiDictionaryApp-main\BuyiDictionaryApp-main\backend"
set "BACKEND_ENV=%BACKEND%\.env"
set "ENV_BACKUP=%TEMP%\buyi-backend-env-backup.env"
set "MIRROR=https://registry.npmmirror.com"
rem ----------------------------

echo ========================================
echo   布依族词典 - 竞赛包下载与一键启动
echo   （将以远程 main 完全覆盖本地）
echo ========================================
echo 目标目录: %TARGET%
echo.

rem ---------- 1. 环境检查 ----------
echo [1/7] 检查运行环境...
where git >nul 2>&1
if errorlevel 1 (
    echo [错误] 未检测到 Git，请先安装 Git 并加入 PATH。
    pause & exit /b 1
)
where node >nul 2>&1
if errorlevel 1 (
    echo [错误] 未检测到 Node.js，请先安装 Node.js 18+。
    pause & exit /b 1
)
echo Git 与 Node.js 就绪。
echo.

rem ---------- 2. 备份后端 .env ----------
echo [2/7] 备份后端 .env（保留 API Key 等敏感配置）...
if exist "%BACKEND_ENV%" (
    copy /Y "%BACKEND_ENV%" "%ENV_BACKUP%" >nul
    echo 已备份: %BACKEND_ENV% -^> %ENV_BACKUP%
) else (
    echo 未找到后端 .env，跳过备份（后续将使用仓库自带 .env.example）。
)
echo.

rem ---------- 3. 同步代码（远程覆盖） ----------
echo [3/7] 同步竞赛包代码（远程覆盖本地）...
cd /d "%TARGET%"

if not exist "%TARGET%\.git" (
    echo [错误] 目标目录不是 Git 仓库: %TARGET%
    echo        请确认路径或先手动克隆: git clone -b %BRANCH% %REPO_URL% "%TARGET%"
    pause & exit /b 1
)

echo 拉取远程 %BRANCH% 分支...
git fetch origin %BRANCH%
if errorlevel 1 (
    echo 首次 fetch 失败，重试一次...
    git fetch origin %BRANCH%
    if errorlevel 1 (
        echo [警告] fetch 失败，将使用本地缓存的 origin/%BRANCH% 继续恢复。
        echo        若本地无缓存将报错，请检查网络/代理后重试。
    )
)

echo 清理会与远程检出的跟踪文件冲突的未跟踪副本目录...
if exist "buyi-dictionary-vue" (
    echo 删除未跟踪副本: buyi-dictionary-vue
    rmdir /s /q "buyi-dictionary-vue"
)
if exist "BuyiDictionaryApp-main" (
    echo 删除未跟踪副本: BuyiDictionaryApp-main
    rmdir /s /q "BuyiDictionaryApp-main"
)

echo 将工作区强制对齐到 origin/%BRANCH%...
git reset --hard origin/%BRANCH%
if errorlevel 1 (
    echo [错误] 同步失败，请手动执行:
    echo        cd /d "%TARGET%"
    echo        git reset --hard origin/%BRANCH%
    pause & exit /b 1
)

echo 清理根目录残留的未跟踪冗余文件（保留 node_modules/.env/数据库/资料目录）...
git clean -fd
echo 同步完成。
echo.

rem ---------- 4. 恢复后端 .env ----------
echo [4/7] 恢复后端 .env...
if exist "%ENV_BACKUP%" (
    if exist "%BACKEND%" (
        copy /Y "%ENV_BACKUP%" "%BACKEND_ENV%" >nul
        echo 已恢复: %ENV_BACKUP% -^> %BACKEND_ENV%
    ) else (
        echo [警告] 后端目录不存在，无法恢复 .env: %BACKEND%
    )
) else (
    if exist "%BACKEND%\.env.example" (
        echo 无备份，从 .env.example 复制默认配置...
        copy /Y "%BACKEND%\.env.example" "%BACKEND_ENV%" >nul
    )
)
echo.

rem ---------- 5. 校验完整性 ----------
echo [5/7] 校验竞赛包完整性...
if not exist "%FRONTEND%\package.json" (
    echo [错误] 前端项目缺失: %FRONTEND%\package.json
    pause & exit /b 1
)
if not exist "%BACKEND%\package.json" (
    echo [错误] 后端项目缺失: %BACKEND%\package.json
    pause & exit /b 1
)
echo 前后端项目文件齐全。
echo.

rem ---------- 6. 安装依赖 ----------
echo [6/7] 安装依赖（如已存在 node_modules 则跳过）...

echo --- 前端依赖 ---
if not exist "%FRONTEND%\node_modules" (
    cd /d "%FRONTEND%"
    call npm install
    if errorlevel 1 (
        echo 默认源失败，切换国内镜像重试...
        call npm install --registry=%MIRROR%
        if errorlevel 1 (
            echo [错误] 前端依赖安装失败，请手动进入 %FRONTEND% 执行 npm install
            pause & exit /b 1
        )
    )
    echo 前端依赖安装完成。
) else (
    echo 前端 node_modules 已存在，跳过。
)

echo --- 后端依赖 ---
if not exist "%BACKEND%\node_modules" (
    cd /d "%BACKEND%"
    call npm install
    if errorlevel 1 (
        echo 默认源失败，切换国内镜像重试...
        call npm install --registry=%MIRROR%
        if errorlevel 1 (
            echo [错误] 后端依赖安装失败，请手动进入 %BACKEND% 执行 npm install
            pause & exit /b 1
        )
    )
    echo 后端依赖安装完成。
) else (
    echo 后端 node_modules 已存在，跳过。
    echo 提示: 若启动报模块找不到，请删除 %BACKEND%\node_modules 后重跑本脚本。
)
echo.

rem ---------- 7. 启动竞赛包 ----------
echo [7/7] 启动竞赛包...
cd /d "%TARGET%"
if exist "启动竞赛包.bat" (
    echo 调用仓库内置 启动竞赛包.bat ...
    call "启动竞赛包.bat"
) else (
    echo [警告] 未找到 启动竞赛包.bat，改用直接启动方式...
    start "Buyi Dictionary API" /D "%BACKEND%" cmd /k "npm run start:dev"
    timeout /t 3 /nobreak >nul
    start "Buyi Dictionary Web" /D "%FRONTEND%" cmd /k "npm run dev -- --host 127.0.0.1"
    echo.
    echo 后端启动于: http://127.0.0.1:3000/api/health
    echo 前端启动于: http://127.0.0.1:5173
    pause
)

endlocal
