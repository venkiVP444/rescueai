using System;
using System.Collections.Generic;
using System.IO;
using System.Net.Http;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Rescue.Application.Interfaces;
using Rescue.Application.Services;
using Rescue.Domain.Entities;
using Rescue.Domain.Enums;
using Rescue.Domain.Interfaces;
using Rescue.Infrastructure.Integrations;
using Rescue.Infrastructure.Persistence;
using Rescue.Infrastructure.Retrieval;
using Rescue.Infrastructure.Services;
using Xunit;

namespace Rescue.Tests;

public class MockNotifier : IEventNotificationService
{
    public List<(string Name, object Payload)> Broadcasts { get; } = new();
    public Task BroadcastEventAsync(string eventName, object payload)
    {
        Broadcasts.Add((eventName, payload));
        return Task.CompletedTask;
    }
}

public class RescueUnitTests : IDisposable
{
    private readonly string _testDbName;
    private readonly RescueDbContext _dbContext;
    private readonly IMemoryService _memoryService;
    private readonly IMossRetrievalService _mossService;
    private readonly IIncidentCorrelationEngine _correlationEngine;
    private readonly IPatchEngine _patchEngine;
    private readonly IValidationEngine _validationEngine;
    private readonly IRiskAssessmentEngine _riskEngine;
    private readonly IGitHubService _gitHubService;
    private readonly IDeploymentVerificationService _deploymentService;

    public RescueUnitTests()
    {
        _testDbName = $"test_rescue_{Guid.NewGuid():N}.db";
        var options = new DbContextOptionsBuilder<RescueDbContext>()
            .UseSqlite($"Data Source={_testDbName}")
            .Options;

        _dbContext = new RescueDbContext(options);
        _dbContext.Database.EnsureCreated();

        _memoryService = new MemoryService(_dbContext);
        _mossService = new MossRetrievalService(new HttpClient());
        _correlationEngine = new IncidentCorrelationEngine();
        _patchEngine = new PatchEngine();
        _validationEngine = new ValidationEngine();
        _riskEngine = new RiskAssessmentEngine();
        _gitHubService = new GitHubService();
        _deploymentService = new StagingDeploymentSimulator();
    }

    public void Dispose()
    {
        try
        {
            _dbContext.Database.EnsureDeleted();
            _dbContext.Dispose();
            if (File.Exists(_testDbName))
            {
                File.Delete(_testDbName);
            }
        }
        catch
        {
            // Ignore cleanup exceptions on file lock
        }
    }

    [Fact]
    public async Task CorrelationEngine_ShouldCorrelateApiChange_WithPaymentIncident()
    {
        var incident = new Incident
        {
            Id = "INC-105",
            Title = "PaymentService 503",
            Service = "PaymentService",
            ErrorRateBefore = 42.0
        };

        var result = await _correlationEngine.CorrelateIncidentAsync(incident);

        Assert.NotNull(result);
        Assert.Equal("INC-105", result.IncidentId);
        Assert.Equal("API-420", result.CorrelatedApiChangeId);
        Assert.Equal(96, result.Score);
        Assert.Equal(5, result.CorrelationReasons.Count);
        Assert.Contains("customer_id", result.SummaryExplanation);
        Assert.Contains(result.CorrelationReasons, r => r.Contains("customer_id"));
    }

    [Fact]
    public async Task MossRetrieval_ShouldMeasureHardwareTiming_AndComputePercentiles()
    {
        var result = await _mossService.SearchAsync("PaymentService Redis MaxPoolSize");

        Assert.NotNull(result);
        Assert.NotEmpty(result.Documents);
        Assert.True(result.LatencyMs >= 0.0, "Latency must be measured rather than fabricated");

        var stats = _mossService.GetObservabilityStats();
        Assert.True(stats.TotalQueries >= 1);
        Assert.True(stats.P50Ms >= 0.0);
        Assert.True(stats.P95Ms >= 0.0);
        Assert.True(stats.P99Ms >= 0.0);

        var benchmark = await _mossService.RunBenchmarkAsync();
        Assert.True(benchmark.SpeedupFactor > 1.0);
        Assert.Equal(185.0, benchmark.SyntheticRemoteBaselineMs);
    }

    [Fact]
    public void PatchEngine_ShouldGenerateValidUnifiedDiff_ForApiMigration()
    {
        var apiChange = new ApiChange
        {
            Id = "API-420",
            OldField = "customer_id",
            NewField = "customerId"
        };

        var patch = _patchEngine.GenerateApiMigrationPatch(apiChange);

        Assert.NotNull(patch);
        Assert.Contains("ApiClient.cs", patch.FilePath);
        Assert.Contains("-                customer_id = request.CustomerId,", patch.UnifiedDiff);
        Assert.Contains("+                customerId = request.CustomerId,", patch.UnifiedDiff);
        Assert.NotEmpty(patch.RollbackPlan);
    }

    [Fact]
    public void PatchEngine_ShouldGenerateValidUnifiedDiff_ForRedisConfig()
    {
        var incident = new Incident { Id = "INC-104", Service = "PaymentService" };
        var patch = _patchEngine.GenerateRedisConfigPatch(incident);

        Assert.NotNull(patch);
        Assert.Contains("payment-production.json", patch.FilePath);
        Assert.Contains("MaxPoolSize", patch.UnifiedDiff);
        Assert.Contains("200", patch.UnifiedDiff);
    }

    [Fact]
    public async Task ValidationEngine_ShouldPassAllTests_ForValidPatch()
    {
        var apiChange = new ApiChange { Id = "API-420", OldField = "customer_id", NewField = "customerId" };
        var validPatch = _patchEngine.GenerateApiMigrationPatch(apiChange);

        var report = await _validationEngine.ValidatePatchAsync(validPatch, "api-migration");

        Assert.True(report.IsSuccess);
        Assert.True(report.SyntaxValid);
        Assert.Equal(8, report.TotalTests);
        Assert.Equal(8, report.PassedTests);
        Assert.True(report.SecretsCheckPassed);
        Assert.True(report.RegressionCheckPassed);
        Assert.Contains("100% SUCCESS", report.OutputSummary);
    }

    [Fact]
    public async Task ValidationEngine_ShouldFail_WhenDeprecatedFieldRemains()
    {
        var invalidPatch = new ProposedPatch
        {
            FilePath = "ApiClient.cs",
            NewContent = "var payload = new { customer_id = request.CustomerId };",
            UnifiedDiff = "+ customer_id = request.CustomerId;"
        };

        var report = await _validationEngine.ValidatePatchAsync(invalidPatch, "api-migration");

        Assert.False(report.IsSuccess);
        Assert.False(report.RegressionCheckPassed);
        Assert.True(report.PassedTests < 8);
        Assert.Contains("FAILED", report.OutputSummary);
    }

    [Fact]
    public async Task ValidationEngine_ShouldFail_WhenSyntaxInvalid()
    {
        var brokenSyntaxPatch = new ProposedPatch
        {
            FilePath = "ApiClient.cs",
            NewContent = "var payload = new { customerId = request.CustomerId; // missing closing brace",
            UnifiedDiff = "+ customerId = request.CustomerId;"
        };

        var report = await _validationEngine.ValidatePatchAsync(brokenSyntaxPatch, "api-migration");

        Assert.False(report.IsSuccess);
        Assert.False(report.SyntaxValid);
        Assert.Contains("Syntax: INVALID", report.OutputSummary);
    }

    [Fact]
    public async Task ValidationEngine_ShouldFail_WhenSecretsDetected()
    {
        var leakyPatch = new ProposedPatch
        {
            FilePath = "ApiClient.cs",
            NewContent = "var payload = new { customerId = request.CustomerId };\nstring dbPassword = \"password = \\\"super_secret_production_credential\\\";\";",
            UnifiedDiff = "+ string dbPassword = \"password = \\\"super_secret_production_credential\\\";\";"
        };

        var report = await _validationEngine.ValidatePatchAsync(leakyPatch, "api-migration");

        Assert.False(report.IsSuccess);
        Assert.False(report.SecretsCheckPassed);
        Assert.Contains("Secrets: DETECTED", report.OutputSummary);
    }

    [Fact]
    public async Task ValidationEngine_ShouldPassAllTests_ForRedisIncident()
    {
        var incident = new Incident { Id = "INC-104", Service = "PaymentService" };
        var patch = _patchEngine.GenerateRedisConfigPatch(incident);
        var report = await _validationEngine.ValidatePatchAsync(patch, "redis-incident");

        Assert.True(report.IsSuccess);
        Assert.Equal(2, report.TotalTests);
        Assert.Equal(2, report.PassedTests);
        Assert.True(report.RegressionCheckPassed);
    }

    [Fact]
    public async Task KillerDemo_ShouldExecuteP0Workflow_EndToEnd()
    {
        var mockNotifier = new MockNotifier();
        var apiEngine = new ApiChangeEngine(_mossService, _patchEngine, _validationEngine);
        var orchestrator = new InvestigationOrchestrator(
            _mossService,
            _correlationEngine,
            apiEngine,
            _patchEngine,
            _validationEngine,
            _riskEngine,
            _gitHubService,
            _deploymentService,
            mockNotifier,
            _memoryService
        );

        // 1. Run investigation
        var incident = await orchestrator.RunKillerDemoAsync();

        Assert.Equal("INC-105", incident.Id);
        Assert.Equal(IncidentStatus.AwaitingApproval, incident.Status);
        Assert.NotNull(incident.Correlation);
        Assert.Equal(96, incident.Correlation.Score);
        Assert.NotNull(incident.Investigation);
        Assert.NotNull(incident.ProposedPatch);
        Assert.NotNull(incident.ValidationReport);
        Assert.Equal(8, incident.ValidationReport.PassedTests);
        Assert.Equal("Pending", incident.Approval?.Status);

        // Verify that RESCUE REMEMBERS found similar historical incident INC-001
        Assert.NotNull(incident.Investigation.SimilarMemoryMatch);
        Assert.Equal("INC-001", incident.Investigation.SimilarMemoryMatch.PreviousIncidentId);
        Assert.Contains("customer_id", incident.Investigation.SimilarMemoryMatch.PreviousRootCause);

        // 2. Approve & Deploy
        var resolvedIncident = await orchestrator.ApproveAndDeployAsync("INC-105", "Senior SRE");

        Assert.Equal(IncidentStatus.Resolved, resolvedIncident.Status);
        Assert.Equal("Approved", resolvedIncident.Approval?.Status);
        Assert.NotNull(resolvedIncident.GitHubPr);
        Assert.Contains("rescue/INC-105-api-migration", resolvedIncident.GitHubPr.BranchName);
        Assert.NotNull(resolvedIncident.Verification);
        Assert.Equal(1.8, resolvedIncident.ErrorRateAfter);
        Assert.True(resolvedIncident.ErrorRateAfter < resolvedIncident.ErrorRateBefore);

        // Verify that resolved incident was recorded into operational memory
        var memories = await _memoryService.GetAllMemoriesAsync();
        Assert.Contains(memories, m => m.IncidentId == "INC-105");
    }

    [Fact]
    public async Task MemoryService_ShouldSeedBaselineAndRetrieveSimilarIncident()
    {
        var memories = await _memoryService.GetAllMemoriesAsync();
        Assert.NotEmpty(memories);
        Assert.Contains(memories, m => m.IncidentId == "INC-001");
        Assert.Contains(memories, m => m.IncidentId == "INC-003");

        var testIncident = new Incident
        {
            Id = "INC-999",
            Service = "PaymentService",
            ProblemDescription = "503 errors and customer_id rejection from external gateway"
        };

        var match = await _memoryService.FindSimilarIncidentAsync(testIncident);
        Assert.NotNull(match);
        Assert.Equal("INC-001", match.PreviousIncidentId);
        Assert.True(match.MatchConfidence >= 90.0);
        Assert.Contains("customer_id", match.RelevanceReason);
    }

    [Fact]
    public async Task MemoryService_ShouldRecordNewResolvedIncident()
    {
        var newRecord = new IncidentMemory
        {
            IncidentId = "INC-555",
            Title = "InventoryService Latency Regression",
            Service = "InventoryService",
            IncidentType = "LatencyDegradation",
            Symptoms = "P99 latency spiked to 2400ms",
            RootCause = "Unindexed database query on inventory catalog",
            ProposedFixSummary = "Added index on sku_id",
            ValidationResultSummary = "4/4 tests passed",
            RiskLevel = "Low",
            ResolutionOutcome = "Successfully resolved",
            ResolvedAt = DateTime.UtcNow
        };

        await _memoryService.RecordIncidentMemoryAsync(newRecord);

        var memories = await _memoryService.GetAllMemoriesAsync();
        var retrieved = memories.Find(m => m.IncidentId == "INC-555");
        Assert.NotNull(retrieved);
        Assert.Equal("InventoryService", retrieved.Service);
        Assert.Equal("Unindexed database query on inventory catalog", retrieved.RootCause);
    }

    [Fact]
    public async Task InvestigationOrchestrator_ShouldRespectAutonomyModes()
    {
        var mockNotifier = new MockNotifier();
        var apiEngine = new ApiChangeEngine(_mossService, _patchEngine, _validationEngine);
        var orchestrator = new InvestigationOrchestrator(
            _mossService,
            _correlationEngine,
            apiEngine,
            _patchEngine,
            _validationEngine,
            _riskEngine,
            _gitHubService,
            _deploymentService,
            mockNotifier,
            _memoryService
        );

        // TEST 1: OBSERVE Mode (Alert only, no patch proposal)
        orchestrator.SetAutonomyMode(AutonomyMode.Observe);
        var observeIncident = await orchestrator.RunKillerDemoAsync();

        Assert.Equal(IncidentStatus.Investigating, observeIncident.Status);
        Assert.Null(observeIncident.ProposedPatch);

        // TEST 2: AUTONOMOUS Mode (Auto-deploys to staging sandbox)
        orchestrator.SetAutonomyMode(AutonomyMode.Autonomous);
        var autoIncident = await orchestrator.RunKillerDemoAsync();

        Assert.Equal(IncidentStatus.Resolved, autoIncident.Status);
        Assert.Equal("Approved", autoIncident.Approval?.Status);
        Assert.NotNull(autoIncident.GitHubPr);
        Assert.NotNull(autoIncident.Verification);
    }

    [Fact]
    public async Task InvestigationOrchestrator_ShouldResetStateAndSupportReplay()
    {
        var mockNotifier = new MockNotifier();
        var apiEngine = new ApiChangeEngine(_mossService, _patchEngine, _validationEngine);
        var orchestrator = new InvestigationOrchestrator(
            _mossService,
            _correlationEngine,
            apiEngine,
            _patchEngine,
            _validationEngine,
            _riskEngine,
            _gitHubService,
            _deploymentService,
            mockNotifier,
            _memoryService
        );

        // Run once
        var incident = await orchestrator.RunKillerDemoAsync();
        Assert.NotNull(orchestrator.GetActiveIncident());

        // Reset
        await orchestrator.ResetStateAsync();
        Assert.Null(orchestrator.GetActiveIncident());
        Assert.Null(orchestrator.GetActiveApiChange());
        Assert.Equal(AutonomyMode.Recommend, orchestrator.GetAutonomyMode());

        // Replay again immediately
        var replayedIncident = await orchestrator.RunKillerDemoAsync();
        Assert.NotNull(replayedIncident);
        Assert.Equal("INC-105", replayedIncident.Id);
    }
}
