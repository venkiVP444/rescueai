using System;
using System.Collections.Generic;
using Microsoft.AspNetCore.Mvc;
using Rescue.Domain.Entities;
using Rescue.Domain.Enums;
using Rescue.Domain.Interfaces;

namespace Rescue.Api.Controllers;

[ApiController]
[Route("api/dashboard")]
public class DashboardController : ControllerBase
{
    private readonly IMossRetrievalService _mossService;
    private static AutonomyMode _currentAutonomy = AutonomyMode.Recommend;

    public DashboardController(IMossRetrievalService mossService)
    {
        _mossService = mossService;
    }

    [HttpGet]
    public IActionResult GetDashboard()
    {
        var mossStats = _mossService.GetObservabilityStats();

        var services = new List<ServiceHealth>
        {
            new() { Name = "PaymentService", Status = "Healthy", ErrorRate = 0.2, LatencyMs = 45.0, Version = "v1.8.2" },
            new() { Name = "OrderService", Status = "Healthy", ErrorRate = 0.1, LatencyMs = 32.0, Version = "v2.1.0" },
            new() { Name = "InventoryService", Status = "Healthy", ErrorRate = 0.0, LatencyMs = 28.0, Version = "v1.4.0" },
            new() { Name = "UserService", Status = "Healthy", ErrorRate = 0.0, LatencyMs = 19.0, Version = "v1.3.0" },
            new() { Name = "NotificationService", Status = "Healthy", ErrorRate = 0.0, LatencyMs = 15.0, Version = "v1.1.0" },
            new() { Name = "API Gateway", Status = "Healthy", ErrorRate = 0.05, LatencyMs = 8.0, Version = "v3.0.0" }
        };

        var recentActivities = new List<AgentActivity>
        {
            new() { StepName = "HealthWatch", Description = "Rescue watching Acme Commerce microservices telemetry", DurationMs = 1.2 },
            new() { StepName = "SchemaMonitor", Description = "Watched upstream Acme Payments Gateway OpenAPI specifications", DurationMs = 2.4 }
        };

        return Ok(new
        {
            overallStatus = "Healthy",
            autonomyMode = _currentAutonomy.ToString(),
            services = services,
            activeIncidentsCount = 0,
            pendingApprovalsCount = 0,
            recentApiChangesCount = 1,
            mossObservability = mossStats,
            recentActivities = recentActivities
        });
    }

    [HttpPost("autonomy")]
    public IActionResult SetAutonomy([FromBody] AutonomyMode mode)
    {
        _currentAutonomy = mode;
        return Ok(new { autonomyMode = _currentAutonomy.ToString() });
    }
}
