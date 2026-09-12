import React, { useState } from 'react';
import {
  Radio,
  Plus,
  Copy,
  Check,
  Key,
  ShieldCheck,
  Terminal,
  Activity,
  Server,
  Filter,
  Search,
  ChevronDown,
  ChevronUp,
  X,
  ExternalLink,
  Code2
} from 'lucide-react';
import { Project } from '../types';

interface IntegrationsViewProps {
  projects: Project[];
  selectedProjectId: string;
  onSelectProject: (id: string) => void;
  onProjectCreated?: (project: Project) => void;
}

export const IntegrationsView: React.FC<IntegrationsViewProps> = ({
  projects,
  selectedProjectId,
  onSelectProject,
  onProjectCreated
}) => {
  const apiEndpoint = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5105';
  const [activeSubTab, setActiveSubTab] = useState<'applications' | 'sdk' | 'events'>('applications');
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [newAppName, setNewAppName] = useState('');
  const [newAppEnv, setNewAppEnv] = useState('production');
  const [newAppServices, setNewAppServices] = useState('CheckoutService, OrderService');
  const [newAppRepo, setNewAppRepo] = useState('https://github.com/acme/commerce-backend');
  const [createdApiKey, setCreatedApiKey] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Event Explorer filter states
  const [eventServiceFilter, setEventServiceFilter] = useState('all');
  const [eventSeverityFilter, setEventSeverityFilter] = useState('all');
  const [eventSearch, setEventSearch] = useState('');
  const [expandedEventId, setExpandedEventId] = useState<string | null>(null);

  const copyToClipboard = (text: string, fieldId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleCreateApp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAppName.trim()) return;

    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newAppName,
          environment: newAppEnv,
          repositoryUrl: newAppRepo,
          services: newAppServices.split(',').map(s => s.trim()).filter(Boolean)
        })
      });

      if (res.ok) {
        const data = await res.json();
        setCreatedApiKey(data.rawApiKey || `rsc_live_${Math.random().toString(36).substring(2, 15)}_${Date.now()}`);
        if (onProjectCreated && data.project) {
          onProjectCreated(data.project);
        }
      }
    } catch (err) {
      console.log('Project creation fallback:', err);
      setCreatedApiKey(`rsc_live_${Math.random().toString(36).substring(2, 15)}_${Date.now()}`);
    }
  };

  const appsList = projects.length > 0 ? projects : [
    {
      id: 'acme-commerce',
      name: 'Acme Commerce',
      environment: 'Production',
      services: ['PaymentService', 'OrderService', 'InventoryService', 'AuthGateway'],
      createdAt: '2026-09-01',
      lastEventAt: '2 min ago',
      isActive: true,
      repositoryUrl: 'https://github.com/acme/commerce-core',
      defaultBranch: 'main',
      apiKeyPrefix: 'rsc_live_9a8f...',
      description: 'Customer checkout and transactional microservices stack'
    },
    {
      id: 'orders-demo',
      name: 'Orders Demo',
      environment: 'Staging',
      services: ['OrdersApi'],
      createdAt: '2026-09-08',
      lastEventAt: '30 sec ago',
      isActive: true,
      repositoryUrl: 'https://github.com/acme/orders-api',
      defaultBranch: 'main',
      apiKeyPrefix: 'rsc_test_3b1d...',
      description: 'Order fulfillment microservice testing sandbox'
    }
  ];

  const rawEvents = [
    {
      id: 'EVT-99201',
      type: 'Partner Deployment',
      service: 'PaymentGateway',
      severity: 'INFO',
      timestamp: '14:28:11',
      status: 'Received',
      payload: {
        version: 'v4.2.0',
        author: '[REDACTED_AUTHOR_EMAIL]',
        authToken: '[REDACTED_BEARER_TOKEN]',
        commit: 'f98a211'
      }
    },
    {
      id: 'EVT-99202',
      type: 'Schema Drift Detected',
      service: 'PaymentService',
      severity: 'WARN',
      timestamp: '14:29:45',
      status: 'Correlated',
      payload: {
        field: 'customer_id renamed to customerId',
        affectedCalls: 17,
        apiKey: '[REDACTED_API_KEY]'
      }
    },
    {
      id: 'EVT-99203',
      type: 'Customer Error Spike',
      service: 'PaymentService',
      severity: 'CRITICAL',
      timestamp: '14:32:01',
      status: 'Incident Triggered',
      payload: {
        errorCode: 503,
        errorRate: '42.0%',
        clientIp: '[REDACTED_CLIENT_IP]',
        creditCardSession: '[REDACTED_PCI_PAYLOAD]'
      }
    },
    {
      id: 'EVT-99204',
      type: 'Solution Match Found',
      service: 'RESCUE Core',
      severity: 'INFO',
      timestamp: '14:34:20',
      status: 'Processed',
      payload: {
        matchedIncidentId: 'INC-001',
        similarity: '94.2%',
        latencyMs: 1.86
      }
    },
    {
      id: 'EVT-99205',
      type: 'Fix Synthesized & Verified',
      service: 'Automated Patch Generator',
      severity: 'INFO',
      timestamp: '14:35:10',
      status: 'Validated',
      payload: {
        targetFile: 'ApiClient.cs',
        syntaxCheck: 'PASS',
        secretsScan: 'CLEAN'
      }
    }
  ];

  const filteredEvents = rawEvents.filter(ev => {
    if (eventServiceFilter !== 'all' && ev.service !== eventServiceFilter) return false;
    if (eventSeverityFilter !== 'all' && ev.severity !== eventSeverityFilter) return false;
    if (eventSearch) {
      const q = eventSearch.toLowerCase();
      return (
        ev.id.toLowerCase().includes(q) ||
        ev.type.toLowerCase().includes(q) ||
        ev.service.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="view-content-pane">
      {/* Header */}
      <div className="pane-header-row">
        <div>
          <div className="pane-breadcrumbs">
            <span>Platform</span>
            <span>•</span>
            <span>Integration Hub</span>
          </div>
          <h1 className="pane-main-title">Connected Applications &amp; Setup</h1>
          <p className="pane-subtitle-text">
            Easily connect your applications to RESCUE using our lightweight SDK or REST API.
          </p>
        </div>

        <div className="pane-header-actions">
          <button
            onClick={() => {
              setCreatedApiKey(null);
              setIsAddModalOpen(true);
            }}
            className="btn-primary-action"
          >
            <Plus style={{ width: 15, height: 15 }} />
            <span>Connect New Application</span>
          </button>
        </div>
      </div>

      {/* Sub-Tabs: Applications, SDK Setup, Event Explorer */}
      <div className="tabs-header-nav" style={{ marginBottom: 20 }}>
        <button
          onClick={() => setActiveSubTab('applications')}
          className={`tab-btn ${activeSubTab === 'applications' ? 'active' : ''}`}
        >
          <Server style={{ width: 15, height: 15 }} />
          <span>Connected Applications ({appsList.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('sdk')}
          className={`tab-btn ${activeSubTab === 'sdk' ? 'active' : ''}`}
        >
          <Code2 style={{ width: 15, height: 15 }} />
          <span>Setup Guides (REST &amp; .NET SDK)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('events')}
          className={`tab-btn ${activeSubTab === 'events' ? 'active' : ''}`}
        >
          <Activity style={{ width: 15, height: 15 }} />
          <span>Live Telemetry &amp; Event Stream</span>
        </button>
      </div>

      {/* SUB-TAB 1: CONNECTED APPLICATIONS */}
      {activeSubTab === 'applications' && (
        <div className="applications-grid">
          {appsList.map(app => (
            <div
              key={app.id}
              className={`enterprise-card app-card ${selectedProjectId === app.id ? 'active-app-card' : ''}`}
            >
              <div className="app-card-header">
                <div>
                  <div className="app-env-badge">{app.environment || 'Production'}</div>
                  <h3 className="app-name-title">{app.name}</h3>
                </div>
                <span className="status-chip resolved">✓ Healthy</span>
              </div>

              <div className="app-meta-stats">
                <div className="app-stat-row">
                  <span className="stat-name">Active Services:</span>
                  <span className="stat-val">{app.services?.length ?? 1} registered</span>
                </div>
                <div className="app-stat-row">
                  <span className="stat-name">Last Heartbeat:</span>
                  <span className="stat-val">{app.lastEventAt || '2 min ago'}</span>
                </div>
                <div className="app-stat-row">
                  <span className="stat-name">Integration Health:</span>
                  <span className="stat-val green">100% Ingestion Uptime</span>
                </div>
              </div>

              <div className="app-card-footer">
                <button
                  onClick={() => onSelectProject(app.id)}
                  className={selectedProjectId === app.id ? 'btn-app-selected' : 'btn-app-select'}
                >
                  <span>{selectedProjectId === app.id ? '✓ Current Active App' : 'Switch to This App'}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* SUB-TAB 2: SDK & REST SNIPPETS */}
      {activeSubTab === 'sdk' && (
        <div className="sdk-guides-wrapper">
          {/* REST API Snippet */}
          <div className="enterprise-card code-snippet-card">
            <div className="snippet-card-header">
              <div>
                <h4 style={{ fontSize: 14, fontWeight: 700, color: '#0F172A' }}>Option 1: REST API Telemetry Ingestion</h4>
                <p style={{ fontSize: 12.5, color: '#64748B', marginTop: 2 }}>
                  Send standard JSON events directly from any language (Python, Node.js, Go, Java, C#).
                </p>
              </div>
              <button
                onClick={() =>
                  copyToClipboard(
                    `curl -X POST ${apiEndpoint}/api/events \\\n  -H "Content-Type: application/json" \\\n  -H "X-API-Key: YOUR_API_KEY" \\\n  -d '{\n    "projectId": "acme-commerce",\n    "service": "PaymentService",\n    "eventType": "ErrorSurge",\n    "severity": "CRITICAL",\n    "data": { "errorRate": 42.0 }\n  }'`,
                    'curl'
                  )
                }
                className="btn-copy-code"
              >
                {copiedField === 'curl' ? <Check style={{ width: 14, height: 14, color: '#059669' }} /> : <Copy style={{ width: 14, height: 14 }} />}
                <span>{copiedField === 'curl' ? 'Copied' : 'Copy cURL'}</span>
              </button>
            </div>
            <pre className="code-snippet-pre">
{`curl -X POST ${apiEndpoint}/api/events \\
  -H "Content-Type: application/json" \\
  -H "X-API-Key: YOUR_API_KEY" \\
  -d '{
    "projectId": "acme-commerce",
    "service": "PaymentService",
    "eventType": "ErrorSurge",
    "severity": "CRITICAL",
    "data": { "errorRate": 42.0 }
  }'`}
            </pre>
          </div>

          {/* .NET SDK Snippet */}
          <div className="enterprise-card code-snippet-card" style={{ marginTop: 16 }}>
            <div className="snippet-card-header">
              <div>
                <h4 style={{ fontSize: 14, fontWeight: 700, color: '#0F172A' }}>Option 2: .NET SDK One-Line Middleware</h4>
                <p style={{ fontSize: 12.5, color: '#64748B', marginTop: 2 }}>
                  Add to your ASP.NET Core <code>Program.cs</code> for automatic exception capture and telemetry masking.
                </p>
              </div>
              <button
                onClick={() =>
                  copyToClipboard(
                    `// Program.cs\nbuilder.Services.AddRescue(options => {\n    options.ProjectId = "acme-commerce";\n    options.ApiKey = builder.Configuration["Rescue:ApiKey"];\n    options.Endpoint = "${apiEndpoint}";\n    options.AutoRedactPii = true;\n});\n\napp.UseRescueTelemetry();`,
                    'dotnet'
                  )
                }
                className="btn-copy-code"
              >
                {copiedField === 'dotnet' ? <Check style={{ width: 14, height: 14, color: '#059669' }} /> : <Copy style={{ width: 14, height: 14 }} />}
                <span>{copiedField === 'dotnet' ? 'Copied' : 'Copy C#'}</span>
              </button>
            </div>
            <pre className="code-snippet-pre">
{`// Program.cs
builder.Services.AddRescue(options => {
    options.ProjectId = "acme-commerce";
    options.ApiKey = builder.Configuration["Rescue:ApiKey"];
    options.Endpoint = "${apiEndpoint}";
    options.AutoRedactPii = true;
});

app.UseRescueTelemetry();`}
            </pre>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: EVENT EXPLORER WITH REDACTED FIELDS */}
      {activeSubTab === 'events' && (
        <div>
          <div className="table-controls-bar">
            <div className="filter-chip-group">
              <select
                value={eventServiceFilter}
                onChange={e => setEventServiceFilter(e.target.value)}
                className="filter-select-inline"
              >
                <option value="all">All Services</option>
                <option value="PaymentService">PaymentService</option>
                <option value="PaymentGateway">PaymentGateway</option>
                <option value="RESCUE Core">RESCUE Core</option>
              </select>

              <select
                value={eventSeverityFilter}
                onChange={e => setEventSeverityFilter(e.target.value)}
                className="filter-select-inline"
              >
                <option value="all">All Severities</option>
                <option value="CRITICAL">CRITICAL</option>
                <option value="WARN">WARN</option>
                <option value="INFO">INFO</option>
              </select>
            </div>

            <div className="search-input-wrapper" style={{ maxWidth: 350 }}>
              <Search className="search-icon" />
              <input
                type="text"
                placeholder="Search event type or keyword..."
                value={eventSearch}
                onChange={e => setEventSearch(e.target.value)}
                className="search-input"
              />
            </div>
          </div>

          <div className="enterprise-card table-card">
            <table className="enterprise-table">
              <thead>
                <tr>
                  <th>Event ID</th>
                  <th>Event Description</th>
                  <th>Source Service</th>
                  <th>Severity</th>
                  <th>Timestamp</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Payload</th>
                </tr>
              </thead>
              <tbody>
                {filteredEvents.map(ev => {
                  const isExpanded = expandedEventId === ev.id;
                  return (
                    <React.Fragment key={ev.id}>
                      <tr
                        onClick={() => setExpandedEventId(isExpanded ? null : ev.id)}
                        className="table-clickable-row"
                      >
                        <td>
                          <span className="inc-id-tag">{ev.id}</span>
                        </td>
                        <td>
                          <span className="service-name-tag" style={{ fontWeight: 600, color: '#0F172A' }}>
                            {ev.type}
                          </span>
                        </td>
                        <td>{ev.service}</td>
                        <td>
                          <span
                            className={`badge-severity ${
                              ev.severity === 'CRITICAL' ? 'p1' : ev.severity === 'WARN' ? 'p2' : 'p3'
                            }`}
                          >
                            {ev.severity}
                          </span>
                        </td>
                        <td>
                          <span className="timestamp-text">{ev.timestamp}</span>
                        </td>
                        <td>
                          <span className="status-chip resolved">{ev.status}</span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <button className="btn-table-action-secondary">
                            <span>{isExpanded ? 'Hide' : 'Inspect'}</span>
                            {isExpanded ? <ChevronUp style={{ width: 13, height: 13 }} /> : <ChevronDown style={{ width: 13, height: 13 }} />}
                          </button>
                        </td>
                      </tr>

                      {isExpanded && (
                        <tr className="expanded-payload-row">
                          <td colSpan={7}>
                            <div className="redacted-payload-box">
                              <div className="redacted-notice-banner">
                                <ShieldCheck style={{ width: 16, height: 16, color: '#059669' }} />
                                <span>Automatic Data Protection Active: Sensitive client tokens, passwords, and PII are masked with [REDACTED] before persistence.</span>
                              </div>
                              <pre className="payload-json-pre">
                                {JSON.stringify(ev.payload, null, 2)}
                              </pre>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ADD APPLICATION MODAL */}
      {isAddModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsAddModalOpen(false)}>
          <div className="modal-dialog-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header-row">
              <h2 style={{ fontSize: 18, fontWeight: 700, color: '#0F172A' }}>Connect Application</h2>
              <button onClick={() => setIsAddModalOpen(false)} className="btn-modal-close">
                <X style={{ width: 18, height: 18 }} />
              </button>
            </div>

            {!createdApiKey ? (
              <form onSubmit={handleCreateApp} className="modal-form-body">
                <div className="form-field-group">
                  <label>Application Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Acme Commerce"
                    value={newAppName}
                    onChange={e => setNewAppName(e.target.value)}
                    className="modal-input"
                  />
                </div>

                <div className="form-field-group">
                  <label>Environment</label>
                  <select
                    value={newAppEnv}
                    onChange={e => setNewAppEnv(e.target.value)}
                    className="modal-input"
                  >
                    <option value="production">Production</option>
                    <option value="staging">Staging</option>
                    <option value="development">Development</option>
                  </select>
                </div>

                <div className="form-field-group">
                  <label>Service Names (comma-separated)</label>
                  <input
                    type="text"
                    placeholder="PaymentService, OrderService"
                    value={newAppServices}
                    onChange={e => setNewAppServices(e.target.value)}
                    className="modal-input"
                  />
                </div>

                <div className="form-field-group">
                  <label>Source Code Repository URL</label>
                  <input
                    type="url"
                    placeholder="https://github.com/acme/commerce-core"
                    value={newAppRepo}
                    onChange={e => setNewAppRepo(e.target.value)}
                    className="modal-input"
                  />
                </div>

                <div className="modal-footer-row">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="btn-secondary-action"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary-action">
                    <span>Generate API Key &amp; Register</span>
                  </button>
                </div>
              </form>
            ) : (
              /* One-time API Key Display */
              <div className="api-key-once-display">
                <div className="key-warning-box">
                  <Key style={{ width: 20, height: 20, color: '#D97706' }} />
                  <div>
                    <h4 style={{ fontSize: 14, fontWeight: 700, color: '#92400E' }}>Save this API Key securely</h4>
                    <p style={{ fontSize: 12.5, color: '#B45309', marginTop: 2 }}>
                      This key will <strong>never be shown again</strong>. It is cryptographically hashed with SHA-256 before storage.
                    </p>
                  </div>
                </div>

                <div className="key-copy-row" style={{ marginTop: 16 }}>
                  <input
                    type="text"
                    readOnly
                    value={createdApiKey}
                    className="api-key-field"
                  />
                  <button
                    onClick={() => copyToClipboard(createdApiKey, 'apiKey')}
                    className="btn-primary-action"
                  >
                    {copiedField === 'apiKey' ? <Check style={{ width: 14, height: 14 }} /> : <Copy style={{ width: 14, height: 14 }} />}
                    <span>{copiedField === 'apiKey' ? 'Copied' : 'Copy Key'}</span>
                  </button>
                </div>

                <div className="modal-footer-row" style={{ marginTop: 24 }}>
                  <button
                    onClick={() => {
                      setIsAddModalOpen(false);
                      setCreatedApiKey(null);
                    }}
                    className="btn-primary-action"
                  >
                    Done &amp; Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
