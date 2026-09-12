import React, { useState, useEffect } from 'react';
import * as signalR from '@microsoft/signalr';
import { SidebarNav, NavTab } from './components/SidebarNav';
import { OverviewView } from './components/OverviewView';
import { IncidentsListView } from './components/IncidentsListView';
import { IncidentCommandCenterView } from './components/IncidentCommandCenterView';
import { EvidenceGraphView } from './components/EvidenceGraphView';
import { RescueMemoryView } from './components/RescueMemoryView';
import { DeploymentsView } from './components/DeploymentsView';
import { IntegrationsView } from './components/IntegrationsView';
import { SettingsView } from './components/SettingsView';
import {
  Incident,
  ServiceHealth,
  AutonomyMode,
  MossObservabilityStats,
  MossBenchmarkResult,
  Project
} from './types';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<NavTab>('overview');
  const [autonomyMode, setAutonomyMode] = useState<AutonomyMode>('Recommend');
  const [services, setServices] = useState<ServiceHealth[]>([]);
  const [incident, setIncident] = useState<Incident | undefined>(undefined);
  const [mossStats, setMossStats] = useState<MossObservabilityStats | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('acme-commerce');

  // Initialize SignalR & initial load
  useEffect(() => {
    fetchDashboard();
    fetchProjects();

    const connection = new signalR.HubConnectionBuilder()
      .withUrl('/hubs/rescue')
      .withAutomaticReconnect()
      .build();

    connection.on('IncidentDetected', (inc: Incident) => {
      setIncident(inc);
    });

    connection.on('CorrelationCompleted', (corr: any) => {
      setIncident(prev => prev ? { ...prev, correlation: corr } : prev);
      setActiveTab('investigate'); // Focus on investigation command center
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
    });

    connection.on('ApprovalGranted', (appr: any) => {
      setIncident(prev => prev ? { ...prev, approval: appr, status: 'Deploying' } : prev);
    });

    connection.on('ApprovalRejected', (rej: any) => {
      setIncident(rej);
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
      fetchDashboard();
    });

    connection.on('EnvironmentReset', () => {
      setIncident(undefined);
      setActiveTab('overview');
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

  const fetchProjects = async () => {
    try {
      const res = await fetch('/api/projects');
      if (res.ok) {
        const data = await res.json();
        const list = Array.isArray(data) ? data : (data.projects || []);
        if (list.length > 0) {
          setProjects(list);
        }
      }
    } catch (e) {
      console.log('Projects fetch fallback:', e);
    }
  };

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

  const handlePlayKillerDemo = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/demo/scenario/api-incident', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setIncident(data.incident);
        setActiveTab('investigate'); // Show Command Center directly
        fetchDashboard();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    setLoading(true);
    try {
      await fetch('/api/demo/reset', { method: 'POST' });
      setIncident(undefined);
      setActiveTab('overview');
      fetchDashboard();
    } finally {
      setLoading(false);
    }
  };

  const handleApproveAndDeploy = async () => {
    if (!incident) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/incidents/${incident.id}/approve`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setIncident(data);
        fetchDashboard();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!incident) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/incidents/${incident.id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: 'Rejected by SRE for further analysis' })
      });
      if (res.ok) {
        const data = await res.json();
        setIncident(data);
        fetchDashboard();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRunBenchmark = async (): Promise<MossBenchmarkResult> => {
    const res = await fetch('/api/performance/moss/benchmark', { method: 'POST' });
    const data = await res.json();
    fetchDashboard();
    return data;
  };

  const activeIncidentCount = incident && incident.status !== 'Resolved' ? 1 : 0;
  const currentProject = projects.find(p => p.id === selectedProjectId) || {
    id: 'acme-commerce',
    name: 'Acme Commerce',
    environment: 'Production'
  };

  return (
    <div className="app-layout-root">
      {/* Left Global Sidebar Navigation */}
      <SidebarNav
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        activeIncidentCount={activeIncidentCount}
        autonomyMode={autonomyMode}
        onSetAutonomy={handleSetAutonomy}
        onRunDemo={handlePlayKillerDemo}
        onReset={handleReset}
        loading={loading}
        projects={projects}
        selectedProjectId={selectedProjectId}
        onSelectProject={setSelectedProjectId}
      />

      {/* Main Content Area */}
      <main className="app-main-viewport">
        {activeTab === 'overview' && (
          <OverviewView
            incident={incident}
            projectName={currentProject.name}
            environment={currentProject.environment || 'Production'}
            onInvestigateIncident={() => setActiveTab('investigate')}
            onTriggerDemo={handlePlayKillerDemo}
          />
        )}

        {activeTab === 'incidents' && (
          <IncidentsListView
            incident={incident}
            onSelectIncident={(id) => setActiveTab('investigate')}
            onTriggerDemo={handlePlayKillerDemo}
            loading={loading}
          />
        )}

        {activeTab === 'investigate' && (
          <IncidentCommandCenterView
            incident={incident}
            onApproveAndDeploy={handleApproveAndDeploy}
            onReject={handleReject}
            onNavigateToEvidence={() => setActiveTab('evidence')}
            onNavigateToMemory={() => setActiveTab('memory')}
            onTriggerDemo={handlePlayKillerDemo}
            loading={loading}
          />
        )}

        {activeTab === 'evidence' && (
          <EvidenceGraphView incident={incident} />
        )}

        {activeTab === 'memory' && (
          <RescueMemoryView />
        )}

        {activeTab === 'deployments' && (
          <DeploymentsView incident={incident} />
        )}

        {activeTab === 'integrations' && (
          <IntegrationsView
            projects={projects}
            selectedProjectId={selectedProjectId}
            onSelectProject={setSelectedProjectId}
            onProjectCreated={(newProj) => {
              setProjects(prev => [...prev, newProj]);
              setSelectedProjectId(newProj.id);
            }}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsView
            mossStats={mossStats}
            onRunBenchmark={handleRunBenchmark}
          />
        )}
      </main>
    </div>
  );
};
