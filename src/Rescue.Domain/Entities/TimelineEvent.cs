using System;
using Rescue.Domain.Enums;

namespace Rescue.Domain.Entities;

public class TimelineEvent
{
    public string Id { get; set; } = Guid.NewGuid().ToString("N");
    public string InvestigationId { get; set; } = string.Empty;
    public string TimeLabel { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string EventType { get; set; } = string.Empty;
    public SeverityLevel Severity { get; set; }
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
}
