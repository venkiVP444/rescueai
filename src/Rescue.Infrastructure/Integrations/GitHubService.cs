using System;
using System.Threading;
using System.Threading.Tasks;
using Rescue.Application.Interfaces;
using Rescue.Domain.Entities;

namespace Rescue.Infrastructure.Integrations;

public class GitHubService : IGitHubService
{
    public Task<GitHubPrRecord> CreatePullRequestAsync(string title, string branch, ProposedPatch patch, ValidationReport validation, CorrelationResult? correlation, CancellationToken cancellationToken = default)
    {
        var prNumber = new Random().Next(108, 142);
        var sha = Guid.NewGuid().ToString("N").Substring(0, 12);

        var body = $@"### [Rescue AI] Autonomous Incident Remediation

#### 🚨 Root Cause
{correlation?.SummaryExplanation ?? patch.Explanation}

#### 🔗 Evidence Chain
- Correlated Event: {correlation?.CorrelatedApiChangeId ?? "Acme Payments API v4.2"}
- Affected File: `{patch.FilePath}`
- Validation: {validation.OutputSummary}

#### 🛠️ Proposed Change
```diff
{patch.UnifiedDiff}
```

#### 🛡️ Rollback Instructions
{patch.RollbackPlan}

---
*Created automatically by Rescue AI Production Engineer under human approval.*";

        var pr = new GitHubPrRecord
        {
            BranchName = branch,
            CommitSha = sha,
            PrNumber = prNumber,
            PrUrl = $"https://github.com/acme-commerce/payment-service/pull/{prNumber}",
            Title = title,
            Body = body,
            IsDemoMode = true,
            CreatedAt = DateTime.UtcNow
        };

        return Task.FromResult(pr);
    }
}
