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
  ExternalLink
} from 'lucide-react';
import { Incident } from '../types';

interface ConnectedTheDotsViewProps {
  incident?: Incident;
  onOpenFixModal: () => void;
  onApproveAndDeploy: () => void;
}

export const ConnectedTheDotsView: React.FC<ConnectedTheDotsViewProps> = ({
  incident,
  onOpenFixModal,
  onApproveAndDeploy
}) => {
  const [selectedTab, setSelectedTab] = useState<'diff' | 'tests' | 'logs'>('diff');

  if (!incident || !incident.correlation) {
    return (
      <div style={{ padding: '60px 20px', textAlign: 'center', background: 'var(--bg-surface-1)', border: '1px solid var(--border-muted)', borderRadius: 8 }}>
        <div style={{ width: 44, height: 44, borderRadius: 8, background: 'var(--bg-surface-2)', border: '1px solid var(--border-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px auto', color: 'var(--healthy-green)' }}>
          <CheckCircle style={{ width: 22, height: 22 }} />
        </div>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: '#FFF', marginBottom: 4 }}>
          No Active Production Incidents
        </h3>
        <p style={{ maxWidth: 480, margin: '0 auto 16px auto', fontSize: 12, color: 'var(--text-secondary)' }}>
          Rescue SRE engine is passively monitoring OpenAPI drift, telemetry thresholds, and application logs.
        </p>
        <button
          onClick={() => {}}
          style={{ background: 'var(--bg-surface-2)', border: '1px solid var(--border-muted)', color: 'var(--text-primary)', padding: '6px 14px', borderRadius: 6, fontSize: 12, cursor: 'default' }}
        >
          Click "Trigger Incident Simulation" in top header to run live scenario
        </button>
      </div>
    );
  }

  const { correlation, proposedPatch, validationReport, approval, verification } = incident;
  const isResolved = incident.status === 'Resolved';

  return (
    <div>
      {/* Incident Header */}
      <div className="incident-header-bar">
        <div>
          <div className="incident-badge-row">
            <span className={`sev-badge ${isResolved ? 'resolved' : 'sev1'}`}>
              {isResolved ? 'SEV-1 MITIGATED' : 'SEV-1 CRITICAL'}
            </span>
            <span className="status-chip">
              ID: {incident.id}
            </span>
            <span className="status-chip">
              Target: {incident.service}
            </span>
            <span className="status-chip" style={{ color: 'var(--info-cyan)' }}>
              Confidence: {correlation.score}%
            </span>
          </div>

          <h1 className="incident-title-text">{incident.title}</h1>

          <div className="incident-meta-sub">
            <span>Commander: <strong>Rescue Autonomous SRE</strong></span>
            <span>•</span>
            <span>Detection: <strong>Prometheus Anomaly Trigger</strong></span>
            <span>•</span>
            <span>Impact: <strong>Acme Commerce Checkout Pipeline</strong></span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {approval?.status === 'Pending' && !isResolved && (
            <button onClick={onApproveAndDeploy} className="btn-approve-primary">
              <CheckCircle style={{ width: 14, height: 14 }} />
              Approve &amp; Deploy Staging Patch
            </button>
          )}
          {isResolved && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--healthy-green)', fontWeight: 700, fontSize: 12, background: 'var(--healthy-bg)', border: '1px solid var(--healthy-border)', padding: '6px 12px', borderRadius: 6 }}>
              <CheckCircle style={{ width: 14, height: 14 }} />
              Verified in Staging Sandbox (42% → 1.8% Error Rate)
            </span>
          )}
        </div>
      </div>

      {/* Two-Column Operational Layout */}
      <div className="two-col-layout">
        {/* Left Column: Diagnostics, Logs, Diff, Tests */}
        <div>
          {/* Root Cause Analysis Report */}
          <div className="sre-panel">
            <div className="sre-panel-header">
              <div className="sre-panel-title">
                <AlertTriangle style={{ width: 14, height: 14, color: isResolved ? 'var(--healthy-green)' : 'var(--sev1-red)' }} />
                <span>Root Cause &amp; Upstream Correlation Analysis</span>
              </div>
              <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-tertiary)' }}>
                Moss Retrieval: 0.74 ms
              </span>
            </div>
            <div className="sre-panel-body">
              <div className="rc-summary-grid">
                <div className="rc-stat-box">
                  <div className="rc-stat-label">Correlation Trigger</div>
                  <div className="rc-stat-val" style={{ fontSize: 13, color: 'var(--sev2-amber)' }}>
                    Acme Payments v4.2 Release
                  </div>
                </div>
                <div className="rc-stat-box">
                  <div className="rc-stat-label">Contract Drift</div>
                  <div className="rc-stat-val" style={{ fontSize: 13, color: 'var(--sev1-red)', fontFamily: 'var(--font-mono)' }}>
                    customer_id → customerId
                  </div>
                </div>
                <div className="rc-stat-box">
                  <div className="rc-stat-label">Blast Radius</div>
                  <div className="rc-stat-val" style={{ fontSize: 13, color: '#FFF' }}>
                    3 Services • 17 Refs
                  </div>
                </div>
              </div>

              <div style={{ fontSize: 12.5, color: '#D1D5DB', lineHeight: 1.6, background: 'var(--bg-surface-2)', padding: 12, borderRadius: 6, border: '1px solid var(--border-muted)', marginBottom: 14 }}>
                <strong style={{ color: '#FFF' }}>SRE Diagnosis: </strong>
                {incident.rootCause}
              </div>

              {/* 5 Correlated Reasons List */}
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', marginBottom: 8 }}>
                Evidence Correlation Chain ({correlation.correlationReasons.length} Events):
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {correlation.correlationReasons.map((reason, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 12, color: 'var(--text-secondary)' }}>
                    <span style={{ color: 'var(--info-cyan)', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>[{idx + 1}]</span>
                    <span>{reason}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Tabbed Inspector: Unified Diff, Tests, Live Error Logs */}
          <div className="sre-panel">
            <div className="sre-panel-header" style={{ padding: '4px 8px' }}>
              <div style={{ display: 'flex', gap: 4 }}>
                <button
                  onClick={() => setSelectedTab('diff')}
                  className={`nav-link-btn ${selectedTab === 'diff' ? 'active' : ''}`}
                >
                  <FileCode style={{ width: 13, height: 13 }} />
                  <span>Proposed Hotfix Diff</span>
                </button>
                <button
                  onClick={() => setSelectedTab('tests')}
                  className={`nav-link-btn ${selectedTab === 'tests' ? 'active' : ''}`}
                >
                  <CheckCircle style={{ width: 13, height: 13 }} />
                  <span>Validation &amp; Unit Tests ({validationReport?.passedTests ?? 8}/8)</span>
                </button>
                <button
                  onClick={() => setSelectedTab('logs')}
                  className={`nav-link-btn ${selectedTab === 'logs' ? 'active' : ''}`}
                >
                  <Terminal style={{ width: 13, height: 13 }} />
                  <span>Production Telemetry Logs</span>
                </button>
              </div>
            </div>

            <div className="sre-panel-body" style={{ padding: 12 }}>
              {/* TAB 1: UNIFIED DIFF */}
              {selectedTab === 'diff' && proposedPatch && (
                <div>
                  <div className="diff-viewer">
                    <div className="diff-toolbar">
                      <span><strong>Target File:</strong> {proposedPatch.filePath}</span>
                      <span style={{ color: 'var(--healthy-green)', fontWeight: 600 }}>Risk: LOW • Roslyn AST Verified</span>
                    </div>
                    <div style={{ padding: '8px 0' }}>
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
                  <div style={{ marginTop: 10, fontSize: 11.5, color: 'var(--text-secondary)' }}>
                    <strong>Patch Explanation:</strong> {proposedPatch.explanation}
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
                        <th>Target Domain</th>
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
                            <span style={{ color: 'var(--healthy-green)', fontWeight: 700, fontFamily: 'var(--font-mono)', fontSize: 11, background: 'var(--healthy-bg)', padding: '2px 6px', borderRadius: 4 }}>
                              ✓ {t.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div style={{ display: 'flex', gap: 12, marginTop: 12, fontSize: 11, color: 'var(--text-secondary)' }}>
                    <span>✓ Roslyn AST Syntax Valid</span>
                    <span>•</span>
                    <span>✓ 0 Hardcoded Secrets Detected</span>
                    <span>•</span>
                    <span>✓ Zero Regressions</span>
                  </div>
                </div>
              )}

              {/* TAB 3: ERROR LOGS */}
              {selectedTab === 'logs' && (
                <div className="log-stream">
                  {[
                    { ts: '10:04:12.418', lvl: 'ERROR', msg: 'System.Text.Json.JsonException: Required property \'customerId\' missing from payload.' },
                    { ts: '10:04:12.420', lvl: 'ERROR', msg: 'AcmePaymentsClient.cs:42: External gateway returned HTTP 400 Bad Request.' },
                    { ts: '10:04:13.104', lvl: 'ERROR', msg: 'PaymentProcessor.cs:118: Gateway timeout. Marking transaction failed (TX-98402).' },
                    { ts: '10:04:13.150', lvl: 'WARN', msg: 'RedisPool.cs:72: Active connection pool reached capacity limit (200/200).' },
                    { ts: '10:04:13.201', lvl: 'ERROR', msg: 'OrderService.cs:88: HTTP 503 Service Unavailable received from PaymentService.' },
                    { ts: '10:04:14.005', lvl: 'INFO', msg: 'Rescue Watcher: Prometheus threshold breach detected (Error rate > 5%).' },
                    { ts: '10:04:14.008', lvl: 'INFO', msg: 'Rescue Moss: In-process semantic search matched 3 documents in 0.74ms.' },
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

          {/* Post-Deployment Telemetry Recovery Table (if resolved) */}
          {isResolved && verification && (
            <div className="sre-panel">
              <div className="sre-panel-header">
                <div className="sre-panel-title">
                  <CheckCircle style={{ width: 14, height: 14, color: 'var(--healthy-green)' }} />
                  <span>Staging Sandbox Telemetry Verification</span>
                </div>
                <span style={{ fontSize: 11, color: 'var(--healthy-green)', fontWeight: 700 }}>
                  PASSED ALL SLO GATES
                </span>
              </div>
              <div className="sre-panel-body">
                <div className="rc-summary-grid">
                  <div className="rc-stat-box">
                    <div className="rc-stat-label">HTTP 503 Error Rate</div>
                    <div className="rc-stat-val" style={{ color: 'var(--healthy-green)' }}>
                      {verification.beforeErrorRate}% → {verification.afterErrorRate}%
                    </div>
                    <div style={{ fontSize: 10, color: 'var(--text-tertiary)', marginTop: 2 }}>-95.7% Reduction</div>
                  </div>
                  <div className="rc-stat-box">
                    <div className="rc-stat-label">P99 Payment Latency</div>
                    <div className="rc-stat-val" style={{ color: 'var(--info-cyan)' }}>
                      {verification.beforeLatencyMs} ms → {verification.afterLatencyMs} ms
                    </div>
                    <div style={{ fontSize: 10, color: 'var(--text-tertiary)', marginTop: 2 }}>Nominal Gateway Response</div>
                  </div>
                  <div className="rc-stat-box">
                    <div className="rc-stat-label">Redis Connection Pool</div>
                    <div className="rc-stat-val" style={{ color: '#FFF' }}>
                      {verification.beforeActiveConnections} → {verification.afterActiveConnections} / 200
                    </div>
                    <div style={{ fontSize: 10, color: 'var(--text-tertiary)', marginTop: 2 }}>Connection Leak Resolved</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Actions, Timeline, Moss Observability */}
        <div>
          {/* Operations Action Box */}
          <div className="sre-panel">
            <div className="sre-panel-header">
              <div className="sre-panel-title">Incident Operations &amp; Gate</div>
              <span className="status-chip">{approval?.status ?? 'Pending'}</span>
            </div>
            <div className="sre-panel-body">
              <div className="action-box">
                <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 2 }}>
                  Autonomy Guardrail: <strong>Recommend Mode</strong>
                </div>
                <p style={{ fontSize: 11.5, color: 'var(--text-tertiary)', lineHeight: 1.4 }}>
                  No automated production mutations allowed without explicit human SRE sign-off.
                </p>

                {approval?.status === 'Pending' && !isResolved ? (
                  <button onClick={onApproveAndDeploy} className="btn-approve-primary">
                    <CheckCircle style={{ width: 14, height: 14 }} />
                    Approve &amp; Deploy Staging Sandbox
                  </button>
                ) : (
                  <button disabled style={{ background: 'var(--bg-surface-3)', border: '1px solid var(--border-muted)', color: 'var(--healthy-green)', padding: '8px 12px', borderRadius: 6, fontSize: 12, fontWeight: 700 }}>
                    ✓ Patch Approved &amp; Deployed
                  </button>
                )}

                <button onClick={onOpenFixModal} className="btn-reject-secondary">
                  <FileCode style={{ width: 13, height: 13 }} />
                  Open Full Screen Diff Inspector
                </button>
              </div>

              {/* GitHub PR info */}
              {incident.githubPr && (
                <div style={{ padding: 10, background: 'var(--bg-surface-2)', border: '1px solid var(--border-muted)', borderRadius: 6, fontSize: 11.5 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontWeight: 600, color: '#FFF' }}>GitHub Pull Request</span>
                    <span className="status-chip" style={{ color: 'var(--info-cyan)' }}>#{incident.githubPr.prNumber}</span>
                  </div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: 11, fontFamily: 'var(--font-mono)' }}>
                    Branch: {incident.githubPr.branchName}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Moss Telemetry Sidebar Card */}
          <div className="sre-panel">
            <div className="sre-panel-header">
              <div className="sre-panel-title">
                <Cpu style={{ width: 13, height: 13, color: 'var(--info-cyan)' }} />
                <span>Moss Retrieval Telemetry</span>
              </div>
              <span style={{ fontSize: 10, color: 'var(--healthy-green)', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                SUB-10MS
              </span>
            </div>
            <div className="sre-panel-body" style={{ fontSize: 11.5 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border-muted)' }}>
                <span style={{ color: 'var(--text-tertiary)' }}>Hardware Timing (P50):</span>
                <strong style={{ fontFamily: 'var(--font-mono)', color: 'var(--info-cyan)' }}>0.74 ms</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border-muted)' }}>
                <span style={{ color: 'var(--text-tertiary)' }}>Ingested Corpus:</span>
                <strong style={{ fontFamily: 'var(--font-mono)', color: '#FFF' }}>37 Specs</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border-muted)' }}>
                <span style={{ color: 'var(--text-tertiary)' }}>Active Engine:</span>
                <strong style={{ color: 'var(--healthy-green)' }}>Local Engine</strong>
              </div>
              <div style={{ marginTop: 8, color: 'var(--text-tertiary)', fontSize: 11 }}>
                Retrieved Context:
                <ul style={{ paddingLeft: 14, marginTop: 4, color: 'var(--text-secondary)' }}>
                  <li>api/acme_payments_v4.2_spec.yaml</li>
                  <li>code/PaymentService/PaymentProcessor.cs</li>
                  <li>tests/PaymentService.Tests.cs</li>
                </ul>
              </div>
            </div>
          </div>

          {/* SRE Audit Trail Timeline */}
          <div className="sre-panel">
            <div className="sre-panel-header">
              <div className="sre-panel-title">
                <Clock style={{ width: 13, height: 13 }} />
                <span>Operational Audit Trail</span>
              </div>
              <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--text-tertiary)' }}>
                5 Events
              </span>
            </div>
            <div className="sre-panel-body">
              <div className="audit-timeline">
                {(incident.investigation?.timeline || []).map((event, i) => {
                  let dotClass = 'audit-dot';
                  if (event.severity === 'Critical') dotClass = 'audit-dot alert';
                  else if (event.severity === 'Resolved' || event.severity === 'Success') dotClass = 'audit-dot success';
                  else dotClass = 'audit-dot active';

                  return (
                    <div key={i} className="audit-event">
                      <div className={dotClass} />
                      <div className="audit-time">{event.timeLabel}</div>
                      <div className="audit-title">{event.title}</div>
                      <div className="audit-desc">{event.description}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
