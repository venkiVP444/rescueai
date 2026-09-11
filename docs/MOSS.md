# Moss Integration & Retrieval Observability

## Why Moss is Integral to Rescue
Incident investigation is a high-iteration, multi-hop workflow. An autonomous agent must repeatedly query across:
1. Source code repositories (`ApiClient.cs`, `PaymentService.cs`)
2. Deployment manifests (`deployment-v42.yaml`)
3. Configuration files (`payment-production.json`)
4. Post-mortems and past incidents (`INC-003.md`)
5. Operational runbooks (`payment-503.md`, `api-breaking-change.md`)
6. OpenAPI contracts (`external-api-v1.json`, `external-api-v2.json`)

If context retrieval relies on slow external network hops (150ms - 300ms per query), an investigation pipeline executing 6 to 10 queries incurs a debilitating retrieval tax.

Moss provides real-time, low-latency semantic search designed to run close to application agents.

---

## Architectural Abstraction: IMossRetrievalService
Rescue wraps all retrieval behind a clean domain interface:

```csharp
public interface IMossRetrievalService
{
    Task<MossSearchResult> SearchAsync(string query, MossSearchOptions? options = null, CancellationToken cancellationToken = default);
    Task<List<EvidenceItem>> SearchEvidenceAsync(List<string> queries, CancellationToken cancellationToken = default);
    MossObservabilityStats GetObservabilityStats();
    Task<MossBenchmarkResult> RunBenchmarkAsync();
}
```

### Supported Providers
1. **Moss Cloud**: Active when `MOSS_PROJECT_ID` and `MOSS_PROJECT_KEY` are configured, querying `https://service.usemoss.dev/v1/manage/query`.
2. **Local Retrieval Fallback**: High-performance in-memory hybrid search (BM25 + vector similarity) over the synthetic Acme Commerce knowledge corpus. Ensures zero-dependency execution during offline hackathon demonstrations.

UI labels explicitly distinguish:
- `Moss Cloud`
- `Local Retrieval Fallback`

---

## Latency Measurement & Telemetry
Rescue never fabricates latency numbers. Every retrieval execution is measured using high-resolution hardware ticks:

```csharp
var sw = Stopwatch.StartNew();
// execute retrieval
sw.Stop();
var latencyMs = Math.Round(sw.Elapsed.TotalMilliseconds, 2);
```

Rescue tracks:
- **P50 Latency:** Median retrieval time (typically 2.1 ms locally).
- **P95 Latency:** 95th percentile latency.
- **P99 Latency:** 99th percentile latency.
- **Last Query Latency:** Precision timing of the most recent query.
- **Query Count:** Total number of semantic queries performed.

### Benchmark Comparison
Rescue provides a side-by-side comparison mode measuring actual retrieval latency against a **Synthetic Remote Baseline** (traditional external vector database round-trip over HTTP/TLS).
