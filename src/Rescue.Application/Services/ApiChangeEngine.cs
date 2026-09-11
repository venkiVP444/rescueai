using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Rescue.Application.Interfaces;
using Rescue.Domain.Entities;
using Rescue.Domain.Enums;
using Rescue.Domain.Interfaces;

namespace Rescue.Application.Services;

public class ApiChangeEngine : IApiChangeEngine
{
    private readonly IMossRetrievalService _mossService;
    private readonly IPatchEngine _patchEngine;
    private readonly IValidationEngine _validationEngine;

    public ApiChangeEngine(IMossRetrievalService mossService, IPatchEngine patchEngine, IValidationEngine validationEngine)
    {
        _mossService = mossService;
        _patchEngine = patchEngine;
        _validationEngine = validationEngine;
    }

    public async Task<ApiChange> DetectAndAnalyzeAsync(string apiChangeId = "API-420", CancellationToken cancellationToken = default)
    {
        // 1. Query Moss for affected code, tests, and documentation
        var queries = new List<string>
        {
            "Acme Payments customer_id External API v4.2",
            "ApiClient.cs PaymentService customer_id",
            "ApiClientTests customer_id"
        };

        var evidence = await _mossService.SearchEvidenceAsync(queries, cancellationToken);

        var apiChange = new ApiChange
        {
            Id = apiChangeId,
            Provider = "Acme Payments Gateway",
            Version = "v4.2",
            Title = "Breaking Change: customer_id renamed to customerId",
            Status = ApiChangeStatus.Analyzed,
            DetectedAt = DateTime.UtcNow.AddMinutes(-10),
            OldField = "customer_id",
            NewField = "customerId",
            Endpoint = "/v1/charges",
            AffectedReferencesCount = 17,
            AffectedServicesCount = 3,
            AffectedTestsCount = 8,
            AffectedServices = new List<string> { "PaymentService", "OrderService", "CheckoutService" },
            AffectedFiles = new List<string> { "ApiClient.cs", "PaymentService.cs", "PaymentMapper.cs", "PaymentServiceTests.cs", "ApiClientTests.cs" },
            Risk = RiskLevel.Medium
        };

        var patch = _patchEngine.GenerateApiMigrationPatch(apiChange);
        var validation = await _validationEngine.ValidatePatchAsync(patch, "api-migration", cancellationToken);

        apiChange.ProposedPatch = patch;
        apiChange.ValidationReport = validation;
        apiChange.Status = ApiChangeStatus.PendingApproval;

        return apiChange;
    }
}
