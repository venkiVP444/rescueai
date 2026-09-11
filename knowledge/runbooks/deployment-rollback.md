---
id: RBK-003
type: runbook
service: platform
environment: production
timestamp: 2026-06-01T00:00:00Z
version: 1.0.0
tags: [runbook, rollback, kubernetes, deployment]
---
# Runbook: Deployment Rollback

To rollback a Kubernetes deployment:
```bash
kubectl rollout undo deployment/payment-service -n production
```
Or revert the configuration patch in configs/payment-production.json.
