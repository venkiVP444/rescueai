using System.Threading.Tasks;
using Rescue.Domain.Entities;

namespace Rescue.Domain.Interfaces;

public interface IRepositoryProvider
{
    string ProviderName { get; }
    Task<GitHubPrRecord> CreatePullRequestAsync(string repoUrl, string branchName, string title, string description, ProposedPatch patch);
    Task<string> GetFileContentAsync(string repoUrl, string filePath, string branch = "main");
}
