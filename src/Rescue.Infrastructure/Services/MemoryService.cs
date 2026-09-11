using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Rescue.Domain.Entities;
using Rescue.Domain.Interfaces;
using Rescue.Infrastructure.Persistence;

namespace Rescue.Infrastructure.Services;

public class MemoryService : IMemoryService
{
    private readonly RescueDbContext _dbContext;

    public MemoryService(RescueDbContext dbContext)
    {
        _dbContext = dbContext;
        EnsureInitialized();
    }

    private void EnsureInitialized()
    {
        try
        {
            _dbContext.Database.EnsureCreated();
            _dbContext.Database.ExecuteSqlRaw(@"
                CREATE TABLE IF NOT EXISTS ""IncidentMemories"" (
                    ""Id"" TEXT NOT NULL CONSTRAINT ""PK_IncidentMemories"" PRIMARY KEY,
                    ""ProjectId"" TEXT NOT NULL DEFAULT 'acme-commerce',
                    ""Environment"" TEXT NOT NULL DEFAULT 'production',
                    ""IncidentId"" TEXT NOT NULL,
                    ""Title"" TEXT NOT NULL,
                    ""Service"" TEXT NOT NULL,
                    ""IncidentType"" TEXT NOT NULL,
                    ""Symptoms"" TEXT NOT NULL,
                    ""RootCause"" TEXT NOT NULL,
                    ""RelatedApiChangeId"" TEXT NULL,
                    ""AffectedFiles"" TEXT NOT NULL,
                    ""AffectedServices"" TEXT NOT NULL,
                    ""ProposedFixSummary"" TEXT NOT NULL,
                    ""ValidationResultSummary"" TEXT NOT NULL,
                    ""RiskLevel"" TEXT NOT NULL,
                    ""ApprovalResult"" TEXT NOT NULL,
                    ""GitHubPrReference"" TEXT NULL,
                    ""DeploymentResult"" TEXT NOT NULL,
                    ""VerificationResult"" TEXT NOT NULL,
                    ""ResolutionOutcome"" TEXT NOT NULL,
                    ""ResolvedAt"" TEXT NOT NULL,
                    ""EvidenceReferences"" TEXT NOT NULL,
                    ""IsBaseline"" INTEGER NOT NULL
                );");

            if (!_dbContext.IncidentMemories.Any())
            {
                SeedBaselineMemoriesInternal();
            }
        }
        catch
        {
            // Allow in-memory fallback for transient test harnesses
        }
    }

    private void SeedBaselineMemoriesInternal()
    {
        var baselineMemories = new List<IncidentMemory>
        {
            new()
            {
                Id = "MEM-001",
                ProjectId = "acme-commerce",
                IncidentId = "INC-001",
                Title = "PaymentService API Compatibility Failure",
                Service = "PaymentService",
                IncidentType = "ApiCompatibilityFailure",
                Symptoms = "Inbound checkout payment gateway errors (HTTP 503) spiking during peak traffic.",
                RootCause = "PaymentService is sending deprecated field 'customer_id' to Acme Payments API v4.2. Upstream gateway requires 'customerId'.",
                RelatedApiChangeId = "API-420",
                AffectedFiles = "ApiClient.cs, PaymentProcessor.cs",
                AffectedServices = "PaymentService, OrderService",
                ProposedFixSummary = "Migrate serialization property customer_id -> customerId in ApiClient.cs",
                ValidationResultSummary = "8/8 unit and regression tests passed (100% pass rate)",
                RiskLevel = "Low",
                ApprovalResult = "Approved by Senior SRE",
                GitHubPrReference = "PR #18 (branch rescue/INC-001-api-migration)",
                DeploymentResult = "Deployed to staging sandbox",
                VerificationResult = "Error rate dropped from 44.0% to 1.6%",
                ResolutionOutcome = "Successfully resolved",
                ResolvedAt = DateTime.UtcNow.AddDays(-20),
                EvidenceReferences = "external-api-v2.json, ApiClient.cs, INC-001.md, api-breaking-change.md",
                IsBaseline = true
            },
            new()
            {
                Id = "MEM-002",
                ProjectId = "acme-commerce",
                IncidentId = "INC-003",
                Title = "Redis Pool Starvation under Peak Load",
                Service = "PaymentService",
                IncidentType = "ConnectionPoolExhaustion",
                Symptoms = "PaymentService returning HTTP 503. Redis active connection pool reached capacity limit (50/50).",
                RootCause = "Deployment v42 reduced Redis MaxPoolSize from 200 to 50, causing pool exhaustion under normal checkout traffic.",
                RelatedApiChangeId = null,
                AffectedFiles = "payment-production.json, RedisClient.cs",
                AffectedServices = "PaymentService",
                ProposedFixSummary = "Revert MaxPoolSize back to 200 in payment-production.json",
                ValidationResultSummary = "184/184 Redis integration tests passed",
                RiskLevel = "Low",
                ApprovalResult = "Approved by Staff SRE",
                GitHubPrReference = "PR #12 (branch rescue/INC-003-redis-pool)",
                DeploymentResult = "Staging deployment verified",
                VerificationResult = "Connection pool stabilized at 32/200 active connections",
                ResolutionOutcome = "Successfully resolved",
                ResolvedAt = DateTime.UtcNow.AddDays(-45),
                EvidenceReferences = "payment-production.json, deployment-v42.yaml, INC-003.md",
                IsBaseline = true
            }
        };

        _dbContext.IncidentMemories.AddRange(baselineMemories);
        _dbContext.SaveChanges();
    }

    public async Task RecordIncidentMemoryAsync(IncidentMemory memory, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(memory.Id))
        {
            memory.Id = Guid.NewGuid().ToString("N");
        }

        if (string.IsNullOrWhiteSpace(memory.IncidentId))
        {
            memory.IncidentId = $"INC-{Guid.NewGuid().ToString("N")[..8]}";
        }

        var existing = await _dbContext.IncidentMemories
            .FirstOrDefaultAsync(m => m.ProjectId == memory.ProjectId && m.IncidentId == memory.IncidentId, cancellationToken);

        if (existing != null)
        {
            // Update existing record
            existing.ProjectId = memory.ProjectId;
            existing.Title = memory.Title;
            existing.Symptoms = memory.Symptoms;
            existing.RootCause = memory.RootCause;
            existing.ProposedFixSummary = memory.ProposedFixSummary;
            existing.ValidationResultSummary = memory.ValidationResultSummary;
            existing.RiskLevel = memory.RiskLevel;
            existing.ApprovalResult = memory.ApprovalResult;
            existing.GitHubPrReference = memory.GitHubPrReference;
            existing.DeploymentResult = memory.DeploymentResult;
            existing.VerificationResult = memory.VerificationResult;
            existing.ResolutionOutcome = memory.ResolutionOutcome;
            existing.ResolvedAt = memory.ResolvedAt;
        }
        else
        {
            await _dbContext.IncidentMemories.AddAsync(memory, cancellationToken);
        }

        await _dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task<MemoryMatchResult?> FindSimilarIncidentAsync(Incident incident, string? projectId = null, CancellationToken cancellationToken = default)
    {
        var targetProject = !string.IsNullOrWhiteSpace(projectId) ? projectId : incident.ProjectId;
        var query = _dbContext.IncidentMemories.AsQueryable();
        if (!string.IsNullOrWhiteSpace(targetProject))
        {
            query = query.Where(m => m.ProjectId == targetProject);
        }

        var memories = await query
            .OrderByDescending(m => m.ResolvedAt)
            .ToListAsync(cancellationToken);

        if (!memories.Any())
        {
            return null;
        }

        // Deterministic matching on service + symptom keywords/contract signatures
        foreach (var mem in memories)
        {
            // Prevent matching with itself if re-investigating
            if (mem.IncidentId == incident.Id)
            {
                continue;
            }

            bool serviceMatch = string.Equals(mem.Service, incident.Service, StringComparison.OrdinalIgnoreCase);
            bool isApiCompatibility = (incident.ProblemDescription?.Contains("customer_id", StringComparison.OrdinalIgnoreCase) == true)
                                      || (incident.ProblemDescription?.Contains("503", StringComparison.OrdinalIgnoreCase) == true)
                                      || (incident.Correlation?.SummaryExplanation?.Contains("customer_id", StringComparison.OrdinalIgnoreCase) == true);

            if (serviceMatch && mem.IncidentType == "ApiCompatibilityFailure" && isApiCompatibility)
            {
                return new MemoryMatchResult
                {
                    PreviousIncidentId = mem.IncidentId,
                    Title = mem.Title,
                    Service = mem.Service,
                    PreviousRootCause = mem.RootCause,
                    PreviousFix = mem.ProposedFixSummary,
                    PreviousValidation = mem.ValidationResultSummary,
                    PreviousOutcome = mem.ResolutionOutcome,
                    RelevanceReason = $"Deterministic Pattern Match: Identical {mem.Service} external API field deprecation signature ('customer_id' -> 'customerId') resolved previously in {mem.IncidentId}.",
                    MatchConfidence = 94.0,
                    ResolvedAt = mem.ResolvedAt
                };
            }

            if (serviceMatch && mem.IncidentType == "ConnectionPoolExhaustion" &&
                incident.ProblemDescription?.Contains("Redis", StringComparison.OrdinalIgnoreCase) == true)
            {
                return new MemoryMatchResult
                {
                    PreviousIncidentId = mem.IncidentId,
                    Title = mem.Title,
                    Service = mem.Service,
                    PreviousRootCause = mem.RootCause,
                    PreviousFix = mem.ProposedFixSummary,
                    PreviousValidation = mem.ValidationResultSummary,
                    PreviousOutcome = mem.ResolutionOutcome,
                    RelevanceReason = $"Deterministic Pattern Match: Identical Redis pool exhaustion signature on {mem.Service} resolved previously in {mem.IncidentId}.",
                    MatchConfidence = 91.0,
                    ResolvedAt = mem.ResolvedAt
                };
            }
        }

        // Generic fallback to most recent matching service incident
        var generalServiceMatch = memories.FirstOrDefault(m =>
            m.IncidentId != incident.Id &&
            string.Equals(m.Service, incident.Service, StringComparison.OrdinalIgnoreCase));

        if (generalServiceMatch != null)
        {
            return new MemoryMatchResult
            {
                PreviousIncidentId = generalServiceMatch.IncidentId,
                Title = generalServiceMatch.Title,
                Service = generalServiceMatch.Service,
                PreviousRootCause = generalServiceMatch.RootCause,
                PreviousFix = generalServiceMatch.ProposedFixSummary,
                PreviousValidation = generalServiceMatch.ValidationResultSummary,
                PreviousOutcome = generalServiceMatch.ResolutionOutcome,
                RelevanceReason = $"Historical Service Match: Previous incident on {generalServiceMatch.Service} ({generalServiceMatch.IncidentId}) with related operational resolution.",
                MatchConfidence = 78.0,
                ResolvedAt = generalServiceMatch.ResolvedAt
            };
        }

        return null;
    }

    public async Task<List<IncidentMemory>> GetAllMemoriesAsync(string? projectId = null, CancellationToken cancellationToken = default)
    {
        var query = _dbContext.IncidentMemories.AsQueryable();
        if (!string.IsNullOrWhiteSpace(projectId))
        {
            query = query.Where(m => m.ProjectId == projectId);
        }

        return await query
            .OrderByDescending(m => m.ResolvedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task SeedBaselineMemoriesAsync(CancellationToken cancellationToken = default)
    {
        if (!await _dbContext.IncidentMemories.AnyAsync(cancellationToken))
        {
            SeedBaselineMemoriesInternal();
        }
    }

    public async Task ResetMemoriesAsync(CancellationToken cancellationToken = default)
    {
        var all = await _dbContext.IncidentMemories.ToListAsync(cancellationToken);
        _dbContext.IncidentMemories.RemoveRange(all);
        await _dbContext.SaveChangesAsync(cancellationToken);
        SeedBaselineMemoriesInternal();
    }
}
