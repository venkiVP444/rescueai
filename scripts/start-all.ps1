# RESCUE AI - All-in-One Startup Script
Write-Host "========================================" -ForegroundColor Cyan
Write-Host " Starting RESCUE AI Engine & UI" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# 1. Set Moss Cloud Credentials
$env:MOSS_PROJECT_ID = "38f88b97-8ba3-458f-a740-3cb8c56fe54e"
$env:MOSS_PROJECT_KEY = "moss_8dedee9223cdffcd95795eec55a799db"

# 2. Start Moss Cloud Bridge in new window
Write-Host "[1/3] Starting Moss Cloud Bridge (port 5188)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "`$env:MOSS_PROJECT_ID='$env:MOSS_PROJECT_ID'; `$env:MOSS_PROJECT_KEY='$env:MOSS_PROJECT_KEY'; python src/Rescue.Infrastructure/MossBridge/moss_bridge.py"

Start-Sleep -Seconds 2

# 3. Start Backend API (.NET 10) in new window
Write-Host "[2/3] Starting ASP.NET Core Backend (port 5105)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "`$env:MOSS_PROJECT_ID='$env:MOSS_PROJECT_ID'; `$env:MOSS_PROJECT_KEY='$env:MOSS_PROJECT_KEY'; dotnet run --project src/Rescue.Api"

Start-Sleep -Seconds 3

# 4. Start React Frontend (Vite) in new window
Write-Host "[3/3] Starting React 19 Frontend (port 5173)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run dev --prefix src/Rescue.Web"

Write-Host "========================================" -ForegroundColor Green
Write-Host " All services started!" -ForegroundColor Green
Write-Host " Local Web App:    http://localhost:5173" -ForegroundColor Green
Write-Host " Swagger API Docs: http://localhost:5173/swagger/index.html" -ForegroundColor Green
Write-Host " Backend API:      http://localhost:5105" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
