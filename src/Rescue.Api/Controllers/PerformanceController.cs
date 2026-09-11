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

    [HttpPost("moss/benchmark")]
    public async Task<IActionResult> RunBenchmark()
    {
        var result = await _mossService.RunBenchmarkAsync();
        return Ok(result);
    }
}
