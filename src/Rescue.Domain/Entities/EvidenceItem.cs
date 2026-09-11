using System;
using Rescue.Domain.Enums;

namespace Rescue.Domain.Entities;

public class EvidenceItem
{
    public string Id { get; set; } = Guid.NewGuid().ToString("N");
    public string InvestigationId { get; set; } = string.Empty;
    public string DocId { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public string Service { get; set; } = string.Empty;
    public string Snippet { get; set; } = string.Empty;
    public double RelevanceScore { get; set; }
    public string FilePath { get; set; } = string.Empty;
    public double LatencyMs { get; set; }
    public RetrievalProvider Provider { get; set; }
    public DateTime RetrievedAt { get; set; } = DateTime.UtcNow;
}
