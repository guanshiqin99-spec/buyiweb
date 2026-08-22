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
echo.

rem --- [1/5] Verify project layout ---
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

rem --- [2/5] Check Node.js ---
node -v >nul 2>&1
if errorlevel 1 (
  echo ERROR: Node.js not found. Please install Node.js 18+.
  pause
  exit /b 1
)

rem --- [3/5] Prepare writable runtime database ---
rem Auto-refresh the writable runtime copy when the seed database is newer.
rem xcopy /D copies only when the source is newer, so runtime data created
rem during a demo (registrations, favorites) is never overwritten.
if exist "%BACKEND%\buyi-local.sqlite" (
  echo Checking runtime database refresh...
  xcopy /D /Y "%BACKEND%\buyi-local.sqlite" "%RUNTIME_DB%*" >nul 2>&1
  if errorlevel 2 (
    echo ERROR: Failed to prepare writable local SQLite database.
    pause
    exit /b 1
  )
) else if exist "%SOURCE_DB%" (
  echo Preparing writable local SQLite database from root seed...
  xcopy /D /Y "%SOURCE_DB%" "%RUNTIME_DB%*" >nul 2>&1
  if errorlevel 2 (
    echo ERROR: Failed to prepare writable local SQLite database.
    pause
    exit /b 1
  )
)

rem --- [4/5] Install dependencies if missing ---
if not exist "%BACKEND%\node_modules" (
  echo Installing backend dependencies...
  pushd "%BACKEND%"
  call npm install
  if errorlevel 1 (
    popd
    echo ERROR: Backend dependency installation failed.
    pause
    exit /b 1
  )
  popd
) else (
  echo Backend dependencies already installed.
)
if not exist "%FRONTEND%\node_modules" (
  echo Installing frontend dependencies...
  pushd "%FRONTEND%"
  call npm install
  if errorlevel 1 (
    popd
    echo ERROR: Frontend dependency installation failed.
    pause
    exit /b 1
  )
  popd
) else (
  echo Frontend dependencies already installed.
)
echo.

rem --- [5/5] Launch services, wait for readiness, then open browser ---
start "Buyi Dictionary API" /D "%BACKEND%" cmd /k "npm run start:dev"

echo Waiting for backend to be ready (http://127.0.0.1:3000/api/health)...
set "BE_MAX=60"
set "BE_TRIES=0"
:be_loop
set /a BE_TRIES+=1
if %BE_TRIES% gtr %BE_MAX% goto be_failed
powershell -NoProfile -Command "try { if ((Invoke-WebRequest -UseBasicParsing -Uri 'http://127.0.0.1:3000/api/health' -TimeoutSec 2).StatusCode -eq 200) { exit 0 } } catch {}; exit 1"
if errorlevel 1 (
  echo   [%BE_TRIES%/%BE_MAX%] backend not ready, retrying in 2s...
  timeout /t 2 /nobreak >nul
  goto be_loop
)
echo Backend is ready.
goto fe_check

:be_failed
echo.
echo ERROR: Backend failed to become ready within %BE_MAX% retries.
echo        Please check the backend window log for errors.
pause
exit /b 1

:fe_check
start "Buyi Dictionary Web" /D "%FRONTEND%" cmd /k "npm run dev -- --host 127.0.0.1"

echo.
echo Waiting for frontend to be ready (http://127.0.0.1:5173)...
set "FE_MAX=30"
set "FE_TRIES=0"
:fe_loop
set /a FE_TRIES+=1
if %FE_TRIES% gtr %FE_MAX% goto fe_warn
powershell -NoProfile -Command "try { if ((Invoke-WebRequest -UseBasicParsing -Uri 'http://127.0.0.1:5173' -TimeoutSec 1).StatusCode -lt 400) { exit 0 } } catch {}; exit 1"
if errorlevel 1 (
  echo   [%FE_TRIES%/%FE_MAX%] frontend not ready, retrying in 1s...
  timeout /t 1 /nobreak >nul
  goto fe_loop
)
echo Frontend is ready.
goto open_browser

:fe_warn
echo WARNING: Frontend not reachable within %FE_MAX% retries. Will still try to open the browser.

:open_browser
echo.
echo Opening browser at http://127.0.0.1:5173 ...
start "" "http://127.0.0.1:5173"
echo.
echo The local API starts at http://127.0.0.1:3000/api/health
echo The web app starts at http://127.0.0.1:5173
echo Browser has been opened. Keep both service windows running during the demo.
pause
