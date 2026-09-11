---
id: ARCH-001
type: architecture
service: platform
environment: production
timestamp: 2026-01-15T00:00:00Z
version: 2.4.0
tags: [architecture, overview, topology, microservices]
---

# Acme Commerce Architecture Overview

Acme Commerce is an e-commerce platform built as an event-driven microservices architecture hosted on Kubernetes.

## Core Microservices
1. **API Gateway**: Edge routing, TLS termination, authentication forwarding, and rate limiting.
2. **OrderService**: Manages checkout lifecycle, shopping cart conversion, and order state machines.
3. **PaymentService**: Processes transactions, coordinates authorization with external payment gateways (Acme Payments API), manages idempotency, and utilizes Redis for high-speed distributed locking and session tokens.
4. **InventoryService**: Real-time stock reservation, warehouse allocations, and replenishment tracking.
5. **UserService / CustomerService**: Identity, preferences, customer profiles, and authentication credentials.
6. **NotificationService**: Asynchronous transactional notifications via email, SMS, and push channels.

## Shared Infrastructure
- **Redis Cluster**: Session caching, payment rate-limiting tokens, distributed locks (`RedLock`), and real-time fraud scoring state.
- **PostgreSQL**: ACID persistence for orders, payment ledgers, and inventory records.
- **RabbitMQ**: Asynchronous message bus for event fanout (`order.created`, `payment.authorized`, `inventory.reserved`).
- **Kubernetes (EKS)**: Deployment platform with horizontal pod autoscaling (HPA).
