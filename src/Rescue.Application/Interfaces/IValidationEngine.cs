using System.Threading;
using System.Threading.Tasks;
using Rescue.Domain.Entities;

namespace Rescue.Application.Interfaces;

public interface IValidationEngine
{
    Task<ValidationReport> ValidatePatchAsync(ProposedPatch patch, string scenarioType = "api-migration", CancellationToken cancellationToken = default);
}
