using System;
using Rescue.Domain.Enums;

namespace Rescue.Domain.Entities;

public class Incident
{
    public string Id { get; set; } = string.Empty;
    public string ProjectId { get; set; } = string.Empty;
    public string Environment { get; set; } = "production";
    public string Title { get; set; } = string.Empty;
    public string Service { get; set; } = string.Empty;
    public SeverityLevel Severity { get; set; } = SeverityLevel.Critical;
    public IncidentStatus Status { get; set; } = IncidentStatus.Detected;
    public DateTime DetectedAt { get; set; } = DateTime.UtcNow;
    public DateTime? ResolvedAt { get; set; }
    public string ProblemDescription { get; set; } = string.Empty;
    public string? RootCause { get; set; }
    public double ErrorRateBefore { get; set; } = 42.0;
    public double? ErrorRateAfter { get; set; }
    public int ActiveConnections { get; set; } = 200;
    public int MaxConnections { get; set; } = 50;
    public double LatencyBeforeMs { get; set; } = 1840.0;
    public double? LatencyAfterMs { get; set; }
    public Investigation? Investigation { get; set; }
    public CorrelationResult? Correlation { get; set; }
    public ProposedPatch? ProposedPatch { get; set; }
    public ValidationReport? ValidationReport { get; set; }
    public ApprovalRecord? Approval { get; set; }
    public GitHubPrRecord? GitHubPr { get; set; }
    public DeploymentVerification? Verification { get; set; }
}
