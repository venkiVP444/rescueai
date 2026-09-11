using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Rescue.Domain.Entities;

namespace Rescue.Sdk;

public interface IRescueClient
{
    Task SendEventAsync(RescueEvent evt, CancellationToken cancellationToken = default);
    Task SendHttpErrorAsync(int statusCode, string endpoint, string message, string? traceId = null, CancellationToken cancellationToken = default);
    Task SendDeploymentAsync(string deploymentId, string version, string status = "deployment_completed", CancellationToken cancellationToken = default);
    Task SendExceptionAsync(Exception ex, string? endpoint = null, CancellationToken cancellationToken = default);
}
