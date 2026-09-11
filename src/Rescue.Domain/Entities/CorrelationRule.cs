using System;
using System.Collections.Generic;

namespace Rescue.Domain.Entities;

public class CorrelationRule
{
    public string RuleId { get; set; } = Guid.NewGuid().ToString("N");
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public bool IsEnabled { get; set; } = true;

    // Trigger conditions
    public string PrimaryEventType { get; set; } = "http_error"; // E.g., http_error or exception
    public int ErrorThresholdCount { get; set; } = 5; // Minimum errors within window
    public TimeSpan TimeWindow { get; set; } = TimeSpan.FromMinutes(10); // Window for event correlation

    // Correlated precursor events
    public List<string> CorrelatedPrecursorTypes { get; set; } = new()
    {
        "deployment_completed",
        "api_change",
        "database_error"
    };

    public bool RequireMatchingService { get; set; } = true;
    public bool RequireTraceIdMatch { get; set; } = false;
}
