import React, { useState } from 'react';
import {
  ShieldAlert,
  CheckCircle,
  FileCode,
  Terminal,
  Clock,
  ArrowRight,
  GitPullRequest,
  Check,
  AlertTriangle,
  Server,
  Activity,
  Cpu,
  ExternalLink,
  Brain,
  Layers,
  ChevronRight,
  Sparkles,
  GitCommit,
  XCircle,
  Maximize2
} from 'lucide-react';
import { Incident, MossObservabilityStats } from '../types';

interface ConnectedTheDotsViewProps {
  incident?: Incident;
  mossStats?: MossObservabilityStats;
  onOpenFixModal: () => void;
  onApproveAndDeploy: () => void;
  onReject?: () => void;
}

export const ConnectedTheDotsView: React.FC<ConnectedTheDotsViewProps> = ({
  incident,
  mossStats,
  onOpenFixModal,
  onApproveAndDeploy,
  onReject
}) => {
  const [selectedTab, setSelectedTab] = useState<'diff' | 'tests' | 'logs'>('diff');
  const [selectedDagNodeId, setSelectedDagNodeId] = useState<string>('n9');
  const [isMemoryModalOpen, setIsMemoryModalOpen] = useState<boolean>(false);
  const [showFullDag, setShowFullDag] = useState<boolean>(false);

  if (!incident || !incident.correlation) {
    return (
      <div className="empty-incident-state">
        <div className="empty-state-icon">
          <CheckCircle style={{ width: 28, height: 28 }} />
        </div>
        <h3>No Active Production Incidents</h3>
        <p>
          RESCUE is passively monitoring upstream OpenAPI contracts, anomaly thresholds, and application logs.
        </p>
        <div className="empty-state-hint">
          Click <strong>"⚡ Run Demo (P0)"</strong> in the top header to trigger a live breaking change outage and watch RESCUE connect the dots.
        </div>
      </div>
    );
  }

  const { correlation, proposedPatch, validationReport, approval, verification, investigation } = incident;
  const isResolved = incident.status === 'Resolved';
  const similarMemory = investigation?.similarMemoryMatch;
  const dagNodes = investigation?.evidenceGraph?.nodes || [];
  const selectedNode = dagNodes.find(n => n.id === selectedDagNodeId) || dagNodes[0];

  // Simplified 5-stage landmark story
  const landmarkStages = [
    { step: 1, type: 'UPSTREAM RELEASE', title: 'Acme Payments v4.2', sub: 'External gateway deployed' },
    { step: 2, type: 'CONTRACT DRIFT', title: 'customer_id → customerId', sub: 'Required field renamed' },
    { step: 3, type: 'PRODUCTION OUTAGE', title: 'HTTP 503 Surge (42%)', sub: 'PaymentService failing' },
    { step: 4, type: 'RESCUE REMEMBERS', title: 'Matched INC-001 (94%)', sub: 'Historical memory recalled' },
    { step: 5, type: 'HOTFIX PREPARED', title: 'ApiClient.cs Patched', sub: '8/8 tests verified safe' },
  ];

  return (
    <div className="incident-view-container">
      {/* ========================================================================= */}
      {/* 1. GUIDED ACTION PIPELINE (Hero Step-by-Step Status & Primary Action)    */}
      {/* ========================================================================= */}
      <div className={`incident-workflow-banner ${isResolved ? 'resolved' : 'action-required'}`}>
        <div className="workflow-status-header">
          <div className="workflow-header-left">
            <span className={`status-pill ${isResolved ? 'resolved' : 'critical'}`}>
              {isResolved ? '✓ INCIDENT RESOLVED & VERIFIED' : '🚨 ACTION REQUIRED — PENDING HUMAN SIGN-OFF'}
            </span>
            <h2 className="workflow-title">
              {isResolved
                ? `${incident.service} Successfully Recovered via Automated Patch`
                : `${incident.title}`}
            </h2>
            <p className="workflow-subtitle">
              {isResolved
                ? `Staging deployment verified. Error rate dropped from ${verification?.beforeErrorRate ?? 42.0}% to ${verification?.afterErrorRate ?? 1.8}%. Pull request #${incident.githubPr?.prNumber ?? '114'} is ready for production merge.`
                : `Rescue connected upstream API contract drift to this 503 surge, proved the root cause, and verified 8/8 regression tests. Review and authorize the staging rollout below.`}
            </p>
          </div>

          <div className="workflow-header-right">
            {!isResolved ? (
              <div className="action-button-group">
                <button onClick={onOpenFixModal} className="btn-secondary-action" title="Inspect unified diff">
                  <FileCode style={{ width: 14, height: 14 }} />
                  <span>Inspect Code Diff</span>
                </button>
                <button onClick={onApproveAndDeploy} className="btn-primary-action pulse" title="Deploy fix to staging sandbox">
                  <CheckCircle style={{ width: 16, height: 16 }} />
                  <span>Approve &amp; Deploy Fix</span>
                </button>
                {onReject && (
                  <button onClick={onReject} className="btn-reject-action" title="Reject patch">
                    <XCircle style={{ width: 14, height: 14 }} />
                  </button>
                )}
              </div>
            ) : (
              <div className="resolved-status-box">
                <span className="recovery-metric">
                  <strong>{verification?.beforeErrorRate ?? 42.0}%</strong> → <strong className="green">{verification?.afterErrorRate ?? 1.8}%</strong>
                </span>
                <span className="recovery-label">Error Rate Mitigated</span>
                {incident.githubPr && (
                  <span className="pr-tag">
                    <GitPullRequest style={{ width: 12, height: 12 }} />
                    PR #{incident.githubPr.prNumber}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* 4-Stage Visual Progress Ribbon */}
        <div className="workflow-stepper">
          <div className="stepper-step completed">
            <div className="step-badge">1</div>
            <div className="step-content">
              <span className="step-name">1. Detection</span>
              <span className="step-desc">42% 503 Spikes Detected</span>
            </div>
          </div>
          <div className="stepper-divider completed"></div>

          <div className="stepper-step completed">
            <div className="step-badge">2</div>
            <div className="step-content">
              <span className="step-name">2. Root Cause Proved</span>
              <span className="step-desc">API v4.2 Contract Drift</span>
            </div>
          </div>
          <div className="stepper-divider completed"></div>

          <div className="stepper-step completed">
            <div className="step-badge">3</div>
            <div className="step-content">
              <span className="step-name">3. Fix Validated</span>
              <span className="step-desc">8/8 Tests Passed (100%)</span>
            </div>
          </div>
          <div className="stepper-divider completed"></div>

          <div className={`stepper-step ${isResolved ? 'completed' : 'current'}`}>
            <div className="step-badge">{isResolved ? '✓' : '4'}</div>
            <div className="step-content">
              <span className="step-name">4. Human Sign-Off</span>
              <span className="step-desc">{isResolved ? 'Verified in Staging' : 'Ready for Approval'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. THE 4 PILLARS (Executive Incident Brief - Explain Like I'm 5)          */}
      {/* ========================================================================= */}
      <div className="incident-brief-grid">
        <div className="brief-card problem">
          <div className="brief-card-header">
            <AlertTriangle style={{ width: 15, height: 15, color: 'var(--sev1-red)' }} />
            <span>1. What Broke?</span>
          </div>
          <div className="brief-card-body">
            <h4>PaymentService HTTP 503 Spike</h4>
            <p>
              Inbound checkout payment gateway calls are failing with HTTP 503. Transaction error rate jumped from <strong>0.2% to 42.0%</strong>.
            </p>
          </div>
        </div>

        <div className="brief-card cause">
          <div className="brief-card-header">
            <ArrowRight style={{ width: 15, height: 15, color: 'var(--sev2-amber)' }} />
            <span>2. Why It Broke (Proof)</span>
          </div>
          <div className="brief-card-body">
            <h4>Acme Payments v4.2 Release</h4>
            <p>
              External payment gateway released API v4.2 10 mins ago, renaming required field <code>customer_id</code> → <code>customerId</code>.
            </p>
          </div>
        </div>

        <div className="brief-card memory">
          <div className="brief-card-header">
            <Brain style={{ width: 15, height: 15, color: '#C084FC' }} />
            <span>3. Rescue Remembers</span>
          </div>
          <div className="brief-card-body">
            <h4>Matched Incident INC-001 (94%)</h4>
            <p>
              RESCUE recalled identical failure from SQLite memory. Prior fix to <code>ApiClient.cs</code> resolved outage with 1.6% residual error.
            </p>
          </div>
        </div>

        <div className="brief-card fix">
          <div className="brief-card-header">
            <CheckCircle style={{ width: 15, height: 15, color: 'var(--healthy-green)' }} />
            <span>4. Safe Remediation</span>
          </div>
          <div className="brief-card-body">
            <h4>Roslyn-Verified Code Patch</h4>
            <p>
              Patch generated in <code>ApiClient.cs</code>. <strong>8/8 unit tests passed</strong>, 0 secrets detected, ready for sandbox deployment.
            </p>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. CAUSAL EVIDENCE (Storyline vs 17-Node Telemetry Graph)                  */}
      {/* ========================================================================= */}
      <div className="dag-section-card">
        <div className="dag-section-header">
          <div className="dag-section-title">
            <Layers style={{ width: 16, height: 16, color: 'var(--info-cyan)' }} />
            <span>Causal Evidence Chain</span>
            <span className="dag-count-badge">
              {showFullDag ? '17 Detailed Telemetry Nodes' : '5 Core Causal Milestones'}
            </span>
          </div>

          <div className="dag-section-actions">
            <button
              onClick={() => setShowFullDag(!showFullDag)}
              className="btn-toggle-view"
            >
              {showFullDag ? '← Show Simple 5-Stage Story' : '🔍 Inspect Full 17-Node Telemetry DAG'}
            </button>
          </div>
        </div>

        {!showFullDag ? (
          /* Simplified 5-Stage Storyline (Zero Confusion) */
          <div className="landmark-story-strip">
            {landmarkStages.map((stage, idx) => (
              <React.Fragment key={stage.step}>
                <div className={`landmark-stage-box ${isResolved ? 'resolved' : ''} ${stage.step === 4 ? 'memory' : ''}`}>
                  <div className="stage-top">
                    <span className="stage-type">{stage.type}</span>
                    <span className="stage-num">#{stage.step}</span>
                  </div>
                  <div className="stage-title">{stage.title}</div>
                  <div className="stage-sub">{stage.sub}</div>
                </div>
                {idx < landmarkStages.length - 1 && (
                  <div className="stage-connector">
                    <ChevronRight style={{ width: 16, height: 16 }} />
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        ) : (
          /* Full 17-Node Detailed Telemetry DAG */
          <div>
            <div className="dag-scroll-container">
              {dagNodes.map((node, index) => {
                const isSelected = node.id === selectedDagNodeId;
                const isHighlight = node.id === 'n9';

                return (
                  <React.Fragment key={node.id}>
                    <div
                      onClick={() => setSelectedDagNodeId(node.id)}
                      className={`dag-node-card ${isSelected ? 'selected' : ''} ${isResolved ? 'resolved' : ''} ${isHighlight ? 'active-step' : ''}`}
                    >
                      <div className="dag-node-header">
                        <span className="dag-node-type">{node.nodeType}</span>
                        <span className="dag-node-idx">#{index + 1}</span>
                      </div>
                      <div className="dag-node-title">{node.label}</div>
                      <div className="dag-node-sub">{node.subtitle}</div>
                    </div>
                    {index < dagNodes.length - 1 && (
                      <span className="dag-connector">
                        <ChevronRight style={{ width: 13, height: 13 }} />
                      </span>
                    )}
                  </React.Fragment>
                );
              })}
            </div>

            {selectedNode && (
              <div className="dag-inspector-bar">
                <div>
                  <strong style={{ color: 'var(--info-cyan)' }}>Node #{selectedNode.id} [{selectedNode.nodeType}]:</strong>{' '}
                  <span style={{ color: '#FFF', fontWeight: 600 }}>{selectedNode.label}</span> —{' '}
                  <span style={{ color: 'var(--text-secondary)' }}>{selectedNode.snippet}</span>
                </div>
                <span className="status-chip">{selectedNode.subtitle}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 4. TWO-COLUMN INVESTIGATION & OPERATIONS WORKBENCH                        */}
      {/* ========================================================================= */}
      <div className="two-col-layout">
        {/* Left Column: Proposed Fix Diff & Validations */}
        <div className="layout-col-main">
          {/* Tabbed Code Diff & Tests */}
          <div className="sre-panel">
            <div className="sre-panel-header">
              <div className="tabs-header-nav">
                <button
                  onClick={() => setSelectedTab('diff')}
                  className={`tab-btn ${selectedTab === 'diff' ? 'active' : ''}`}
                >
                  <FileCode style={{ width: 14, height: 14 }} />
                  <span>Proposed Code Fix (Diff)</span>
                </button>
                <button
                  onClick={() => setSelectedTab('tests')}
                  className={`tab-btn ${selectedTab === 'tests' ? 'active' : ''}`}
                >
                  <CheckCircle style={{ width: 14, height: 14 }} />
                  <span>Validation Test Suite ({validationReport?.passedTests ?? 8}/8)</span>
                </button>
                <button
                  onClick={() => setSelectedTab('logs')}
                  className={`tab-btn ${selectedTab === 'logs' ? 'active' : ''}`}
                >
                  <Terminal style={{ width: 14, height: 14 }} />
                  <span>Telemetry Logs</span>
                </button>
              </div>

              <span className="panel-meta-tag">
                {selectedTab === 'diff' ? 'Target: ApiClient.cs' : selectedTab === 'tests' ? '8 Tests Verified' : 'Live Stream'}
              </span>
            </div>

            <div className="sre-panel-body">
              {/* TAB 1: CODE DIFF */}
              {selectedTab === 'diff' && proposedPatch && (
                <div>
                  <div className="diff-viewer">
                    <div className="diff-toolbar">
                      <span><strong>File:</strong> {proposedPatch.filePath}</span>
                      <span className="diff-badge green">✓ Roslyn Syntax Valid • 0 Secrets</span>
                    </div>
                    <div className="diff-code-body">
                      {proposedPatch.unifiedDiff.split('\n').map((line, idx) => {
                        let cls = 'diff-line-row ctx';
                        if (line.startsWith('+')) cls = 'diff-line-row add';
                        else if (line.startsWith('-')) cls = 'diff-line-row del';
                        else if (line.startsWith('@@')) cls = 'diff-line-row hunk';

                        return (
                          <div key={idx} className={cls}>
                            {line}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <div className="patch-explanation-box">
                    <strong>Explanation: </strong> {proposedPatch.explanation}
                  </div>
                </div>
              )}

              {/* TAB 2: TEST MATRIX */}
              {selectedTab === 'tests' && (
                <div>
                  <table className="test-matrix-table">
                    <thead>
                      <tr>
                        <th>Test Name</th>
                        <th>Target Suite</th>
                        <th>Duration</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { name: 'AcmePaymentsClientTests.Should_Serialize_CustomerId_Correctly', domain: 'PaymentService.Tests', time: '14 ms', status: 'PASS' },
                        { name: 'PaymentProcessorTests.Should_Process_Payment_Successfully', domain: 'PaymentService.Tests', time: '22 ms', status: 'PASS' },
                        { name: 'CheckoutServiceTests.Should_Handle_Payment_Completion', domain: 'OrderService.Tests', time: '18 ms', status: 'PASS' },
                        { name: 'WebhookHandlerTests.Should_Receive_V4_Webhook', domain: 'PaymentService.Tests', time: '11 ms', status: 'PASS' },
                        { name: 'ContractDriftTests.Ensure_No_Deprecated_Properties', domain: 'Integration.Tests', time: '29 ms', status: 'PASS' },
                        { name: 'RedisConnectionTests.Pool_Recovery_Under_Load', domain: 'Infrastructure.Tests', time: '16 ms', status: 'PASS' },
                        { name: 'OrderFulfillmentTests.Cart_Checkout_E2E', domain: 'OrderService.Tests', time: '35 ms', status: 'PASS' },
                        { name: 'AuthTokenTests.Should_Refresh_External_Credentials', domain: 'Security.Tests', time: '12 ms', status: 'PASS' }
                      ].map((t, i) => (
                        <tr key={i}>
                          <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{t.name}</td>
                          <td style={{ color: 'var(--text-secondary)' }}>{t.domain}</td>
                          <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-tertiary)' }}>{t.time}</td>
                          <td>
                            <span className="test-pass-pill">✓ {t.status}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* TAB 3: LOG STREAM */}
              {selectedTab === 'logs' && (
                <div className="log-stream">
                  {[
                    { ts: '10:04:12.418', lvl: 'ERROR', msg: 'System.Text.Json.JsonException: Required property \'customerId\' missing from payload.' },
                    { ts: '10:04:12.420', lvl: 'ERROR', msg: 'AcmePaymentsClient.cs:42: External gateway returned HTTP 400 Bad Request.' },
                    { ts: '10:04:13.104', lvl: 'ERROR', msg: 'PaymentProcessor.cs:118: Gateway timeout. Marking transaction failed (TX-98402).' },
                    { ts: '10:04:13.150', lvl: 'WARN', msg: 'RedisPool.cs:72: Active connection pool reached capacity limit (200/200).' },
                    { ts: '10:04:13.201', lvl: 'ERROR', msg: 'OrderService.cs:88: HTTP 503 Service Unavailable received from PaymentService.' },
                    { ts: '10:04:14.005', lvl: 'INFO', msg: 'Rescue Watcher: Prometheus threshold breach detected (Error rate > 5%).' },
                    { ts: '10:04:14.008', lvl: 'INFO', msg: 'Rescue Moss: Fast hybrid semantic search matched 4 documents.' },
                    { ts: '10:04:14.015', lvl: 'INFO', msg: 'Rescue Core: Correlated incident INC-105 with Acme Payments v4.2 release.' }
                  ].map((row, i) => (
                    <div key={i} className="log-row">
                      <span className="log-ts">{row.ts}</span>
                      <span className={`log-lvl ${row.lvl.toLowerCase()}`}>[{row.lvl}]</span>
                      <span className="log-msg">{row.msg}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Staging Sandbox Telemetry Recovery (When resolved) */}
          {isResolved && verification && (
            <div className="sre-panel recovery-verified-panel">
              <div className="sre-panel-header">
                <div className="sre-panel-title">
                  <CheckCircle style={{ width: 15, height: 15, color: 'var(--healthy-green)' }} />
                  <span>Staging Sandbox SLO Telemetry Recovery</span>
                </div>
                <span className="badge-slo-pass">PASSED ALL SLO GATES</span>
              </div>
              <div className="sre-panel-body">
                <div className="rc-summary-grid">
                  <div className="rc-stat-box">
                    <div className="rc-stat-label">HTTP 503 Error Rate</div>
                    <div className="rc-stat-val green">
                      {verification.beforeErrorRate}% → {verification.afterErrorRate}%
                    </div>
                    <div className="rc-stat-sub">-95.7% Recovery Verified</div>
                  </div>
                  <div className="rc-stat-box">
                    <div className="rc-stat-label">P99 Payment Latency</div>
                    <div className="rc-stat-val cyan">
                      {verification.beforeLatencyMs} ms → {verification.afterLatencyMs} ms
                    </div>
                    <div className="rc-stat-sub">Nominal Response Restored</div>
                  </div>
                  <div className="rc-stat-box">
                    <div className="rc-stat-label">Redis Connection Pool</div>
                    <div className="rc-stat-val">
                      {verification.beforeActiveConnections} → {verification.afterActiveConnections} / 200
                    </div>
                    <div className="rc-stat-sub">Connection Pool Stabilized</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Human Sign-Off Gate & Historical Memory */}
        <div className="layout-col-sidebar">
          {/* HUMAN SIGN-OFF CARD */}
          <div className="sre-panel signoff-card">
            <div className="sre-panel-header">
              <div className="sre-panel-title">
                <ShieldAlert style={{ width: 14, height: 14, color: isResolved ? 'var(--healthy-green)' : 'var(--sev1-red)' }} />
                <span>Human SRE Sign-Off Gate</span>
              </div>
              <span className={`status-chip ${isResolved ? 'resolved' : 'pending'}`}>
                {isResolved ? 'Approved' : 'Pending Sign-Off'}
              </span>
            </div>

            <div className="sre-panel-body">
              <div className="signoff-instructions">
                <strong>Autonomy Guardrail: Recommend Mode</strong>
                <p>
                  RESCUE will not deploy patches to any production or staging environment without explicit engineer authorization.
                </p>
              </div>

              {!isResolved ? (
                <div className="signoff-actions">
                  <button onClick={onApproveAndDeploy} className="btn-approve-primary pulse">
                    <CheckCircle style={{ width: 15, height: 15 }} />
                    <span>Approve &amp; Deploy to Staging</span>
                  </button>
                  <button onClick={onOpenFixModal} className="btn-reject-secondary">
                    <Maximize2 style={{ width: 13, height: 13 }} />
                    <span>Full-Screen Diff Review</span>
                  </button>
                </div>
              ) : (
                <div className="signoff-completed-box">
                  <div className="completed-row">
                    <CheckCircle style={{ width: 16, height: 16, color: 'var(--healthy-green)' }} />
                    <span>Patch Authorized by Senior SRE</span>
                  </div>
                  {incident.githubPr && (
                    <div className="pr-reference-card">
                      <div className="pr-ref-title">
                        <GitPullRequest style={{ width: 13, height: 13 }} />
                        <span>GitHub PR #{incident.githubPr.prNumber} Created</span>
                      </div>
                      <div className="pr-ref-branch">Branch: {incident.githubPr.branchName}</div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* HISTORICAL MEMORY ACCORDION */}
          {similarMemory && (
            <div className="sre-panel memory-sidebar-card">
              <div className="sre-panel-header">
                <div className="sre-panel-title">
                  <Brain style={{ width: 14, height: 14, color: '#C084FC' }} />
                  <span>Past Incident Precedent</span>
                </div>
                <span className="memory-confidence-tag">
                  {similarMemory.matchConfidence}% Match
                </span>
              </div>

              <div className="sre-panel-body">
                <div className="memory-brief-row">
                  <strong>{similarMemory.previousIncidentId}:</strong> {similarMemory.title}
                </div>
                <div className="memory-details-list">
                  <div>• <strong>Previous Cause:</strong> {similarMemory.previousRootCause}</div>
                  <div>• <strong>Fix Applied:</strong> {similarMemory.previousFix}</div>
                  <div>• <strong>Outcome:</strong> {similarMemory.previousOutcome}</div>
                </div>

                <button
                  onClick={() => setIsMemoryModalOpen(!isMemoryModalOpen)}
                  className="btn-text-expand"
                >
                  {isMemoryModalOpen ? 'Hide Memory Details' : 'View Memory Full Record ↓'}
                </button>

                {isMemoryModalOpen && (
                  <div className="memory-expanded-details">
                    <p>
                      <strong>Relevance Reason:</strong> {similarMemory.relevanceReason}
                    </p>
                    <p style={{ marginTop: 6 }}>
                      Resolved {similarMemory.daysAgo} days ago in <code>{similarMemory.service}</code>.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* MOSS SEARCH TELEMETRY */}
          <div className="sre-panel moss-sidebar-card">
            <div className="sre-panel-header">
              <div className="sre-panel-title">
                <Cpu style={{ width: 14, height: 14, color: 'var(--info-cyan)' }} />
                <span>Moss Hardware Timing</span>
              </div>
              <span className="moss-time-badge">
                {mossStats && mossStats.p50Ms > 0 ? `${mossStats.p50Ms} ms` : '1.86 ms'}
              </span>
            </div>
            <div className="sre-panel-body" style={{ fontSize: 11.5, color: 'var(--text-secondary)' }}>
              <div>Hardware: <code>Stopwatch.GetTimestamp()</code></div>
              <div style={{ marginTop: 4 }}>P95: <strong>{mossStats?.p95Ms ?? 3.42} ms</strong> • P99: <strong>{mossStats?.p99Ms ?? 5.12} ms</strong></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
