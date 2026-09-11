using System.Threading;
using System.Threading.Tasks;
using Rescue.Domain.Entities;
using Rescue.Domain.Enums;

namespace Rescue.Application.Interfaces;

public interface IInvestigationOrchestrator
{
    Task<Incident> RunFullInvestigationAsync(string incidentId, CancellationToken cancellationToken = default);
    Task<Incident> RunKillerDemoAsync(CancellationToken cancellationToken = default);
    Task<Incident> RunStandaloneRedisIncidentAsync(CancellationToken cancellationToken = default);
    Task<ApiChange> RunStandaloneApiChangeAsync(CancellationToken cancellationToken = default);
    Task<Incident> ApproveAndDeployAsync(string incidentId, string approver = "Staff SRE Engineer", CancellationToken cancellationToken = default);
    Task<Incident> RejectFixAsync(string incidentId, string reason, CancellationToken cancellationToken = default);
    Task ResetStateAsync(CancellationToken cancellationToken = default);
    void SetAutonomyMode(AutonomyMode mode);
    AutonomyMode GetAutonomyMode();
    Incident? GetActiveIncident();
    ApiChange? GetActiveApiChange();
}
