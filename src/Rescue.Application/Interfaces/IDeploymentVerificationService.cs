using System.Threading;
using System.Threading.Tasks;
using Rescue.Domain.Entities;

namespace Rescue.Application.Interfaces;

public interface IDeploymentVerificationService
{
    Task<DeploymentVerification> DeployToStagingAndVerifyAsync(string incidentId, CancellationToken cancellationToken = default);
}
