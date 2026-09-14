# RESCUE AI - Local Development Startup Script
Write-Host "========================================" -ForegroundColor Cyan
Write-Host " Starting RESCUE AI Local Services" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# 1. Check Moss Cloud Credentials
if (-not $env:MOSS_PROJECT_ID -or -not $env:MOSS_PROJECT_KEY) {
    Write-Host "[INFO] MOSS_PROJECT_ID or MOSS_PROJECT_KEY not set in environment." -ForegroundColor DarkYellow
    Write-Host "       RESCUE will safely run using built-in Local Retrieval Fallback." -ForegroundColor DarkYellow
} else {
    Write-Host "[OK] Moss Cloud credentials detected in environment." -ForegroundColor Green
}

# 2. Start Moss Cloud Bridge in new window (if credentials present)
if ($env:MOSS_PROJECT_ID -and $env:MOSS_PROJECT_KEY) {
    Write-Host "[1/3] Starting Moss Cloud Bridge (port 5188)..." -ForegroundColor Yellow
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "`$env:MOSS_PROJECT_ID='$env:MOSS_PROJECT_ID'; `$env:MOSS_PROJECT_KEY='$env:MOSS_PROJECT_KEY'; python src/Rescue.Infrastructure/MossBridge/moss_bridge.py"
    Start-Sleep -Seconds 2
} else {
    Write-Host "[1/3] Skipping Moss Bridge (running Local Fallback mode)..." -ForegroundColor Gray
}

# 3. Start Backend API (.NET 10) in new window
Write-Host "[2/3] Starting ASP.NET Core Backend (port 5105)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "dotnet run --project src/Rescue.Api"

Start-Sleep -Seconds 3

# 4. Start React Frontend (Vite) in new window
Write-Host "[3/3] Starting React 19 Frontend (port 5173)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run dev --prefix src/Rescue.Web"

Write-Host "========================================" -ForegroundColor Green
Write-Host " All local services started!" -ForegroundColor Green
Write-Host " Local Web App:    http://localhost:5173" -ForegroundColor Green
Write-Host " Swagger API Docs: https://rescueai-api-api.onrender.com/swagger/index.html" -ForegroundColor Green
Write-Host " Backend API:      http://localhost:5105" -ForegroundColor Green
Write-Host " Health Check:     http://localhost:5105/health" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
