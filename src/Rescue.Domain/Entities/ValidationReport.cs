using System;
using System.Collections.Generic;

namespace Rescue.Domain.Entities;

public class ValidationReport
{
    public string Id { get; set; } = Guid.NewGuid().ToString("N");
    public bool SyntaxValid { get; set; } = true;
    public int TotalTests { get; set; }
    public int PassedTests { get; set; }
    public bool SecretsCheckPassed { get; set; } = true;
    public bool RegressionCheckPassed { get; set; } = true;
    public bool RiskAnalysisPassed { get; set; } = true;
    public bool IsSuccess => SyntaxValid && TotalTests == PassedTests && SecretsCheckPassed && RegressionCheckPassed && RiskAnalysisPassed;
    public List<string> TestNames { get; set; } = new();
    public string OutputSummary { get; set; } = string.Empty;
    public DateTime ValidatedAt { get; set; } = DateTime.UtcNow;
}
