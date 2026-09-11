using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Rescue.Application.Interfaces;
using Rescue.Domain.Entities;
using Rescue.Domain.Enums;
using Rescue.Domain.Interfaces;

namespace Rescue.Application.Services;

public class GenericIncidentEngine : IGenericIncidentEngine
{
    private readonly IMemoryService _memoryService;
    private readonly IEventNotificationService _notifier;
    private readonly List<CorrelationRule> _rules = new();

    public List<CorrelationRule> Rules => _rules;

    public GenericIncidentEngine(IMemoryService memoryService, IEventNotificationService notifier)
    {
        _memoryService = memoryService;
        _notifier = notifier;

        // Default simple configurable rule:
        _rules.Add(new CorrelationRule
        {
            RuleId = "rule_error_spike",
            Name = "Service Error Spike",
            Description = "Correlates repeated HTTP 5xx or unhandled exceptions within a sliding time window.",
            PrimaryEventType = "http_error",
            ErrorThresholdCount = 3,
            TimeWindow = TimeSpan.FromMinutes(5),
            CorrelatedPrecursorTypes = new List<string> { "deployment_completed", "api_change", "database_error" },
            RequireMatchingService = true
        });
    }

    public void AddRule(CorrelationRule rule)
    {
        _rules.Add(rule);
    }

    public async Task<Incident?> EvaluateEventsAsync(
        string projectId,
        string service,
        List<RescueEvent> recentEvents,
        CancellationToken cancellationToken = default)
    {
        var now = DateTime.UtcNow;

        foreach (var rule in _rules.Where(r => r.IsEnabled))
        {
            var windowStart = now - rule.TimeWindow;
            var windowEvents = recentEvents
                .Where(e => e.ProjectId == projectId &&
                            e.Timestamp >= windowStart &&
                            (rule.RequireMatchingService ? string.Equals(e.Service, service, StringComparison.OrdinalIgnoreCase) : true))
                .OrderBy(e => e.Timestamp)
                .ToList();

            var errorEvents = windowEvents
                .Where(e => string.Equals(e.EventType, rule.PrimaryEventType, StringComparison.OrdinalIgnoreCase) ||
                            string.Equals(e.EventType, "exception", StringComparison.OrdinalIgnoreCase))
                .ToList();

            if (errorEvents.Count >= rule.ErrorThresholdCount)
            {
                // Find precursor events within window
                var precursorEvents = windowEvents
                    .Where(e => rule.CorrelatedPrecursorTypes.Contains(e.EventType, StringComparer.OrdinalIgnoreCase) &&
                                e.Timestamp <= errorEvents.First().Timestamp)
                    .ToList();

                var incidentId = $"INC-{Random.Shared.Next(200, 999)}";
                var latestError = errorEvents.Last();

                var title = $"{service} Elevated Error Surge ({errorEvents.Count} errors)";
                var description = $"Detected {errorEvents.Count} error events within {rule.TimeWindow.TotalMinutes:F0} minutes on service '{service}'.";

                var correlationReasons = new List<string>
                {
                    $"Breached threshold: {errorEvents.Count} errors (rule minimum: {rule.ErrorThresholdCount})"
                };

                string? rootCause = null;
                if (precursorEvents.Any())
                {
                    var precursor = precursorEvents.Last();
                    correlationReasons.Add($"Precursor event detected: '{precursor.EventType}' at {precursor.Timestamp:HH:mm:ss} UTC (Trace: {precursor.Correlation.GetValueOrDefault("traceId", "N/A")})");
                    rootCause = $"Correlated precursor '{precursor.EventType}' likely triggered downstream failure on service '{service}'.";
                }
                else
                {
                    correlationReasons.Add("No deployment or configuration precursors detected in recent window; isolated service failure.");
                    rootCause = $"Internal service degradation or resource saturation on '{service}'.";
                }

                var incident = new Incident
                {
                    Id = incidentId,
                    ProjectId = projectId,
                    Environment = latestError.Environment,
                    Title = title,
                    Service = service,
                    Severity = SeverityLevel.Critical,
                    Status = IncidentStatus.Investigating,
                    DetectedAt = now,
                    ProblemDescription = description,
                    RootCause = rootCause,
                    ErrorRateBefore = Math.Min(50.0, errorEvents.Count * 8.5),
                    Correlation = new CorrelationResult
                    {
                        IncidentId = incidentId,
                        Score = precursorEvents.Any() ? 88 : 72,
                        SummaryExplanation = rootCause,
                        CorrelationReasons = correlationReasons
                    },
                    Approval = new ApprovalRecord
                    {
                        Status = "Pending",
                        Approver = null,
                        ApprovedAt = null,
                        DecisionNotes = null
                    }
                };

                // Check project-isolated memory
                var memoryMatch = await _memoryService.FindSimilarIncidentAsync(incident, projectId, cancellationToken);
                incident.Investigation = new Investigation
                {
                    IncidentId = incidentId,
                    StartedAt = now,
                    CompletedAt = now,
                    Classification = "Production Error Spike",
                    RootCause = rootCause,
                    ConfidenceScore = precursorEvents.Any() ? 88 : 72,
                    ConfidenceExplanation = string.Join("; ", correlationReasons),
                    SimilarMemoryMatch = memoryMatch
                };

                // Notify UI
                await _notifier.BroadcastEventAsync("IncidentDetected", incident);
                return incident;
            }
        }

        return null;
    }
}
