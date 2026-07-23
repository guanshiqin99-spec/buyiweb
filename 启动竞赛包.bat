@echo off
chcp 65001 >nul
title Buyi Dictionary - Competition Launcher

set "ROOT=%~dp0"
set "BACKEND=%ROOT%BuyiDictionaryApp-main\BuyiDictionaryApp-main\backend"
set "FRONTEND=%ROOT%buyi-dictionary-vue"
set "SOURCE_DB=%ROOT%buyi_dictionary.db"
set "RUNTIME_DB=%BACKEND%\buyi-runtime.sqlite"

rem Local demo defaults. Existing environment variables always take precedence.
if not defined NODE_ENV set "NODE_ENV=development"
if not defined DB_TYPE set "DB_TYPE=sqljs"
if not defined DB_NAME set "DB_NAME=%RUNTIME_DB%"
if not defined DB_SYNCHRONIZE set "DB_SYNCHRONIZE=true"
if not defined DB_LOGGING set "DB_LOGGING=false"
if not defined SEED_ON_BOOT set "SEED_ON_BOOT=true"
if not defined WECHAT_MOCK_MODE set "WECHAT_MOCK_MODE=true"
if not defined CORS_ORIGIN set "CORS_ORIGIN=http://127.0.0.1:5173,http://localhost:5173"
if not defined JWT_SECRET set "JWT_SECRET=buyi-local-%RANDOM%-%RANDOM%-%RANDOM%-%RANDOM%-%RANDOM%-%RANDOM%"

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
if not exist "%RUNTIME_DB%" (
  if exist "%BACKEND%\buyi-local.sqlite" (
    echo Preparing writable local SQLite database...
    copy /Y "%BACKEND%\buyi-local.sqlite" "%RUNTIME_DB%" >nul
    if errorlevel 1 (
      echo ERROR: Failed to prepare writable local SQLite database.
      pause
      exit /b 1
    )
  ) else if exist "%SOURCE_DB%" (
    echo Preparing writable local SQLite database from root seed...
    copy /Y "%SOURCE_DB%" "%RUNTIME_DB%" >nul
    if errorlevel 1 (
      echo ERROR: Failed to prepare writable local SQLite database.
      pause
      exit /b 1
    )
  )
)

start "Buyi Dictionary API" /D "%BACKEND%" cmd /k "npm run start:dev"
timeout /t 3 /nobreak >nul
start "Buyi Dictionary Web" /D "%FRONTEND%" cmd /k "npm run dev -- --host 127.0.0.1"

echo.
echo The local API starts at http://127.0.0.1:3000/api/health
echo The web app starts at http://127.0.0.1:5173
echo Keep both opened windows running during the demo.
pause
