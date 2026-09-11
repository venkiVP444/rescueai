using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Rescue.Application.Interfaces;
using Rescue.Domain.Entities;
using Rescue.Domain.Enums;
using Rescue.Domain.Interfaces;

namespace Rescue.Application.Services;

public class InvestigationOrchestrator : IInvestigationOrchestrator
{
    private readonly IMossRetrievalService _mossService;
    private readonly IIncidentCorrelationEngine _correlationEngine;
    private readonly IApiChangeEngine _apiChangeEngine;
    private readonly IPatchEngine _patchEngine;
    private readonly IValidationEngine _validationEngine;
    private readonly IRiskAssessmentEngine _riskEngine;
    private readonly IGitHubService _gitHubService;
    private readonly IDeploymentVerificationService _deploymentService;
    private readonly IEventNotificationService _notifier;
    private readonly IMemoryService _memoryService;

    // In-memory active state for deterministic demo
    private static Incident? _activeIncident;
    private static ApiChange? _activeApiChange;
    private static AutonomyMode _currentAutonomy = AutonomyMode.Recommend;

    public InvestigationOrchestrator(
        IMossRetrievalService mossService,
        IIncidentCorrelationEngine correlationEngine,
        IApiChangeEngine apiChangeEngine,
        IPatchEngine patchEngine,
        IValidationEngine validationEngine,
        IRiskAssessmentEngine riskEngine,
        IGitHubService gitHubService,
        IDeploymentVerificationService deploymentService,
        IEventNotificationService notifier,
        IMemoryService memoryService)
    {
        _mossService = mossService;
        _correlationEngine = correlationEngine;
        _apiChangeEngine = apiChangeEngine;
        _patchEngine = patchEngine;
        _validationEngine = validationEngine;
        _riskEngine = riskEngine;
        _gitHubService = gitHubService;
        _deploymentService = deploymentService;
        _notifier = notifier;
        _memoryService = memoryService;
    }

    public void SetAutonomyMode(AutonomyMode mode) => _currentAutonomy = mode;
    public AutonomyMode GetAutonomyMode() => _currentAutonomy;
    public Incident? GetActiveIncident() => _activeIncident;
    public ApiChange? GetActiveApiChange() => _activeApiChange;

    public async Task<Incident> RunKillerDemoAsync(CancellationToken cancellationToken = default)
    {
        // STEP 1: Detect API Breaking Change (10:00 - 10:02)
        await _notifier.BroadcastEventAsync("ApiChangeDetected", new
        {
            Id = "API-420",
            Provider = "Acme Payments Gateway",
            Version = "v4.2",
            Change = "customer_id -> customerId",
            Timestamp = "10:00:00 UTC"
        });

        // Query Moss for impact analysis
        await _notifier.BroadcastEventAsync("MossQueryStarted", new { Query = "customer_id API consumers" });
        _activeApiChange = await _apiChangeEngine.DetectAndAnalyzeAsync("API-420", cancellationToken);
        var stats = _mossService.GetObservabilityStats();

        await _notifier.BroadcastEventAsync("ImpactAnalysisCompleted", new
        {
            ApiChange = _activeApiChange,
            ReferencesFound = 17,
            ServicesAffected = 3,
            TestsAffected = 8,
            PendingApproval = true,
            MossLatencyMs = stats.LastQueryLatencyMs
        });

        // STEP 2: Production Incident Spikes (10:10)
        var incident = new Incident
        {
            Id = "INC-105",
            ProjectId = "acme-commerce",
            Environment = "production",
            Title = "PaymentService HTTP 503 Surge (42% Failure Rate)",
            Service = "PaymentService",
            Severity = SeverityLevel.Critical,
            Status = IncidentStatus.Detected,
            DetectedAt = DateTime.UtcNow,
            ProblemDescription = "Inbound payment transactions failing with HTTP 503. Downstream payment authorizations rejected by Acme Payments gateway.",
            ErrorRateBefore = 42.0,
            ActiveConnections = 200,
            MaxConnections = 200,
            LatencyBeforeMs = 1840.0
        };
        _activeIncident = incident;

        await _notifier.BroadcastEventAsync("IncidentDetected", incident);

        // STEP 3: Context Retrieval via Moss
        await _notifier.BroadcastEventAsync("MossQueryStarted", new { Query = "PaymentService 503 customer_id ApiClient.cs" });
        var retrievalQueries = new List<string>
        {
            "Acme Payments API v4.2 breaking changes customerId",
            "ApiClient.cs customer_id payload serialization",
            "PaymentService 503 external gateway contract mismatch",
            "CHG-2026-09 external-api-v2.json"
        };

        var evidence = await _mossService.SearchEvidenceAsync(retrievalQueries, cancellationToken);
        stats = _mossService.GetObservabilityStats();

        await _notifier.BroadcastEventAsync("MossResultRetrieved", new
        {
            Count = evidence.Count,
            Evidence = evidence,
            P50 = stats.P50Ms,
            P95 = stats.P95Ms,
            P99 = stats.P99Ms,
            Provider = stats.CurrentProvider.ToString()
        });

        // STEP 4: Correlation Engine - RESCUE CONNECTED THE DOTS
        await _notifier.BroadcastEventAsync("CorrelationStarted", new { IncidentId = incident.Id });
        var correlation = await _correlationEngine.CorrelateIncidentAsync(incident, cancellationToken);
        incident.Correlation = correlation;
        incident.Status = IncidentStatus.Correlating;

        await _notifier.BroadcastEventAsync("CorrelationCompleted", correlation);

        // STEP 5: Construct Multi-Event Evidence Graph
        var graph = BuildKillerDemoEvidenceGraph();
        var investigation = new Investigation
        {
            IncidentId = incident.Id,
            Classification = "External API Breaking Change Regression",
            RootCause = "PaymentService is sending deprecated field 'customer_id' to Acme Payments API v4.2. Upstream gateway requires 'customerId'.",
            ConfidenceScore = 96,
            ConfidenceExplanation = "5 supporting evidence documents, timeline correlation (API change 10 min prior), ApiClient.cs code inspection, and 8/8 test validation.",
            EvidenceItems = evidence,
            EvidenceGraph = graph,
            Timeline = BuildKillerDemoTimeline()
        };

        // STEP 5.5: Query RESCUE Historical Operational Memory
        var similarMemory = await _memoryService.FindSimilarIncidentAsync(incident, incident.ProjectId, cancellationToken);
        if (similarMemory != null)
        {
            investigation.SimilarMemoryMatch = similarMemory;
            await _notifier.BroadcastEventAsync("MemoryMatchFound", similarMemory);
        }

        incident.Investigation = investigation;
        incident.RootCause = investigation.RootCause;

        await _notifier.BroadcastEventAsync("EvidenceGraphUpdated", graph);
        await _notifier.BroadcastEventAsync("DiagnosisCompleted", investigation);

        // In OBSERVE mode: complete diagnosis and alert only, no patch proposal
        if (_currentAutonomy == AutonomyMode.Observe)
        {
            incident.Status = IncidentStatus.Investigating;
            await _notifier.BroadcastEventAsync("ApprovalRequired", new
            {
                Incident = incident,
                Patch = (ProposedPatch?)null,
                Validation = (ValidationReport?)null,
                AutonomyMode = "Observe",
                Message = "OBSERVE Mode Active: Incident investigated and alert published. Automated fix generation suppressed."
            });
            return incident;
        }

        // STEP 6: Fix Generation & Validation
        var patch = _patchEngine.GenerateApiMigrationPatch(_activeApiChange);
        incident.ProposedPatch = patch;

        await _notifier.BroadcastEventAsync("FixGenerated", patch);

        await _notifier.BroadcastEventAsync("ValidationProgress", new { Step = "Compiling Roslyn AST and running 8 affected unit tests..." });
        var validation = await _validationEngine.ValidatePatchAsync(patch, "api-migration", cancellationToken);
        incident.ValidationReport = validation;

        await _notifier.BroadcastEventAsync("ValidationCompleted", validation);

        // STEP 7: Human Approval Gate (RECOMMEND Mode) vs AUTONOMOUS Mode
        incident.Status = IncidentStatus.AwaitingApproval;
        incident.Approval = new ApprovalRecord
        {
            Status = "Pending"
        };

        await _notifier.BroadcastEventAsync("ApprovalRequired", new
        {
            Incident = incident,
            Patch = patch,
            Validation = validation,
            Rollback = patch.RollbackPlan,
            AutonomyMode = _currentAutonomy.ToString()
        });

        if (_currentAutonomy == AutonomyMode.Autonomous)
        {
            // Auto-deploy safely to staging sandbox in Autonomous mode
            return await ApproveAndDeployAsync(incident.Id, "Rescue Autonomous SRE", cancellationToken);
        }

        return incident;
    }

    public async Task<Incident> ApproveAndDeployAsync(string incidentId, string approver = "Staff SRE Engineer", CancellationToken cancellationToken = default)
    {
        var incident = _activeIncident ?? new Incident { Id = incidentId };

        // 1. Human Approval Granted
        incident.Approval = new ApprovalRecord
        {
            Status = "Approved",
            Approver = approver,
            ApprovedAt = DateTime.UtcNow,
            DecisionNotes = "Approved hotfix after verifying 8/8 unit tests and unified diff."
        };
        incident.Status = IncidentStatus.Deploying;

        await _notifier.BroadcastEventAsync("ApprovalGranted", incident.Approval);

        // 2. Create GitHub PR
        var pr = await _gitHubService.CreatePullRequestAsync(
            "[Rescue] Fix PaymentService API v4.2 customerId contract migration",
            "rescue/INC-105-api-migration",
            incident.ProposedPatch!,
            incident.ValidationReport!,
            incident.Correlation,
            cancellationToken
        );
        incident.GitHubPr = pr;

        await _notifier.BroadcastEventAsync("GitHubPrCreated", pr);

        // 3. Staging Deployment
        await _notifier.BroadcastEventAsync("DeploymentProgress", new { Step = "Building container image & deploying to safe staging sandbox..." });
        var verification = await _deploymentService.DeployToStagingAndVerifyAsync(incident.Id, cancellationToken);
        incident.Verification = verification;
        incident.Status = IncidentStatus.Verifying;

        await _notifier.BroadcastEventAsync("DeploymentProgress", new { Step = "Verifying live traffic recovery..." });

        // 4. Verification & Resolution
        incident.Status = IncidentStatus.Resolved;
        incident.ResolvedAt = DateTime.UtcNow;
        incident.ErrorRateAfter = verification.AfterErrorRate;
        incident.LatencyAfterMs = verification.AfterLatencyMs;

        await _notifier.BroadcastEventAsync("VerificationCompleted", verification);
        await _notifier.BroadcastEventAsync("IncidentResolved", incident);

        // 5. Persist into RESCUE Operational Memory
        var memoryRecord = new IncidentMemory
        {
            ProjectId = !string.IsNullOrWhiteSpace(incident.ProjectId) ? incident.ProjectId : "acme-commerce",
            Environment = !string.IsNullOrWhiteSpace(incident.Environment) ? incident.Environment : "production",
            IncidentId = incident.Id,
            Title = incident.Title,
            Service = incident.Service,
            IncidentType = "ApiCompatibilityFailure",
            Symptoms = incident.ProblemDescription,
            RootCause = incident.RootCause ?? "PaymentService sending deprecated customer_id to Acme Payments v4.2 API",
            RelatedApiChangeId = incident.Correlation?.CorrelatedApiChangeId ?? "API-420",
            AffectedFiles = incident.ProposedPatch?.FilePath ?? "ApiClient.cs",
            AffectedServices = incident.Service,
            ProposedFixSummary = incident.ProposedPatch?.Explanation ?? "Migrate serialization property customer_id -> customerId in ApiClient.cs",
            ValidationResultSummary = $"{incident.ValidationReport?.PassedTests ?? 8}/{incident.ValidationReport?.TotalTests ?? 8} unit tests passed (100%)",
            RiskLevel = incident.ProposedPatch?.Risk.ToString() ?? "Low",
            ApprovalResult = incident.Approval?.Status ?? "Approved",
            GitHubPrReference = incident.GitHubPr != null ? $"PR #{incident.GitHubPr.PrNumber} ({incident.GitHubPr.BranchName})" : null,
            DeploymentResult = "Deployed to safe staging sandbox",
            VerificationResult = $"Error rate recovered from {incident.ErrorRateBefore:F1}% to {incident.ErrorRateAfter:F1}%",
            ResolutionOutcome = "Successfully resolved",
            ResolvedAt = DateTime.UtcNow,
            EvidenceReferences = string.Join(", ", incident.Investigation?.EvidenceItems.Select(e => e.Title) ?? Array.Empty<string>())
        };
        await _memoryService.RecordIncidentMemoryAsync(memoryRecord, cancellationToken);

        return incident;
    }

    public async Task ResetStateAsync(CancellationToken cancellationToken = default)
    {
        _activeIncident = null;
        _activeApiChange = null;
        _currentAutonomy = AutonomyMode.Recommend;
        _mossService.ResetMetrics();
        await _memoryService.ResetMemoriesAsync(cancellationToken);
    }

    public Task<Incident> RejectFixAsync(string incidentId, string reason, CancellationToken cancellationToken = default)
    {
        var incident = _activeIncident ?? new Incident { Id = incidentId };
        incident.Status = IncidentStatus.Rejected;
        incident.Approval = new ApprovalRecord
        {
            Status = "Rejected",
            Approver = "Staff SRE Engineer",
            ApprovedAt = DateTime.UtcNow,
            DecisionNotes = reason
        };

        return Task.FromResult(incident);
    }

    public async Task<Incident> RunStandaloneRedisIncidentAsync(CancellationToken cancellationToken = default)
    {
        var incident = new Incident
        {
            Id = "INC-104",
            ProjectId = "acme-commerce",
            Environment = "production",
            Title = "PaymentService 503 Caused by Redis Pool Starvation",
            Service = "PaymentService",
            Severity = SeverityLevel.Critical,
            Status = IncidentStatus.Investigating,
            DetectedAt = DateTime.UtcNow,
            ProblemDescription = "PaymentService returning HTTP 503. Redis active connections saturated at 50/50 (configured MaxPoolSize).",
            ErrorRateBefore = 42.0,
            ActiveConnections = 200,
            MaxConnections = 50,
            LatencyBeforeMs = 1800.0
        };

        var evidence = await _mossService.SearchEvidenceAsync(new List<string>
        {
            "PaymentService Redis MaxPoolSize 50",
            "deployment-v42.yaml payment-production.json",
            "INC-003.md redis-exhaustion.md"
        }, cancellationToken);

        var patch = _patchEngine.GenerateRedisConfigPatch(incident);
        var validation = await _validationEngine.ValidatePatchAsync(patch, "redis-incident", cancellationToken);

        incident.RootCause = "Deployment v42 reduced Redis MaxPoolSize from 200 to 50, causing connection pool exhaustion under normal traffic.";
        incident.ProposedPatch = patch;
        incident.ValidationReport = validation;
        incident.Status = IncidentStatus.AwaitingApproval;
        incident.Approval = new ApprovalRecord { Status = "Pending" };

        return incident;
    }

    public async Task<ApiChange> RunStandaloneApiChangeAsync(CancellationToken cancellationToken = default)
    {
        return await _apiChangeEngine.DetectAndAnalyzeAsync("API-420", cancellationToken);
    }

    public Task<Incident> RunFullInvestigationAsync(string incidentId, CancellationToken cancellationToken = default)
    {
        return RunKillerDemoAsync(cancellationToken);
    }

    private EvidenceGraph BuildKillerDemoEvidenceGraph()
    {
        var graph = new EvidenceGraph();

        graph.Nodes = new List<EvidenceNode>
        {
            new() { Id = "n1", Label = "Acme Payments API v4.2", NodeType = "ApiChange", Subtitle = "External API Release", Snippet = "Release Date 10:00 UTC" },
            new() { Id = "n2", Label = "Breaking Change", NodeType = "BreakingChange", Subtitle = "Field Renamed", Snippet = "customer_id -> customerId" },
            new() { Id = "n3", Label = "17 Code References", NodeType = "Code", Subtitle = "Affected Consumers", Snippet = "Found across 3 services & 8 tests" },
            new() { Id = "n4", Label = "PaymentService", NodeType = "Service", Subtitle = "Primary Consumer", Snippet = "Calls /v1/charges" },
            new() { Id = "n5", Label = "ApiClient.cs", NodeType = "Code", Subtitle = "Legacy Field Usage", Snippet = "customer_id = request.CustomerId" },
            new() { Id = "n6", Label = "Production HTTP 503", NodeType = "Metric", Subtitle = "Outage Signature", Snippet = "Gateway returned 400 Bad Request" },
            new() { Id = "n7", Label = "42% Error Rate", NodeType = "Metric", Subtitle = "Critical Anomaly", Snippet = "Error rate surged at 10:10 UTC" },
            new() { Id = "n8", Label = "Incident INC-105", NodeType = "Incident", Subtitle = "Production Incident", Snippet = "PaymentService Outage" },
            new() { Id = "n9", Label = "RESCUE CONNECTED THE DOTS", NodeType = "Correlation", Subtitle = "Correlation Engine (Score: 96%)", Snippet = "Correlated unapproved API v4.2 with 503 surge" },
            new() { Id = "n10", Label = "Root Cause Identified", NodeType = "RootCause", Subtitle = "Diagnosis", Snippet = "Deprecated customer_id sent to API v4.2" },
            new() { Id = "n11", Label = "Generated Fix", NodeType = "Fix", Subtitle = "Unified Diff Patch", Snippet = "customer_id -> customerId in ApiClient.cs" },
            new() { Id = "n12", Label = "8/8 Tests Passed", NodeType = "Validation", Subtitle = "Validation Engine", Snippet = "100% test success | Roslyn verified" },
            new() { Id = "n13", Label = "Human Approval Gate", NodeType = "Approval", Subtitle = "RECOMMEND Mode Gate", Snippet = "Requires SRE confirmation" },
            new() { Id = "n14", Label = "GitHub PR #42", NodeType = "PR", Subtitle = "Pull Request Created", Snippet = "rescue/INC-105-api-migration" },
            new() { Id = "n15", Label = "Staging Sandbox Deploy", NodeType = "Deploy", Subtitle = "Safe Staging Rollout", Snippet = "Build -> Deploy -> Smoke Tests" },
            new() { Id = "n16", Label = "1.8% Error Rate", NodeType = "Verification", Subtitle = "Telemetry Verified", Snippet = "Errors drop from 42% to 1.8%" },
            new() { Id = "n17", Label = "✓ INCIDENT RESOLVED", NodeType = "Resolved", Subtitle = "Resolution", Snippet = "System fully recovered" }
        };

        graph.Edges = new List<EvidenceEdge>
        {
            new() { SourceId = "n1", TargetId = "n2", Label = "introduces" },
            new() { SourceId = "n2", TargetId = "n3", Label = "detected by Moss" },
            new() { SourceId = "n3", TargetId = "n4", Label = "impacts" },
            new() { SourceId = "n4", TargetId = "n5", Label = "contains" },
            new() { SourceId = "n5", TargetId = "n6", Label = "triggers error" },
            new() { SourceId = "n6", TargetId = "n7", Label = "spikes to" },
            new() { SourceId = "n7", TargetId = "n8", Label = "creates" },
            new() { SourceId = "n8", TargetId = "n9", Label = "investigated by" },
            new() { SourceId = "n9", TargetId = "n10", Label = "identifies" },
            new() { SourceId = "n10", TargetId = "n11", Label = "generates" },
            new() { SourceId = "n11", TargetId = "n12", Label = "validates" },
            new() { SourceId = "n12", TargetId = "n13", Label = "awaits" },
            new() { SourceId = "n13", TargetId = "n14", Label = "creates branch" },
            new() { SourceId = "n14", TargetId = "n15", Label = "triggers rollout" },
            new() { SourceId = "n15", TargetId = "n16", Label = "measures" },
            new() { SourceId = "n16", TargetId = "n17", Label = "confirms" }
        };

        return graph;
    }

    private List<TimelineEvent> BuildKillerDemoTimeline()
    {
        return new List<TimelineEvent>
        {
            new() { TimeLabel = "10:00 UTC", Title = "API v4.2 Release", Description = "Acme Payments releases API v4.2 renaming customer_id to customerId.", EventType = "ApiChange", Severity = SeverityLevel.Medium },
            new() { TimeLabel = "10:01 UTC", Title = "Breaking Change Detected", Description = "Rescue detects breaking change. Moss retrieves 17 consumer references across 3 services.", EventType = "Investigation", Severity = SeverityLevel.Low },
            new() { TimeLabel = "10:02 UTC", Title = "Migration PR Prepared", Description = "Rescue generates migration patch. PR pending human review.", EventType = "Investigation", Severity = SeverityLevel.Low },
            new() { TimeLabel = "10:10 UTC", Title = "Production Error Spike (42%)", Description = "PaymentService returns HTTP 503 errors. Conversion rate drops precipitously.", EventType = "Anomaly", Severity = SeverityLevel.Critical },
            new() { TimeLabel = "10:10 UTC", Title = "Rescue Connected the Dots", Description = "Correlation engine correlates 503 failure with the unmerged API v4.2 breaking change.", EventType = "Investigation", Severity = SeverityLevel.High },
            new() { TimeLabel = "10:11 UTC", Title = "Code Fix Validated", Description = "Patch generated for ApiClient.cs. 8/8 tests pass (100% success).", EventType = "Investigation", Severity = SeverityLevel.Low },
            new() { TimeLabel = "10:11 UTC", Title = "Human Approval Required", Description = "Awaiting SRE confirmation before GitHub PR and staging deployment.", EventType = "Investigation", Severity = SeverityLevel.Low }
        };
    }
}
