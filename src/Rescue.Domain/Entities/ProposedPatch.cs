using System;
using Rescue.Domain.Enums;

namespace Rescue.Domain.Entities;

public class ProposedPatch
{
    public string Id { get; set; } = Guid.NewGuid().ToString("N");
    public string FilePath { get; set; } = string.Empty;
    public string OldContent { get; set; } = string.Empty;
    public string NewContent { get; set; } = string.Empty;
    public string UnifiedDiff { get; set; } = string.Empty;
    public string Explanation { get; set; } = string.Empty;
    public RiskLevel Risk { get; set; } = RiskLevel.Low;
    public string RollbackPlan { get; set; } = string.Empty;
    public bool IsApplied { get; set; }
    public DateTime GeneratedAt { get; set; } = DateTime.UtcNow;
}
