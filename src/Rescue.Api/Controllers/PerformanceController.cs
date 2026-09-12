using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Rescue.Domain.Interfaces;

namespace Rescue.Api.Controllers;

[ApiController]
[Route("api/performance")]
public class PerformanceController : ControllerBase
{
    private readonly IMossRetrievalService _mossService;

    public PerformanceController(IMossRetrievalService mossService)
    {
        _mossService = mossService;
    }

    [HttpGet("moss")]
    public IActionResult GetMossPerformance()
    {
        var stats = _mossService.GetObservabilityStats();
        return Ok(stats);
    }

    [HttpGet("moss/query")]
    public async Task<IActionResult> QueryMoss([FromQuery] string q)
    {
        var result = await _mossService.SearchAsync(q ?? "");
        return Ok(new
        {
            query = result.Query,
            latencyMs = result.LatencyMs,
            provider = result.Provider.ToString(),
            documents = result.Documents.Select(d => $"{d.DocId} (Relevance: {d.RelevanceScore:F2})").ToList(),
            evidence = result.Documents
        });
    }

    [HttpPost("moss/benchmark")]
    public async Task<IActionResult> RunBenchmark()
    {
        var result = await _mossService.RunBenchmarkAsync();
        return Ok(result);
    }
}
