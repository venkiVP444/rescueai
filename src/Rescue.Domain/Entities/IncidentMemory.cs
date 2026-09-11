using System;

namespace Rescue.Domain.Entities;

public class IncidentMemory
{
    public string Id { get; set; } = Guid.NewGuid().ToString("N");
    public string ProjectId { get; set; } = string.Empty;
    public string Environment { get; set; } = "production";
    public string IncidentId { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Service { get; set; } = string.Empty;
    public string IncidentType { get; set; } = string.Empty;
    public string Symptoms { get; set; } = string.Empty;
    public string RootCause { get; set; } = string.Empty;
    public string? RelatedApiChangeId { get; set; }
    public string AffectedFiles { get; set; } = string.Empty;
    public string AffectedServices { get; set; } = string.Empty;
    public string ProposedFixSummary { get; set; } = string.Empty;
    public string ValidationResultSummary { get; set; } = string.Empty;
    public string RiskLevel { get; set; } = "Low";
    public string ApprovalResult { get; set; } = "Approved";
    public string? GitHubPrReference { get; set; }
    public string DeploymentResult { get; set; } = string.Empty;
    public string VerificationResult { get; set; } = string.Empty;
    public string ResolutionOutcome { get; set; } = "Successfully resolved";
    public DateTime ResolvedAt { get; set; } = DateTime.UtcNow;
    public string EvidenceReferences { get; set; } = string.Empty;
    public bool IsBaseline { get; set; } = false;
}
