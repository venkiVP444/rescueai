# RESCUE Operational Memory ("RESCUE REMEMBERS")

## 1. Why RESCUE Needs Operational Memory
Traditional incident management systems suffer from organizational amnesia:
* When an upstream API changes or a connection pool exhausts, SREs frequently re-diagnose identical incidents that were resolved weeks or months earlier.
* Standard LLM conversational assistants ("ChatGPT memory") lack deterministic schema guarantees, auditability, and persistence across service restarts.

**RESCUE Operational Memory** gives RESCUE permanent, auditable, structured operational memory stored in SQLite / EF Core. It stores factual operational records rather than conversational chat transcripts.

---

## 2. Architecture Distinction: Moss vs RESCUE Memory

| Dimension | Moss Retrieval Runtime | RESCUE Operational Memory |
|---|---|---|
| **Purpose** | Low-latency lexical & semantic retrieval of current codebase, OpenAPI specifications, configurations, and runbooks. | Persistent structured memory of historical incident investigations, root causes, approved patches, and verified recovery telemetry. |
| **Data Scope** | Current system reality (specs, source code, yaml deployments, runbooks). | Historical operational experience & outcomes across previous outages. |
| **Timing** | Hardware-timed micro-retrieval (`Stopwatch.GetTimestamp()`) for sub-millisecond to low single-digit millisecond query latency. | SQLite relational indexed queries on `Service`, `IncidentType`, and `ResolvedAt`. |
| **Role in P0 Flow** | Discovers affected code references, deprecation notices, and consumer call sites. | Surfaces prior matching incidents: *"A similar PaymentService incident was resolved 20 days ago (INC-001)."* |

---

## 3. How Moss + Memory Work Together

```
                          Production Incident Detected (INC-105)
                                            │
                    ┌───────────────────────┴───────────────────────┐
                    ▼                                               ▼
          Moss Retrieval Layer                            RESCUE Memory Layer
   (Searches active specs, code, logs)           (Queries historical SQLite incident facts)
                    │                                               │
                    │ 17 affected code references                   │ Similar incident match: INC-001
                    │ OpenAPI v4.2 breaking change                  │ 20 days ago: customer_id -> customerId
                    │ ApiClient.cs call site                        │ 8/8 tests passed, resolved successfully
                    │                                               │
                    └───────────────────────┬───────────────────────┘
                                            ▼
                           Unified Incident Correlation Engine
                                            │
                               "RESCUE CONNECTED THE DOTS"
                                            │
                           1. Correlated with unmerged API v4.2
                           2. Recalled identical resolution from INC-001
                           3. Generated unified diff for ApiClient.cs
                           4. Validated 8/8 tests passed
                           5. Awaits Human SRE Approval
```

---

## 4. What Operational Memory Retains
Every incident recorded in memory preserves structured operational telemetry:
* **Incident ID & Service:** Target service name (`PaymentService`) and incident identifier.
* **Incident Type & Symptoms:** E.g., `ApiCompatibilityFailure` / `HTTP 503 Gateway Error`.
* **Root Cause:** Deprecated contract property sent to external gateway.
* **Related API Change:** Upstream version and field renaming (`API-420`, `customer_id` → `customerId`).
* **Proposed Fix Summary:** Unified diff applied (`ApiClient.cs`).
* **Validation Outcome:** Test counts and verification result (`8/8 migration tests passed`).
* **Risk & Human Approval:** Risk level (`Low`) and approval audit (`Approved by Staff SRE`).
* **GitHub PR Reference:** Branch and PR number (`rescue/INC-105-api-migration`, PR #42).
* **Deployment & SLO Verification:** Live telemetry recovery metrics (42.0% → 1.8% error rate).
* **Resolution Outcome & Timestamp:** Explicit resolution confirmation with hardware timestamps.

---

## 5. Retrieval & Pattern Matching Mechanics
* **Deterministic Matching:** Uses deterministic signature matching across service name, failure symptoms, and contract deprecation patterns.
* **Transparency:** Matches are explicitly attributed with a confidence score and human-readable explanation:
  > *"Deterministic Pattern Match: Identical PaymentService external API field deprecation signature ('customer_id' -> 'customerId') resolved previously in INC-001."*
* **Continuous Learning:** Upon approval and verified deployment of any incident (`ApproveAndDeployAsync`), the newly resolved incident is immediately written to SQLite operational memory, making it available for future incidents.
