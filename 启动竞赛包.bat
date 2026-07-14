@echo off
chcp 65001 >nul
title Buyi Dictionary - Competition Launcher

set "ROOT=%~dp0"
set "BACKEND=%ROOT%BuyiDictionaryApp-main\BuyiDictionaryApp-main\backend"
set "FRONTEND=%ROOT%buyi-dictionary-vue"

echo Starting Buyi Dictionary competition package...

if not exist "%BACKEND%\package.json" (
  echo ERROR: Backend project not found: %BACKEND%
  pause
  exit /b 1
)
if not exist "%FRONTEND%\package.json" (
  echo ERROR: Frontend project not found: %FRONTEND%
  pause
  exit /b 1
)

start "Buyi Dictionary API" /D "%BACKEND%" cmd /k "npm run start:dev"
timeout /t 3 /nobreak >nul
start "Buyi Dictionary Web" /D "%FRONTEND%" cmd /k "npm run dev -- --host 127.0.0.1"

echo.
echo The local API starts at http://127.0.0.1:3000/api/health
echo The web app starts at http://127.0.0.1:5173
echo Keep both opened windows running during the demo.
pause
