import React from 'react';
import { Shield, Activity, RefreshCw, Play, Layers, Server, Cpu, FileText, CheckCircle, Radio } from 'lucide-react';
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
            <span className="workspace-badge">acme-prod-us-east-1</span>
          </div>

          {/* Navigation Links */}
          <nav className="nav-links">
            <button
              onClick={() => onSelectTab('dots')}
              className={`nav-link-btn ${activeTab === 'dots' ? 'active' : ''}`}
            >
              <Shield style={{ width: 14, height: 14 }} />
              <span>Incident Response</span>
              {isCritical && (
                <span className="sev-badge sev1" style={{ fontSize: 9, padding: '1px 5px' }}>1</span>
              )}
            </button>

            <button
              onClick={() => onSelectTab('dashboard')}
              className={`nav-link-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
            >
              <Server style={{ width: 14, height: 14 }} />
              <span>Service Catalog</span>
            </button>

            <button
              onClick={() => onSelectTab('moss')}
              className={`nav-link-btn ${activeTab === 'moss' ? 'active' : ''}`}
            >
              <Cpu style={{ width: 14, height: 14 }} />
              <span>Moss Observability</span>
            </button>

            <button
              onClick={() => onSelectTab('explorer')}
              className={`nav-link-btn ${activeTab === 'explorer' ? 'active' : ''}`}
            >
              <Layers style={{ width: 14, height: 14 }} />
              <span>Topology &amp; Mesh</span>
            </button>

            <button
              onClick={() => onSelectTab('submission')}
              className={`nav-link-btn ${activeTab === 'submission' ? 'active' : ''}`}
            >
              <FileText style={{ width: 14, height: 14 }} />
              <span>Architecture &amp; PRD</span>
            </button>

            <button
              onClick={() => onSelectTab('integrations')}
              className={`nav-link-btn ${activeTab === 'integrations' ? 'active' : ''}`}
            >
              <Radio style={{ width: 14, height: 14 }} />
              <span>Projects &amp; Integrations</span>
            </button>
          </nav>
        </div>

        {/* Right Controls */}
        <div className="header-right">
          {/* Autonomy Selector */}
          <div className="autonomy-pill-group">
            <span style={{ fontSize: 10, color: 'var(--text-tertiary)', padding: '0 6px', fontWeight: 600 }}>AUTONOMY:</span>
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
            <span>Moss P50:</span>
            <strong>{mossStats && mossStats.totalQueries > 0 ? `${mossStats.p50Ms} ms` : 'Ready'}</strong>
          </div>

          {/* SRE Simulation Trigger */}
          <button
            onClick={onRunKillerDemo}
            disabled={loading}
            className="btn-trigger-action"
            title="Inject external API change drift & correlate production 503 incident"
          >
            <Play style={{ width: 13, height: 13 }} />
            <span>{loading ? 'Correlating Incident...' : 'Play Killer Demo (P0)'}</span>
          </button>

          {/* Reset Environment */}
          <button
            onClick={onReset}
            disabled={loading}
            className="btn-icon-outline"
            title="Reset to clean baseline telemetry"
          >
            <RefreshCw style={{ width: 13, height: 13 }} />
          </button>
        </div>
      </div>
    </header>
  );
};
