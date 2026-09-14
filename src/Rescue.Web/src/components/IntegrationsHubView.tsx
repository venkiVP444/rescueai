import React, { useState, useEffect } from 'react';
import {
  FolderPlus,
  Key,
  Copy,
  Check,
  Code,
  Terminal,
  Server,
  Radio,
  Send,
  ShieldCheck,
  Layers,
  Clock,
  AlertTriangle,
  ExternalLink
} from 'lucide-react';
import { Project, RescueEvent } from '../types';
import { apiUrl, getActiveHost, SWAGGER_URL } from '../apiConfig';

export const IntegrationsHubView: React.FC = () => {
  const apiEndpoint = getActiveHost();
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('acme-commerce');
  const [events, setEvents] = useState<RescueEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);
  const [newlyCreatedKey, setNewlyCreatedKey] = useState<string | null>(null);

  // Form state
  const [formId, setFormId] = useState('');
  const [formName, setFormName] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formEnv, setFormEnv] = useState('production');
  const [formService, setFormService] = useState('');
  const [formRepo, setFormRepo] = useState('');

  // Test event state
  const [testEventType, setTestEventType] = useState('http_error');
  const [testEventMessage, setTestEventMessage] = useState('Connection pool timeout on /api/orders');
  const [sendingTestEvent, setSendingTestEvent] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  useEffect(() => {
    fetchProjects();
    fetchEvents();
    const interval = setInterval(fetchEvents, 4000);
    return () => clearInterval(interval);
  }, [selectedProjectId]);

  const fetchProjects = async () => {
    try {
      const res = await fetch(apiUrl('/api/v1/projects'));
      if (res.ok) {
        const data = await res.json();
        setProjects(data.projects || []);
      }
    } catch {
      // Fallback baseline
      setProjects([
        {
          id: 'acme-commerce',
          name: 'Acme Commerce Platform',
          description: 'Reference e-commerce checkout and payment microservices cluster.',
          environment: 'production',
          apiKeyPrefix: 'res_live_acme...',
          repositoryUrl: 'https://github.com/acme-commerce/platform',
          defaultBranch: 'main',
          services: ['PaymentService', 'OrderService'],
          createdAt: new Date().toISOString(),
          isActive: true
        }
      ]);
    }
  };

  const fetchEvents = async () => {
    try {
      const res = await fetch(apiUrl(`/api/v1/events?projectId=${selectedProjectId}&limit=20`));
      if (res.ok) {
        const data = await res.json();
        setEvents(data.events || []);
      }
    } catch {
      // Silently catch in polling
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formId.trim() || !formName.trim()) return;

    setLoading(true);
    try {
      const res = await fetch(apiUrl('/api/v1/projects'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: formId.trim().toLowerCase(),
          name: formName.trim(),
          description: formDesc.trim(),
          environment: formEnv,
          services: formService ? [formService.trim()] : [],
          repositoryUrl: formRepo.trim()
        })
      });

      if (res.ok) {
        const data = await res.json();
        setNewlyCreatedKey(data.rawApiKey);
        setShowCreateModal(false);
        fetchProjects();
        setSelectedProjectId(data.project.id);
        // Reset form
        setFormId('');
        setFormName('');
        setFormDesc('');
        setFormService('');
        setFormRepo('');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSendTestEvent = async () => {
    setSendingTestEvent(true);
    setTestResult(null);
    try {
      const res = await fetch(apiUrl('/api/v1/events'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': 'res_live_demo_test_bypass'
        },
        body: JSON.stringify({
          schemaVersion: '1.0',
          projectId: selectedProjectId,
          service: selectedProject?.services[0] || 'AppService',
          environment: selectedProject?.environment || 'production',
          eventType: testEventType,
          severity: 'critical',
          data: {
            statusCode: 504,
            endpoint: '/api/resource',
            message: testEventMessage,
            password: 'CustomerPassword123' // Sent to verify auto-redaction
          },
          correlation: {
            traceId: `trace-${Date.now().toString(36)}`
          }
        })
      });

      if (res.ok) {
        const data = await res.json();
        setTestResult(`✓ Event ingested successfully (ID: ${data.eventId})`);
        fetchEvents();
      } else {
        const err = await res.json();
        setTestResult(`Error: ${err.message}`);
      }
    } catch {
      setTestResult('Error: Failed to reach RESCUE API');
    } finally {
      setSendingTestEvent(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const selectedProject = projects.find(p => p.id === selectedProjectId) || projects[0];

  return (
    <div>
      {/* Header */}
      <div className="incident-header-bar">
        <div>
          <div className="incident-badge-row">
            <span className="sev-badge resolved">PLATFORM INTEGRATIONS</span>
            <span className="status-chip">Framework-Agnostic Core</span>
            <span className="status-chip" style={{ color: 'var(--info-cyan)' }}>Standard Event Contract v1.0</span>
          </div>
          <h1 className="incident-title-text">Projects &amp; External Application Integrations</h1>
          <div className="incident-meta-sub">
            <span>Active Project: <strong>{selectedProject?.name ?? 'Acme Commerce'}</strong></span>
            <span>•</span>
            <span>Registered Services: <strong>{(selectedProject?.services || []).join(', ') || 'Default'}</strong></span>
            <span>•</span>
            <span>Security: <strong>SHA-256 Hashed Secrets &amp; Automatic Redaction</strong></span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <a
            href={SWAGGER_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary-action"
            style={{ textDecoration: 'none', color: '#38BDF8', borderColor: 'rgba(56, 189, 248, 0.4)' }}
            title="Open Swagger REST API interactive explorer"
          >
            <ExternalLink style={{ width: 14, height: 14 }} />
            <span>Swagger API Docs</span>
          </a>
          <button onClick={() => setShowCreateModal(true)} className="btn-trigger-action">
            <FolderPlus style={{ width: 14, height: 14 }} />
            <span>Register New Project</span>
          </button>
        </div>
      </div>

      {/* Raw API Key One-Time Warning Banner */}
      {newlyCreatedKey && (
        <div style={{ background: 'rgba(245, 158, 11, 0.12)', border: '1px solid var(--sev2-amber)', borderRadius: 8, padding: '14px 16px', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <Key style={{ width: 16, height: 16, color: 'var(--sev2-amber)' }} />
            <strong style={{ color: 'var(--sev2-amber)', fontSize: 13 }}>
              Save Your Project Integration Secret Now!
            </strong>
          </div>
          <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 10, lineHeight: 1.5 }}>
            This raw integration secret is displayed <strong>ONLY ONCE</strong>. RESCUE stores only its SHA-256 cryptographic hash in operational storage to guarantee zero-knowledge security.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <code style={{ background: '#06090F', border: '1px solid var(--border-muted)', padding: '6px 12px', borderRadius: 4, color: 'var(--info-cyan)', fontFamily: 'var(--font-mono)', fontSize: 13, flex: 1 }}>
              {newlyCreatedKey}
            </code>
            <button
              onClick={() => copyToClipboard(newlyCreatedKey)}
              style={{ background: 'var(--sev2-amber)', color: '#000', border: 'none', padding: '6px 14px', borderRadius: 4, fontWeight: 700, fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
            >
              {copiedKey ? <Check style={{ width: 13, height: 13 }} /> : <Copy style={{ width: 13, height: 13 }} />}
              {copiedKey ? 'Copied!' : 'Copy Key'}
            </button>
            <button
              onClick={() => setNewlyCreatedKey(null)}
              style={{ background: 'transparent', border: '1px solid var(--border-muted)', color: 'var(--text-tertiary)', padding: '6px 12px', borderRadius: 4, fontSize: 11, cursor: 'pointer' }}
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Projects Navigation Bar */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, overflowX: 'auto', paddingBottom: 4 }}>
        {projects.map((p) => (
          <button
            key={p.id}
            onClick={() => setSelectedProjectId(p.id)}
            style={{
              padding: '8px 14px',
              borderRadius: 6,
              background: p.id === selectedProjectId ? 'var(--info-blue)' : 'var(--bg-surface-2)',
              color: p.id === selectedProjectId ? '#FFF' : 'var(--text-secondary)',
              border: p.id === selectedProjectId ? '1px solid var(--info-cyan)' : '1px solid var(--border-muted)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontSize: 12,
              fontWeight: 600
            }}
          >
            <Server style={{ width: 13, height: 13 }} />
            <span>{p.name}</span>
            {p.id === 'acme-commerce' && (
              <span className="status-chip" style={{ fontSize: 9, padding: '1px 5px', color: 'var(--healthy-green)' }}>
                Official Demo
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Two Column Integration Layout */}
      <div className="two-col-layout">
        {/* Left Column: Code Integration Guides */}
        <div>
          {/* SDK Connection Guide */}
          <div className="sre-panel">
            <div className="sre-panel-header">
              <div className="sre-panel-title">
                <Code style={{ width: 14, height: 14, color: 'var(--info-cyan)' }} />
                <span>Lightweight .NET SDK Integration</span>
              </div>
              <span className="status-chip" style={{ color: 'var(--healthy-green)' }}>Non-Blocking &amp; Fail-Safe</span>
            </div>
            <div className="sre-panel-body">
              <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 10, lineHeight: 1.5 }}>
                Add the RESCUE SDK to your ASP.NET Core service. Telemetry dispatch operates on a detached background worker queue so failures never impact your application.
              </p>
              <div style={{ background: '#06090F', border: '1px solid var(--border-muted)', borderRadius: 6, padding: 12, fontFamily: 'var(--font-mono)', fontSize: 11.5, color: 'var(--text-code)', overflowX: 'auto', lineHeight: 1.5 }}>
                <span style={{ color: '#6B7280' }}>// 1. Register RESCUE in Program.cs</span><br />
                builder.Services.<span style={{ color: '#60A5FA' }}>AddRescue</span>(options =&gt;<br />
                &#123;<br />
                &nbsp;&nbsp;options.Endpoint = <span style={{ color: '#34D399' }}>"{apiEndpoint}"</span>;<br />
                &nbsp;&nbsp;options.ProjectId = <span style={{ color: '#34D399' }}>"{selectedProject?.id ?? 'your-project'}"</span>;<br />
                &nbsp;&nbsp;options.ApiKey = <span style={{ color: '#FCD34D' }}>"YOUR_PROJECT_API_KEY"</span>;<br />
                &nbsp;&nbsp;options.Service = <span style={{ color: '#34D399' }}>"{selectedProject?.services[0] ?? 'OrdersService'}"</span>;<br />
                &#125;);<br /><br />
                <span style={{ color: '#6B7280' }}>// 2. Dispatch events safely from middleware, filters, or error handlers:</span><br />
                <span style={{ color: '#F472B6' }}>await</span> rescueClient.<span style={{ color: '#60A5FA' }}>SendHttpErrorAsync</span>(504, <span style={{ color: '#34D399' }}>"/checkout"</span>, <span style={{ color: '#34D399' }}>"Connection timeout"</span>);
              </div>
            </div>
          </div>

          {/* Webhook / cURL Ingestion Guide */}
          <div className="sre-panel">
            <div className="sre-panel-header">
              <div className="sre-panel-title">
                <Terminal style={{ width: 14, height: 14, color: 'var(--sev2-amber)' }} />
                <span>Generic Webhook Ingestion (HTTP / CI / CD)</span>
              </div>
              <span style={{ fontSize: 10, color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>POST /api/v1/events</span>
            </div>
            <div className="sre-panel-body">
              <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 10, lineHeight: 1.5 }}>
                Connect GitHub Actions, GitLab CI, Kubernetes alerts, or Datadog webhooks by posting standardized RESCUE events.
              </p>
              <div style={{ background: '#06090F', border: '1px solid var(--border-muted)', borderRadius: 6, padding: 12, fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-code)', overflowX: 'auto', lineHeight: 1.4 }}>
                curl -X POST {apiEndpoint}/api/v1/events \<br />
                &nbsp;&nbsp;-H "Content-Type: application/json" \<br />
                &nbsp;&nbsp;-H "X-API-Key: YOUR_PROJECT_API_KEY" \<br />
                &nbsp;&nbsp;-d '&#123;<br />
                &nbsp;&nbsp;&nbsp;&nbsp;"schemaVersion": "1.0",<br />
                &nbsp;&nbsp;&nbsp;&nbsp;"projectId": "{selectedProject?.id}",<br />
                &nbsp;&nbsp;&nbsp;&nbsp;"service": "{selectedProject?.services[0] ?? 'api-service'}",<br />
                &nbsp;&nbsp;&nbsp;&nbsp;"environment": "{selectedProject?.environment ?? 'production'}",<br />
                &nbsp;&nbsp;&nbsp;&nbsp;"eventType": "http_error",<br />
                &nbsp;&nbsp;&nbsp;&nbsp;"severity": "critical",<br />
                &nbsp;&nbsp;&nbsp;&nbsp;"data": &#123; "statusCode": 500, "message": "Database pool saturation" &#125;,<br />
                &nbsp;&nbsp;&nbsp;&nbsp;"correlation": &#123; "traceId": "trace-98402" &#125;<br />
                &nbsp;&nbsp;&#125;'
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Test Ingestion & Live Event Stream */}
        <div>
          {/* Interactive Test Event Dispatcher */}
          <div className="sre-panel">
            <div className="sre-panel-header">
              <div className="sre-panel-title">
                <Send style={{ width: 14, height: 14, color: 'var(--healthy-green)' }} />
                <span>Simulate Live Event Ingestion</span>
              </div>
              <span className="status-chip">Interactive Probe</span>
            </div>
            <div className="sre-panel-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
                <div>
                  <label style={{ fontSize: 11, color: 'var(--text-tertiary)', display: 'block', marginBottom: 4 }}>EVENT TYPE</label>
                  <select
                    value={testEventType}
                    onChange={(e) => setTestEventType(e.target.value)}
                    style={{ width: '100%', background: 'var(--bg-surface-2)', border: '1px solid var(--border-muted)', borderRadius: 4, padding: 6, color: '#FFF', fontSize: 12 }}
                  >
                    <option value="http_error">http_error (5xx Spike)</option>
                    <option value="deployment_completed">deployment_completed</option>
                    <option value="database_error">database_error (Pool Saturation)</option>
                    <option value="exception">exception (Unhandled)</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 11, color: 'var(--text-tertiary)', display: 'block', marginBottom: 4 }}>TARGET SERVICE</label>
                  <input
                    type="text"
                    value={selectedProject?.services[0] ?? 'AppService'}
                    disabled
                    style={{ width: '100%', background: 'var(--bg-surface-3)', border: '1px solid var(--border-muted)', borderRadius: 4, padding: 6, color: 'var(--text-secondary)', fontSize: 12 }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 11, color: 'var(--text-tertiary)', display: 'block', marginBottom: 4 }}>ERROR MESSAGE (INC. PASSWORD FOR REDACTION TEST)</label>
                <input
                  type="text"
                  value={testEventMessage}
                  onChange={(e) => setTestEventMessage(e.target.value)}
                  style={{ width: '100%', background: 'var(--bg-surface-2)', border: '1px solid var(--border-muted)', borderRadius: 4, padding: 6, color: '#FFF', fontSize: 12 }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <button onClick={handleSendTestEvent} disabled={sendingTestEvent} className="btn-trigger-action">
                  <Send style={{ width: 13, height: 13 }} />
                  <span>{sendingTestEvent ? 'Dispatching...' : 'Send Telemetry Event'}</span>
                </button>
                {testResult && (
                  <span style={{ fontSize: 11, color: testResult.startsWith('✓') ? 'var(--healthy-green)' : 'var(--sev1-red)', fontFamily: 'var(--font-mono)' }}>
                    {testResult}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Live Ingested Events Stream */}
          <div className="sre-panel">
            <div className="sre-panel-header">
              <div className="sre-panel-title">
                <Radio style={{ width: 14, height: 14, color: 'var(--info-cyan)' }} />
                <span>Live Ingested Telemetry Feed ({events.length} Events)</span>
              </div>
              <span style={{ fontSize: 10, color: 'var(--healthy-green)', fontFamily: 'var(--font-mono)' }}>STREAMING</span>
            </div>
            <div className="sre-panel-body" style={{ maxHeight: 320, overflowY: 'auto' }}>
              {events.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-tertiary)', fontSize: 12 }}>
                  No external events ingested yet for this project. Send a probe event above!
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {events.map((e) => (
                    <div
                      key={e.eventId}
                      style={{
                        background: 'var(--bg-surface-2)',
                        border: '1px solid var(--border-muted)',
                        borderRadius: 6,
                        padding: '8px 10px',
                        fontSize: 11.5
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span className={`sev-badge ${e.severity === 'critical' ? 'sev1' : 'resolved'}`} style={{ fontSize: 9, padding: '1px 5px' }}>
                            {e.eventType}
                          </span>
                          <strong style={{ color: '#FFF' }}>{e.service}</strong>
                        </div>
                        <span style={{ color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)', fontSize: 10 }}>
                          {new Date(e.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <div style={{ color: 'var(--text-secondary)', fontSize: 11, fontFamily: 'var(--font-mono)' }}>
                        Data: {JSON.stringify(e.data)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Project Registration Modal */}
      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal-container" style={{ maxWidth: 480 }}>
            <div className="modal-header">
              <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#FFF' }}>Register New Customer Project</h3>
              <button onClick={() => setShowCreateModal(false)} className="btn-icon-outline">✕</button>
            </div>
            <form onSubmit={handleCreateProject} style={{ padding: 16 }}>
              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 11, color: 'var(--text-tertiary)', display: 'block', marginBottom: 4 }}>PROJECT IDENTIFIER (SLUG)</label>
                <input
                  type="text"
                  placeholder="e.g. billing-microservice"
                  value={formId}
                  onChange={(e) => setFormId(e.target.value)}
                  required
                  style={{ width: '100%', background: 'var(--bg-surface-2)', border: '1px solid var(--border-muted)', borderRadius: 4, padding: 8, color: '#FFF', fontSize: 12.5 }}
                />
              </div>

              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 11, color: 'var(--text-tertiary)', display: 'block', marginBottom: 4 }}>PROJECT DISPLAY NAME</label>
                <input
                  type="text"
                  placeholder="e.g. Acme Billing Engine"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  required
                  style={{ width: '100%', background: 'var(--bg-surface-2)', border: '1px solid var(--border-muted)', borderRadius: 4, padding: 8, color: '#FFF', fontSize: 12.5 }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
                <div>
                  <label style={{ fontSize: 11, color: 'var(--text-tertiary)', display: 'block', marginBottom: 4 }}>ENVIRONMENT</label>
                  <select
                    value={formEnv}
                    onChange={(e) => setFormEnv(e.target.value)}
                    style={{ width: '100%', background: 'var(--bg-surface-2)', border: '1px solid var(--border-muted)', borderRadius: 4, padding: 8, color: '#FFF', fontSize: 12 }}
                  >
                    <option value="production">Production</option>
                    <option value="staging">Staging</option>
                    <option value="development">Development</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 11, color: 'var(--text-tertiary)', display: 'block', marginBottom: 4 }}>PRIMARY SERVICE</label>
                  <input
                    type="text"
                    placeholder="e.g. BillingService"
                    value={formService}
                    onChange={(e) => setFormService(e.target.value)}
                    style={{ width: '100%', background: 'var(--bg-surface-2)', border: '1px solid var(--border-muted)', borderRadius: 4, padding: 8, color: '#FFF', fontSize: 12 }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 11, color: 'var(--text-tertiary)', display: 'block', marginBottom: 4 }}>REPOSITORY URL (GITHUB / GITLAB / AZURE DEVOPS)</label>
                <input
                  type="text"
                  placeholder="https://github.com/organization/repository"
                  value={formRepo}
                  onChange={(e) => setFormRepo(e.target.value)}
                  style={{ width: '100%', background: 'var(--bg-surface-2)', border: '1px solid var(--border-muted)', borderRadius: 4, padding: 8, color: '#FFF', fontSize: 12 }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <button type="button" onClick={() => setShowCreateModal(false)} className="btn-icon-outline">
                  Cancel
                </button>
                <button type="submit" disabled={loading} className="btn-approve-primary">
                  {loading ? 'Creating...' : 'Register Project & Generate Key'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
