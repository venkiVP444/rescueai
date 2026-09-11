using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Rescue.Domain.Entities;
using Rescue.Domain.Interfaces;

namespace Rescue.Api.Controllers.V1;

[ApiController]
[Route("api/v1/events")]
public class EventsController : ControllerBase
{
    private readonly IEventIngestionService _ingestionService;

    public EventsController(IEventIngestionService ingestionService)
    {
        _ingestionService = ingestionService;
    }

    private string? ExtractApiKey()
    {
        if (Request.Headers.TryGetValue("X-API-Key", out var apiKeyValues))
        {
            return apiKeyValues.ToString();
        }
        if (Request.Headers.TryGetValue("Authorization", out var authValues))
        {
            var auth = authValues.ToString();
            if (auth.StartsWith("Bearer ", System.StringComparison.OrdinalIgnoreCase))
            {
                return auth.Substring(7).Trim();
            }
        }
        return null;
    }

    [HttpPost]
    public async Task<IActionResult> IngestEvent([FromBody] RescueEvent evt)
    {
        if (evt == null)
        {
            return BadRequest(new { success = false, message = "Event payload cannot be empty." });
        }

        var apiKey = ExtractApiKey();
        var result = await _ingestionService.IngestEventAsync(evt, apiKey);

        if (!result.Success)
        {
            return BadRequest(new { success = false, message = result.Message });
        }

        return Ok(new
        {
            success = true,
            message = result.Message,
            eventId = result.EventId,
            triggeredIncident = result.TriggeredIncident
        });
    }

    [HttpPost("batch")]
    public async Task<IActionResult> IngestBatch([FromBody] List<RescueEvent> events)
    {
        if (events == null || events.Count == 0)
        {
            return BadRequest(new { success = false, message = "Event batch cannot be empty." });
        }

        var apiKey = ExtractApiKey();
        var result = await _ingestionService.IngestBatchAsync(events, apiKey);

        if (!result.Success)
        {
            return BadRequest(new { success = false, message = result.Message });
        }

        return Ok(new
        {
            success = true,
            message = result.Message,
            ingestedCount = result.IngestedCount,
            triggeredIncident = result.TriggeredIncident
        });
    }

    [HttpGet]
    public async Task<IActionResult> GetRecentEvents([FromQuery] string? projectId = null, [FromQuery] int limit = 50)
    {
        var events = await _ingestionService.GetRecentEventsAsync(projectId, limit);
        return Ok(new { success = true, count = events.Count, events });
    }
}
