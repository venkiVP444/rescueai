import React from 'react';
import { Shield, Activity, RefreshCw, Play, Layers, Cpu, FileText, Radio, ExternalLink } from 'lucide-react';
import { AutonomyMode, MossObservabilityStats } from '../types';

interface TopNavProps {
  autonomyMode: AutonomyMode;
  onSetAutonomy: (mode: AutonomyMode) => void;
  systemStatus: string;
  mossStats?: MossObservabilityStats;
  onRunKillerDemo: () => void;
  onReset: () => void;
  loading: boolean;
  activeTab: string;
  onSelectTab: (tab: string) => void;
  activeIncidentCount?: number;
}

export const TopNav: React.FC<TopNavProps> = ({
  autonomyMode,
  onSetAutonomy,
  systemStatus,
  mossStats,
  onRunKillerDemo,
  onReset,
  loading,
  activeTab,
  onSelectTab,
  activeIncidentCount = 1
}) => {
  const isCritical = systemStatus === 'Critical' || systemStatus === 'Degraded';

  return (
    <header className="ent-header">
      <div className="ent-header-inner">
        {/* Brand & Workspace */}
        <div className="header-left">
          <div className="header-brand">
            <div className="brand-badge-pill">R</div>
            <span>RESCUE</span>
            <span className="workspace-badge" title="Active Cluster Context">acme-prod-us-east-1</span>
            <span className={`cluster-status-pill ${isCritical ? 'critical' : 'nominal'}`}>
              <span className="pulse-dot"></span>
              {isCritical ? '1 Active Outage' : 'Nominal'}
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="nav-links">
            <button
              onClick={() => onSelectTab('dots')}
              className={`nav-link-btn ${activeTab === 'dots' ? 'active' : ''}`}
              title="Active self-healing incident response & evidence"
            >
              <Shield style={{ width: 14, height: 14 }} />
              <span>Incidents</span>
              {isCritical && (
                <span className="sev-badge sev1" style={{ fontSize: 9, padding: '1px 6px', borderRadius: 99 }}>1</span>
              )}
            </button>

            <button
              onClick={() => onSelectTab('integrations')}
              className={`nav-link-btn ${activeTab === 'integrations' ? 'active' : ''}`}
              title="Connect customer microservices, API keys, and SDK"
            >
              <Radio style={{ width: 14, height: 14 }} />
              <span>Projects &amp; Integrations</span>
            </button>

            <button
              onClick={() => onSelectTab('moss')}
              className={`nav-link-btn ${activeTab === 'moss' ? 'active' : ''}`}
              title="Moss architectural memory & high-resolution telemetry"
            >
              <Cpu style={{ width: 14, height: 14 }} />
              <span>Moss &amp; Memory</span>
            </button>

            <button
              onClick={() => onSelectTab('explorer')}
              className={`nav-link-btn ${activeTab === 'explorer' ? 'active' : ''}`}
              title="Cluster topology & service mesh map"
            >
              <Layers style={{ width: 14, height: 14 }} />
              <span>Topology</span>
            </button>

            <button
              onClick={() => onSelectTab('submission')}
              className={`nav-link-btn ${activeTab === 'submission' ? 'active' : ''}`}
              title="Architecture specifications & audit report"
            >
              <FileText style={{ width: 14, height: 14 }} />
              <span>Architecture</span>
            </button>

            {/* Direct Swagger API Link */}
            <a
              href="/swagger/index.html"
              target="_blank"
              rel="noopener noreferrer"
              className="nav-link-btn swagger-link-btn"
              title="Open live interactive Swagger REST API documentation"
            >
              <ExternalLink style={{ width: 13, height: 13, color: '#38BDF8' }} />
              <span>Swagger API</span>
              <span className="live-api-tag">v1</span>
            </a>
          </nav>
        </div>

        {/* Right Controls */}
        <div className="header-right">
          {/* Autonomy Selector */}
          <div className="autonomy-pill-group" title="Autonomy Guardrail: Choose between Alert Only, Recommend (Human Approval), or Full Auto-Healing">
            <span style={{ fontSize: 10, color: 'var(--text-tertiary)', padding: '0 6px', fontWeight: 600 }}>MODE:</span>
            {(['Observe', 'Recommend', 'Autonomous'] as AutonomyMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => onSetAutonomy(mode)}
                className={`autonomy-tab ${autonomyMode === mode ? 'active' : ''}`}
              >
                {mode}
              </button>
            ))}
          </div>

          {/* Real Hardware Latency */}
          <div className="latency-indicator" title="Hardware-timed Moss semantic search">
            <Activity style={{ width: 13, height: 13, color: 'var(--info-cyan)' }} />
            <span>Moss:</span>
            <strong>{mossStats && mossStats.totalQueries > 0 ? `${mossStats.p50Ms} ms` : 'Ready'}</strong>
          </div>

          {/* Demo Trigger Button */}
          <button
            onClick={onRunKillerDemo}
            disabled={loading}
            className="btn-trigger-action"
            title="Simulate upstream breaking change and trigger automated incident investigation"
          >
            <Play style={{ width: 13, height: 13, fill: 'currentColor' }} />
            <span>{loading ? 'Investigating...' : '⚡ Run Demo (P0)'}</span>
          </button>

          {/* Reset Environment */}
          <button
            onClick={onReset}
            disabled={loading}
            className="btn-icon-outline"
            title="Reset demo state and operational memories"
          >
            <RefreshCw style={{ width: 13, height: 13 }} />
          </button>
        </div>
      </div>
    </header>
  );
};
