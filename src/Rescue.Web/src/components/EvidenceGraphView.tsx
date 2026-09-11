import React, { useState } from 'react';
import {
  Layers,
  ChevronRight,
  Info,
  Clock,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  X,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { Incident } from '../types';

interface EvidenceGraphViewProps {
  incident?: Incident;
}

interface EvidenceNodeDetail {
  id: string;
  type: string;
  source: string;
  time: string;
  label: string;
  whyItMatters: string;
  rawPayload?: Record<string, any>;
}

export const EvidenceGraphView: React.FC<EvidenceGraphViewProps> = ({ incident }) => {
  const [selectedNodeId, setSelectedNodeId] = useState<string>('node-1');
  const [showRawPayload, setShowRawPayload] = useState<boolean>(false);

  // 12 Milestone Causal Path
  const mainPathNodes: EvidenceNodeDetail[] = [
    {
      id: 'node-1',
      type: 'External Partner Change',
      source: 'Acme Payments v4.2 Release',
      time: '14:28',
      label: 'API Update Released',
      whyItMatters: 'The upstream payment partner deployed an unannounced update right before the errors started.',
      rawPayload: {
        provider: 'Acme Payments Gateway',
        release: 'v4.2.0',
        author: 'payments-partner@gateway.net',
        spec: 'openapi-v3.yaml'
      }
    },
    {
      id: 'node-2',
      type: 'Schema Contract Drift',
      source: 'OpenAPI Spec Comparison',
      time: '14:29',
      label: 'Breaking Contract Change',
      whyItMatters: 'The partner renamed "customer_id" to "customerId" without maintaining backward compatibility.',
      rawPayload: {
        breakingChange: 'PropertyRenamed',
        previousName: 'customer_id',
        newName: 'customerId',
        severity: 'Breaking'
      }
    },
    {
      id: 'node-3',
      type: 'Code Scanning',
      source: 'Roslyn Syntax Tree Scanner',
      time: '14:30',
      label: '17 References Affected',
      whyItMatters: '17 internal places in PaymentService still expected the old property name.',
      rawPayload: {
        filesChecked: ['ApiClient.cs', 'OrderProcessor.cs', 'PaymentModel.cs'],
        matchCount: 17,
        attribute: 'JsonPropertyNameAttribute'
      }
    },
    {
      id: 'node-4',
      type: 'Target Application',
      source: 'Kubernetes Microservice Fleet',
      time: '14:31',
      label: 'PaymentService Impacted',
      whyItMatters: 'This service handles live customer credit card checkouts and order payments.',
      rawPayload: {
        service: 'PaymentService',
        replicas: 6,
        runtime: '.NET 10 Web API'
      }
    },
    {
      id: 'node-5',
      type: 'Customer Anomaly',
      source: 'Prometheus Anomaly Detection',
      time: '14:32',
      label: '503 Errors Spike to 42%',
      whyItMatters: 'Checkout errors jumped from normal 0.2% up to 42% within seconds of the partner update.',
      rawPayload: {
        metric: 'http_requests_503_total',
        baselinePercent: 0.2,
        spikePercent: 42.0
      }
    },
    {
      id: 'node-6',
      type: 'Incident Detection',
      source: 'RESCUE Correlation Engine',
      time: '14:32',
      label: 'Incident INC-105 Opened',
      whyItMatters: 'Classified automatically as P1 Critical due to direct checkout customer impact.',
      rawPayload: {
        incidentId: 'INC-105',
        severity: 'P1',
        title: 'PaymentService API Failure'
      }
    },
    {
      id: 'node-7',
      type: 'Root Cause Analysis',
      source: 'RESCUE AI Inference',
      time: '14:33',
      label: 'Root Cause Confirmed (96%)',
      whyItMatters: 'Confirmed causal link between the partner field rename and deserialization failures.',
      rawPayload: {
        confidenceScore: 0.96,
        matchedPrecedent: 'INC-001',
        mechanism: 'JsonSerializationException'
      }
    },
    {
      id: 'node-8',
      type: 'Code Synthesis',
      source: 'Automated Patch Generator',
      time: '14:34',
      label: '1-Line Code Fix Generated',
      whyItMatters: 'Created clean, safe code update to ApiClient.cs with zero secrets and minimal diff.',
      rawPayload: {
        targetFile: 'src/PaymentService/Clients/AcmePaymentsClient.cs',
        linesChanged: 2,
        secretScanned: true
      }
    },
    {
      id: 'node-9',
      type: 'Automated Testing',
      source: 'Sandbox Test Runner',
      time: '14:35',
      label: '8 of 8 Tests Passed',
      whyItMatters: 'All unit, integration, and security tests verified clean execution before human review.',
      rawPayload: {
        totalTests: 8,
        passed: 8,
        failed: 0
      }
    },
    {
      id: 'node-10',
      type: 'Human Guardrail',
      source: 'RESCUE Safety Gate',
      time: '14:36',
      label: 'Awaiting Human Approval',
      whyItMatters: 'RESCUE pauses and presents the fix for human sign-off before making any changes.',
      rawPayload: {
        guardrailMode: 'Recommend',
        requiresHumanApproval: true
      }
    },
    {
      id: 'node-11',
      type: 'Version Control',
      source: 'GitHub Pull Request',
      time: '14:37',
      label: 'GitHub PR #117 Created',
      whyItMatters: 'Pull request generated with full explanation, test results, and diff ready to merge.',
      rawPayload: {
        prNumber: 117,
        branch: 'rescue/INC-105-api-migration'
      }
    },
    {
      id: 'node-12',
      type: 'Telemetry Verification',
      source: 'Staging Sandbox Telemetry',
      time: '14:38',
      label: 'Staging Recovery Verified',
      whyItMatters: 'Error rate dropped from 42% back to 1.8%, proving the fix completely resolves the issue.',
      rawPayload: {
        environment: 'staging',
        errorRateBefore: 42.0,
        errorRateAfter: 1.8,
        recoveryConfirmed: true
      }
    }
  ];

  const selectedNode = mainPathNodes.find(n => n.id === selectedNodeId) || mainPathNodes[0];

  return (
    <div className="view-content-pane">
      {/* Header */}
      <div className="pane-header-row">
        <div>
          <div className="pane-breadcrumbs">
            <span>Investigation</span>
            <span>•</span>
            <span>Causal Telemetry</span>
          </div>
          <h1 className="pane-main-title">Evidence Chain &amp; Investigation Story</h1>
          <p className="pane-subtitle-text">
            Click any step along the 12-milestone causal chain to understand why it matters and inspect details.
          </p>
        </div>
      </div>

      {/* Main Evidence Layout: Visual Path + Side Panel */}
      <div className="evidence-split-layout">
        {/* Left Column: Visual Path Flow */}
        <div className="evidence-flow-column">
          <div className="enterprise-card evidence-dag-card">
            <div className="dag-card-header">
              <span className="dag-header-title">
                <Layers style={{ width: 18, height: 18, color: '#2563EB' }} />
                <span>Causal Evidence Progression (12 Steps)</span>
              </span>
              <span className="dag-subtitle-tag">Click any step to inspect</span>
            </div>

            <div className="evidence-nodes-vertical-chain">
              {mainPathNodes.map((node, idx) => {
                const isSelected = node.id === selectedNodeId;
                return (
                  <React.Fragment key={node.id}>
                    <div
                      onClick={() => {
                        setSelectedNodeId(node.id);
                        setShowRawPayload(false);
                      }}
                      className={`evidence-chain-node ${isSelected ? 'selected' : ''}`}
                    >
                      <div className="node-marker">
                        <span className="node-number">{idx + 1}</span>
                      </div>

                      <div className="node-content-block">
                        <div className="node-meta-line">
                          <span className="node-type-pill">{node.type}</span>
                          <span className="node-time-stamp">
                            <Clock style={{ width: 12, height: 12 }} />
                            <span>{node.time}</span>
                          </span>
                        </div>
                        <div className="node-main-label">{node.label}</div>
                        <div className="node-source-text">Source: {node.source}</div>
                      </div>

                      <div className="node-select-arrow">
                        <ChevronRight style={{ width: 16, height: 16 }} />
                      </div>
                    </div>

                    {idx < mainPathNodes.length - 1 && (
                      <div className="evidence-chain-divider">
                        <div className="vertical-connector-line"></div>
                      </div>
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Selected Node Side Panel */}
        <div className="evidence-sidepanel-column">
          <div className="enterprise-card evidence-inspector-panel">
            <div className="inspector-header">
              <div className="inspector-title-row">
                <span className="badge-inspector">Evidence Detail</span>
                <span className="inspector-time">{selectedNode.time}</span>
              </div>
              <h3 className="inspector-node-name">{selectedNode.label}</h3>
            </div>

            <div className="inspector-body">
              <div className="inspector-field-group">
                <span className="inspector-field-label">Category:</span>
                <span className="inspector-field-value">{selectedNode.type}</span>
              </div>

              <div className="inspector-field-group">
                <span className="inspector-field-label">Source of Data:</span>
                <span className="inspector-field-value">{selectedNode.source}</span>
              </div>

              <div className="inspector-field-group">
                <span className="inspector-field-label">Timestamp:</span>
                <span className="inspector-field-value">{selectedNode.time} (Today)</span>
              </div>

              <div className="inspector-matter-box">
                <div className="matter-label">
                  <Info style={{ width: 15, height: 15, color: '#2563EB' }} />
                  <span>Why this matters in plain English:</span>
                </div>
                <p className="matter-text">{selectedNode.whyItMatters}</p>
              </div>

              {/* Progressive disclosure for raw telemetry/metadata */}
              <div className="inspector-raw-section">
                <button
                  onClick={() => setShowRawPayload(!showRawPayload)}
                  className="btn-toggle-raw"
                >
                  {showRawPayload ? <ChevronUp style={{ width: 13, height: 13 }} /> : <ChevronDown style={{ width: 13, height: 13 }} />}
                  <span>{showRawPayload ? 'Hide raw JSON metadata' : 'Show raw JSON metadata (Engineers)'}</span>
                </button>

                {showRawPayload && selectedNode.rawPayload && (
                  <pre className="raw-metadata-json">
                    {JSON.stringify(selectedNode.rawPayload, null, 2)}
                  </pre>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
