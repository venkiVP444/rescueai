---
id: ARCH-003
type: architecture
service: PaymentService
environment: production
timestamp: 2026-03-10T00:00:00Z
version: 2.4.0
tags: [payment, architecture, redis, external-api, apiclient]
---
# PaymentService Architecture

PaymentService handles customer payment authorizations and charge requests.
- Integrates with external payment provider Acme Payments via ApiClient.cs.
- Calls Acme Payments API endpoint POST /v1/charges using payload structure with customer identifier.
- Uses Redis connection pool (RedisClient.cs) for distributed idempotency locks (RedLock) and token caching.
- Configuration for Redis connection pool is specified in configs/payment-production.json under RedisConfig.MaxPoolSize.
- If Redis pool is exhausted or external API responds with client/gateway errors, PaymentService returns HTTP 503 Service Unavailable.
