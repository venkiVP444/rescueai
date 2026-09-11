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
  ChevronRight
} from 'lucide-react';
import { Incident, MossObservabilityStats } from '../types';

interface ConnectedTheDotsViewProps {
  incident?: Incident;
  mossStats?: MossObservabilityStats;
  onOpenFixModal: () => void;
  onApproveAndDeploy: () => void;
}

export const ConnectedTheDotsView: React.FC<ConnectedTheDotsViewProps> = ({
  incident,
  mossStats,
  onOpenFixModal,
  onApproveAndDeploy
}) => {
  const [selectedTab, setSelectedTab] = useState<'diff' | 'tests' | 'logs'>('diff');
  const [selectedDagNodeId, setSelectedDagNodeId] = useState<string>('n9');
  const [isMemoryModalOpen, setIsMemoryModalOpen] = useState<boolean>(false);

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
        <div style={{ display: 'inline-flex', gap: 8, background: 'var(--bg-surface-2)', border: '1px solid var(--border-muted)', color: 'var(--text-primary)', padding: '6px 14px', borderRadius: 6, fontSize: 12 }}>
          Click "Play Killer Demo" in the top header to run the live P0 incident flow
        </div>
      </div>
    );
  }

  const { correlation, proposedPatch, validationReport, approval, verification, investigation } = incident;
  const isResolved = incident.status === 'Resolved';
  const similarMemory = investigation?.similarMemoryMatch;
  const dagNodes = investigation?.evidenceGraph?.nodes || [];
  const selectedNode = dagNodes.find(n => n.id === selectedDagNodeId) || dagNodes[0];

  return (
    <div>
      {/* Incident Header Bar */}
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
            <span className="status-chip" style={{ background: 'rgba(192, 132, 252, 0.15)', color: '#C084FC', border: '1px solid rgba(192, 132, 252, 0.3)' }}>
              🧠 Memory Grounded
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
              Verified in Staging Sandbox ({verification?.beforeErrorRate ?? 42.0}% → {verification?.afterErrorRate ?? 1.8}% Error Rate)
            </span>
          )}
        </div>
      </div>

      {/* Multi-Event Evidence DAG (17 Causal Nodes) */}
      {dagNodes.length > 0 && (
        <div className="dag-panel">
          <div className="dag-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Layers style={{ width: 14, height: 14, color: 'var(--info-cyan)' }} />
              <span style={{ fontWeight: 700, fontSize: 12.5, color: '#FFF' }}>
                Multi-Event Evidence DAG ({dagNodes.length} Causal Nodes Correlated by Rescue)
              </span>
            </div>
            <span style={{ fontSize: 11, color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>
              Click node to inspect causal evidence snippet
            </span>
          </div>

          <div className="dag-scroll-container">
            {dagNodes.map((node, index) => {
              const isSelected = node.id === selectedDagNodeId;
              const isNodeResolved = isResolved;
              const isHighlight = node.id === 'n9'; // "RESCUE CONNECTED THE DOTS"

              return (
                <React.Fragment key={node.id}>
                  <div
                    onClick={() => setSelectedDagNodeId(node.id)}
                    className={`dag-node-card ${isSelected ? 'selected' : ''} ${isNodeResolved ? 'resolved' : ''} ${isHighlight ? 'active-step' : ''}`}
                    title={node.snippet}
                  >
                    <div className="dag-node-header">
                      <span className="dag-node-type" style={{ color: isHighlight ? 'var(--sev2-amber)' : undefined }}>
                        {node.nodeType}
                      </span>
                      {isNodeResolved ? (
                        <Check style={{ width: 11, height: 11, color: 'var(--healthy-green)' }} />
                      ) : (
                        <span style={{ fontSize: 9.5, color: 'var(--text-tertiary)' }}>#{index + 1}</span>
                      )}
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
              <span className="status-chip" style={{ fontSize: 10 }}>
                {selectedNode.subtitle}
              </span>
            </div>
          )}
        </div>
      )}

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
                Moss Hardware Retrieval: {mossStats && mossStats.p50Ms > 0 ? `${mossStats.p50Ms} ms` : 'Hardware Measured'}
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

          {/* 🧠 RESCUE REMEMBERS Panel */}
          {similarMemory && (
            <div className="sre-panel rescue-remembers-panel">
              <div className="sre-panel-header" style={{ background: 'linear-gradient(90deg, rgba(147, 51, 234, 0.15) 0%, rgba(59, 130, 246, 0.08) 100%)' }}>
                <div className="sre-panel-title" style={{ color: '#D8B4FE' }}>
                  <Brain style={{ width: 15, height: 15, color: '#C084FC' }} />
                  <span>🧠 RESCUE REMEMBERS — Persistent Operational Memory</span>
                </div>
                <span className="memory-badge">
                  {similarMemory.matchConfidence}% Pattern Confidence
                </span>
              </div>
              <div className="sre-panel-body">
                <div className="memory-match-card">
                  <div className="memory-header-row">
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#FFF' }}>
                        Similar Incident Found: {similarMemory.title} ({similarMemory.previousIncidentId})
                      </div>
                      <div style={{ fontSize: 11, color: '#A78BFA', marginTop: 2 }}>
                        Resolved {similarMemory.daysAgo} days ago • Target Service: {similarMemory.service}
                      </div>
                    </div>
                    <button
                      onClick={() => setIsMemoryModalOpen(!isMemoryModalOpen)}
                      style={{ background: 'rgba(168, 85, 247, 0.2)', border: '1px solid rgba(168, 85, 247, 0.4)', color: '#D8B4FE', padding: '4px 10px', borderRadius: 4, fontSize: 11, cursor: 'pointer', fontWeight: 600 }}
                    >
                      {isMemoryModalOpen ? 'Hide History' : 'View Previous Investigation'}
                    </button>
                  </div>

                  <div className="memory-grid">
                    <div className="memory-item">
                      <div className="memory-item-label">Historical Root Cause</div>
                      <div className="memory-item-val" style={{ color: '#F87171' }}>
                        {similarMemory.previousRootCause}
                      </div>
                    </div>
                    <div className="memory-item">
                      <div className="memory-item-label">Previous Fix Applied</div>
                      <div className="memory-item-val" style={{ color: 'var(--info-cyan)' }}>
                        {similarMemory.previousFix}
                      </div>
                    </div>
                    <div className="memory-item">
                      <div className="memory-item-label">Validation Verification</div>
                      <div className="memory-item-val" style={{ color: 'var(--healthy-green)' }}>
                        {similarMemory.previousValidation}
                      </div>
                    </div>
                    <div className="memory-item">
                      <div className="memory-item-label">Resolution Outcome</div>
                      <div className="memory-item-val" style={{ color: 'var(--healthy-green)' }}>
                        ✓ {similarMemory.previousOutcome}
                      </div>
                    </div>
                  </div>

                  <div style={{ fontSize: 11.5, color: '#D1D5DB', background: 'rgba(0, 0, 0, 0.3)', padding: '8px 12px', borderRadius: 4, borderLeft: '3px solid #C084FC' }}>
                    <strong style={{ color: '#D8B4FE' }}>Relevance Reason: </strong>
                    {similarMemory.relevanceReason}
                  </div>

                  {isMemoryModalOpen && (
                    <div style={{ marginTop: 12, padding: 12, background: 'var(--bg-surface-1)', border: '1px solid var(--border-default)', borderRadius: 6, fontSize: 11.5, color: 'var(--text-secondary)' }}>
                      <div style={{ fontWeight: 700, color: '#FFF', marginBottom: 6 }}>
                        Historical Investigation Record: {similarMemory.previousIncidentId}
                      </div>
                      <p style={{ marginBottom: 6 }}>
                        RESCUE recalled this incident from its SQLite Operational Memory store. When Acme Payments previously updated API contracts without backward compatibility, the PaymentApiClient broke with HTTP 503 errors.
                      </p>
                      <ul style={{ paddingLeft: 16, display: 'flex', flexDirection: 'column', gap: 3 }}>
                        <li>Historical Patch: Renamed customer_id to customerId in ApiClient.cs</li>
                        <li>Validation: Ran 8 automated migration unit tests with 100% pass rate</li>
                        <li>Approval: Approved by Senior SRE Engineer and deployed safely to staging</li>
                        <li>Verified Recovery: Error rate dropped to 1.6%</li>
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

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
                {mossStats && mossStats.totalQueries > 0 ? `${mossStats.totalQueries} QUERIES` : 'READY'}
              </span>
            </div>
            <div className="sre-panel-body" style={{ fontSize: 11.5 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border-muted)' }}>
                <span style={{ color: 'var(--text-tertiary)' }}>Hardware Timing (P50):</span>
                <strong style={{ fontFamily: 'var(--font-mono)', color: 'var(--info-cyan)' }}>
                  {mossStats && mossStats.p50Ms > 0 ? `${mossStats.p50Ms} ms` : 'Measured'}
                </strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border-muted)' }}>
                <span style={{ color: 'var(--text-tertiary)' }}>P95 / P99 Latency:</span>
                <strong style={{ fontFamily: 'var(--font-mono)', color: '#FFF' }}>
                  {mossStats && mossStats.p95Ms > 0 ? `${mossStats.p95Ms} ms / ${mossStats.p99Ms} ms` : 'Active'}
                </strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border-muted)' }}>
                <span style={{ color: 'var(--text-tertiary)' }}>Active Retrieval Provider:</span>
                <strong style={{ color: 'var(--healthy-green)' }}>
                  {mossStats?.currentProvider === 'MossCloud' ? 'Moss Cloud REST' : 'Local Retrieval Fallback'}
                </strong>
              </div>
              <div style={{ marginTop: 8, color: 'var(--text-tertiary)', fontSize: 11 }}>
                Retrieved Context Documents:
                <ul style={{ paddingLeft: 14, marginTop: 4, color: 'var(--text-secondary)' }}>
                  {investigation?.evidenceItems && investigation.evidenceItems.length > 0 ? (
                    investigation.evidenceItems.slice(0, 4).map((item, idx) => (
                      <li key={idx}>
                        <span style={{ color: 'var(--info-cyan)', fontFamily: 'var(--font-mono)' }}>[{item.type}]</span> {item.title}
                      </li>
                    ))
                  ) : (
                    <>
                      <li>api/external-api-v2.json</li>
                      <li>code/ApiClient.cs</li>
                      <li>tests/ApiClientTests.cs</li>
                    </>
                  )}
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
                {(incident.investigation?.timeline || []).length} Events
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
