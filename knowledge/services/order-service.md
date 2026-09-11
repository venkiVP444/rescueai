---
id: SVC-002
type: service
service: OrderService
environment: production
timestamp: 2026-05-01T00:00:00Z
version: 2.1.0
tags: [service, orders, checkout]
---
# OrderService Specification

Coordinates customer checkout:
- Calls PaymentService synchronously.
- When PaymentService returns 503, OrderService raises OrderPaymentFailedException and reports 42% transaction failure rate during outages.
