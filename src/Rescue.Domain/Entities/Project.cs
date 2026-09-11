using System;
using System.Collections.Generic;

namespace Rescue.Domain.Entities;

public class Project
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Environment { get; set; } = "production";
    public string ApiKeyHash { get; set; } = string.Empty;
    public string ApiKeyPrefix { get; set; } = string.Empty;
    public string RepositoryUrl { get; set; } = string.Empty;
    public string DefaultBranch { get; set; } = "main";
    public List<string> Services { get; set; } = new();
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? LastEventAt { get; set; }
    public bool IsActive { get; set; } = true;
}
