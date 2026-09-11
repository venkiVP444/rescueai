using System;
using System.Collections.Generic;
using Rescue.Domain.Enums;

namespace Rescue.Domain.Entities;

public class ApiChange
{
    public string Id { get; set; } = string.Empty;
    public string Provider { get; set; } = string.Empty;
    public string Version { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public ApiChangeStatus Status { get; set; } = ApiChangeStatus.Detected;
    public DateTime DetectedAt { get; set; } = DateTime.UtcNow;
    public string OldField { get; set; } = "customer_id";
    public string NewField { get; set; } = "customerId";
    public string Endpoint { get; set; } = "/v1/charges";
    public int AffectedReferencesCount { get; set; } = 17;
    public int AffectedServicesCount { get; set; } = 3;
    public int AffectedTestsCount { get; set; } = 8;
    public List<string> AffectedServices { get; set; } = new() { "PaymentService", "OrderService", "CheckoutService" };
    public List<string> AffectedFiles { get; set; } = new() { "ApiClient.cs", "PaymentService.cs", "PaymentMapper.cs", "PaymentServiceTests.cs", "ApiClientTests.cs" };
    public RiskLevel Risk { get; set; } = RiskLevel.Medium;
    public ProposedPatch? ProposedPatch { get; set; }
    public ValidationReport? ValidationReport { get; set; }
    public ApprovalRecord? Approval { get; set; }
    public GitHubPrRecord? GitHubPr { get; set; }
}
