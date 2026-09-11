using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Rescue.Domain.Entities;

namespace Rescue.Domain.Interfaces;

public interface IMemoryService
{
    Task RecordIncidentMemoryAsync(IncidentMemory memory, CancellationToken cancellationToken = default);
    Task<MemoryMatchResult?> FindSimilarIncidentAsync(Incident incident, CancellationToken cancellationToken = default);
    Task<List<IncidentMemory>> GetAllMemoriesAsync(CancellationToken cancellationToken = default);
    Task SeedBaselineMemoriesAsync(CancellationToken cancellationToken = default);
    Task ResetMemoriesAsync(CancellationToken cancellationToken = default);
}
