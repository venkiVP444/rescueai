import React from 'react';
import {
  LayoutDashboard,
  AlertCircle,
  Search,
  Layers,
  Brain,
  GitPullRequest,
  Radio,
  Settings,
  ExternalLink,
  Play,
  RefreshCw,
  ChevronDown,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { AutonomyMode, Project } from '../types';

export type NavTab =
  | 'overview'
  | 'incidents'
  | 'investigate'
  | 'evidence'
  | 'memory'
  | 'deployments'
  | 'integrations'
  | 'settings';

interface SidebarNavProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  activeIncidentCount: number;
  autonomyMode: AutonomyMode;
  onSetAutonomy: (mode: AutonomyMode) => void;
  onRunDemo: () => void;
  onReset: () => void;
  loading: boolean;
  projects: Project[];
  selectedProjectId: string;
  onSelectProject: (projectId: string) => void;
}

export const SidebarNav: React.FC<SidebarNavProps> = ({
  activeTab,
  onSelectTab,
  activeIncidentCount,
  autonomyMode,
  onSetAutonomy,
  onRunDemo,
  onReset,
  loading,
  projects,
  selectedProjectId,
  onSelectProject
}) => {
  const currentProject = projects.find(p => p.id === selectedProjectId) || {
    id: 'acme-commerce',
    name: 'Acme Commerce',
    environment: 'production'
  };

  return (
    <aside className="app-sidebar">
      {/* Brand Header */}
      <div className="sidebar-brand-area">
        <div className="brand-badge-square">
          <Zap style={{ width: 18, height: 18, fill: '#FFFFFF', color: '#FFFFFF' }} />
        </div>
        <div className="brand-text-block">
          <span className="brand-title">RESCUE AI</span>
          <span className="brand-tagline">Automated Production Safety</span>
        </div>
      </div>

      {/* Main Navigation Links with Clear Labels */}
      <nav className="sidebar-nav-menu">
        <div className="nav-section-label">MONITORING &amp; RESPONSE</div>

        <button
          onClick={() => onSelectTab('overview')}
          className={`sidebar-nav-item ${activeTab === 'overview' ? 'active' : ''}`}
          title="High-level production system status"
        >
          <LayoutDashboard className="nav-icon" />
          <span>System Overview</span>
        </button>

        <button
          onClick={() => onSelectTab('incidents')}
          className={`sidebar-nav-item ${activeTab === 'incidents' ? 'active' : ''}`}
          title="List of all active and resolved issues"
        >
          <AlertCircle className="nav-icon" />
          <span>All Incidents</span>
          {activeIncidentCount > 0 && (
            <span className="nav-count-badge active-alert">{activeIncidentCount} Active</span>
          )}
        </button>

        <button
          onClick={() => onSelectTab('investigate')}
          className={`sidebar-nav-item ${activeTab === 'investigate' ? 'active' : ''}`}
          title="Command Center: Investigate cause and approve fix"
        >
          <Search className="nav-icon" />
          <span>Command Center</span>
          {activeIncidentCount > 0 && (
            <span className="nav-attention-badge">Needs Action</span>
          )}
        </button>

        <div className="nav-section-label" style={{ marginTop: 14 }}>INVESTIGATION DETAILS</div>

        <button
          onClick={() => onSelectTab('evidence')}
          className={`sidebar-nav-item ${activeTab === 'evidence' ? 'active' : ''}`}
          title="Step-by-step evidence and proof chain"
        >
          <Layers className="nav-icon" />
          <span>Evidence Chain</span>
        </button>

        <button
          onClick={() => onSelectTab('memory')}
          className={`sidebar-nav-item ${activeTab === 'memory' ? 'active' : ''}`}
          title="Previous resolved incidents RESCUE learned from"
        >
          <Brain className="nav-icon" />
          <span>Learned Memory</span>
        </button>

        <button
          onClick={() => onSelectTab('deployments')}
          className={`sidebar-nav-item ${activeTab === 'deployments' ? 'active' : ''}`}
          title="Pull requests and verified rollouts"
        >
          <GitPullRequest className="nav-icon" />
          <span>Deployments &amp; PRs</span>
        </button>

        <div className="nav-section-label" style={{ marginTop: 14 }}>CONFIGURATION</div>

        <button
          onClick={() => onSelectTab('integrations')}
          className={`sidebar-nav-item ${activeTab === 'integrations' ? 'active' : ''}`}
          title="Connected applications, API keys and SDK setup"
        >
          <Radio className="nav-icon" />
          <span>Connected Apps</span>
        </button>

        <button
          onClick={() => onSelectTab('settings')}
          className={`sidebar-nav-item ${activeTab === 'settings' ? 'active' : ''}`}
          title="Rules, team notifications and security"
        >
          <Settings className="nav-icon" />
          <span>Settings</span>
        </button>

        <a
          href="/swagger/index.html"
          target="_blank"
          rel="noopener noreferrer"
          className="sidebar-nav-item swagger-nav-link"
          title="Open interactive Swagger REST API documentation"
        >
          <ExternalLink className="nav-icon" />
          <span>API Documentation</span>
          <span className="nav-badge-pill">Swagger</span>
        </a>
      </nav>

      {/* Interactive Quick Demo Action Box */}
      <div className="sidebar-demo-box">
        <div className="demo-box-label">QUICK SIMULATION DEMO</div>
        <button
          onClick={onRunDemo}
          disabled={loading}
          className="btn-sidebar-demo"
          title="Simulate an external API breaking change outage"
        >
          <Play style={{ width: 13, height: 13, fill: 'currentColor' }} />
          <span>{loading ? 'Analyzing...' : '⚡ Simulate Outage (Demo)'}</span>
        </button>
        <button
          onClick={onReset}
          disabled={loading}
          className="btn-sidebar-reset"
          title="Reset to clean healthy state"
        >
          <RefreshCw style={{ width: 12, height: 12 }} />
          <span>Reset to All Healthy</span>
        </button>
      </div>

      {/* Footer Project & Environment Context */}
      <div className="sidebar-footer">
        <div className="footer-context-label">CURRENT APPLICATION</div>
        <div className="project-switcher-select">
          <select
            value={selectedProjectId}
            onChange={(e) => onSelectProject(e.target.value)}
            className="project-dropdown"
          >
            {projects.length > 0 ? (
              projects.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))
            ) : (
              <option value="acme-commerce">Acme Commerce</option>
            )}
          </select>
          <ChevronDown className="select-arrow-icon" />
        </div>
        <div className="env-meta-row">
          <span className="env-tag">
            <span className="env-dot"></span>
            Production
          </span>
          <span className="mode-tag" title="RESCUE recommends fixes and asks for human approval">
            Human Approval Required
          </span>
        </div>
      </div>
    </aside>
  );
};
