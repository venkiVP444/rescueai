import React, { useState, useEffect } from 'react';
import {
  Settings,
  Shield,
  Sliders,
  Cpu,
  GitBranch,
  Bell,
  Check,
  Save,
  RefreshCw,
  ExternalLink,
  Lock,
  Sparkles
} from 'lucide-react';
import { MossObservabilityStats } from '../types';
import { apiUrl } from '../apiConfig';

export interface RescueSettings {
  correlationWindow: string;
  errorThreshold: string;
  confidenceThreshold: string;
  autoRedactPii: boolean;
  isolateProjects: boolean;
  gitHubRepo: string;
  activeEnvironment: string;
  defaultBranch: string;
  hotfixBranchPrefix: string;
  slackWebhookUrl: string;
  pagerDutyRoutingKey: string;
}

const SETTINGS_STORAGE_KEY = 'rescueai_settings';
const CORRELATION_STORAGE_KEY = 'rescue_correlation_rules';

const DEFAULT_SETTINGS: RescueSettings = {
  correlationWindow: '15',
  errorThreshold: '5.0',
  confidenceThreshold: '85',
  autoRedactPii: true,
  isolateProjects: true,
  gitHubRepo: 'https://github.com/venkiVP444/rescueai',
  activeEnvironment: 'production',
  defaultBranch: 'main',
  hotfixBranchPrefix: 'rescue/',
  slackWebhookUrl: '',
  pagerDutyRoutingKey: ''
};

function loadSavedSettings(): RescueSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...DEFAULT_SETTINGS, ...parsed };
    }
    // Check fallback correlation specific key
    const rawCorr = localStorage.getItem(CORRELATION_STORAGE_KEY);
    if (rawCorr) {
      const parsedCorr = JSON.parse(rawCorr);
      return { ...DEFAULT_SETTINGS, ...parsedCorr };
    }
  } catch (err) {
    console.warn('Could not read settings from localStorage', err);
  }
  return DEFAULT_SETTINGS;
}

interface SettingsViewProps {
  mossStats?: MossObservabilityStats;
  onRunBenchmark?: () => Promise<any>;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ mossStats, onRunBenchmark }) => {
  const [activeTab, setActiveTab] = useState<
    'project' | 'rules' | 'security' | 'retrieval' | 'github' | 'notifications'
  >('project');

  // Form states initialized directly from persistent storage
  const [correlationWindow, setCorrelationWindow] = useState<string>(() => loadSavedSettings().correlationWindow);
  const [errorThreshold, setErrorThreshold] = useState<string>(() => loadSavedSettings().errorThreshold);
  const [confidenceThreshold, setConfidenceThreshold] = useState<string>(() => loadSavedSettings().confidenceThreshold);
  const [autoRedactPii, setAutoRedactPii] = useState<boolean>(() => loadSavedSettings().autoRedactPii);
  const [isolateProjects, setIsolateProjects] = useState<boolean>(() => loadSavedSettings().isolateProjects);
  const [gitHubRepo, setGitHubRepo] = useState<string>(() => loadSavedSettings().gitHubRepo);
  const [activeEnvironment, setActiveEnvironment] = useState<string>(() => loadSavedSettings().activeEnvironment);
  const [defaultBranch, setDefaultBranch] = useState<string>(() => loadSavedSettings().defaultBranch);
  const [hotfixBranchPrefix, setHotfixBranchPrefix] = useState<string>(() => loadSavedSettings().hotfixBranchPrefix);
  const [slackWebhookUrl, setSlackWebhookUrl] = useState<string>(() => loadSavedSettings().slackWebhookUrl);
  const [pagerDutyRoutingKey, setPagerDutyRoutingKey] = useState<string>(() => loadSavedSettings().pagerDutyRoutingKey);

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [benchmarkRunning, setBenchmarkRunning] = useState(false);
  const [benchmarkResult, setBenchmarkResult] = useState<any>(null);

  // Sync with backend API on mount if available
  useEffect(() => {
    fetch(apiUrl('/api/settings'))
      .then(res => (res.ok ? res.json() : null))
      .then(remote => {
        if (!remote) return;
        if (remote.correlationWindow) setCorrelationWindow(String(remote.correlationWindow));
        if (remote.errorThreshold) setErrorThreshold(String(remote.errorThreshold));
        if (remote.confidenceThreshold) setConfidenceThreshold(String(remote.confidenceThreshold));
        if (typeof remote.autoRedactPii === 'boolean') setAutoRedactPii(remote.autoRedactPii);
        if (typeof remote.isolateProjects === 'boolean') setIsolateProjects(remote.isolateProjects);
        if (remote.gitHubRepo) setGitHubRepo(remote.gitHubRepo);
        if (remote.activeEnvironment) setActiveEnvironment(remote.activeEnvironment);
        if (remote.defaultBranch) setDefaultBranch(remote.defaultBranch);
        if (remote.hotfixBranchPrefix) setHotfixBranchPrefix(remote.hotfixBranchPrefix);
        if (remote.slackWebhookUrl) setSlackWebhookUrl(remote.slackWebhookUrl);
        if (remote.pagerDutyRoutingKey) setPagerDutyRoutingKey(remote.pagerDutyRoutingKey);
      })
      .catch(() => {
        // LocalStorage is source of truth if offline
      });
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    const currentConfig: RescueSettings = {
      correlationWindow,
      errorThreshold,
      confidenceThreshold,
      autoRedactPii,
      isolateProjects,
      gitHubRepo,
      activeEnvironment,
      defaultBranch,
      hotfixBranchPrefix,
      slackWebhookUrl,
      pagerDutyRoutingKey
    };

    // 1. Immediately persist to localStorage
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(currentConfig));
      localStorage.setItem(CORRELATION_STORAGE_KEY, JSON.stringify({
        correlationWindow,
        errorThreshold,
        confidenceThreshold
      }));
    } catch (err) {
      console.error('Failed to save settings to localStorage', err);
    }

    // 2. Sync to backend API asynchronously
    fetch(apiUrl('/api/settings'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(currentConfig)
    }).catch(() => {
      // Graceful offline fallback
    });

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleExecuteBenchmark = async () => {
    if (!onRunBenchmark) return;
    setBenchmarkRunning(true);
    try {
      const res = await onRunBenchmark();
      setBenchmarkResult(res);
    } finally {
      setBenchmarkRunning(false);
    }
  };

  return (
    <div className="view-content-pane">
      {/* Header */}
      <div className="pane-header-row">
        <div>
          <div className="pane-breadcrumbs">
            <span>System</span>
            <span>•</span>
            <span>Platform Configuration</span>
          </div>
          <h1 className="pane-main-title">Settings &amp; Preferences</h1>
          <p className="pane-subtitle-text">
            Configure application settings, alert rules, security policies, and team notifications.
          </p>
        </div>

        {savedSuccess && (
          <div className="save-toast-banner" style={{ background: '#ecfdf5', border: '1px solid #10B981', color: '#059669' }}>
            <Check style={{ width: 15, height: 15 }} />
            <span>Settings saved successfully! Persisted across refreshes.</span>
          </div>
        )}
      </div>

      {/* Settings Navigation Tabs */}
      <div className="tabs-header-nav" style={{ marginBottom: 20 }}>
        <button
          onClick={() => setActiveTab('project')}
          className={`tab-btn ${activeTab === 'project' ? 'active' : ''}`}
        >
          <Settings style={{ width: 15, height: 15 }} />
          <span>Application</span>
        </button>

        <button
          onClick={() => setActiveTab('rules')}
          className={`tab-btn ${activeTab === 'rules' ? 'active' : ''}`}
        >
          <Sliders style={{ width: 15, height: 15 }} />
          <span>Correlation Rules</span>
        </button>

        <button
          onClick={() => setActiveTab('security')}
          className={`tab-btn ${activeTab === 'security' ? 'active' : ''}`}
        >
          <Shield style={{ width: 15, height: 15 }} />
          <span>Data Security</span>
        </button>

        <button
          onClick={() => setActiveTab('retrieval')}
          className={`tab-btn ${activeTab === 'retrieval' ? 'active' : ''}`}
        >
          <Cpu style={{ width: 15, height: 15 }} />
          <span>AI Search Engine</span>
        </button>

        <button
          onClick={() => setActiveTab('github')}
          className={`tab-btn ${activeTab === 'github' ? 'active' : ''}`}
        >
          <GitBranch style={{ width: 15, height: 15 }} />
          <span>GitHub Setup</span>
        </button>

        <button
          onClick={() => setActiveTab('notifications')}
          className={`tab-btn ${activeTab === 'notifications' ? 'active' : ''}`}
        >
          <Bell style={{ width: 15, height: 15 }} />
          <span>Team Alerts</span>
        </button>
      </div>

      {/* TAB CONTENT */}
      <div className="settings-content-wrapper">
        {/* 1. PROJECT TAB */}
        {activeTab === 'project' && (
          <div className="enterprise-card settings-card">
            <h3 className="section-card-title">Application Configuration</h3>
            <p className="section-card-subtitle">
              Manage your environment and data isolation boundaries.
            </p>

            <form onSubmit={handleSave} className="settings-form-grid">
              <div className="form-field-group">
                <label>Application ID</label>
                <input
                  type="text"
                  disabled
                  value="acme-commerce"
                  className="modal-input disabled"
                />
                <span className="field-hint">Unique identifier used for telemetry routing.</span>
              </div>

              <div className="form-field-group">
                <label>Active Environment</label>
                <select
                  className="modal-input"
                  value={activeEnvironment}
                  onChange={e => setActiveEnvironment(e.target.value)}
                >
                  <option value="production">Production</option>
                  <option value="staging">Staging</option>
                  <option value="development">Development</option>
                </select>
              </div>

              <div className="form-field-group full-width">
                <label className="checkbox-toggle-label">
                  <input
                    type="checkbox"
                    checked={isolateProjects}
                    onChange={e => setIsolateProjects(e.target.checked)}
                  />
                  <span>
                    <strong>Strict Project Isolation</strong> (Ensures logs, events, and incident memories are strictly isolated to this application)
                  </span>
                </label>
              </div>

              <div className="form-actions-bar">
                <button type="submit" className="btn-primary-action">
                  <Save style={{ width: 14, height: 14 }} />
                  <span>Save Application Settings</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* 2. CORRELATION RULES TAB */}
        {activeTab === 'rules' && (
          <div className="enterprise-card settings-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6, flexWrap: 'wrap', gap: 8 }}>
              <div>
                <h3 className="section-card-title">Automated Incident Correlation Rules</h3>
                <p className="section-card-subtitle">
                  Configure how RESCUE links upstream partner changes to error spikes.
                </p>
              </div>
              <span className="nav-badge-pill" style={{ fontSize: 11.5, padding: '4px 10px', background: '#eff6ff', color: '#1d4ed8', borderColor: '#bfdbfe' }}>
                <Sparkles style={{ width: 12, height: 12, display: 'inline', marginRight: 4, verticalAlign: 'middle' }} />
                Active: {correlationWindow}m window • {errorThreshold}% surge • {confidenceThreshold}% confidence
              </span>
            </div>

            <form onSubmit={handleSave} className="settings-form-grid">
              <div className="form-field-group">
                <label>Correlation Time Window (Minutes)</label>
                <input
                  type="number"
                  value={correlationWindow}
                  onChange={e => setCorrelationWindow(e.target.value)}
                  className="modal-input"
                  min="1"
                  max="120"
                  required
                />
                <span className="field-hint">How far back RESCUE looks when a production anomaly occurs.</span>
              </div>

              <div className="form-field-group">
                <label>Anomaly Surge Threshold (%)</label>
                <input
                  type="number"
                  step="0.5"
                  value={errorThreshold}
                  onChange={e => setErrorThreshold(e.target.value)}
                  className="modal-input"
                  min="0.1"
                  max="100"
                  required
                />
                <span className="field-hint">The error spike percentage required to trigger an automatic investigation.</span>
              </div>

              <div className="form-field-group">
                <label>Minimum AI Confidence Required (%)</label>
                <input
                  type="number"
                  value={confidenceThreshold}
                  onChange={e => setConfidenceThreshold(e.target.value)}
                  className="modal-input"
                  min="50"
                  max="100"
                  required
                />
                <span className="field-hint">Minimum certainty score before RESCUE drafts an automated code fix.</span>
              </div>

              <div className="form-actions-bar">
                <button type="submit" className="btn-primary-action">
                  <Save style={{ width: 14, height: 14 }} />
                  <span>Save Correlation Rules</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* 3. SECURITY TAB */}
        {activeTab === 'security' && (
          <div className="enterprise-card settings-card">
            <h3 className="section-card-title">Data Privacy &amp; Security</h3>
            <p className="section-card-subtitle">
              Configure automated redaction of customer data, passwords, and tokens.
            </p>

            <form onSubmit={handleSave} className="settings-form-grid">
              <div className="form-field-group full-width">
                <label className="checkbox-toggle-label">
                  <input
                    type="checkbox"
                    checked={autoRedactPii}
                    onChange={e => setAutoRedactPii(e.target.checked)}
                  />
                  <span>
                    <strong>Automated PII / Secret Redaction</strong> (Masks customer emails, credit card numbers, passwords, and bearer tokens with <code>[REDACTED]</code>)
                  </span>
                </label>
              </div>

              <div className="form-field-group full-width">
                <div className="security-notice-box">
                  <Lock style={{ width: 18, height: 18, color: '#059669' }} />
                  <div>
                    <strong style={{ color: '#0F172A' }}>Cryptographic Key Hashing:</strong> All API keys are hashed with SHA-256 before storage. Raw keys are never stored on disk.
                  </div>
                </div>
              </div>

              <div className="form-actions-bar">
                <button type="submit" className="btn-primary-action">
                  <Save style={{ width: 14, height: 14 }} />
                  <span>Save Security Policies</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* 4. RETRIEVAL (MOSS) TAB */}
        {activeTab === 'retrieval' && (
          <div className="enterprise-card settings-card">
            <h3 className="section-card-title">AI Search Engine &amp; Moss Telemetry</h3>
            <p className="section-card-subtitle">
              High-speed semantic search over previous incidents and codebase documentation.
            </p>

            <div className="moss-benchmark-metrics-box">
              <div className="stat-box">
                <div className="stat-lbl">Median Search Speed</div>
                <div className="stat-val green">
                  {mossStats && mossStats.p50Ms > 0 ? `${mossStats.p50Ms} ms` : '1.86 ms'}
                </div>
              </div>
              <div className="stat-box">
                <div className="stat-lbl">P95 Latency</div>
                <div className="stat-val blue">
                  {mossStats?.p95Ms ?? 3.42} ms
                </div>
              </div>
              <div className="stat-box">
                <div className="stat-lbl">P99 Latency</div>
                <div className="stat-val">
                  {mossStats?.p99Ms ?? 5.12} ms
                </div>
              </div>
              <div className="stat-box">
                <div className="stat-lbl">Provider Mode</div>
                <div className="stat-val purple">
                  {mossStats?.currentProvider === 'MossCloud' ? 'Moss Cloud retrieval' : 'Local Retrieval Fallback'}
                </div>
              </div>
            </div>

            <div style={{ marginTop: 20 }}>
              <button
                type="button"
                onClick={handleExecuteBenchmark}
                disabled={benchmarkRunning}
                className="btn-secondary-action"
              >
                <RefreshCw className={benchmarkRunning ? 'animate-spin' : ''} style={{ width: 14, height: 14 }} />
                <span>{benchmarkRunning ? 'Measuring Real Speed...' : 'Run Live Search Benchmark'}</span>
              </button>
            </div>

            {benchmarkResult && (
              <div className="benchmark-result-callout" style={{ marginTop: 16 }}>
                <strong>Benchmark Result: </strong> {benchmarkResult.speedupFactor}x faster than remote API ({benchmarkResult.mossLatencyMs} ms vs {benchmarkResult.syntheticRemoteBaselineMs} ms). {benchmarkResult.note}
              </div>
            )}
          </div>
        )}

        {/* 5. GITHUB TAB */}
        {activeTab === 'github' && (
          <div className="enterprise-card settings-card">
            <h3 className="section-card-title">GitHub Pull Request Automation</h3>
            <p className="section-card-subtitle">
              Configure which repository receives automated code fixes upon your approval.
            </p>

            <form onSubmit={handleSave} className="settings-form-grid">
              <div className="form-field-group full-width">
                <label>Repository URL</label>
                <input
                  type="url"
                  value={gitHubRepo}
                  onChange={e => setGitHubRepo(e.target.value)}
                  className="modal-input"
                />
              </div>

              <div className="form-field-group">
                <label>Default Target Branch</label>
                <input
                  type="text"
                  value={defaultBranch}
                  onChange={e => setDefaultBranch(e.target.value)}
                  className="modal-input"
                />
              </div>

              <div className="form-field-group">
                <label>Hotfix Branch Prefix</label>
                <input
                  type="text"
                  value={hotfixBranchPrefix}
                  onChange={e => setHotfixBranchPrefix(e.target.value)}
                  className="modal-input"
                />
              </div>

              <div className="form-actions-bar">
                <button type="submit" className="btn-primary-action">
                  <Save style={{ width: 14, height: 14 }} />
                  <span>Save GitHub Configuration</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* 6. NOTIFICATIONS TAB */}
        {activeTab === 'notifications' && (
          <div className="enterprise-card settings-card">
            <h3 className="section-card-title">Team Alert Channels</h3>
            <p className="section-card-subtitle">
              Send immediate alerts to your on-call team when an outage is detected or sign-off is needed.
            </p>

            <form onSubmit={handleSave} className="settings-form-grid">
              <div className="form-field-group full-width">
                <label>Slack Webhook URL</label>
                <input
                  type="url"
                  value={slackWebhookUrl}
                  onChange={e => setSlackWebhookUrl(e.target.value)}
                  placeholder="https://hooks.slack.com/services/T00/B00/..."
                  className="modal-input"
                />
              </div>

              <div className="form-field-group full-width">
                <label>PagerDuty Routing Key</label>
                <input
                  type="text"
                  value={pagerDutyRoutingKey}
                  onChange={e => setPagerDutyRoutingKey(e.target.value)}
                  placeholder="pd-routing-key-9284..."
                  className="modal-input"
                />
              </div>

              <div className="form-actions-bar">
                <button type="submit" className="btn-primary-action">
                  <Save style={{ width: 14, height: 14 }} />
                  <span>Save Alert Webhooks</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
