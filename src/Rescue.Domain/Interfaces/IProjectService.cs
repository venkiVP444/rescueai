using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Rescue.Domain.Entities;

namespace Rescue.Domain.Interfaces;

public class ProjectCreationResult
{
    public Project Project { get; set; } = null!;
    public string RawApiKey { get; set; } = string.Empty; // Shown ONLY once!
}

public interface IProjectService
{
    Task<ProjectCreationResult> CreateProjectAsync(string id, string name, string description, string environment, List<string>? services = null, string repoUrl = "", CancellationToken cancellationToken = default);
    Task<Project?> GetProjectAsync(string projectId, CancellationToken cancellationToken = default);
    Task<List<Project>> GetAllProjectsAsync(CancellationToken cancellationToken = default);
    Task<bool> ValidateApiKeyAsync(string projectId, string rawApiKey, CancellationToken cancellationToken = default);
    Task SeedDefaultProjectAsync(CancellationToken cancellationToken = default);
}
