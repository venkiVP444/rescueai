# 3-Minute Hackathon Demo Script

**Scenario:** "API Change → Production Incident" (Rescue's Unified P0 Killer Demo)

---

### Minute 0:00 - 0:45: Introduction & Monitoring Mode
- **Speaker:**
  > "Welcome to Acme Commerce. Our microservices are humming along normally, and Rescue—our autonomous AI Production Engineer—is watching in the background. Notice the mode selector is set to **RECOMMEND**, meaning Rescue will investigate, fix, and validate, but will never modify production without explicit human permission."
- **Action:**
  - Show the Command Center dashboard with all green services.
  - Point to the **Moss Latency** meter: actual hardware-timed retrieval at 2.1 ms.

---

### Minute 0:45 - 1:30: The Upstream API Breaking Change
- **Speaker:**
  > "At 10:00, our upstream payment provider, Acme Payments, releases API v4.2. They deprecate `customer_id` and mandate `customerId`. Rescue immediately detects the change. Through Moss, it searches our entire codebase and finds 17 affected references across 3 services and 8 tests. Rescue prepares a migration PR, but let's assume the development team is busy and leaves it unapproved."
- **Action:**
  - Click **Play Killer Demo**.
  - Show the initial API change detection and Moss retrieval activity.

---

### Minute 1:30 - 2:15: Production Breaks — "Rescue Connected the Dots"
- **Speaker:**
  > "10 minutes later, production PaymentService begins failing. Inbound checkout errors spike to 42% with HTTP 503 errors. Rescue wakes up automatically. It queries Moss, searches logs, deployments, and recent changes. And here is the killer capability: Rescue runs its Incident Correlation Engine and connects the live incident to the unapproved API change!"
- **Action:**
  - The screen highlights: **RESCUE CONNECTED THE DOTS**.
  - Walk through the 5 correlation reasons.
  - Show the interactive Multi-Event Evidence DAG from API Change → ApiClient.cs → 503 Incident → Root Cause.

---

### Minute 2:15 - 3:00: Validated Fix, Human Approval, and Verification
- **Speaker:**
  > "Rescue shows the exact unified diff in `ApiClient.cs`—renaming `customer_id` to `customerId`. It ran 8 unit tests, and all 8 passed. It classifies the risk as LOW and includes a complete rollback plan. Now, it waits for my approval. I click 'Approve & Deploy'. Rescue creates GitHub PR #42, deploys to our staging sandbox, and verifies our live telemetry: error rate drops from 42% back down to 1.8%. Incident Resolved!"
- **Action:**
  - Open the Fix Inspector modal and show the unified diff and 8/8 tests passed.
  - Click **Approve & Create GitHub PR**.
  - Show the staging deployment progress and verified recovery chart.
  - Banner confirms: **✓ INCIDENT RESOLVED**.
