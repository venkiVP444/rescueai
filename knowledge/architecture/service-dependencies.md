---
id: ARCH-002
type: architecture
service: platform
environment: production
timestamp: 2026-02-01T00:00:00Z
version: 2.4.0
tags: [dependencies, topology, network]
---
# Service Dependencies
1. API Gateway -> OrderService, UserService
2. OrderService -> PaymentService, InventoryService
3. PaymentService -> Redis (distributed locks, rate-limits)
4. PaymentService -> PostgreSQL (payment transactions)
5. PaymentService -> External Payment API (Acme Payments v4.x gateway via ApiClient.cs)
6. OrderService -> NotificationService