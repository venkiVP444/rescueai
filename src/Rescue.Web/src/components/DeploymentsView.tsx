import React from 'react';
import {
  GitPullRequest,
  CheckCircle,
  GitCommit,
  ExternalLink,
  Clock,
  ArrowRight,
  ShieldCheck,
  Server,
  Activity
} from 'lucide-react';
import { Incident } from '../types';

interface DeploymentsViewProps {
  incident?: Incident;
}

export const DeploymentsView: React.FC<DeploymentsViewProps> = ({ incident }) => {
  const isResolved = incident?.status === 'Resolved';
  const prNumber = incident?.githubPr?.prNumber ?? 117;
  const branchName = incident?.githubPr?.branchName ?? 'rescue/INC-105-api-migration';
  const beforeRate = incident?.errorRateBefore ?? 42.0;
  const afterRate = incident?.verification?.afterErrorRate ?? 1.8;

  const deploymentHistory = [
    {
      id: 'DEP-842',
      title: 'RESCUE Automated Fix: Payment API Contract Field Alignment',
      env: 'Staging',
      status: isResolved ? 'Verified & Deployed' : 'Ready for Rollout',
      pr: `#${prNumber}`,
      author: 'RESCUE AI Agent',
      time: '14:37 (Today)',
      result: isResolved ? '42.0% → 1.8% Errors (95.7% Recovery)' : 'Awaiting Approval'
    },
    {
      id: 'DEP-841',
      title: 'Acme Payments Core Gateway v4.2 Release',
      env: 'Production',
      status: 'Caused Incident',
      pr: '#112',
      author: 'External Partner',
      time: '14:28 (Today)',
      result: 'Triggered INC-105'
    },
    {
      id: 'DEP-840',
      title: 'RESCUE Automated Fix: Redis Connection Pool Optimization',
      env: 'Production',
      status: 'Verified & Deployed',
      pr: '#108',
      author: 'RESCUE AI Agent',
      time: 'Yesterday',
      result: 'Latency restored to 45ms'
    },
    {
      id: 'DEP-839',
      title: 'Scheduled maintenance release v4.1.2',
      env: 'Production',
      status: 'Verified & Deployed',
      pr: '#99',
      author: 'release-bot',
      time: '4 days ago',
      result: 'Normal baseline'
    }
  ];

  return (
    <div className="view-content-pane">
      {/* Header */}
      <div className="pane-header-row">
        <div>
          <div className="pane-breadcrumbs">
            <span>CI/CD &amp; Rollouts</span>
            <span>•</span>
            <span>Verification Pipeline</span>
          </div>
          <h1 className="pane-main-title">Deployments &amp; Verified Pull Requests</h1>
          <p className="pane-subtitle-text">
            Track automated hotfix pull requests and real-time staging recovery telemetry.
          </p>
        </div>
      </div>

      {/* Primary Active / Recent Remediation Deployment Card */}
      <div className="enterprise-card deployment-verification-card" style={{ marginBottom: 24 }}>
        <div className="card-header-clean">
          <div>
            <div className={`status-badge-inline ${isResolved ? 'green' : 'blue'}`}>
              {isResolved ? '✓ Service Recovery Confirmed' : 'Ready for Deployment'}
            </div>
            <h3 className="section-card-title" style={{ marginTop: 4 }}>
              Active Remediation: INC-105 Payment Service
            </h3>
            <p className="section-card-subtitle">
              Automated Pull Request synthesized from code analysis with 8/8 safety checks passed.
            </p>
          </div>
        </div>

        {/* GitHub PR & Branch metadata */}
        <div className="deployment-meta-row">
          <div className="dep-meta-block">
            <span className="dep-lbl">GitHub Pull Request:</span>
            <span className="dep-val pr">
              <GitPullRequest style={{ width: 15, height: 15 }} />
              <span>PR #{prNumber}</span>
            </span>
          </div>

          <div className="dep-meta-block">
            <span className="dep-lbl">Git Branch:</span>
            <span className="dep-val branch">
              <code>{branchName}</code>
            </span>
          </div>

          <div className="dep-meta-block">
            <span className="dep-lbl">Commit ID:</span>
            <span className="dep-val commit">
              <GitCommit style={{ width: 14, height: 14 }} />
              <code>e4a9f21</code>
            </span>
          </div>

          <div className="dep-meta-block">
            <span className="dep-lbl">Status:</span>
            <span className={`status-chip ${isResolved ? 'resolved' : 'pending'}`}>
              {isResolved ? 'Created & Verified' : 'Pending Sign-Off'}
            </span>
          </div>
        </div>

        {/* Staging Verification Before/After Comparison */}
        <div className="staging-comparison-box">
          <div className="comp-title">Staging environment error rate comparison</div>
          <div className="comp-columns">
            <div className="comp-col before">
              <span className="comp-col-lbl">Before Fix:</span>
              <span className="comp-rate text-red">{beforeRate}% of checkouts failing</span>
              <span className="comp-subtext">Checkout Latency: 840 ms</span>
            </div>

            <div className="comp-arrow">➔</div>

            <div className="comp-col after">
              <span className="comp-col-lbl">After Fix:</span>
              <span className="comp-rate green">{afterRate}% normal baseline</span>
              <span className="comp-subtext">Checkout Latency: 125 ms</span>
            </div>

            <div className="comp-result-badge">
              <CheckCircle style={{ width: 18, height: 18, color: '#059669' }} />
              <span>{isResolved ? '✓ Service Fully Restored' : 'Pre-flight Verification Passed'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Deployment History Table */}
      <div className="enterprise-card table-card">
        <div className="card-header-clean" style={{ padding: '16px 20px', borderBottom: '1px solid #E2E8F0' }}>
          <h3 className="section-card-title" style={{ fontSize: 14 }}>Deployment Audit Log</h3>
        </div>

        <table className="enterprise-table">
          <thead>
            <tr>
              <th>Deployment &amp; Purpose</th>
              <th>Environment</th>
              <th>Status</th>
              <th>Pull Request</th>
              <th>Author</th>
              <th>Timestamp</th>
              <th>Telemetry Outcome</th>
            </tr>
          </thead>
          <tbody>
            {deploymentHistory.map(dep => (
              <tr key={dep.id}>
                <td>
                  <div className="incident-id-cell">
                    <span className="inc-id-tag">{dep.id}</span>
                    <span className="inc-title-text">{dep.title}</span>
                  </div>
                </td>
                <td>
                  <span className="service-name-tag">{dep.env}</span>
                </td>
                <td>
                  <span
                    className={`status-chip ${
                      dep.status.includes('Verified')
                        ? 'resolved'
                        : dep.status === 'Caused Incident'
                        ? 'critical'
                        : 'pending'
                    }`}
                  >
                    {dep.status}
                  </span>
                </td>
                <td>
                  <span className="pr-reference-inline">
                    <GitPullRequest style={{ width: 13, height: 13 }} />
                    <span>{dep.pr}</span>
                  </span>
                </td>
                <td>
                  <span className="author-text">{dep.author}</span>
                </td>
                <td>
                  <span className="timestamp-text">{dep.time}</span>
                </td>
                <td>
                  <span className="outcome-text" style={{ fontWeight: 600, color: dep.result.includes('95') ? '#059669' : '#334155' }}>
                    {dep.result}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
