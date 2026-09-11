using System.Threading;
using System.Threading.Tasks;
using Rescue.Domain.Entities;

namespace Rescue.Domain.Interfaces;

public interface IIncidentCorrelationEngine
{
    Task<CorrelationResult> CorrelateIncidentAsync(Incident incident, CancellationToken cancellationToken = default);
}
