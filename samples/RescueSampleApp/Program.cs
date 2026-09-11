using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Rescue.Domain.Entities;
using Rescue.Sdk;

Console.WriteLine("===================================================================");
Console.WriteLine("   RESCUE SAMPLE APP — Orders Processing Microservice (v1.2)       ");
Console.WriteLine("   Demonstrating Generic Framework-Agnostic Integration            ");
Console.WriteLine("===================================================================\n");

var apiKey = Environment.GetEnvironmentVariable("RESCUE_API_KEY") 
    ?? (args.Length > 0 ? args[0] : "res_live_sample_orders_secret_99401");

var projectId = Environment.GetEnvironmentVariable("RESCUE_PROJECT_ID")
    ?? (args.Length > 1 ? args[1] : "sample-orders-api");

var options = new RescueClientOptions
{
    Endpoint = "http://localhost:5105",
    ProjectId = projectId,
    ApiKey = apiKey,
    Service = "OrdersService",
    Environment = "production",
    NonBlocking = false // Synchronous for sample execution output
};

var client = new RescueClient(options);

Console.WriteLine("[1/4] Registering Deployment Event (deploy-orders-v102)...");
await client.SendDeploymentAsync("deploy-orders-v102", "v1.0.2", "deployment_completed");
Console.WriteLine("      ✓ Deployment event dispatched to RESCUE\n");

await Task.Delay(500);

Console.WriteLine("[2/4] Simulating Downstream PostgreSQL Connection Saturation...");
for (int i = 1; i <= 4; i++)
{
    var traceId = $"trace-ord-{Guid.NewGuid().ToString("N")[..8]}";
    Console.WriteLine($"      Emitting HTTP 504 Timeout [{i}/4] on /api/orders/checkout (Trace: {traceId})...");
    await client.SendHttpErrorAsync(
        statusCode: 504,
        endpoint: "/api/orders/checkout",
        message: "NpgsqlException: Connection pool timeout (max 100 connections saturated)",
        traceId: traceId);
    await Task.Delay(200);
}

Console.WriteLine("\n[3/4] Emitting Sensitive Data Payload to test Auto-Redaction...");
var rawEvent = new RescueEvent
{
    ProjectId = projectId,
    Service = "OrdersService",
    Environment = "production",
    EventType = "database_error",
    Severity = "critical",
    Data = new Dictionary<string, object>
    {
        ["dbHost"] = "postgres-prod.internal",
        ["password"] = "SuperSecretDbPassword123!",
        ["authorization"] = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
        ["activePool"] = 100,
        ["maxPool"] = 100
    },
    Correlation = new Dictionary<string, string>
    {
        ["deploymentId"] = "deploy-orders-v102"
    }
};

await client.SendEventAsync(rawEvent);
Console.WriteLine("      ✓ Sensitive event sent (password and bearer token automatically redacted)\n");

Console.WriteLine("[4/4] RESCUE Integration Complete!");
Console.WriteLine("      Visit http://localhost:5173 -> 'Projects & Integrations' tab to inspect");
Console.WriteLine("      the ingested telemetry, auto-redacted credentials, and triggered investigation.\n");
