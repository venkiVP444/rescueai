import React from 'react';
import {
  ShieldAlert,
  CheckCircle,
  Clock,
  ArrowRight,
  TrendingDown,
  Activity,
  Zap,
  AlertTriangle,
  Play
} from 'lucide-react';
import { Incident } from '../types';

interface OverviewViewProps {
  incident?: Incident;
  projectName?: string;
  environment?: string;
  onInvestigateIncident: () => void;
  onTriggerDemo: () => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  incident,
  projectName = 'Acme Commerce',
  environment = 'Production',
  onInvestigateIncident,
  onTriggerDemo
}) => {
  const hasActiveIncident = incident && incident.status !== 'Resolved';
  const isResolved = incident && incident.status === 'Resolved';

  const timelineItems = [
    {
      time: '14:32',
      title: 'Outage Detected',
      desc: 'Automated monitoring detected 42% of customer checkout attempts failing.'
    },
    {
      time: '14:33',
      title: 'Cause Correlated',
      desc: 'Correlated with external payment partner releasing API update v4.2.'
    },
    {
      time: '14:34',
      title: 'Historical Solution Found',
      desc: 'Matched past incident INC-001 (94% match) from RESCUE operational memory.'
    },
    {
      time: '14:35',
      title: 'Root Cause Confirmed',
      desc: 'Payment partner renamed "customer_id" to "customerId", breaking deserialization.'
    },
    {
      time: '14:36',
      title: 'Fix Synthesized & Tested',
      desc: 'Automated code fix created. 8 out of 8 safety regression tests passed.'
    },
    {
      time: '14:37',
      title: isResolved ? 'Staging Verified & Recovery Confirmed' : 'Waiting for Human Sign-Off',
      desc: isResolved
        ? 'Rollout complete. Error rate plummeted to 1.8%. Service fully restored.'
        : 'RESCUE has the verified fix ready. Awaiting your approval to roll out to staging.'
    }
  ];

  return (
    <div className="view-content-pane">
      {/* Header Area */}
      <div className="pane-header-row">
        <div>
          <div className="pane-breadcrumbs">
            <span>Project: <strong>{projectName}</strong></span>
            <span>•</span>
            <span>Environment: <strong>{environment}</strong></span>
          </div>
          <h1 className="pane-main-title">Production Health Overview</h1>
          <p className="pane-subtitle-text">
            Real-time status of your customer-facing applications and autonomous incident resolution.
          </p>
        </div>

        <div className="pane-header-actions">
          <span className={`status-pill-lg ${hasActiveIncident ? 'attention' : 'healthy'}`}>
            <span className="dot"></span>
            {hasActiveIncident ? 'Action Required: 1 Active Outage' : 'All Systems Running Smoothly'}
          </span>
        </div>
      </div>

      {/* Top 4 Key Metrics Cards */}
      <div className="overview-metrics-grid">
        <div className="metric-overview-card">
          <div className="metric-lbl">System Uptime</div>
          <div className="metric-value-huge">
            {hasActiveIncident ? '98.80%' : '99.94%'}
          </div>
          <div className="metric-subtext green">Service Target: 99.90%</div>
        </div>

        <div className="metric-overview-card">
          <div className="metric-lbl">Active Outages</div>
          <div className={`metric-value-huge ${hasActiveIncident ? 'red' : ''}`}>
            {hasActiveIncident ? '1' : '0'}
          </div>
          <div className="metric-subtext">
            {hasActiveIncident ? '1 incident needs approval' : 'Zero active outages'}
          </div>
        </div>

        <div className="metric-overview-card">
          <div className="metric-lbl">Customer Checkout Impact</div>
          <div className={`metric-value-huge ${hasActiveIncident ? 'red' : ''}`}>
            {hasActiveIncident ? '42%' : '0%'}
          </div>
          <div className="metric-subtext">
            {hasActiveIncident ? 'Failing transactions' : 'Normal checkout baseline'}
          </div>
        </div>

        <div className="metric-overview-card">
          <div className="metric-lbl">AI Diagnosis Confidence</div>
          <div className="metric-value-huge blue">
            {hasActiveIncident ? `${incident.correlation?.score ?? 96}%` : '96%'}
          </div>
          <div className="metric-subtext">Verified with 5 evidence sources</div>
        </div>
      </div>

      {/* Active Incident Hero Card */}
      <div className="section-block" style={{ marginBottom: 24 }}>
        <div className="section-title-row">
          <h2 className="section-heading">Current Production Status</h2>
          {hasActiveIncident && (
            <span className="live-tag">REQUIRES ATTENTION</span>
          )}
        </div>

        {hasActiveIncident ? (
          <div className="active-incident-card">
            <div className="incident-card-top">
              <div className="incident-card-id-block">
                <span className="badge-severity p1">P1 CRITICAL</span>
                <div>
                  <h3 className="incident-card-title">
                    {incident.id} — Payment Service Failing During Customer Checkout
                  </h3>
                  <div className="incident-card-meta">
                    <span>Service: <strong>PaymentService</strong></span>
                    <span>•</span>
                    <span className="text-red"><strong>{incident.errorRateBefore}% of requests failing</strong></span>
                    <span>•</span>
                    <span>Detected at 14:32 (Today)</span>
                  </div>
                </div>
              </div>

              <button
                onClick={onInvestigateIncident}
                className="btn-primary-action btn-hero-cta"
                title="Open Incident Command Center to review and approve fix"
              >
                <span>Review &amp; Approve Fix</span>
                <ArrowRight style={{ width: 16, height: 16 }} />
              </button>
            </div>

            <div className="incident-card-body">
              <div className="incident-finding-box">
                <div className="finding-header">
                  <Zap style={{ width: 18, height: 18, color: '#D97706' }} />
                  <strong>RESCUE has identified the exact cause and has a verified fix ready:</strong>
                </div>
                <p style={{ fontSize: 13.5, lineHeight: 1.6, color: '#334155' }}>
                  An external payment partner updated their software to version 4.2 without notice, renaming the customer account field. RESCUE automatically identified this discrepancy, wrote a safe 1-line code fix, verified it against 8 out of 8 safety tests, and is ready to deploy upon your approval.
                </p>
                <div className="finding-footer">
                  <span>Confidence: <strong style={{ color: '#0F172A' }}>{incident.correlation?.score ?? 96}%</strong></span>
                  <span>•</span>
                  <span>Previous solution found: <strong style={{ color: '#0F172A' }}>INC-001 (94% match)</strong></span>
                  <span>•</span>
                  <span>Safety Tests: <strong style={{ color: '#059669' }}>8 of 8 passed</strong></span>
                  <span>•</span>
                  <span>Action Needed: <strong style={{ color: '#2563EB' }}>Click button above to approve rollout</strong></span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="no-incident-card">
            <CheckCircle className="no-incident-icon" />
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0F172A' }}>All Systems Operating Normally</h3>
              <p style={{ fontSize: 13, color: '#64748B', marginTop: 2 }}>
                All services are healthy and error rates are well within safe thresholds.
              </p>
            </div>
            <button
              onClick={onTriggerDemo}
              className="btn-primary-action"
              style={{ marginLeft: 'auto' }}
              title="Trigger a simulated payment outage to test RESCUE response"
            >
              <Play style={{ width: 14, height: 14, fill: 'currentColor' }} />
              <span>Simulate Outage (Demo)</span>
            </button>
          </div>
        )}
      </div>

      {/* Simple Recent Activity Timeline */}
      <div className="section-block">
        <h2 className="section-heading">Incident Timeline &amp; Actions Taken</h2>
        <div className="activity-timeline-card">
          <div className="activity-list">
            {timelineItems.map((item, idx) => (
              <div key={idx} className="activity-row">
                <span className="activity-time">{item.time}</span>
                <div className="activity-dot-connector">
                  <div className={`activity-dot ${idx === timelineItems.length - 1 && !isResolved ? 'pulse' : ''}`}></div>
                  {idx < timelineItems.length - 1 && <div className="activity-line"></div>}
                </div>
                <div className="activity-content">
                  <div className="activity-title">{item.title}</div>
                  <div className="activity-desc">{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
