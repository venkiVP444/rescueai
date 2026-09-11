using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Rescue.Domain.Interfaces;

namespace Rescue.Api.Controllers;

[ApiController]
[Route("api/memory")]
public class MemoryController : ControllerBase
{
    private readonly IMemoryService _memoryService;

    public MemoryController(IMemoryService memoryService)
    {
        _memoryService = memoryService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAllMemories()
    {
        var memories = await _memoryService.GetAllMemoriesAsync();
        return Ok(new
        {
            success = true,
            count = memories.Count,
            memories
        });
    }

    [HttpPost("reset")]
    public async Task<IActionResult> ResetMemories()
    {
        await _memoryService.ResetMemoriesAsync();
        return Ok(new
        {
            success = true,
            message = "RESCUE Operational Memory reset to verified baseline historical records."
        });
    }
}
