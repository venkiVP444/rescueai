using System;

namespace Rescue.Domain.Entities;

public class DeploymentVerification
{
    public string Id { get; set; } = Guid.NewGuid().ToString("N");
    public string StagingEnvironment { get; set; } = "staging-cluster.internal";
    public string Status { get; set; } = "Verified";
    public double BeforeErrorRate { get; set; }
    public double AfterErrorRate { get; set; }
    public double BeforeLatencyMs { get; set; }
    public double AfterLatencyMs { get; set; }
    public int BeforeActiveConnections { get; set; }
    public int AfterActiveConnections { get; set; }
    public DateTime CompletedAt { get; set; } = DateTime.UtcNow;
}
