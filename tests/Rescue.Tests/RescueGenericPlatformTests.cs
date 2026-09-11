using System;
using System.Collections.Generic;
using System.IO;
using System.Net.Http;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Rescue.Application.Interfaces;
using Rescue.Application.Services;
using Rescue.Domain.Entities;
using Rescue.Domain.Interfaces;
using Rescue.Infrastructure.Integrations;
using Rescue.Infrastructure.Persistence;
using Rescue.Infrastructure.Services;
using Rescue.Sdk;
using Xunit;

namespace Rescue.Tests;

public class RescueGenericPlatformTests : IDisposable
{
    private readonly string _testDbName;
    private readonly RescueDbContext _dbContext;
    private readonly IProjectService _projectService;
    private readonly IMemoryService _memoryService;
    private readonly IGenericIncidentEngine _incidentEngine;
    private readonly IEventIngestionService _ingestionService;
    private readonly IRepositoryProvider _repoProvider;
    private readonly MockNotifier _notifier;

    public RescueGenericPlatformTests()
    {
        _testDbName = $"test_generic_{Guid.NewGuid():N}.db";
        var options = new DbContextOptionsBuilder<RescueDbContext>()
            .UseSqlite($"Data Source={_testDbName}")
            .Options;

        _dbContext = new RescueDbContext(options);
        _dbContext.Database.EnsureCreated();

        _notifier = new MockNotifier();
        _projectService = new ProjectService(_dbContext);
        _memoryService = new MemoryService(_dbContext);
        _incidentEngine = new GenericIncidentEngine(_memoryService, _notifier);
        _ingestionService = new EventIngestionService(_dbContext, _projectService, _incidentEngine, _notifier);
        _repoProvider = new GitHubRepositoryProvider(new GitHubService());
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
            // Ignore file lock in cleanup
        }
    }

    [Fact]
    public async Task ProjectService_ShouldCreateProject_AndStoreHashedApiKeyOnly()
    {
        var result = await _projectService.CreateProjectAsync(
            "test-billing-api",
            "Test Billing API",
            "Billing platform microservice",
            "staging",
            new List<string> { "BillingService" },
            "https://github.com/customer/billing");

        Assert.NotNull(result.Project);
        Assert.Equal("test-billing-api", result.Project.Id);
        Assert.StartsWith("res_live_", result.RawApiKey);
        Assert.NotEqual(result.RawApiKey, result.Project.ApiKeyHash); // Stored as hash!
        Assert.Equal(64, result.Project.ApiKeyHash.Length); // SHA-256 hex string

        // Validate Key
        var valid = await _projectService.ValidateApiKeyAsync("test-billing-api", result.RawApiKey);
        var invalid = await _projectService.ValidateApiKeyAsync("test-billing-api", "invalid_key");

        Assert.True(valid);
        Assert.False(invalid);
    }

    [Fact]
    public async Task EventIngestion_ShouldRedactSensitiveKeysAndBearerTokens()
    {
        var projectRes = await _projectService.CreateProjectAsync(
            "security-audit-project",
            "Security Audit",
            "Test",
            "production");

        var rawEvent = new RescueEvent
        {
            ProjectId = "security-audit-project",
            Service = "AuthService",
            EventType = "http_error",
            Severity = "critical",
            Data = new Dictionary<string, object>
            {
                ["password"] = "CustomerSuperSecretPassword99!",
                ["apiKey"] = "secret_api_key_xyz",
                ["authorization"] = "Bearer eyJhbGciOiJIUzI1NiJ9.test",
                ["normalField"] = "valid_content"
            }
        };

        var res = await _ingestionService.IngestEventAsync(rawEvent, projectRes.RawApiKey);

        Assert.True(res.Success);

        var recent = await _ingestionService.GetRecentEventsAsync("security-audit-project");
        Assert.Single(recent);

        var stored = recent[0];
        Assert.Equal("[REDACTED]", stored.Data["password"].ToString());
        Assert.Equal("[REDACTED]", stored.Data["apiKey"].ToString());
        Assert.Equal("[REDACTED]", stored.Data["authorization"].ToString());
        Assert.Equal("valid_content", stored.Data["normalField"].ToString());
    }

    [Fact]
    public async Task EventIngestion_ShouldAcceptBatchEvents()
    {
        var projectRes = await _projectService.CreateProjectAsync(
            "batch-test-project",
            "Batch Test",
            "Test",
            "staging");

        var batch = new List<RescueEvent>
        {
            new() { ProjectId = "batch-test-project", Service = "Worker1", EventType = "deployment_started" },
            new() { ProjectId = "batch-test-project", Service = "Worker1", EventType = "deployment_completed" },
            new() { ProjectId = "batch-test-project", Service = "Worker1", EventType = "http_error" }
        };

        var res = await _ingestionService.IngestBatchAsync(batch, projectRes.RawApiKey);

        Assert.True(res.Success);
        Assert.Equal(3, res.IngestedCount);

        var events = await _ingestionService.GetRecentEventsAsync("batch-test-project");
        Assert.Equal(3, events.Count);
    }

    [Fact]
    public async Task GenericIncidentEngine_ShouldCorrelateDeploymentAndErrorSpike()
    {
        var projectRes = await _projectService.CreateProjectAsync(
            "e-commerce-inventory",
            "Inventory Service",
            "Test",
            "production");

        // 1. Send deployment event
        await _ingestionService.IngestEventAsync(new RescueEvent
        {
            ProjectId = "e-commerce-inventory",
            Service = "InventoryService",
            EventType = "deployment_completed",
            Timestamp = DateTime.UtcNow.AddMinutes(-2),
            Correlation = new Dictionary<string, string> { ["traceId"] = "trace-deploy-88" }
        }, projectRes.RawApiKey);

        // 2. Send 3 error events to trigger the configurable rule (threshold: 3)
        Incident? incident = null;
        for (int i = 0; i < 3; i++)
        {
            var r = await _ingestionService.IngestEventAsync(new RescueEvent
            {
                ProjectId = "e-commerce-inventory",
                Service = "InventoryService",
                EventType = "http_error",
                Timestamp = DateTime.UtcNow,
                Data = new Dictionary<string, object> { ["statusCode"] = 500 }
            }, projectRes.RawApiKey);

            if (r.TriggeredIncident != null)
            {
                incident = r.TriggeredIncident;
            }
        }

        Assert.NotNull(incident);
        Assert.Equal("e-commerce-inventory", incident.ProjectId);
        Assert.Equal("InventoryService", incident.Service);
        Assert.Contains("Elevated Error Surge", incident.Title);
        Assert.Contains("deployment_completed", incident.RootCause); // Successfully correlated precursor!
        Assert.Equal("Pending", incident.Approval?.Status); // Human approval gate enforced!
    }

    [Fact]
    public async Task MemoryService_ShouldEnforceStrictProjectIsolation()
    {
        // Add memory record for Project A
        await _memoryService.RecordIncidentMemoryAsync(new IncidentMemory
        {
            ProjectId = "customer-alpha",
            Service = "SearchService",
            IncidentType = "ApiCompatibilityFailure",
            Title = "Alpha Customer Search Failure",
            RootCause = "Alpha specific secret schema bug"
        });

        // Add memory record for Project B
        await _memoryService.RecordIncidentMemoryAsync(new IncidentMemory
        {
            ProjectId = "customer-beta",
            Service = "SearchService",
            IncidentType = "ApiCompatibilityFailure",
            Title = "Beta Customer Search Failure",
            RootCause = "Beta specific index failure"
        });

        // Query Project A memories
        var alphaMemories = await _memoryService.GetAllMemoriesAsync("customer-alpha");
        Assert.Single(alphaMemories);
        Assert.Equal("Alpha Customer Search Failure", alphaMemories[0].Title);

        // Query Project B memories
        var betaMemories = await _memoryService.GetAllMemoriesAsync("customer-beta");
        Assert.Single(betaMemories);
        Assert.Equal("Beta Customer Search Failure", betaMemories[0].Title);

        // Cross-project match test: Incident in Project B must NEVER match memory from Project A
        var incidentBeta = new Incident
        {
            Id = "INC-BETA",
            ProjectId = "customer-beta",
            Service = "SearchService",
            ProblemDescription = "Search failure"
        };

        var match = await _memoryService.FindSimilarIncidentAsync(incidentBeta, "customer-beta");
        Assert.NotNull(match);
        Assert.Equal("Beta Customer Search Failure", match.Title); // Only matches Beta!
    }

    [Fact]
    public async Task RescueSdk_ShouldNotCrashCaller_WhenEndpointIsUnreachable()
    {
        // Point to non-existent / unreachable port
        var client = new RescueClient(new RescueClientOptions
        {
            Endpoint = "http://localhost:59999",
            ProjectId = "resilient-app",
            NonBlocking = false, // Even synchronous mode must NOT crash!
            Timeout = TimeSpan.FromMilliseconds(500)
        });

        // This call must complete gracefully without throwing an unhandled exception
        var exception = await Record.ExceptionAsync(async () =>
        {
            await client.SendHttpErrorAsync(500, "/api/test", "Simulated error");
        });

        Assert.Null(exception);
    }

    [Fact]
    public async Task RepositoryProvider_ShouldCreatePullRequestRecord()
    {
        var patch = new ProposedPatch
        {
            FilePath = "src/Orders/OrdersClient.cs",
            UnifiedDiff = "--- a/OrdersClient.cs\n+++ b/OrdersClient.cs\n@@ -1,1 +1,1 @@\n-old();\n+new();",
            Explanation = "Generic patch test"
        };

        var pr = await _repoProvider.CreatePullRequestAsync(
            "https://github.com/customer/repo",
            "rescue/fix-orders",
            "Fix Orders Client",
            "Automated patch proposal",
            patch);

        Assert.NotNull(pr);
        Assert.StartsWith("https://github.com/acme-commerce/payment-service/pull/", pr.PrUrl);
        Assert.True(pr.PrNumber > 0);
    }
}
