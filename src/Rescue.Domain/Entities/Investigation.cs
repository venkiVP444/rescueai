using System;
using System.Collections.Generic;

namespace Rescue.Domain.Entities;

public class Investigation
{
    public string Id { get; set; } = Guid.NewGuid().ToString("N");
    public string IncidentId { get; set; } = string.Empty;
    public DateTime StartedAt { get; set; } = DateTime.UtcNow;
    public DateTime? CompletedAt { get; set; }
    public string Classification { get; set; } = "Production Incident";
    public string RootCause { get; set; } = string.Empty;
    public int ConfidenceScore { get; set; } = 96;
    public string ConfidenceExplanation { get; set; } = string.Empty;
    public List<EvidenceItem> EvidenceItems { get; set; } = new();
    public List<TimelineEvent> Timeline { get; set; } = new();
    public EvidenceGraph EvidenceGraph { get; set; } = new();
}
