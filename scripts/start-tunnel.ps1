# RESCUE AI - Public Cloudflare Tunnel Script
Write-Host "Starting Public Cloudflare Tunnel for RESCUE..." -ForegroundColor Cyan
& "c:\personal\RescueAI\tools\cloudflared.exe" tunnel --url http://localhost:5173
