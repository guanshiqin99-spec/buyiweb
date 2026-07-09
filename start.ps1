# 布依族词典 - Vue 3 Web版 启动脚本

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "布依族词典 - Vue 3 Web版" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 检查Node.js
Write-Host "[1/3] 检查Node.js版本..." -ForegroundColor Yellow
try {
     = node -v
    Write-Host "Node.js版本: " -ForegroundColor Green
} catch {
    Write-Host "错误: 未安装Node.js，请先安装Node.js" -ForegroundColor Red
    Read-Host "按Enter键退出"
    exit 1
}

# 安装依赖
Write-Host ""
Write-Host "[2/3] 安装依赖..." -ForegroundColor Yellow
Write-Host "如果网络较慢，请耐心等待..." -ForegroundColor Gray
Write-Host ""

npm install
if ( -ne 0) {
    Write-Host "错误: 依赖安装失败" -ForegroundColor Red
    Write-Host "请尝试使用国内镜像: npm install --registry=https://registry.npmmirror.com" -ForegroundColor Yellow
    Read-Host "按Enter键退出"
    exit 1
}

# 启动开发服务器
Write-Host ""
Write-Host "[3/3] 启动开发服务器..." -ForegroundColor Yellow
Write-Host "项目将在 http://localhost:3000 启动" -ForegroundColor Green
Write-Host "按 Ctrl+C 停止服务器" -ForegroundColor Gray
Write-Host ""

npm run dev
