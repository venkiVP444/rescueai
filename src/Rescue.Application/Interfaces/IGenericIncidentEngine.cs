using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Rescue.Domain.Entities;

namespace Rescue.Application.Interfaces;

public interface IGenericIncidentEngine
{
    List<CorrelationRule> Rules { get; }
    void AddRule(CorrelationRule rule);
    Task<Incident?> EvaluateEventsAsync(string projectId, string service, List<RescueEvent> recentEvents, CancellationToken cancellationToken = default);
}
