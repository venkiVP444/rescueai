using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Rescue.Domain.Interfaces;
using Rescue.Infrastructure.Persistence;

namespace Rescue.Api.Controllers;

[ApiController]
[Route("health")]
public class HealthController : ControllerBase
{
    private readonly RescueDbContext _dbContext;
    private readonly IMossRetrievalService _mossService;

    public HealthController(RescueDbContext dbContext, IMossRetrievalService mossService)
    {
        _dbContext = dbContext;
        _mossService = mossService;
    }

    [HttpGet]
    public async Task<IActionResult> GetHealth()
    {
        var dbAvailable = await _dbContext.Database.CanConnectAsync();
        var stats = _mossService.GetObservabilityStats();

        return Ok(new
        {
            status = "Healthy",
            api = "Online",
            database = dbAvailable ? "Available" : "Degraded",
            persistence = "SQLite (Local/Ephemeral)",
            mossProvider = stats.CurrentProvider.ToString(),
            timestamp = DateTime.UtcNow,
            version = "1.0.0"
        });
    }
}
