# ============================================================
# 布依词典项目 · 一键自动化测试
# 用法：
#   powershell -File .\run-tests.ps1                  # 全量（含前端构建）
#   powershell -File .\run-tests.ps1 -SkipBuild       # 跳过前端构建
#   powershell -File .\run-tests.ps1 -BackendOnly     # 仅后端
#   powershell -File .\run-tests.ps1 -FrontendOnly    # 仅前端
# 退出码 0 表示全部通过；任一环节失败立即停止并返回对应码。
# 注意：勿设 $ErrorActionPreference='Stop'，npm/jest 的报告走 stderr，
# 在 Windows PowerShell 5.1 下会被误判为 NativeCommandError 提前中断。
# ============================================================
param(
  [switch]$SkipBuild,
  [switch]$BackendOnly,
  [switch]$FrontendOnly
)

$ErrorActionPreference = 'Continue'
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$backend = Join-Path $root 'BuyiDictionaryApp-main\BuyiDictionaryApp-main\backend'
$frontend = Join-Path $root 'buyi-dictionary-vue'

function Run-Step {
  param([string]$Name, [scriptblock]$Body)
  Write-Host ''
  Write-Host ('========== ' + $Name + ' ==========') -ForegroundColor Cyan
  & $Body
  if ($LASTEXITCODE -ne 0) {
    Write-Host ''
    Write-Host ('[FAIL] ' + $Name + ' (exit ' + $LASTEXITCODE + ')') -ForegroundColor Red
    exit $LASTEXITCODE
  }
  Write-Host ('[PASS] ' + $Name) -ForegroundColor Green
}

function Test-Backend {
  Run-Step 'backend: tsc --noEmit' {
    Push-Location $backend
    npx tsc --noEmit
    Pop-Location
  }
  Run-Step 'backend: jest (npm test)' {
    Push-Location $backend
    npm test
    Pop-Location
  }
}

function Test-Frontend {
  Run-Step 'frontend: node:test (npm test)' {
    Push-Location $frontend
    npm test
    Pop-Location
  }
  if (-not $SkipBuild) {
    Run-Step 'frontend: vite build' {
      Push-Location $frontend
      npm run build
      Pop-Location
    }
  } else {
    Write-Host 'skip frontend build (-SkipBuild)' -ForegroundColor DarkGray
  }
}

Write-Host '=== Buyi Dictionary automated tests ===' -ForegroundColor Yellow
Write-Host ('backend : ' + $backend) -ForegroundColor DarkGray
Write-Host ('frontend: ' + $frontend) -ForegroundColor DarkGray

if (-not $FrontendOnly) { Test-Backend }
if (-not $BackendOnly)  { Test-Frontend }

Write-Host ''
Write-Host '========================================' -ForegroundColor Green
Write-Host 'ALL TESTS PASSED' -ForegroundColor Green
Write-Host '========================================' -ForegroundColor Green
exit 0
