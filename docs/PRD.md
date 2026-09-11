# Product Requirements Document (PRD)

## Product Name
**RESCUE** — "Your AI Production Engineer"

## Tagline
**"Detect. Understand. Fix. Approve. Deploy. Verify."**

---

## 1. Executive Summary & Problem Statement
When production breaks or an external dependency changes, software engineers, DevOps, and SREs waste critical hours manually searching logs, source code, deployment manifests, OpenAPI specifications, documentation, and past post-mortems before they can even comprehend the root cause.

Traditional monitoring tools (Datadog, Grafana, Sentry) alert engineers *that* something is broken, but leave the investigation, correlation, fix generation, and validation entirely to human triage.

Rescue is an autonomous software reliability and maintenance platform. It continuously watches software systems for:
1. Production incidents (e.g. HTTP 503 spikes, connection pool starvation)
2. API & dependency breaking changes (e.g. upstream schema deprecations)
3. Configuration and deployment regressions
4. Application telemetry anomalies

When an anomaly occurs, Rescue automatically:
- **Detects** the event
- **Retrieves** context using **Moss** ultra-low-latency semantic retrieval
- **Correlates** live incidents with recent API releases or deployments ("Rescue connected the dots")
- **Diagnoses** root cause with evidence lineage
- **Proposes** a precise unified diff patch
- **Validates** syntax, secret cleanliness, and runs test suites
- **Enforces** mandatory human approval before production changes
- **Generates** GitHub Pull Requests
- **Deploys** to a safe staging environment
- **Verifies** telemetry recovery before closing the incident

---

## 2. Target Users & Personas
- **Software Engineers & Senior Developers:** Need automated migration patches for breaking API changes.
- **DevOps & SRE Engineers:** Need instant root cause isolation and verified config rollbacks without 2 AM alert fatigue.
- **Engineering Managers:** Need reduced MTTR (Mean Time To Resolution) and clear audit trails.
- **Startups & Small Engineering Teams:** Cannot afford 24/7 dedicated SRE rotations; Rescue acts as an autonomous virtual staff SRE.

---

## 3. Autonomy Levels
Rescue supports three operational modes:
1. **OBSERVE**: Detect → Investigate → Alert (read-only audit).
2. **RECOMMEND (Default)**: Detect → Investigate → Generate Fix → Enforce Human Approval Gate → Automated PR & Staging Verification.
3. **AUTONOMOUS**: Detect → Investigate → Fix → Verify (with safety boundary: production mutations disabled in demo sandbox).

---

## 4. Core Features & User Stories

### P0 Killer Flow: "API Change → Production Incident"
- **User Story:** As an on-call engineer, when an external API provider breaks a contract and triggers a production outage, I want Rescue to automatically correlate the outage to the upstream change, prove the root cause, and prepare a validated patch for my approval.
- **Flow:**
  1. Acme Payments releases API v4.2 (`customer_id` → `customerId`).
  2. Rescue detects the breaking change and uses Moss to find 17 references across 3 services.
  3. A migration PR is prepared, but remains unapproved.
  4. At 10:10, PaymentService begins failing in production (42% error rate, HTTP 503).
  5. Rescue detects the incident and `IIncidentCorrelationEngine` correlates the live failure with the unapproved API change.
  6. UI proclaims: **"RESCUE CONNECTED THE DOTS"** and presents the multi-event evidence graph.
  7. Patch generated for `ApiClient.cs`; 8/8 tests pass.
  8. Human approval gate -> GitHub PR #42 -> Staging Deploy -> Telemetry Verification (42% → 1.8%).

### P1 Standalone Incident: Redis Pool Starvation
- Deployment v42 regresses `MaxPoolSize: 50`.
- Rescue retrieves `deployment-v42.yaml`, `payment-production.json`, `INC-003.md`, and `RedisClient.cs`.
- Restores `MaxPoolSize: 200`; 184/184 tests pass.

### P1 Standalone API Breaking Change
- OpenAPI schema diff highlights breaking field rename.
- Moss pinpoints all 17 consumer references.

### P1 Moss Observability
- True hardware-measured retrieval latency (`Stopwatch.GetTimestamp()`).
- Real-time P50, P95, P99 percentiles and benchmark comparison against `Synthetic Remote Baseline`.

---

## 5. Non-Functional Requirements & Security
- **Sub-10ms Context Retrieval:** Powered by Moss local/in-process semantic search.
- **Human-in-the-Loop Safety:** Production mutation is strictly blocked without explicit approval.
- **Zero Secrets Committed:** Environment variables used for all credentials (`.env.example`).
