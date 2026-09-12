# RESCUE AI - Stop All Local Services
Write-Host "Stopping all RESCUE AI local services..." -ForegroundColor Yellow

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

Write-Host "All RESCUE local services stopped. Ports 5173, 5105, 5188 are free!" -ForegroundColor Green
