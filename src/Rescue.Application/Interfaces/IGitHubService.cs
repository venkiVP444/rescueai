using System.Threading;
using System.Threading.Tasks;
using Rescue.Domain.Entities;

namespace Rescue.Application.Interfaces;

public interface IGitHubService
{
    Task<GitHubPrRecord> CreatePullRequestAsync(string title, string branch, ProposedPatch patch, ValidationReport validation, CorrelationResult? correlation, CancellationToken cancellationToken = default);
}
