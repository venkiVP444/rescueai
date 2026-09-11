using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Rescue.Domain.Entities;
using Rescue.Domain.Enums;

namespace Rescue.Domain.Interfaces;

public record MossSearchOptions(int TopK = 5, double Alpha = 0.6, string? FilterCategory = null);

public record MossSearchResult(
    string Query,
    List<EvidenceItem> Documents,
    double LatencyMs,
    RetrievalProvider Provider
);

public record MossObservabilityStats(
    double P50Ms,
    double P95Ms,
    double P99Ms,
    double AverageMs,
    double LastQueryLatencyMs,
    int TotalQueries,
    RetrievalProvider CurrentProvider,
    List<MossMetric> RecentQueries
);

public record MossBenchmarkResult(
    double MossLatencyMs,
    double SyntheticRemoteBaselineMs,
    double SpeedupFactor,
    string Note
);

public interface IMossRetrievalService
{
    Task<MossSearchResult> SearchAsync(string query, MossSearchOptions? options = null, CancellationToken cancellationToken = default);
    Task<List<EvidenceItem>> SearchEvidenceAsync(List<string> queries, CancellationToken cancellationToken = default);
    MossObservabilityStats GetObservabilityStats();
    Task<MossBenchmarkResult> RunBenchmarkAsync();
    void ResetMetrics();
}
