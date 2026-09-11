---
id: ARCH-004
type: architecture
service: platform
environment: production
timestamp: 2026-04-01T00:00:00Z
version: 2.4.0
tags: [deployment, kubernetes, rollout, helm]
---
# Deployment Architecture

Acme Commerce runs microservices on Amazon EKS:
- Deployments track manifests in deployments/deployment-v*.yaml.
- Pods mount ConfigMaps mapped from configs/*.json.
- Recent deployment deployment-v42.yaml updated PaymentService configurations.
