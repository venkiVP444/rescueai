using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using Rescue.Domain.Entities;

namespace Rescue.Sdk;

public class RescueClient : IRescueClient
{
    private readonly HttpClient _httpClient;
    private readonly RescueClientOptions _options;

    public RescueClient(RescueClientOptions options, HttpClient? httpClient = null)
    {
        _options = options;
        _httpClient = httpClient ?? new HttpClient();
        _httpClient.Timeout = _options.Timeout;
    }

    public async Task SendEventAsync(RescueEvent evt, CancellationToken cancellationToken = default)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(evt.ProjectId))
            {
                evt.ProjectId = _options.ProjectId;
            }
            if (string.IsNullOrWhiteSpace(evt.Environment))
            {
                evt.Environment = _options.Environment;
            }
            if (string.IsNullOrWhiteSpace(evt.Service))
            {
                evt.Service = _options.Service;
            }

            var requestUri = $"{_options.Endpoint.TrimEnd('/')}/api/v1/events";
            var json = JsonSerializer.Serialize(evt);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            var request = new HttpRequestMessage(HttpMethod.Post, requestUri)
            {
                Content = content
            };

            if (!string.IsNullOrWhiteSpace(_options.ApiKey))
            {
                request.Headers.Add("X-API-Key", _options.ApiKey);
            }

            if (_options.NonBlocking)
            {
                // Fire and forget in non-blocking mode to guarantee zero latency on caller's request path
                _ = Task.Run(async () =>
                {
                    try
                    {
                        using var cts = new CancellationTokenSource(_options.Timeout);
                        await _httpClient.SendAsync(request, cts.Token);
                    }
                    catch
                    {
                        // Safely absorb network / timeout exceptions
                    }
                }, CancellationToken.None);
            }
            else
            {
                await _httpClient.SendAsync(request, cancellationToken);
            }
        }
        catch
        {
            // RESCUE SDK contract: Telemetry failures must NEVER crash the host application.
        }
    }

    public Task SendHttpErrorAsync(int statusCode, string endpoint, string message, string? traceId = null, CancellationToken cancellationToken = default)
    {
        var evt = new RescueEvent
        {
            ProjectId = _options.ProjectId,
            Service = _options.Service,
            Environment = _options.Environment,
            EventType = "http_error",
            Severity = statusCode >= 500 ? "critical" : "high",
            Timestamp = DateTime.UtcNow,
            Data = new Dictionary<string, object>
            {
                ["statusCode"] = statusCode,
                ["endpoint"] = endpoint,
                ["message"] = message
            },
            Correlation = new Dictionary<string, string>()
        };

        if (!string.IsNullOrWhiteSpace(traceId))
        {
            evt.Correlation["traceId"] = traceId;
        }

        return SendEventAsync(evt, cancellationToken);
    }

    public Task SendDeploymentAsync(string deploymentId, string version, string status = "deployment_completed", CancellationToken cancellationToken = default)
    {
        var evt = new RescueEvent
        {
            ProjectId = _options.ProjectId,
            Service = _options.Service,
            Environment = _options.Environment,
            EventType = status,
            Severity = status.Contains("failed", StringComparison.OrdinalIgnoreCase) ? "critical" : "info",
            Timestamp = DateTime.UtcNow,
            Data = new Dictionary<string, object>
            {
                ["deploymentId"] = deploymentId,
                ["version"] = version,
                ["status"] = status
            },
            Correlation = new Dictionary<string, string>
            {
                ["deploymentId"] = deploymentId,
                ["version"] = version
            }
        };

        return SendEventAsync(evt, cancellationToken);
    }

    public Task SendExceptionAsync(Exception ex, string? endpoint = null, CancellationToken cancellationToken = default)
    {
        var evt = new RescueEvent
        {
            ProjectId = _options.ProjectId,
            Service = _options.Service,
            Environment = _options.Environment,
            EventType = "exception",
            Severity = "critical",
            Timestamp = DateTime.UtcNow,
            Data = new Dictionary<string, object>
            {
                ["exceptionType"] = ex.GetType().FullName ?? ex.GetType().Name,
                ["message"] = ex.Message,
                ["stackTrace"] = ex.StackTrace ?? string.Empty,
                ["endpoint"] = endpoint ?? "N/A"
            },
            Correlation = new Dictionary<string, string>()
        };

        return SendEventAsync(evt, cancellationToken);
    }
}
