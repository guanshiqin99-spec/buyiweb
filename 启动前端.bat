@echo off
chcp 65001 >nul
title Buyi Dictionary - Frontend

echo ========================================
echo  Buyi Dictionary - Frontend Launcher
echo ========================================
echo.

set "PROJECT_DIR=%~dp0buyi-dictionary-vue"

echo Project directory: %PROJECT_DIR%
echo.

if not exist "%PROJECT_DIR%\package.json" (
    echo ERROR: Frontend project not found
    echo Expected path: %PROJECT_DIR%
    pause
    exit /b 1
)

cd /d "%PROJECT_DIR%"
if %errorlevel% neq 0 (
    echo ERROR: Cannot enter project directory
    pause
    exit /b 1
)

echo Current directory: %cd%
echo.

echo [1/3] Checking Node.js...
node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js not found. Please install Node.js 18+.
    pause
    exit /b 1
)
echo Node.js is available.
echo.

echo [2/3] Checking dependencies...
if not exist "node_modules" (
    echo node_modules not found. Installing dependencies...
    call npm install
    if %errorlevel% neq 0 (
        echo ERROR: Dependency installation failed.
        pause
        exit /b 1
    )
) else (
    echo Dependencies already installed.
)
echo.

echo [3/3] Starting frontend dev server...
echo Server will run at http://localhost:5173
echo Press Ctrl+C to stop
echo.
call npm run dev

pause
