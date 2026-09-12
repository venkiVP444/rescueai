# RESCUE AI - Stop All Script
Write-Host "Stopping all RESCUE AI services and tunnels..." -ForegroundColor Yellow

$ports = @(5173, 5105, 5188)
foreach ($port in $ports) {
    $connections = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
    if ($connections) {
        foreach ($conn in $connections) {
            $pidToKill = $conn.OwningProcess
            if ($pidToKill -gt 0) {
                Write-Host "Stopping process on port $port (PID $pidToKill)..." -ForegroundColor Gray
                Stop-Process -Id $pidToKill -Force -ErrorAction SilentlyContinue
            }
        }
    }
}

Get-Process -Name "cloudflared" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Write-Host "All RESCUE services and tunnels are stopped. Ports are free!" -ForegroundColor Green
