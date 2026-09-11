import React, { useState, useEffect } from 'react';
import * as signalR from '@microsoft/signalr';
import { TopNav } from './components/TopNav';
import { DashboardView } from './components/DashboardView';
import { ConnectedTheDotsView } from './components/ConnectedTheDotsView';
import { FixModal } from './components/FixModal';
import { MossObservabilityView } from './components/MossObservabilityView';
import { SystemExplorerView } from './components/SystemExplorerView';
import { SubmissionHubView } from './components/SubmissionHubView';
import { IntegrationsHubView } from './components/IntegrationsHubView';
import {
  Incident,
  ServiceHealth,
  AutonomyMode,
  MossObservabilityStats,
  MossBenchmarkResult
} from './types';
import { ShieldAlert, CheckCircle, AlertTriangle, FileCode } from 'lucide-react';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'dots' | 'moss' | 'explorer' | 'submission' | 'integrations'>('dots');
  const [autonomyMode, setAutonomyMode] = useState<AutonomyMode>('Recommend');
  const [systemStatus, setSystemStatus] = useState<string>('Healthy');
  const [services, setServices] = useState<ServiceHealth[]>([]);
  const [incident, setIncident] = useState<Incident | undefined>(undefined);
  const [mossStats, setMossStats] = useState<MossObservabilityStats | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(false);
  const [isFixModalOpen, setIsFixModalOpen] = useState<boolean>(false);
  const [dismissApprovalBanner, setDismissApprovalBanner] = useState<boolean>(false);

  // Initialize SignalR & initial load
  useEffect(() => {
    fetchDashboard();

    const connection = new signalR.HubConnectionBuilder()
      .withUrl('/hubs/rescue')
      .withAutomaticReconnect()
      .build();

    connection.on('IncidentDetected', (inc: Incident) => {
      setIncident(inc);
      setSystemStatus('Critical');
      setDismissApprovalBanner(false);
    });

    connection.on('CorrelationCompleted', (corr: any) => {
      setIncident(prev => prev ? { ...prev, correlation: corr } : prev);
      setActiveTab('dots'); // Automatically bring engineer to the showstopper view
    });

    connection.on('MemoryMatchFound', (match: any) => {
      setIncident(prev => prev ? {
        ...prev,
        investigation: prev.investigation ? { ...prev.investigation, similarMemoryMatch: match } : undefined
      } : prev);
    });

    connection.on('DiagnosisCompleted', (diag: any) => {
      setIncident(prev => prev ? { ...prev, investigation: diag, rootCause: diag.rootCause } : prev);
    });

    connection.on('FixGenerated', (patch: any) => {
      setIncident(prev => prev ? { ...prev, proposedPatch: patch } : prev);
    });

    connection.on('ValidationCompleted', (val: any) => {
      setIncident(prev => prev ? { ...prev, validationReport: val } : prev);
    });

    connection.on('ApprovalRequired', (payload: any) => {
      setIncident(prev => prev ? {
        ...prev,
        status: payload?.autonomyMode === 'Observe' ? 'Investigating' : 'AwaitingApproval',
        proposedPatch: payload?.patch || prev.proposedPatch,
        validationReport: payload?.validation || prev.validationReport
      } : prev);
      setDismissApprovalBanner(false);
    });

    connection.on('ApprovalGranted', (appr: any) => {
      setIncident(prev => prev ? { ...prev, approval: appr, status: 'Deploying' } : prev);
    });

    connection.on('GitHubPrCreated', (pr: any) => {
      setIncident(prev => prev ? { ...prev, githubPr: pr } : prev);
    });

    connection.on('VerificationCompleted', (verif: any) => {
      setIncident(prev => prev ? {
        ...prev,
        verification: verif,
        errorRateAfter: verif.afterErrorRate,
        latencyAfterMs: verif.afterLatencyMs
      } : prev);
    });

    connection.on('IncidentResolved', (res: Incident) => {
      setIncident(res);
      setSystemStatus('Healthy');
      fetchDashboard();
    });

    connection.on('EnvironmentReset', () => {
      setIncident(undefined);
      setSystemStatus('Healthy');
      setActiveTab('dots');
      setDismissApprovalBanner(false);
      fetchDashboard();
    });

    connection.start().catch(err => console.log('SignalR connection info:', err));

    return () => {
      connection.stop();
    };
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await fetch('/api/dashboard');
      if (res.ok) {
        const data = await res.json();
        setServices(data.services || []);
        setMossStats(data.mossObservability);
        if (data.autonomyMode) {
          setAutonomyMode(data.autonomyMode as AutonomyMode);
        }
      }
    } catch (e) {
      console.log('Dashboard fetch fallback:', e);
    }
  };

  // Sync autonomy mode with backend
  const handleSetAutonomy = async (mode: AutonomyMode) => {
    setAutonomyMode(mode);
    try {
      await fetch('/api/dashboard/autonomy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mode)
      });
    } catch (e) {
      console.log('Failed to sync autonomy mode:', e);
    }
  };

  // Run Killer Demo: API Change -> Production Incident
  const handlePlayKillerDemo = async () => {
    setLoading(true);
    setDismissApprovalBanner(false);
    try {
      const res = await fetch('/api/demo/scenario/api-incident', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setIncident(data.incident);
        setSystemStatus(data.incident.status === 'Resolved' ? 'Healthy' : 'Critical');
        setActiveTab('dots'); // Highlight "RESCUE CONNECTED THE DOTS"
        fetchDashboard();
      }
    } finally {
      setLoading(false);
    }
  };

  // Reset Environment
  const handleReset = async () => {
    setLoading(true);
    try {
      await fetch('/api/demo/reset', { method: 'POST' });
      setIncident(undefined);
      setSystemStatus('Healthy');
      setActiveTab('dots');
      setDismissApprovalBanner(false);
      fetchDashboard();
    } finally {
      setLoading(false);
    }
  };

  // Approve & Deploy
  const handleApproveAndDeploy = async () => {
    if (!incident) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/incidents/${incident.id}/approve`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setIncident(data);
        setSystemStatus('Healthy');
        setDismissApprovalBanner(true);
        fetchDashboard();
      }
    } finally {
      setLoading(false);
    }
  };

  // Reject Fix
  const handleReject = async () => {
    if (!incident) return;
    await fetch(`/api/incidents/${incident.id}/reject`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason: 'Rejected by SRE for further analysis' })
    });
    setDismissApprovalBanner(true);
    setIsFixModalOpen(false);
  };

  // Run Benchmark
  const handleRunBenchmark = async (): Promise<MossBenchmarkResult> => {
    const res = await fetch('/api/performance/moss/benchmark', { method: 'POST' });
    const data = await res.json();
    fetchDashboard();
    return data;
  };

  const isAwaitingApproval = incident?.status === 'AwaitingApproval' && !dismissApprovalBanner;

  return (
    <div className="app-shell">
      <TopNav
        autonomyMode={autonomyMode}
        onSetAutonomy={handleSetAutonomy}
        systemStatus={systemStatus}
        mossStats={mossStats}
        onRunKillerDemo={handlePlayKillerDemo}
        onReset={handleReset}
        loading={loading}
        activeTab={activeTab}
        onSelectTab={(tab) => setActiveTab(tab as any)}
      />

      <main className="main-viewport">
        {activeTab === 'dots' && (
          <ConnectedTheDotsView
            incident={incident}
            mossStats={mossStats}
            onOpenFixModal={() => setIsFixModalOpen(true)}
            onApproveAndDeploy={handleApproveAndDeploy}
            onReject={handleReject}
          />
        )}

        {activeTab === 'dashboard' && (
          <DashboardView
            incident={incident}
            services={services}
            mossStats={mossStats}
            onSelectIncident={() => setActiveTab('dots')}
            onPlayKillerDemo={handlePlayKillerDemo}
          />
        )}

        {activeTab === 'moss' && (
          <MossObservabilityView
            stats={mossStats}
            onRunBenchmark={handleRunBenchmark}
          />
        )}

        {activeTab === 'explorer' && (
          <SystemExplorerView />
        )}

        {activeTab === 'submission' && (
          <SubmissionHubView />
        )}

        {activeTab === 'integrations' && (
          <IntegrationsHubView />
        )}
      </main>

      {/* Fix & Approval Modal */}
      <FixModal
        incident={incident}
        isOpen={isFixModalOpen}
        onClose={() => setIsFixModalOpen(false)}
        onApprove={handleApproveAndDeploy}
        onReject={handleReject}
      />
    </div>
  );
};
