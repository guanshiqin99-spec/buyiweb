@echo off
chcp 65001 >nul
title Buyi Dictionary - Seed Data

echo ========================================
echo  Buyi Dictionary - Import Sample Data
echo ========================================
echo.

set "ROOT=%~dp0"
set "PROJECT_DIR=%ROOT%BuyiDictionaryApp-main\BuyiDictionaryApp-main\backend"

echo Project directory: %PROJECT_DIR%
echo.

if not exist "%PROJECT_DIR%\package.json" (
    echo ERROR: Backend project not found
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

echo [1/4] Checking Node.js...
node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js not found. Please install Node.js 18+.
    pause
    exit /b 1
)
echo Node.js is available.
echo.

echo [2/4] Checking dependencies...
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

echo [3/4] Seeding base data...
call npm run seed:data
if %errorlevel% neq 0 (
    echo ERROR: Base data seed failed.
    pause
    exit /b 1
)
echo.

echo [4/4] Seeding more sample data...
call npx ts-node --transpile-only src/scripts/seed-more-data.ts
if %errorlevel% neq 0 (
    echo ERROR: More data seed failed.
    pause
    exit /b 1
)

call npx ts-node --transpile-only src/scripts/seed-custom-data.ts
if %errorlevel% neq 0 (
    echo ERROR: Custom data seed failed.
    pause
    exit /b 1
)

echo.
echo Sample data imported successfully.
echo Please restart the backend server if it is running.
pause
