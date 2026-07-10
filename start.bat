@echo off
chcp 65001 >nul
echo ========================================
echo 布依族词典 - Vue 3 Web版
echo ========================================
echo.

echo [1/3] 检查 Node.js 环境...
node -v
if %errorlevel% neq 0 (
    echo 错误: 未安装 Node.js,请先安装 Node.js 18+
    pause
    exit /b 1
)

echo.
echo [2/3] 安装依赖...
echo 如网络较慢请耐心等待...
echo.
call npm install
if %errorlevel% neq 0 (
    echo 错误: 依赖安装失败
    echo 可尝试国内镜像: npm install --registry=https://registry.npmmirror.com
    pause
    exit /b 1
)

echo.
echo [3/3] 启动开发服务器...
echo 项目将在 http://localhost:5173 启动
echo 按 Ctrl+C 停止服务器
echo.
call npm run dev
pause
