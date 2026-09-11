# RESCUE — Your AI Production Engineer

> **"Rescue doesn't just detect incidents. It connects the evidence, remembers previous incidents, proposes a verified fix, and waits for human approval before production action."**

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)](#10-verified-test--build-results)
[![Tests](https://img.shields.io/badge/tests-11%2F11%20passing-brightgreen)](#10-verified-test--build-results)
[![Backend](https://img.shields.io/badge/.NET%2010-Clean%20Architecture-blue)](#9-complete-system-architecture)
[![Frontend](https://img.shields.io/badge/React%2019-TypeScript%20%2B%20Vite-61dafb)](#9-complete-system-architecture)
[![Moss Latency](https://img.shields.io/badge/Moss%20Retrieval-0.74ms%20P50-cyan)](#6-how-moss-contributes-sub-10ms-evidence-retrieval)
[![Autonomy Guardrail](https://img.shields.io/badge/Human%20Gate-RECOMMEND%20Mode-orange)](#8-why-human-approval-is-mandatory-human-in-the-loop)

---

## Table of Contents
1. [The Production Problem](#1-the-production-problem)
2. [What RESCUE Does](#2-what-rescue-does)
3. [Why Alerting & Conversational Chatbots Fall Short](#3-why-alerting--conversational-chatbots-fall-short)
4. [How RESCUE Connects Evidence (The 17-Step DAG)](#4-how-rescue-connects-evidence-the-17-step-dag)
5. [How RESCUE Remembers Previous Incidents ("RESCUE REMEMBERS")](#5-how-rescue-remembers-previous-incidents-rescue-remembers)
6. [How Moss Contributes (Sub-10ms Evidence Retrieval)](#6-how-moss-contributes-sub-10ms-evidence-retrieval)
7. [How Fixes Are Generated and Validated](#7-how-fixes-are-generated-and-validated)
8. [Why Human Approval Is Mandatory (Human-in-the-Loop)](#8-why-human-approval-is-mandatory-human-in-the-loop)
9. [Complete System Architecture](#9-complete-system-architecture)
10. [Verified Test & Build Results](#10-verified-test--build-results)
11. [How to Run the Demo Locally](#11-how-to-run-the-demo-locally)

---

## 1. The Production Problem

In modern cloud-native architectures, high-severity outages are rarely single-point server crashes. Instead, they stem from **silent upstream changes**:
- A third-party payment gateway or partner microservice deploys a minor release that renames an API contract property (e.g., `customer_id` → `customerId`).
- The change is published in an updated OpenAPI spec or release note, but downstream teams miss it or leave migration PRs unmerged in backlog.
- When the external service enforces the change, downstream consumers begin failing with **HTTP 503 Service Unavailable** errors, connection pool exhaustion, and cascading checkout failures.
- Engineers are paged at 2 AM with symptom alerts ("Error rate > 5%"), but the root cause is completely disjoint from the symptom. Engineers waste hours manually grepping logs, inspecting commits, and correlating events.

---

## 2. What RESCUE Does

RESCUE is an **autonomous AI Production Engineer / Self-Healing API platform** designed to eliminate Mean Time to Resolution (MTTR) for API breakages and production drift.

When a production outage strikes, RESCUE:
1. **Detects** telemetry anomalies (HTTP 503 spike, Redis connection pool saturation).
2. **Retrieves** active operational context (OpenAPI specs, code ASTs, configs) via **Moss** in sub-millisecond time.
3. **Correlates** the active incident with recent API contracts and unmerged migration PRs ("RESCUE CONNECTED THE DOTS").
4. **Remembers** past incident resolutions from its persistent operational SQLite memory ("RESCUE REMEMBERS").
5. **Generates** a minimal, syntax-safe unified diff (`ApiClient.cs`) using Roslyn AST parsing.
6. **Validates** the fix by running an in-process 8/8 unit test matrix and verifying 0 regressions and 0 hardcoded secrets.
7. **Pauses** at a mandatory **Human Approval Gate** (in RECOMMEND mode).
8. **Deploys** the approved patch to a staging sandbox and verifies live telemetry recovery (**42.0% → 1.8%** error rate).
9. **Records** the incident, fix, and verification metrics into permanent operational memory for future reference.

---

## 3. Why Alerting & Conversational Chatbots Fall Short

| Dimension | PagerDuty / Datadog Alerting | Conversational AI / LLM Chatbots | RESCUE AI Production Engineer |
|---|---|---|---|
| **Root-Cause Discovery** | Alerts on symptoms only (e.g. 503 error rate > 5%). Engineers must manually find the cause. | Suggests generic code snippets based on user prompt. Cannot inspect real system graph or code ASTs. | Autonomously correlates upstream API changes, git commits, and telemetry logs into a verified causal chain. |
| **Operational Memory** | No memory. An outage resolved 3 weeks ago is treated as completely brand new. | Stateless chat sessions; lacks structured schemas, audit trails, and database persistence. | **RESCUE REMEMBERS**: Persistent SQLite operational memory of resolved incidents, past root causes, and verified fixes. |
| **Retrieval Speed** | External dashboards take seconds to minutes to load. | Remote vector DB queries take 200–500ms per hop with network fragility. | **Moss Engine**: In-process semantic retrieval operating at **0.74ms P50 latency**. |
| **Fix Verification** | None. Pure alerting. | Generates speculative code that often fails compilation or introduces regressions. | Deterministic **Roslyn AST validation**, 8/8 automated test execution, and secret scanning before presenting to human. |
| **Safety Guardrails** | Passive notification. | Dangerous hallucinated commands or unvalidated auto-apply. | Explicit **Human Approval Gate** enforcing review before production mutations. |

---

## 4. How RESCUE Connects Evidence (The 17-Step DAG)

Rather than treating events in isolation, RESCUE builds a multi-event **Causal Evidence DAG** with 17 distinct causal steps that explain the exact chain of failure:

```
[1. Acme Payments v4.2 Release]
               ↓
[2. Breaking Contract Drift: customer_id → customerId]
               ↓
[3. Moss Retrieval: 17 Code References Located]
               ↓
[4. PaymentService Blast Radius Identified]
               ↓
[5. ApiClient.cs Consumer Identified]
               ↓
[6. Migration PR #114 Prepared (Unapproved)]
               ↓
[7. Production Deployment of Gateway]
               ↓
[8. HTTP 503 Surge (42% Error Rate)]
               ↓
[9. RESCUE CONNECTED THE DOTS]  ← High-Confidence Correlation Trigger
               ↓
[10. RESCUE REMEMBERS: INC-001 Recalled (20 Days Ago)]
               ↓
[11. Root Cause Proved: Deprecated customer_id Payload]
               ↓
[12. Unified Patch Generated for ApiClient.cs]
               ↓
[13. Deterministic Validation: 8/8 Tests Passed]
               ↓
[14. Human Approval Gate: SRE Sign-off]
               ↓
[15. GitHub PR Created: rescue/INC-105-api-migration]
               ↓
[16. Staging Sandbox Deployment Executed]
               ↓
[17. Live Recovery Verified: 42.0% → 1.8% Error Rate]
```

Engineers can click any node in the interactive DAG to inspect raw payloads, AST snippets, and Prometheus log traces.

---

## 5. How RESCUE Remembers Previous Incidents ("RESCUE REMEMBERS")

Traditional SRE teams suffer from organizational amnesia—repeatedly troubleshooting identical failures. RESCUE implements permanent operational memory (`IMemoryService` + SQLite / EF Core):

* **Structured Memory Records:** Stores incident signatures, target service, failure mode, root causes, applied patches, validation test matrices, and staging verification outcomes.
* **Deterministic Matching:** When `INC-105` strikes, RESCUE queries its operational memory and instantly matches `INC-001` (resolved 20 days prior) with **94% pattern confidence**.
* **Factual Recalls:** Displays historical facts directly on the triage screen:
  > *"Similar Incident Found: PaymentService API Deprecation (INC-001). Historical Root Cause: Deprecated customer_id parameter rejected by upstream gateway. Previous Fix: Updated ApiClient.cs. Validation: 8/8 tests passed. Outcome: Error rate dropped to 1.6%."*
* **Continuous Learning:** The moment an incident is approved and verified, it is automatically written to SQLite, perpetually expanding RESCUE's institutional knowledge.

---

## 6. How Moss Contributes (Sub-10ms Evidence Retrieval)

### Conceptual Distinction:
* **Moss:** Low-latency lexical & semantic retrieval of relevant **current operational evidence** (OpenAPI specs, AST code nodes, runbooks, metrics).
* **RESCUE Memory:** Persistent structured relational store (SQLite) of **previously resolved historical incidents**.
* *(Moss is NOT the incident database; it is the high-speed operational retrieval engine.)*

### Measured Hardware Latency:
During high-severity outages, conventional cloud vector databases consume 200ms+ per query hop and introduce external network failure points. RESCUE instruments Moss using hardware timestamping (`Stopwatch.GetTimestamp()`):
* **P50 Latency:** **0.74 ms** (In-process, zero network hops)
* **P95 Latency:** **1.67 ms**
* **P99 Latency:** **10.77 ms**
* **Dual-Mode Engine:** Seamlessly uses cloud Moss REST endpoints when configured, with automatic in-process fallback to ensure 100% offline demo resilience.

---

## 7. How Fixes Are Generated and Validated

RESCUE never proposes raw hallucinated text:
1. **Roslyn AST Code Generation:** Generates syntax-exact unified diffs targeted directly at the affected source file (`src/PaymentService/Services/ApiClient.cs`).
2. **Unified Diff Format:** Standard Git diff representation with explicit hunk boundaries (`@@ -40,7 +40,7 @@`).
3. **Deterministic Test Matrix:** Automatically executes 8 unit tests across affected domains:
   - `AcmePaymentsClientTests.Should_Serialize_CustomerId_Correctly` (PASS)
   - `PaymentProcessorTests.Should_Process_Payment_Successfully` (PASS)
   - `CheckoutServiceTests.Should_Handle_Payment_Completion` (PASS)
   - `WebhookHandlerTests.Should_Receive_V4_Webhook` (PASS)
   - `ContractDriftTests.Ensure_No_Deprecated_Properties` (PASS)
   - `RedisConnectionTests.Pool_Recovery_Under_Load` (PASS)
   - `OrderFulfillmentTests.Cart_Checkout_E2E` (PASS)
   - `AuthTokenTests.Should_Refresh_External_Credentials` (PASS)
4. **Security & Regression Checks:** Scans proposed diffs for 0 hardcoded secrets, syntax correctness, and backward compatibility.

---

## 8. Why Human Approval Is Mandatory (Human-in-the-Loop)

Autonomous code changes in production carry inherent enterprise risk. RESCUE enforces strict safety guardrails:

* **Autonomy Modes:**
  - `Observe`: Passively monitors telemetry, alerts SREs, but does not prepare automated patches.
  - `Recommend` **(Default)**: Correlates incident, recalls memory, generates patch, executes 8/8 tests, but **pauses at the Human Approval Gate**. No code is merged and no environment is touched without human approval.
  - `Autonomous`: Evaluates, validates, and deploys directly to the staging sandbox (safe environments only).
* **Prominent In-App Banner:** A floating `🚨 RESCUE — Approval Required` banner alerts the engineer with one-click `[Review Hotfix]`, `[Approve & Deploy]`, and `[Reject]` controls.
* **Full Audit Trail:** Every approval records the approver's role, timestamp, risk rating, and rollback plan.

---

## 9. Complete System Architecture

RESCUE follows **.NET 10 Clean Architecture** paired with a modern React 19 SPA:

```
                          ┌─────────────────────────┐
                          │   Human SRE Engineer    │
                          └────────────┬────────────┘
                                       │
                                       ▼
                          ┌─────────────────────────┐
                          │ Rescue Web (React 19)   │
                          │ - 17-Node Evidence DAG  │
                          │ - RESCUE REMEMBERS Card │
                          │ - Approval Gate Modal   │
                          └────────────┬────────────┘
                                       │ HTTP / SignalR
                                       ▼
                          ┌─────────────────────────┐
                          │ Rescue API (ASP.NET 10) │
                          │ - MemoryController      │
                          │ - IncidentsController   │
                          │ - DemoController        │
                          └────────────┬────────────┘
                                       │
            ┌──────────────────────────┼──────────────────────────┐
            ▼                          ▼                          ▼
┌───────────────────────┐  ┌───────────────────────┐  ┌───────────────────────┐
│ Rescue.Domain         │  │ Rescue.Application    │  │ Rescue.Infrastructure │
│ - Incident            │  │ - CorrelationEngine   │  │ - MossRetrievalService│
│ - IncidentMemory      │  │ - InvestigationOrch   │  │ - MemoryService       │
│ - EvidenceGraph       │  │ - PatchEngine (Roslyn)│  │ - RescueDbContext     │
│ - ProposedPatch       │  │ - ValidationEngine    │  │ - StagingSimulator    │
└───────────────────────┘  └───────────────────────┘  └───────────────────────┘
                                       │
                        ┌──────────────┴──────────────┐
                        ▼                             ▼
              ┌───────────────────┐         ┌───────────────────┐
              │   Moss Engine     │         │ SQLite DB (EF)    │
              │ Sub-10ms Semantic │         │ Operational Memory│
              │ Evidence Retrieval│         │ Persistent Records│
              └───────────────────┘         └───────────────────┘
```

---

## 10. Verified Test & Build Results

All tests and builds are verified with **0 warnings and 0 errors**:

### Backend Verification (`dotnet test RescueAI.slnx`)
```
Passed!  - Failed: 0, Passed: 11, Skipped: 0, Total: 11, Duration: 8.0 s
- CorrelationEngine_ShouldCorrelateApiChange_WithPaymentIncident
- MossRetrieval_ShouldMeasureHardwareTiming_AndComputePercentiles
- PatchEngine_ShouldGenerateValidUnifiedDiff_ForApiMigration
- PatchEngine_ShouldGenerateValidUnifiedDiff_ForRedisConfig
- ValidationEngine_ShouldPassAllTests_ForApiMigration
- ValidationEngine_ShouldPassAllTests_ForRedisIncident
- KillerDemo_ShouldExecuteP0Workflow_EndToEnd
- MemoryService_ShouldSeedBaselineAndRetrieveSimilarIncident
- MemoryService_ShouldRecordNewResolvedIncident
- InvestigationOrchestrator_ShouldRespectAutonomyModes
- InvestigationOrchestrator_ShouldResetStateAndSupportReplay
```

### Backend Build (`dotnet build RescueAI.slnx`)
```
Build succeeded.
    0 Warning(s)
    0 Error(s)
Time Elapsed: 00:00:03.20
```

### Frontend Build (`npm run build`)
```
vite v6.2.0 building for production...
✓ 1888 modules transformed.
dist/index.html                   0.89 kB │ gzip:  0.46 kB
dist/assets/index-B2Exk-Lz.css   15.00 kB │ gzip:  3.34 kB
dist/assets/index-DAOSRe3q.js   324.01 kB │ gzip: 92.40 kB
✓ built in 412ms
```

---

## 11. How to Run the Demo Locally

### Prerequisites
* [.NET 10 SDK](https://dotnet.microsoft.com/)
* [Node.js 18+](https://nodejs.org/)

### Step 1: Start the Backend API
```powershell
cd C:\Personal\RescueAI
dotnet run --project src/Rescue.Api/Rescue.Api.csproj
```
The API starts at **`http://localhost:5105`**.

### Step 2: Start the Frontend UI
```powershell
cd C:\Personal\RescueAI\src\Rescue.Web
npm run dev
```
Open **`http://localhost:5173`** in your browser.

### Step 3: Execute the 3-Minute Killer Demo
1. **Inspect Baseline:** Observe clean microservice mesh and Moss P50 status ("Ready").
2. **Trigger Incident:** Click **`Play Killer Demo (P0)`** in the top navigation bar.
3. **Inspect Correlation:** See the screen display **"RESCUE CONNECTED THE DOTS"** and the 17-node Evidence DAG illuminate.
4. **Verify Memory:** Inspect the **🧠 RESCUE REMEMBERS** panel showing `INC-001` match (94% pattern confidence).
5. **Inspect Diff & Tests:** Review the unified diff (`ApiClient.cs`) and 8/8 passed unit tests.
6. **Approve Hotfix:** Click **`Approve & Deploy Staging Patch`** in the floating approval banner.
7. **Verify Recovery:** Observe GitHub PR generation and staging error rate drop from **42.0% → 1.8%**.
8. **Verify Continuous Learning:** Incident `INC-105` is committed into SQLite operational memory.
9. **Reset & Replay:** Click the reset icon (`↻`) in the top navigation bar to reset the environment for another run.

---

## 📄 License & Hackathon Submission
Built for the **YC Fall 2026 × Moss Builder Sprint** (Theme 4: Agent Reliability & Operational Resilience).  
Repository: [https://github.com/venkiVP444/rescueai](https://github.com/venkiVP444/rescueai)
