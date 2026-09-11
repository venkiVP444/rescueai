# Rescue REST API Documentation

Base URL: `http://localhost:5105/api`

## Dashboard & System Status
- `GET /api/dashboard`: Returns overall health, autonomy mode, microservices status, Moss latency percentiles, and recent activities.
- `POST /api/dashboard/autonomy`: Sets global autonomy mode (`Observe`, `Recommend`, `Autonomous`).

## Demo Scenarios
- `POST /api/demo/scenario/api-incident`: Executes the P0 Killer Demo ("API Change → Production Incident").
- `POST /api/demo/scenario/production-incident`: Executes the Standalone Redis Pool Outage demo.
- `POST /api/demo/scenario/api-change`: Executes the Standalone API Breaking Change demo.
- `POST /api/demo/reset`: Resets all synthetic state to nominal health.

## Incidents
- `GET /api/incidents`: Lists all incidents.
- `GET /api/incidents/{id}`: Returns incident details, evidence graph, correlation explanation, patch, and validation report.
- `POST /api/incidents/simulate`: Simulates an incoming production incident.
- `POST /api/incidents/{id}/investigate`: Triggers AI investigation pipeline.
- `POST /api/incidents/{id}/approve`: Grants human approval, creates GitHub PR, deploys to staging, and verifies recovery.
- `POST /api/incidents/{id}/reject`: Rejects proposed patch.

## Moss Performance & Telemetry
- `GET /api/performance/moss`: Returns measured P50, P95, P99, query count, and query stream.
- `POST /api/performance/moss/benchmark`: Executes side-by-side benchmark comparison.
