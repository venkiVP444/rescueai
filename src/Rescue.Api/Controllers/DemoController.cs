using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Rescue.Application.Interfaces;
using Rescue.Domain.Entities;
using Rescue.Domain.Enums;
using Rescue.Domain.Interfaces;

namespace Rescue.Api.Controllers;

[ApiController]
[Route("api/demo")]
public class DemoController : ControllerBase
{
    private readonly IInvestigationOrchestrator _orchestrator;
    private readonly IEventNotificationService _notifier;

    public DemoController(IInvestigationOrchestrator orchestrator, IEventNotificationService notifier)
    {
        _orchestrator = orchestrator;
        _notifier = notifier;
    }

    [HttpPost("scenario/api-incident")]
    public async Task<IActionResult> RunKillerDemo()
    {
        var incident = await _orchestrator.RunKillerDemoAsync();
        return Ok(new
        {
            success = true,
            scenario = "API Change -> Production Incident",
            incident = incident
        });
    }

    [HttpPost("scenario/production-incident")]
    public async Task<IActionResult> RunStandaloneIncident()
    {
        var incident = await _orchestrator.RunStandaloneRedisIncidentAsync();
        return Ok(new
        {
            success = true,
            scenario = "Standalone Redis Pool Exhaustion Incident",
            incident = incident
        });
    }

    [HttpPost("scenario/api-change")]
    public async Task<IActionResult> RunStandaloneApiChange()
    {
        var apiChange = await _orchestrator.RunStandaloneApiChangeAsync();
        return Ok(new
        {
            success = true,
            scenario = "Standalone API Breaking Change",
            apiChange = apiChange
        });
    }

    [HttpPost("reset")]
    public async Task<IActionResult> ResetEnvironment()
    {
        await _notifier.BroadcastEventAsync("EnvironmentReset", new
        {
            status = "Healthy",
            message = "Acme Commerce synthetic environment reset to baseline healthy state."
        });

        return Ok(new
        {
            success = true,
            message = "All synthetic state reset."
        });
    }
}
