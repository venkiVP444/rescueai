using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Rescue.Application.Interfaces;

namespace Rescue.Api.Controllers.V1;

public class ApprovalRequest
{
    public string Approver { get; set; } = "Staff SRE";
    public string Notes { get; set; } = "Approved via API V1";
}

public class RejectionRequest
{
    public string Reason { get; set; } = "Rejected via API V1";
}

[ApiController]
[Route("api/v1/incidents")]
public class IncidentsV1Controller : ControllerBase
{
    private readonly IInvestigationOrchestrator _orchestrator;

    public IncidentsV1Controller(IInvestigationOrchestrator orchestrator)
    {
        _orchestrator = orchestrator;
    }

    [HttpGet]
    public IActionResult GetIncidents([FromQuery] string? projectId = null)
    {
        var active = _orchestrator.GetActiveIncident();
        if (active == null)
        {
            return Ok(new { success = true, count = 0, incidents = new object[] { } });
        }

        if (!string.IsNullOrWhiteSpace(projectId) && !string.Equals(active.ProjectId, projectId, System.StringComparison.OrdinalIgnoreCase))
        {
            return Ok(new { success = true, count = 0, incidents = new object[] { } });
        }

        return Ok(new { success = true, count = 1, incidents = new[] { active } });
    }

    [HttpGet("{incidentId}")]
    public IActionResult GetIncident(string incidentId)
    {
        var active = _orchestrator.GetActiveIncident();
        if (active == null || !string.Equals(active.Id, incidentId, System.StringComparison.OrdinalIgnoreCase))
        {
            return NotFound(new { success = false, message = $"Incident '{incidentId}' not found." });
        }

        return Ok(new { success = true, incident = active });
    }

    [HttpPost("{incidentId}/approve")]
    public async Task<IActionResult> ApproveIncident(string incidentId, [FromBody] ApprovalRequest? request = null)
    {
        var approver = request?.Approver ?? "Staff SRE";
        var incident = await _orchestrator.ApproveAndDeployAsync(incidentId, approver);
        return Ok(new { success = true, incident });
    }

    [HttpPost("{incidentId}/reject")]
    public async Task<IActionResult> RejectIncident(string incidentId, [FromBody] RejectionRequest? request = null)
    {
        var reason = request?.Reason ?? "Rejected by engineer";
        var incident = await _orchestrator.RejectFixAsync(incidentId, reason);
        return Ok(new { success = true, incident });
    }
}
