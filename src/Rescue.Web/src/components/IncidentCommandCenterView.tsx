import React, { useState } from 'react';
import {
  ShieldAlert,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  GitPullRequest,
  Check,
  ChevronDown,
  ChevronUp,
  FileCode,
  Terminal,
  ExternalLink,
  Layers,
  Brain,
  Zap,
  Clock,
  Play,
  HelpCircle
} from 'lucide-react';
import { Incident } from '../types';

interface IncidentCommandCenterViewProps {
  incident?: Incident;
  onApproveAndDeploy: () => void;
  onReject?: () => void;
  onNavigateToEvidence: () => void;
  onNavigateToMemory: () => void;
  onTriggerDemo: () => void;
  loading: boolean;
}

export const IncidentCommandCenterView: React.FC<IncidentCommandCenterViewProps> = ({
  incident,
  onApproveAndDeploy,
  onReject,
  onNavigateToEvidence,
  onNavigateToMemory,
  onTriggerDemo,
  loading
}) => {
  const [showTechnicalDetails, setShowTechnicalDetails] = useState<boolean>(false);
  const [showCodeDiff, setShowCodeDiff] = useState<boolean>(false);

  if (!incident) {
    return (
      <div className="view-content-pane">
        <div className="empty-command-center">
          <div className="empty-center-icon">
            <CheckCircle style={{ width: 42, height: 42, color: '#059669' }} />
          </div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: '#0F172A', marginTop: 12 }}>
            No Active Incidents
          </h2>
          <p style={{ color: '#64748B', maxWidth: 450, margin: '8px auto 0' }}>
            All production services are running nominally. There are no outages requiring human sign-off.
          </p>
          <button
            onClick={onTriggerDemo}
            disabled={loading}
            className="btn-primary-action"
            style={{ marginTop: 20 }}
          >
            <Play style={{ width: 14, height: 14, fill: 'currentColor' }} />
            <span>{loading ? 'Simulating Outage...' : '⚡ Simulate Outage for Demo'}</span>
          </button>
        </div>
      </div>
    );
  }

  const isResolved = incident.status === 'Resolved';
  const isRejected = incident.status === 'Rejected' || incident.approval?.status === 'Rejected';
  const confidenceScore = incident.correlation?.score ?? 96;
  const beforeRate = incident.errorRateBefore ?? 42.0;
  const afterRate = incident.verification?.afterErrorRate ?? (isResolved ? 1.8 : undefined);
  const prNumber = incident.githubPr?.prNumber ?? 117;
  const branchName = incident.githubPr?.branchName ?? 'rescue/INC-105-api-migration';

  const unifiedDiff = incident.proposedPatch?.unifiedDiff || `--- a/src/PaymentService/Clients/AcmePaymentsClient.cs
+++ b/src/PaymentService/Clients/AcmePaymentsClient.cs
@@ -42,3 +42,3 @@
-    [JsonPropertyName("customer_id")]
-    public string CustomerId { get; set; }
+    [JsonPropertyName("customerId")]
+    public string CustomerId { get; set; }`;

  return (
    <div className="view-content-pane">
      {/* 1. Clear Header Area */}
      <div className="command-center-header">
        <div className="header-left-col">
          <div className="pane-breadcrumbs">
            <span>Production Engineering</span>
            <span>•</span>
            <span>Incident Command Center</span>
            <span>•</span>
            <span>{incident.service}</span>
          </div>
          <div className="title-with-badge-row">
            <h1 className="command-incident-title">
              {incident.id} — Payment Service API Failure
            </h1>
            <span className="badge-severity p1">P1 CRITICAL</span>
            <span className={`status-pill-lg ${isResolved ? 'healthy' : isRejected ? 'rejected' : 'attention'}`}>
              <span className="dot"></span>
              {isResolved ? '✓ Resolved & Verified' : isRejected ? '✕ Approval Rejected by SRE' : '⚠ Waiting for Your Approval'}
            </span>
          </div>
        </div>

        <div className="header-right-col">
          <div className="error-rate-indicator-box">
            <span className="rate-lbl">Customer Checkout Error Rate</span>
            <div className="rate-val-row">
              <span className={`rate-val ${isResolved ? 'strikethrough' : 'text-red'}`}>
                {beforeRate}% failing
              </span>
              {isResolved && afterRate !== undefined && (
                <>
                  <span className="rate-arrow">➔</span>
                  <span className="rate-val-recovered">{afterRate}% recovered</span>
                </>
              )}
            </div>
            <span className="rate-sub">
              {isResolved ? 'Recovered in Staging Sandbox (Synthetic Demo Telemetry)' : 'Synthetic Demo Telemetry'}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Executive "What you need to know in 5 seconds" Brief */}
      <div className="rescue-summary-card">
        <div className="summary-headline-row">
          <div className="summary-icon-box">
            <Zap style={{ width: 20, height: 20, color: '#D97706' }} />
          </div>
          <div>
            <div className="summary-statement">
              RESCUE identified an <strong>API contract change in v4.2</strong> as the root cause.
            </div>
            <div style={{ fontSize: 13, color: '#475569', marginTop: 3 }}>
              An external payment partner updated their API without notice, breaking checkout transactions. RESCUE generated and verified the fix.
            </div>
          </div>
        </div>

        <div className="summary-pills-row">
          <div className="summary-pill-item">
            <span className="pill-label">AI Confidence:</span>
            <span className="pill-value blue">{confidenceScore}%</span>
          </div>
          <div className="summary-pill-divider">•</div>
          <div className="summary-pill-item">
            <span className="pill-label">Past Solution Matched:</span>
            <span className="pill-value purple">INC-001 — 94% similarity</span>
          </div>
          <div className="summary-pill-divider">•</div>
          <div className="summary-pill-item">
            <span className="pill-label">Affected References:</span>
            <span className="pill-value">17</span>
          </div>
          <div className="summary-pill-divider">•</div>
          <div className="summary-pill-item">
            <span className="pill-label">Safety Tests:</span>
            <span className="pill-value green">8 of 8 passed (100%)</span>
          </div>
        </div>
      </div>

      {/* 3. Plain English Investigation Progress Stepper */}
      <div className="enterprise-card investigation-flow-card">
        <div className="card-section-title">RESOLUTION PROGRESSION (6 STEPS)</div>

        <div className="stepper-horizontal-flow">
          {/* Step 1: DETECTED */}
          <div className="flow-step completed">
            <div className="step-circle">
              <Check style={{ width: 14, height: 14 }} />
            </div>
            <div className="step-text-meta">
              <span className="step-stage-name">1. DETECTED</span>
              <span className="step-detail-label">Outage detected</span>
            </div>
          </div>
          <div className="flow-connector active"></div>

          {/* Step 2: CONNECTED */}
          <div className="flow-step completed">
            <div className="step-circle">
              <Check style={{ width: 14, height: 14 }} />
            </div>
            <div className="step-text-meta">
              <span className="step-stage-name">2. CONNECTED</span>
              <span className="step-detail-label">Partner API v4.2 correlated</span>
            </div>
          </div>
          <div className="flow-connector active"></div>

          {/* Step 3: ROOT CAUSE */}
          <div className="flow-step completed">
            <div className="step-circle">
              <Check style={{ width: 14, height: 14 }} />
            </div>
            <div className="step-text-meta">
              <span className="step-stage-name">3. ROOT CAUSE</span>
              <span className="step-detail-label">Field mismatch found</span>
            </div>
          </div>
          <div className="flow-connector active"></div>

          {/* Step 4: FIX GENERATED */}
          <div className="flow-step completed">
            <div className="step-circle">
              <Check style={{ width: 14, height: 14 }} />
            </div>
            <div className="step-text-meta">
              <span className="step-stage-name">4. FIX READY</span>
              <span className="step-detail-label">Code patch synthesized</span>
            </div>
          </div>
          <div className="flow-connector active"></div>

          {/* Step 5: VALIDATED */}
          <div className="flow-step completed">
            <div className="step-circle">
              <Check style={{ width: 14, height: 14 }} />
            </div>
            <div className="step-text-meta">
              <span className="step-stage-name">5. TESTED</span>
              <span className="step-detail-label">8/8 tests passed</span>
            </div>
          </div>
          <div className="flow-connector active"></div>

          {/* Step 6: APPROVAL */}
          <div className={`flow-step ${isResolved ? 'completed' : 'awaiting'}`}>
            <div className="step-circle">
              {isResolved ? (
                <Check style={{ width: 14, height: 14 }} />
              ) : (
                <AlertTriangle style={{ width: 14, height: 14 }} />
              )}
            </div>
            <div className="step-text-meta">
              <span className="step-stage-name">6. APPROVAL</span>
              <span className="step-detail-label">
                {isResolved ? 'Approved by SRE' : 'Awaiting your approval'}
              </span>
            </div>
          </div>
          <div className={`flow-connector ${isResolved ? 'active' : ''}`}></div>

          {/* Step 7: STAGING */}
          <div className={`flow-step ${isResolved ? 'completed' : 'pending'}`}>
            <div className="step-circle">
              {isResolved ? <Check style={{ width: 14, height: 14 }} /> : <span>○</span>}
            </div>
            <div className="step-text-meta">
              <span className="step-stage-name">7. ROLLOUT</span>
              <span className="step-detail-label">
                {isResolved ? 'Recovery confirmed' : 'Staging verification'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. "Why did this happen?" Plain English Section */}
      <div className="enterprise-card why-did-this-happen-card">
        <div className="card-header-clean">
          <div>
            <h3 className="section-card-title">Why did this happen?</h3>
            <p className="section-card-subtitle">
              Plain-English explanation derived from automated causal telemetry:
            </p>
          </div>
          <div className="card-actions-row">
            <button
              onClick={onNavigateToEvidence}
              className="btn-secondary-action"
              title="Inspect the 12-milestone evidence chain"
            >
              <Layers style={{ width: 14, height: 14 }} />
              <span>View full evidence chain</span>
            </button>
          </div>
        </div>

        <div className="findings-numbered-list">
          <div className="finding-item">
            <span className="finding-index">1</span>
            <div className="finding-text">
              <strong>External API update introduced a breaking change:</strong> Upstream Payment Gateway released version 4.2 and renamed field <code>customer_id</code> to <code>customerId</code>.
            </div>
          </div>

          <div className="finding-item">
            <span className="finding-index">2</span>
            <div className="finding-text">
              <strong>Your PaymentService was still expecting the old name:</strong> When customer payments came in, our application couldn&apos;t parse the customer identifier, causing transaction failures.
            </div>
          </div>

          <div className="finding-item">
            <span className="finding-index">3</span>
            <div className="finding-text">
              <strong>17 downstream code references were affected:</strong> The checkout payment pipeline failed to receive the required account reference.
            </div>
          </div>

          <div className="finding-item">
            <span className="finding-index">4</span>
            <div className="finding-text">
              <strong>Production 503 errors began right after their update:</strong> Anomaly detection matched the spike initiation timestamp exactly with the partner&apos;s v4.2 deployment.
            </div>
          </div>

          <div className="finding-item">
            <span className="finding-index">5</span>
            <div className="finding-text">
              <strong>Past incident INC-001 had the exact same pattern:</strong> RESCUE recalled how a similar field rename was solved previously, enabling instant automated fix generation.
            </div>
          </div>
        </div>

        {/* Technical Details Progressive Disclosure for Engineers */}
        <div className="technical-details-wrapper">
          <button
            onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
            className="btn-toggle-technical"
          >
            {showTechnicalDetails ? <ChevronUp style={{ width: 14, height: 14 }} /> : <ChevronDown style={{ width: 14, height: 14 }} />}
            <span>{showTechnicalDetails ? 'Hide technical logs' : 'Show technical logs & raw telemetry (For Engineers)'}</span>
          </button>

          {showTechnicalDetails && (
            <div className="technical-details-content">
              <div className="tech-section-block">
                <div className="tech-block-title">Application Exception Logs</div>
                <div className="code-box-log">
                  <div>14:32:01.402 [ERROR] PaymentService: System.Text.Json.JsonException: The JSON property &apos;customer_id&apos; was not found in response payload.</div>
                  <div>14:32:02.109 [ERROR] AcmePaymentsClient: External gateway returned HTTP 400 Bad Request. Auth token: [REDACTED_API_KEY]</div>
                  <div>14:32:03.581 [CRITICAL] CheckoutController: 503 Service Unavailable surfaced to checkout API.</div>
                </div>
              </div>

              <div className="tech-section-block" style={{ marginTop: 12 }}>
                <div className="tech-block-title">Telemetry &amp; Retrieval Metadata</div>
                <div className="metadata-kv-grid">
                  <div><strong>Correlation Engine:</strong> Deterministic Rule + Semantic Hybrid</div>
                  <div><strong>Moss Hardware Timing:</strong> 1.86 ms (Stopwatch.GetTimestamp())</div>
                  <div><strong>Precedent Memory ID:</strong> INC-001 (Match Confidence: 94.2%)</div>
                  <div><strong>Security Filter:</strong> Sensitive tokens automatically [REDACTED]</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 5. Recommended Fix & Validation Section */}
      <div className="enterprise-card fix-validation-card">
        <div className="card-header-clean">
          <div>
            <div className="status-badge-inline green">Status: Validated &amp; Ready</div>
            <h3 className="section-card-title" style={{ marginTop: 4 }}>Recommended Safe Code Fix</h3>
            <p className="section-card-subtitle">
              Automated 1-line update to <code>ApiClient.cs</code> to align with the payment partner&apos;s new schema.
            </p>
          </div>

          <div className="card-actions-row">
            <button
              onClick={() => setShowCodeDiff(!showCodeDiff)}
              className="btn-secondary-action"
            >
              <FileCode style={{ width: 14, height: 14 }} />
              <span>{showCodeDiff ? 'Hide code diff' : 'Review code diff'}</span>
            </button>
            {!isResolved && !isRejected && (
              <button
                onClick={onApproveAndDeploy}
                className="btn-primary-action"
                title="Approve and roll out to staging"
              >
                <CheckCircle style={{ width: 15, height: 15 }} />
                <span>Approve Fix &amp; Deploy</span>
              </button>
            )}
          </div>
        </div>

        <div className="fix-metrics-ribbon">
          <div className="fix-stat-item">
            <span className="stat-label">Files Changed:</span>
            <span className="stat-value">1 file (ApiClient.cs)</span>
          </div>
          <div className="fix-stat-divider">•</div>
          <div className="fix-stat-item">
            <span className="stat-label">Safety Tests Passed:</span>
            <span className="stat-value green">8 of 8 passed (100%)</span>
          </div>
          <div className="fix-stat-divider">•</div>
          <div className="fix-stat-item">
            <span className="stat-label">Validation Result:</span>
            <span className="stat-value green">PASSED</span>
          </div>
          <div className="fix-stat-divider">•</div>
          <div className="fix-stat-item">
            <span className="stat-label">Deployment Risk:</span>
            <span className="stat-value blue">Low (Isolated field rename)</span>
          </div>
        </div>

        {/* Collapsible Unified Diff */}
        {showCodeDiff && (
          <div className="code-diff-container">
            <div className="diff-header-bar">
              <span>Target File: <code>src/PaymentService/Clients/AcmePaymentsClient.cs</code></span>
              <span className="syntax-verified-tag">✓ Syntax Valid • 0 Secrets Exposed</span>
            </div>
            <div className="diff-body-lines">
              {unifiedDiff.split('\n').map((line, idx) => {
                let rowCls = 'diff-row ctx';
                if (line.startsWith('+')) rowCls = 'diff-row add';
                else if (line.startsWith('-')) rowCls = 'diff-row del';
                else if (line.startsWith('@@')) rowCls = 'diff-row hunk';
                return (
                  <div key={idx} className={rowCls}>
                    {line}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* 6. Human Approval Gate Section (Primary Action) */}
      {isRejected ? (
        <div className="enterprise-card approval-gate-card" style={{ borderColor: '#EF4444', background: '#FEF2F2' }}>
          <div className="gate-header-area">
            <div className="gate-title-block">
              <ShieldAlert style={{ width: 24, height: 24, color: '#DC2626' }} />
              <div>
                <h3 className="gate-title" style={{ color: '#991B1B' }}>Approval Rejected by Human Operator</h3>
                <p className="gate-subtitle" style={{ color: '#B91C1C' }}>
                  Deployment halted and pull request execution cancelled. No changes will be applied to production or staging.
                </p>
              </div>
            </div>
            <span className="gate-security-badge" style={{ background: '#FEE2E2', color: '#991B1B', borderColor: '#FCA5A5' }}>
              Execution Prevented
            </span>
          </div>
          <div className="gate-disclaimer-box" style={{ background: '#FFF', borderColor: '#FECACA', color: '#7F1D1D', marginTop: 14 }}>
            <strong>Operator Decision:</strong> &ldquo;{incident.approval?.decisionNotes || 'Rejected by SRE for further analysis'}&rdquo;
          </div>
        </div>
      ) : !isResolved ? (
        <div className="enterprise-card approval-gate-card">
          <div className="gate-header-area">
            <div className="gate-title-block">
              <ShieldAlert style={{ width: 24, height: 24, color: '#2563EB' }} />
              <div>
                <h3 className="gate-title">Human Sign-Off Required Before Action</h3>
                <p className="gate-subtitle">
                  RESCUE will create a GitHub Pull Request and verify recovery in your staging sandbox.
                </p>
              </div>
            </div>
            <span className="gate-security-badge">Safety Guardrail Active</span>
          </div>

          <div className="gate-review-grid">
            <div className="review-spec-item">
              <span className="spec-name">Problem</span>
              <span className="spec-val">Payment Partner API mismatch</span>
            </div>
            <div className="review-spec-item">
              <span className="spec-name">Proposed Fix</span>
              <span className="spec-val">Update client field to &apos;customerId&apos;</span>
            </div>
            <div className="review-spec-item">
              <span className="spec-name">Verification</span>
              <span className="spec-val green">8/8 automated tests passed</span>
            </div>
            <div className="review-spec-item">
              <span className="spec-name">Expected Result</span>
              <span className="spec-val">Checkouts restored to 100% success</span>
            </div>
            <div className="review-spec-item">
              <span className="spec-name">Risk Level</span>
              <span className="spec-val blue">Low</span>
            </div>
          </div>

          <div className="gate-disclaimer-box">
            <strong>Safety Guarantee:</strong> &ldquo;RESCUE will not make production changes without your explicit approval.&rdquo;
          </div>

          <div className="gate-actions-row">
            {onReject && (
              <button onClick={onReject} className="btn-reject-action" title="Reject this patch">
                <span>Reject Patch</span>
              </button>
            )}
            <button
              onClick={onApproveAndDeploy}
              className="btn-approve-primary pulse"
              title="Authorize RESCUE to apply this fix and verify recovery"
            >
              <CheckCircle style={{ width: 16, height: 16 }} />
              <span>Approve Fix &amp; Deploy to Staging ➔</span>
            </button>
          </div>
        </div>
      ) : (
        /* 7. Deployment Recovery Confirmation Section (When Resolved) */
        <div className="enterprise-card deployment-verification-card">
          <div className="card-header-clean">
            <div>
              <div className="status-badge-inline green">✓ Recovery Confirmed &amp; Verified</div>
              <h3 className="section-card-title" style={{ marginTop: 4 }}>
                Deployment Verification Summary
              </h3>
              <p className="section-card-subtitle">
                The hotfix was deployed to staging and telemetry confirmed error recovery.
              </p>
            </div>
          </div>

          <div className="deployment-meta-row">
            <div className="dep-meta-block">
              <span className="dep-lbl">GitHub Pull Request:</span>
              <span className="dep-val pr">
                <GitPullRequest style={{ width: 14, height: 14 }} />
                <span>PR #{prNumber} (Sandbox / Demo Mode)</span>
              </span>
            </div>
            <div className="dep-meta-block">
              <span className="dep-lbl">Branch:</span>
              <span className="dep-val branch"><code>{branchName}</code></span>
            </div>
            <div className="dep-meta-block">
              <span className="dep-lbl">Status:</span>
              <span className="status-chip resolved">Created &amp; Verified</span>
            </div>
          </div>

          <div className="staging-comparison-box">
            <div className="comp-title">Staging recovery verification (Synthetic Demo Telemetry)</div>
            <div className="comp-columns">
              <div className="comp-col before">
                <span className="comp-col-lbl">Before Fix:</span>
                <span className="comp-rate text-red">{beforeRate}% failing</span>
              </div>
              <div className="comp-arrow">➔</div>
              <div className="comp-col after">
                <span className="comp-col-lbl">After Fix:</span>
                <span className="comp-rate green">{afterRate ?? 1.8}% normal baseline</span>
              </div>
              <div className="comp-result-badge">
                <CheckCircle style={{ width: 16, height: 16, color: '#059669' }} />
                <span>Service Restored (95.7% Error Reduction)</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
