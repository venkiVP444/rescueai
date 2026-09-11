using System.Collections.Generic;
using Rescue.Domain.Enums;

namespace Rescue.Domain.Entities;

public class SystemStatus
{
    public string Overall { get; set; } = "Healthy";
    public AutonomyMode Autonomy { get; set; } = AutonomyMode.Recommend;
    public List<ServiceHealth> Services { get; set; } = new();
}

public class ServiceHealth
{
    public string Name { get; set; } = string.Empty;
    public string Status { get; set; } = "Healthy"; // Healthy, Degraded, Critical
    public double ErrorRate { get; set; }
    public double LatencyMs { get; set; }
    public string Version { get; set; } = "v1.8.2";
}
