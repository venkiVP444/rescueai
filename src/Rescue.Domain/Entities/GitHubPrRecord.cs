using System;

namespace Rescue.Domain.Entities;

public class GitHubPrRecord
{
    public string Id { get; set; } = Guid.NewGuid().ToString("N");
    public string BranchName { get; set; } = string.Empty;
    public string CommitSha { get; set; } = string.Empty;
    public int PrNumber { get; set; }
    public string PrUrl { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Body { get; set; } = string.Empty;
    public bool IsDemoMode { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
