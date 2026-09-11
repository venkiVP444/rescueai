using System;

namespace Rescue.Domain.Entities;

public class MemoryMatchResult
{
    public string PreviousIncidentId { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Service { get; set; } = string.Empty;
    public string PreviousRootCause { get; set; } = string.Empty;
    public string PreviousFix { get; set; } = string.Empty;
    public string PreviousValidation { get; set; } = string.Empty;
    public string PreviousOutcome { get; set; } = string.Empty;
    public string RelevanceReason { get; set; } = string.Empty;
    public double MatchConfidence { get; set; } = 92.0;
    public DateTime ResolvedAt { get; set; } = DateTime.UtcNow.AddDays(-20);
    public int DaysAgo => Math.Max(1, (int)(DateTime.UtcNow - ResolvedAt).TotalDays);
}
