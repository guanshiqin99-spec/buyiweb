@echo off
chcp 65001 >nul
title Buyi Dictionary - Backend

echo ========================================
echo  Buyi Dictionary - Backend Launcher
echo ========================================
echo.

set "PROJECT_DIR=%~dp0BuyiDictionaryApp-main\BuyiDictionaryApp-main\backend"
set "SOURCE_DB=%~dp0buyi_dictionary.db"

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

echo [1/4] Checking database...
if not exist "buyi-local.sqlite" (
    if exist "%SOURCE_DB%" (
        echo Found existing database at %SOURCE_DB%
        echo Copying to buyi-local.sqlite...
        copy /Y "%SOURCE_DB%" "buyi-local.sqlite" >nul
        if %errorlevel% neq 0 (
            echo ERROR: Failed to copy database.
            pause
            exit /b 1
        )
        echo Database copied.
    ) else (
        echo No existing database found. Backend will create buyi-local.sqlite.
    )
) else (
    echo buyi-local.sqlite already exists. Using existing database.
    echo To force re-copy from %SOURCE_DB%, delete buyi-local.sqlite first.
)
echo.

echo [2/4] Checking Node.js...
node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js not found. Please install Node.js 18+.
    pause
    exit /b 1
)
echo Node.js is available.
echo.

echo [3/4] Checking dependencies...
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

echo [4/4] Starting backend dev server...
echo Server is starting. Check console for port info.
echo Press Ctrl+C to stop
echo.
call npm run start:dev

pause
