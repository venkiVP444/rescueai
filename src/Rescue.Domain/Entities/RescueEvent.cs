using System;
using System.Collections.Generic;

namespace Rescue.Domain.Entities;

public class RescueEvent
{
    public string EventId { get; set; } = Guid.NewGuid().ToString("N");
    public string SchemaVersion { get; set; } = "1.0";
    public string ProjectId { get; set; } = string.Empty;
    public string Service { get; set; } = string.Empty;
    public string Environment { get; set; } = "production";
    public string EventType { get; set; } = "http_error";
    public string Severity { get; set; } = "high";
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    public Dictionary<string, object> Data { get; set; } = new();
    public Dictionary<string, string> Correlation { get; set; } = new();
    public string? RawPayload { get; set; }
    public bool IsProcessed { get; set; } = false;
}
