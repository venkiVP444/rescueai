using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Rescue.Application.Interfaces;

namespace Rescue.Api.Controllers;

[ApiController]
[Route("api/incidents")]
public class IncidentsController : ControllerBase
{
    private readonly IInvestigationOrchestrator _orchestrator;

    public IncidentsController(IInvestigationOrchestrator orchestrator)
    {
        _orchestrator = orchestrator;
    }

    [HttpPost("simulate")]
    public async Task<IActionResult> SimulateIncident()
    {
        var incident = await _orchestrator.RunKillerDemoAsync();
        return Ok(incident);
    }

    [HttpPost("{id}/investigate")]
    public async Task<IActionResult> Investigate(string id)
    {
        var incident = await _orchestrator.RunFullInvestigationAsync(id);
        return Ok(incident);
    }

    [HttpPost("{id}/approve")]
    public async Task<IActionResult> Approve(string id, [FromQuery] string approver = "Staff SRE Engineer")
    {
        var incident = await _orchestrator.ApproveAndDeployAsync(id, approver);
        return Ok(incident);
    }

    [HttpPost("{id}/reject")]
    public async Task<IActionResult> Reject(string id, [FromBody] RejectRequest req)
    {
        var incident = await _orchestrator.RejectFixAsync(id, req.Reason);
        return Ok(incident);
    }
}

public record RejectRequest(string Reason);
