@echo off
chcp 65001 >nul
title Buyi Dictionary - RAG Toggle

echo ========================================
echo  AI 导览员 RAG 开关切换（本地后端）
echo ========================================
echo.

set "ROOT=%~dp0"
set "ENV_FILE=%ROOT%BuyiDictionaryApp-main\BuyiDictionaryApp-main\backend\.env"

if not exist "%ENV_FILE%" (
    echo [错误] 未找到后端配置文件：
    echo   %ENV_FILE%
    pause
    exit /b 1
)

echo 目标文件：%ENV_FILE%
echo.

rem 读取 .env 中 AGENT_RAG_ENABLED 的当前值并取反写回；行不存在时视为 true 并切换为 false
powershell -NoProfile -ExecutionPolicy Bypass -Command "$f='%ENV_FILE%'; $lines=[System.IO.File]::ReadAllLines($f); $found=$false; $new=''; $out=@(); foreach($l in $lines){ if($l -match '^\s*AGENT_RAG_ENABLED\s*='){ $found=$true; $cur=($l -split '=',2)[1].Trim(); if($cur -eq 'false'){$new='true'}else{$new='false'}; $out+=('AGENT_RAG_ENABLED='+$new) } else { $out+=$l } }; if(-not $found){ $new='false'; $out+='AGENT_RAG_ENABLED=false' }; [System.IO.File]::WriteAllLines($f, $out, (New-Object System.Text.UTF8Encoding $false)); if($new -eq 'true'){ Write-Host '[OK] RAG 已开启：AI 回答前会检索词典数据库增强（数据库增强模式）' -ForegroundColor Green } else { Write-Host '[OK] RAG 已关闭：AI 直接调用大模型回答（对照组模式）' -ForegroundColor Yellow }"

echo.
echo 注意：需重启本地后端（重新运行 启动后端.bat）后生效。
echo 用途：演示对比 RAG 开/关两种模式下的回答质量差异。
echo.

pause
