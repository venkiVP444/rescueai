# RESCUE Platform Integration Guide

> **"Transforming RESCUE from a hardcoded demo into a reusable, framework-agnostic AI Production Engineering platform."**

This guide documents how developers and engineering organizations connect external services, applications, and CI/CD pipelines to RESCUE for automated incident correlation, memory retrieval, fix validation, and human-in-the-loop approvals.

---

## Integration Status Matrix

| Capability | Status | Implementation Details |
|---|---|---|
| **Standard Event Contract (`schemaVersion: "1.0"`)** | **Implemented** | Normalized JSON contract supporting `http_error`, `exception`, `deployment_started`, `deployment_completed`, `database_error`, `api_change`, etc. |
| **REST Ingestion API (`/api/v1/events`)** | **Implemented** | Single event (`POST /api/v1/events`) and batch ingestion (`POST /api/v1/events/batch`). |
| **Project Management (`/api/v1/projects`)** | **Implemented** | Multi-project registration, project-scoped data boundaries, and SHA-256 hashed API key validation. |
| **Cryptographic API Key Storage** | **Implemented** | Raw token displayed **only once** at creation; only SHA-256 hash stored in SQLite database. |
| **Automated Secret & PII Redaction** | **Implemented** | Sensitive keys (`password`, `token`, `secret`, `apiKey`) and `Bearer [token]` headers automatically redacted before storage. |
| **Project-Isolated Operational Memory** | **Implemented** | RESCUE REMEMBERS queries strictly isolated by `ProjectId`; zero cross-tenant leakage. |
| **Lightweight .NET SDK (`Rescue.Sdk`)** | **Implemented** | `builder.Services.AddRescue(...)`, non-blocking asynchronous queuing, fail-safe HTTP dispatch (telemetry failure never crashes caller). |
| **Configurable Correlation Rules** | **Implemented** | Simple, extensible rules evaluating error spikes, precursor events (deployments/API changes), and sliding time windows. |
| **GitHub Repository Abstraction (`IRepositoryProvider`)** | **Implemented** | Generates pull requests, unified diffs, and branch refs. |
| **Interactive Console Integration Hub** | **Implemented** | Web console UI for project onboarding, raw key copy banners, cURL snippets, and real-time streaming feed. |
| **Independent Reference Application (`RescueSampleApp`)** | **Implemented** | Orders processing microservice running outside Acme Commerce to prove generic compatibility. |
| **CI/CD Webhook Ingestion** | **Partially Implemented** | Generic webhook HTTP endpoint implemented; dedicated GitHub Actions / GitLab CI marketplace extensions are planned. |
| **Cloud Vector DB Remote Providers** | **Partially Implemented** | In-process sub-10ms Moss retrieval + local engine implemented; managed cloud cluster adapters planned. |
| **Enterprise OAuth / SSO Marketplace** | **Planned** | Roadmap item for multi-tenant SaaS deployment. |

---

## 1. What RESCUE Integration Is

Connecting an application to RESCUE provides:
1. **Real-time Incident Correlation:** Correlates runtime exceptions with recent deployments, database degradations, or API breaking changes.
2. **Institutional Memory ("RESCUE REMEMBERS"):** Automatically recalls historical root causes and validated patches from previously resolved incidents on the same project.
3. **Automated Roslyn Diff Generation & Validation:** Prepares code and configuration patches tested against an automated test suite before reaching engineers.
4. **Mandatory Human Approval Gate:** Enforces human review in `RECOMMEND` mode before generating pull requests or staging mutations.

---

## 2. Standard Event Contract (`schemaVersion: "1.0"`)

RESCUE accepts events formatted in accordance with the normalized version 1.0 schema:

```json
{
  "schemaVersion": "1.0",
  "projectId": "orders-microservice",
  "service": "OrdersService",
  "environment": "production",
  "eventType": "http_error",
  "severity": "critical",
  "timestamp": "2026-09-11T12:00:00Z",
  "data": {
    "statusCode": 504,
    "endpoint": "/api/orders/checkout",
    "message": "PostgreSQL connection pool exhausted (100/100 connections)"
  },
  "correlation": {
    "traceId": "trace-ord-98402",
    "deploymentId": "deploy-orders-v102"
  }
}
```

### Supported `eventType` Identifiers:
* `http_error` — HTTP 5xx responses or gateway errors.
* `exception` — Unhandled runtime exceptions or panic traces.
* `deployment_started` / `deployment_completed` / `deployment_failed` — CI/CD deployment markers.
* `rollback` — Deployment rollback events.
* `database_error` — Database deadlocks, pool timeouts, or slow queries.
* `api_change` — Upstream OpenAPI specification drift or schema deprecations.
* `health_check_failure` — Liveness or readiness probe failures.
* `custom` — Application-specific telemetry signals.

---

## 3. Project Onboarding Flow

```
1. Register Project (POST /api/v1/projects)
                ↓
2. Save One-Time Raw API Key (res_live_...)
                ↓
3. Install Rescue.Sdk in your service
                ↓
4. Add builder.Services.AddRescue(...) in Program.cs
                ↓
5. Dispatch test event (SendHttpErrorAsync / cURL)
                ↓
6. Verification Complete: Telemetry streaming into RESCUE
```

### Step 1: Create a Project via API
```bash
curl -X POST http://localhost:5105/api/v1/projects \
  -H "Content-Type: application/json" \
  -d '{
    "id": "sample-orders-api",
    "name": "Sample Orders API",
    "description": "Order processing and cart service",
    "environment": "production",
    "services": ["OrdersService"],
    "repositoryUrl": "https://github.com/organization/orders-repo"
  }'
```

**Response (HTTP 201 Created):**
```json
{
  "success": true,
  "message": "Project created successfully. Save your raw API key now; it will not be shown again.",
  "project": {
    "id": "sample-orders-api",
    "name": "Sample Orders API",
    "apiKeyPrefix": "res_live_ab12...",
    "environment": "production"
  },
  "rawApiKey": "res_live_ab12ef3498ac7162bcae918234"
}
```

> [!CAUTION]
> The raw API key (`rawApiKey`) is returned **only once** upon creation. RESCUE hashes the key with SHA-256 before writing to storage. If lost, generate a new project or rotate credentials.

---

## 4. .NET SDK Integration (`Rescue.Sdk`)

### Installation
Reference the `Rescue.Sdk` project or NuGet package.

### Configuration in `Program.cs`
```csharp
using Rescue.Sdk;

var builder = WebApplication.CreateBuilder(args);

// Register RESCUE non-blocking client
builder.Services.AddRescue(options =>
{
    options.Endpoint = "http://localhost:5105";
    options.ProjectId = "sample-orders-api";
    options.ApiKey = builder.Configuration["Rescue:ApiKey"]!;
    options.Service = "OrdersService";
    options.Environment = "production";
    options.NonBlocking = true; // Telemetry runs asynchronously in background
});
```

### Emitting Events in Code
```csharp
public class CheckoutController : ControllerBase
{
    private readonly IRescueClient _rescueClient;

    public CheckoutController(IRescueClient rescueClient)
    {
        _rescueClient = rescueClient;
    }

    [HttpPost("process")]
    public async Task<IActionResult> ProcessCheckout()
    {
        try
        {
            // Business logic
            return Ok();
        }
        catch (NpgsqlException ex)
        {
            // Fail-safe dispatch: will NEVER throw or crash the checkout endpoint!
            await _rescueClient.SendHttpErrorAsync(
                statusCode: 504,
                endpoint: "/api/checkout/process",
                message: ex.Message,
                traceId: HttpContext.TraceIdentifier);

            return StatusCode(504, "Payment processing timed out.");
        }
    }
}
```

---

## 5. Security, Redaction & Guardrails

* **Zero-Knowledge API Keys:** API keys are generated with cryptographic entropy (`RandomNumberGenerator`) and stored solely as SHA-256 digests (`ApiKeyHash`).
* **Automated Data Redaction:** All incoming events are scrubbed before storage. Any payload key containing `password`, `secret`, `token`, `apiKey`, `auth`, `authorization`, or values matching `Bearer [token]` are replaced with `[REDACTED]`.
* **Tenant & Project Isolation:** All queries to operational memory (`IMemoryService`) require an explicit `ProjectId`. Incident patterns and historical resolutions from Customer A are strictly invisible to Customer B.
* **Human Approval Gate:** In `RECOMMEND` mode (default), RESCUE prepares investigations, proposed diffs, and verification metrics, but halts execution until an authorized engineer clicks **Approve**.

---

## 6. Testing with the Sample Application (`RescueSampleApp`)

A standalone sample service is located at `samples/RescueSampleApp`:

```powershell
# Run the backend API
dotnet run --project src/Rescue.Api/Rescue.Api.csproj

# In another terminal, run the sample app:
dotnet run --project samples/RescueSampleApp/RescueSampleApp.csproj
```

The sample app connects using `RescueClient`, emits deployment event `deploy-orders-v102`, simulates 4 consecutive connection saturation timeouts on `OrdersService`, and tests sensitive credential auto-redaction.
