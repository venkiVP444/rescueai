using System;

namespace Rescue.Domain.Entities;

public class AgentActivity
{
    public string Id { get; set; } = Guid.NewGuid().ToString("N");
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    public string StepName { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string PayloadJson { get; set; } = "{}";
    public double DurationMs { get; set; }
}
