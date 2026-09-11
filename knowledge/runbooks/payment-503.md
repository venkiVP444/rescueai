---
id: RBK-001
type: runbook
service: PaymentService
environment: production
timestamp: 2026-05-15T00:00:00Z
version: 1.2.0
tags: [runbook, payment, 503, triage, error-rate]
---
# Runbook: PaymentService HTTP 503 Outage

## Symptoms
- Inbound HTTP 503 Service Unavailable spikes above 5% (critical threshold >40%).
- Order checkout conversions plummet.

## Diagnostic Steps
1. Check External API changelogs for Acme Payments: Verify if an unapproved API breaking change was released (e.g., customer_id vs customerId).
2. Check recent deployments: Inspect deployment-v42.yaml and configs/payment-production.json for MaxPoolSize regressions.
3. Inspect Redis connection metrics: Look for pool saturation (e.g. 50/50 or 200/200 active connections).
4. Inspect ApiClient.cs error logs: Look for deserialization errors or HTTP 400 Bad Request responses from Acme Payments gateway.

## Remediation
- If API breaking change: Update ApiClient.cs request payload mapping to use new field name customerId, validate tests, and deploy.
- If Redis pool exhaustion: Revert MaxPoolSize to 200 in payment-production.json and restart pods.
