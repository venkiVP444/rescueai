---
id: CHG-2026-09
type: changelog
service: AcmePayments
environment: production
timestamp: 2026-09-06T10:00:00Z
version: v4.2
tags: [changelog, breaking-change, external-api, payments]
---
# Acme Payments API v4.2 Release Notes (BREAKING CHANGE)

**Release Date:** September 6, 2026 - 10:00:00 UTC  
**Provider:** Acme Payments Gateway  
**Impact Level:** HIGH (Breaking contract modification)  

## Breaking Changes
In accordance with our API modernization roadmap:
- The field `customer_id` has been deprecated and **REMOVED** from all charge and authorization endpoints (`POST /v1/charges`, `POST /v1/authorizations`).
- Consumers must send `customerId` (camelCase) instead.
- Requests still providing `customer_id` will be rejected with `HTTP 400 Bad Request: Missing required parameter customerId`.

## Affected Consumers in Acme Commerce
- `PaymentService` (`ApiClient.cs`, `PaymentService.cs`)
- `OrderService` (indirect consumer)
- `CheckoutService` (indirect consumer)
- 17 code usages across 3 services and 8 unit test fixtures.
