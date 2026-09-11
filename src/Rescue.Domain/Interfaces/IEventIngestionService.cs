using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Rescue.Domain.Entities;

namespace Rescue.Domain.Interfaces;

public class IngestionResult
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
    public string? EventId { get; set; }
    public int IngestedCount { get; set; }
    public Incident? TriggeredIncident { get; set; }
}

public interface IEventIngestionService
{
    Task<IngestionResult> IngestEventAsync(RescueEvent evt, string? apiKey = null, CancellationToken cancellationToken = default);
    Task<IngestionResult> IngestBatchAsync(List<RescueEvent> events, string? apiKey = null, CancellationToken cancellationToken = default);
    Task<List<RescueEvent>> GetRecentEventsAsync(string? projectId = null, int limit = 50, CancellationToken cancellationToken = default);
}
