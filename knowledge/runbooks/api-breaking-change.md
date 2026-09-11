---
id: RBK-004
type: runbook
service: PaymentService
environment: production
timestamp: 2026-06-10T00:00:00Z
version: 1.3.0
tags: [runbook, api-change, breaking-change, migration]
---
# Runbook: Handling Upstream API Breaking Changes

## Background
Acme Payments gateway frequently publishes API updates.
When upstream API releases a breaking schema change:
1. Locate all references to deprecated fields across codebase using semantic search (Moss).
2. Update ApiClient.cs, PaymentService.cs, and DTO models.
3. Run ApiClientTests.cs (8 test cases) to guarantee payload contract compliance.
4. Obtain human approval and deploy hotfix PR.
