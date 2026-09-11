using System;
using Rescue.Domain.Enums;

namespace Rescue.Domain.Entities;

public class MossMetric
{
    public string Id { get; set; } = Guid.NewGuid().ToString("N");
    public string Query { get; set; } = string.Empty;
    public double LatencyMs { get; set; }
    public int ResultCount { get; set; }
    public RetrievalProvider Provider { get; set; }
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
}
