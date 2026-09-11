using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Rescue.Application.Interfaces;

namespace Rescue.Api.Controllers;

[ApiController]
[Route("api/api-changes")]
public class ApiChangesController : ControllerBase
{
    private readonly IApiChangeEngine _apiChangeEngine;

    public ApiChangesController(IApiChangeEngine apiChangeEngine)
    {
        _apiChangeEngine = apiChangeEngine;
    }

    [HttpGet]
    public async Task<IActionResult> GetApiChanges()
    {
        var change = await _apiChangeEngine.DetectAndAnalyzeAsync();
        return Ok(new[] { change });
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetApiChange(string id)
    {
        var change = await _apiChangeEngine.DetectAndAnalyzeAsync(id);
        return Ok(change);
    }

    [HttpPost("simulate")]
    public async Task<IActionResult> SimulateApiChange()
    {
        var change = await _apiChangeEngine.DetectAndAnalyzeAsync("API-420");
        return Ok(change);
    }
}
