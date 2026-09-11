# Architecture Documentation

## Overview
Rescue is built as a Clean Architecture system with clear separation between Domain, Application, Infrastructure, API, and Web presentation layers.

```
                    ┌─────────────────────────┐
                    │   User / SRE Engineer   │
                    └────────────┬────────────┘
                                 │
                                 ▼
                    ┌─────────────────────────┐
                    │ Rescue Web (React/Vite) │
                    └────────────┬────────────┘
                                 │ HTTP / SignalR
                                 ▼
                    ┌─────────────────────────┐
                    │ Rescue API (ASP.NET)    │
                    └────────────┬────────────┘
                                 │
             ┌───────────────────┼───────────────────┐
             ▼                   ▼                   ▼
      Incident Engine    API Change Engine     Approval Gate
             │                   │                   │
             └───────────────────┼───────────────────┘
                                 ▼
                    ┌─────────────────────────┐
                    │ Agent Orchestrator Core │
                    └────────────┬────────────┘
                                 │
              ┌──────────────────┼──────────────────┐
              ▼                  ▼                  ▼
      IMossRetrieval      CorrelationEngine   Evidence Graph
              │                  │                  │
              └──────────────────┼──────────────────┘
                                 ▼
                    ┌─────────────────────────┐
                    │ Fix & Diff Generator    │
                    └────────────┬────────────┘
                                 │
                    ┌─────────────────────────┐
                    │ Validation Engine       │
                    └────────────┬────────────┘
                                 │
                    ┌─────────────────────────┐
                    │ Human Approval Gate     │
                    └────────────┬────────────┘
                                 │
                    ┌─────────────────────────┐
                    │ GitHub PR / Staging     │
                    └────────────┬────────────┘
                                 │
                    ┌─────────────────────────┐
                    │ Recovery Verification   │
                    └─────────────────────────┘
```

## Core Components
1. **Rescue.Domain**:
   - Entities: `Incident`, `ApiChange`, `Investigation`, `CorrelationResult`, `EvidenceGraph`, `ProposedPatch`, `ValidationReport`, `ApprovalRecord`, `GitHubPrRecord`, `DeploymentVerification`, `MossMetric`.
   - Interfaces: `IMossRetrievalService`, `IIncidentCorrelationEngine`, `IInvestigationOrchestrator`, `IApiChangeEngine`, `IPatchEngine`, `IValidationEngine`, `IRiskAssessmentEngine`, `IGitHubService`, `IDeploymentVerificationService`.

2. **Rescue.Application**:
   - `IncidentCorrelationEngine`: Evaluates incoming incidents against active API changes, deployments, configs, and logs.
   - `InvestigationOrchestrator`: Multi-agent pipeline coordinating context retrieval, causal graph generation, patch creation, and validation.
   - `PatchEngine`: Unified diff generation for C# and JSON configuration.
   - `ValidationEngine`: Roslyn syntax validation, test suite simulation, secret scanning.

3. **Rescue.Infrastructure**:
   - `MossRetrievalService`: Cloud Moss REST integration with seamless in-process hybrid retrieval fallback. Instruments actual hardware timestamps (`Stopwatch.GetTimestamp`) for true P50/P95/P99 latency calculations.
   - `RescueDbContext`: SQLite EF Core persistence.
   - `GitHubService`: Generates branch names, commit SHAs, and markdown PR previews.
   - `StagingDeploymentSimulator`: Executes staging rollouts and verified telemetry metrics.

4. **Rescue.Api**:
   - REST Controllers: `DashboardController`, `IncidentsController`, `ApiChangesController`, `PerformanceController`, `DemoController`.
   - SignalR Hub: `/hubs/rescue` streaming real-time event notifications.

5. **Rescue.Web**:
   - React 19 + TypeScript + Vite SRE Command Center.
   - "RESCUE CONNECTED THE DOTS" primary view with interactive causal evidence DAG.
