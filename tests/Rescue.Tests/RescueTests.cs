using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Threading.Tasks;
using Rescue.Application.Interfaces;
using Rescue.Application.Services;
using Rescue.Domain.Entities;
using Rescue.Domain.Enums;
using Rescue.Domain.Interfaces;
using Rescue.Infrastructure.Integrations;
using Rescue.Infrastructure.Retrieval;
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

public class RescueUnitTests
{
    private readonly IMossRetrievalService _mossService;
    private readonly IIncidentCorrelationEngine _correlationEngine;
    private readonly IPatchEngine _patchEngine;
    private readonly IValidationEngine _validationEngine;
    private readonly IRiskAssessmentEngine _riskEngine;
    private readonly IGitHubService _gitHubService;
    private readonly IDeploymentVerificationService _deploymentService;

    public RescueUnitTests()
    {
        _mossService = new MossRetrievalService(new HttpClient());
        _correlationEngine = new IncidentCorrelationEngine();
        _patchEngine = new PatchEngine();
        _validationEngine = new ValidationEngine();
        _riskEngine = new RiskAssessmentEngine();
        _gitHubService = new GitHubService();
        _deploymentService = new StagingDeploymentSimulator();
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
    public async Task ValidationEngine_ShouldPassAllTests_ForApiMigration()
    {
        var patch = new ProposedPatch { FilePath = "ApiClient.cs" };
        var report = await _validationEngine.ValidatePatchAsync(patch, "api-migration");

        Assert.True(report.IsSuccess);
        Assert.True(report.SyntaxValid);
        Assert.Equal(8, report.TotalTests);
        Assert.Equal(8, report.PassedTests);
        Assert.True(report.SecretsCheckPassed);
        Assert.True(report.RegressionCheckPassed);
    }

    [Fact]
    public async Task ValidationEngine_ShouldPassAllTests_ForRedisIncident()
    {
        var patch = new ProposedPatch { FilePath = "payment-production.json" };
        var report = await _validationEngine.ValidatePatchAsync(patch, "redis-incident");

        Assert.True(report.IsSuccess);
        Assert.Equal(184, report.TotalTests);
        Assert.Equal(184, report.PassedTests);
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
            mockNotifier
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

        // 2. Approve & Deploy
        var resolvedIncident = await orchestrator.ApproveAndDeployAsync("INC-105", "Senior SRE");

        Assert.Equal(IncidentStatus.Resolved, resolvedIncident.Status);
        Assert.Equal("Approved", resolvedIncident.Approval?.Status);
        Assert.NotNull(resolvedIncident.GitHubPr);
        Assert.Contains("rescue/INC-105-api-migration", resolvedIncident.GitHubPr.BranchName);
        Assert.NotNull(resolvedIncident.Verification);
        Assert.Equal(1.8, resolvedIncident.ErrorRateAfter);
        Assert.True(resolvedIncident.ErrorRateAfter < resolvedIncident.ErrorRateBefore);
    }
}

