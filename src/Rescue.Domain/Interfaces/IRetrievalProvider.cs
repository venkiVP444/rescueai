using System.Collections.Generic;
using System.Threading.Tasks;
using Rescue.Domain.Entities;

namespace Rescue.Domain.Interfaces;

public interface IRetrievalProvider
{
    string ProviderName { get; }
    Task<List<EvidenceItem>> RetrieveEvidenceAsync(string query, int maxResults = 5);
    Task<MossMetric> MeasureLatencyAsync();
}
