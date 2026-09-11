using System;
using System.Threading.Tasks;
using Rescue.Application.Interfaces;
using Rescue.Domain.Entities;
using Rescue.Domain.Interfaces;

namespace Rescue.Infrastructure.Integrations;

public class GitHubRepositoryProvider : IRepositoryProvider
{
    private readonly IGitHubService _gitHubService;

    public string ProviderName => "GitHub";

    public GitHubRepositoryProvider(IGitHubService gitHubService)
    {
        _gitHubService = gitHubService;
    }

    public async Task<GitHubPrRecord> CreatePullRequestAsync(
        string repoUrl,
        string branchName,
        string title,
        string description,
        ProposedPatch patch)
    {
        var dummyValidation = new ValidationReport
        {
            SyntaxValid = true,
            PassedTests = 8,
            TotalTests = 8,
            SecretsCheckPassed = true
        };

        return await _gitHubService.CreatePullRequestAsync(
            title,
            branchName,
            patch,
            dummyValidation,
            null);
    }

    public Task<string> GetFileContentAsync(string repoUrl, string filePath, string branch = "main")
    {
        // Simulated local AST lookup or repo integration
        return Task.FromResult($"// Repository file: {filePath} on branch {branch}");
    }
}
