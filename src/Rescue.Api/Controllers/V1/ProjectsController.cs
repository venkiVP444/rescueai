using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Rescue.Domain.Interfaces;

namespace Rescue.Api.Controllers.V1;

public class CreateProjectRequest
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Environment { get; set; } = "production";
    public string RepositoryUrl { get; set; } = string.Empty;
    public List<string>? Services { get; set; }
}

[ApiController]
[Route("api/v1/projects")]
[Route("api/projects")]
public class ProjectsController : ControllerBase
{
    private readonly IProjectService _projectService;

    public ProjectsController(IProjectService projectService)
    {
        _projectService = projectService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAllProjects()
    {
        var projects = await _projectService.GetAllProjectsAsync();
        return Ok(new { success = true, count = projects.Count, projects });
    }

    [HttpGet("{projectId}")]
    public async Task<IActionResult> GetProject(string projectId)
    {
        var project = await _projectService.GetProjectAsync(projectId);
        if (project == null)
        {
            return NotFound(new { success = false, message = $"Project '{projectId}' not found." });
        }
        return Ok(new { success = true, project });
    }

    [HttpPost]
    public async Task<IActionResult> CreateProject([FromBody] CreateProjectRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Id) || string.IsNullOrWhiteSpace(request.Name))
        {
            return BadRequest(new { success = false, message = "Project 'id' and 'name' are required." });
        }

        var existing = await _projectService.GetProjectAsync(request.Id);
        if (existing != null)
        {
            return Conflict(new { success = false, message = $"Project with id '{request.Id}' already exists." });
        }

        var result = await _projectService.CreateProjectAsync(
            request.Id,
            request.Name,
            request.Description,
            request.Environment,
            request.Services,
            request.RepositoryUrl);

        return CreatedAtAction(nameof(GetProject), new { projectId = result.Project.Id }, new
        {
            success = true,
            message = "Project created successfully. Save your raw API key now; it will not be shown again.",
            project = result.Project,
            rawApiKey = result.RawApiKey
        });
    }
}
