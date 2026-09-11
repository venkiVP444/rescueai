---
id: SVC-001
type: service
service: PaymentService
environment: production
timestamp: 2026-05-01T00:00:00Z
version: 1.8.2
tags: [service, payments, redis, pci, external-api]
---
# PaymentService Specification

Financial processing microservice:
- Endpoints: POST /api/payments/charge, POST /api/payments/authorize
- Downstream dependencies:
  1. Acme Payments External API v4 (via ApiClient.cs)
  2. Redis Cluster (distributed lock and token store)
- Callers: OrderService
- Failure Signatures:
  - HTTP 503: Occurs when Redis connection pool is starved OR when ApiClient fails contract validation with Acme Payments.
