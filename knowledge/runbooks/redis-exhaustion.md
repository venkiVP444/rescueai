---
id: RBK-002
type: runbook
service: PaymentService
environment: production
timestamp: 2026-06-01T00:00:00Z
version: 1.1.0
tags: [runbook, redis, connection-pool, maxpoolsize]
---
# Runbook: Redis Connection Pool Exhaustion

## Diagnostic Signature
- Error in logs: `Timeout awaiting connection from Redis pool (MaxPoolSize reached)`.
- Concurrent requests exceed MaxPoolSize setting in configs/payment-production.json.

## Historical Context
- Incident INC-003 was caused by setting MaxPoolSize to 50 under high traffic load.
- Baseline recommended MaxPoolSize is 200.
