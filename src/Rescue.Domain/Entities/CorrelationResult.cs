using System;
using System.Collections.Generic;
using Rescue.Domain.Enums;

namespace Rescue.Domain.Entities;

public class CorrelationResult
{
    public string Id { get; set; } = Guid.NewGuid().ToString("N");
    public string IncidentId { get; set; } = string.Empty;
    public string? CorrelatedApiChangeId { get; set; }
    public string? CorrelatedDeploymentId { get; set; }
    public CorrelationConfidence Confidence { get; set; } = CorrelationConfidence.High;
    public int Score { get; set; } = 96;
    public string SummaryExplanation { get; set; } = string.Empty;
    public List<string> CorrelationReasons { get; set; } = new();
    public List<string> EvidenceDocIds { get; set; } = new();
    public DateTime CorrelatedAt { get; set; } = DateTime.UtcNow;
}
