# RESCUE — Your AI Production Engineer

> **"Detect. Understand. Fix. Approve. Deploy. Verify."**

Rescue is an autonomous software reliability and maintenance platform. It unifies **Self-Healing API Maintenance** and **Autonomous Production Incident Response** into a single, cohesive engine powered by the **Moss** low-latency retrieval runtime.

---

## 🌟 The P0 Killer Demo: "API Change → Production Incident"

```
Acme Payments releases API v4.2 (customer_id → customerId)
                         ↓
Rescue detects breaking change & retrieves 17 references via Moss
                         ↓
Migration PR prepared (unapproved by busy engineering team)
                         ↓
PaymentService begins failing in production (HTTP 503 / 42% Error Rate)
                         ↓
Rescue automatically correlates the active incident with the API change
                         ↓
             "RESCUE CONNECTED THE DOTS"
                         ↓
Root Cause: Deprecated customer_id sent to API v4.2
                         ↓
Generated Fix for ApiClient.cs • 8/8 Tests Passed
                         ↓
Human Approval Gate (RECOMMEND Mode)
                         ↓
GitHub PR Created • Staging Sandbox Deployed
                         ↓
Telemetry Recovery Verified: 42.0% → 1.8% Error Rate
                         ↓
                 ✓ INCIDENT RESOLVED
```

---

## 🚀 Quick Start

### 1. Start Backend API (Port 5105)
```bash
cd C:\Personal\RescueAI
dotnet run --project src/Rescue.Api/Rescue.Api.csproj
```

### 2. Start Frontend Command Center (Port 5173)
```bash
cd C:\Personal\RescueAI\src\Rescue.Web
npm run dev
```
Open **`http://localhost:5173`** in your browser.

### 3. Run Automated Tests
```bash
cd C:\Personal\RescueAI
dotnet test RescueAI.slnx
```

---

## ⚡ Key Highlights
- **Unified Correlation Engine (`IIncidentCorrelationEngine`):** Connects API changes, deployments, configuration regressions, and production error logs.
- **🧠 RESCUE REMEMBERS (`IMemoryService`):** Persistent SQLite operational memory storing structured incident facts, historical resolutions, and continuous learning.
- **Multi-Event Evidence DAG:** Visualizes all 17 causal nodes from upstream OpenAPI drift to downstream telemetry verification.
- **Moss Retrieval Observability:** Hardware-timed latency tracking (`Stopwatch.GetTimestamp`) computing actual P50, P95, and P99 percentiles.
- **Autonomy Levels:** Global toggle between `OBSERVE`, `RECOMMEND` (Default), and `AUTONOMOUS`.
- **Human Approval Gate & In-App Alerts:** Mandatory human review before creating PRs or modifying environments.
- **Safe Staging Sandbox:** Verification of telemetry before closing incidents (42% → 1.8%).

---

## 📚 Complete Documentation
- [Final Verification Report](docs/FINAL_VERIFICATION.md) **(100% Verified)**
- [Implementation Audit](docs/IMPLEMENTATION_AUDIT.md)
- [RESCUE Operational Memory Guide](docs/MEMORY.md)
- [Product Requirements Document (PRD)](docs/PRD.md)
- [System Architecture](docs/ARCHITECTURE.md)
- [3-Minute Hackathon Demo Script](docs/DEMO_SCRIPT.md)
- [Moss Integration & Observability](docs/MOSS.md)
- [Security Guardrails](docs/SECURITY.md)
- [API Documentation](docs/API.md)
- [Setup Guide](docs/SETUP.md)
