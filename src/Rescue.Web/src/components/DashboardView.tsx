import React from 'react';
import { Server, Activity, AlertTriangle, ShieldCheck, ArrowRight, Play, Database, CheckCircle } from 'lucide-react';
import { Incident, ServiceHealth, MossObservabilityStats } from '../types';

interface DashboardViewProps {
  incident?: Incident;
  services: ServiceHealth[];
  mossStats?: MossObservabilityStats;
  onSelectIncident: () => void;
  onPlayKillerDemo: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  incident,
  services,
  mossStats,
  onSelectIncident,
  onPlayKillerDemo
}) => {
  const isOutage = incident && incident.status !== 'Resolved';
  const errorRate = isOutage ? 42.0 : incident?.errorRateAfter ?? 0.2;
  const latency = isOutage ? 1840.0 : incident?.latencyAfterMs ?? 45.0;

  return (
    <div>
      {/* Active Incident Alert Banner */}
      {isOutage && (
        <div
          onClick={onSelectIncident}
          style={{
            background: 'var(--sev1-bg)',
            border: '1px solid var(--sev1-border)',
            borderRadius: 8,
            padding: '12px 18px',
            marginBottom: 16,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <AlertTriangle style={{ width: 18, height: 18, color: 'var(--sev1-red)' }} />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span className="sev-badge sev1">SEV-1 ACTIVE</span>
                <strong style={{ fontSize: 13, color: '#FFF' }}>{incident.title}</strong>
              </div>
              <div style={{ fontSize: 11.5, color: 'var(--text-secondary)', marginTop: 2 }}>
                PaymentService sending deprecated field 'customer_id'. Correlated with upstream Acme Payments v4.2 release.
              </div>
            </div>
          </div>

          <button className="nav-link-btn active" style={{ fontSize: 11, fontWeight: 700, color: 'var(--sev1-red)' }}>
            Investigate in Incident Console <ArrowRight style={{ width: 13, height: 13 }} />
          </button>
        </div>
      )}

      {/* Cluster Metrics Row (Prometheus / Grafana Style) */}
      <div className="ent-metrics-row">
        <div className="ent-metric-card">
          <div className="ent-metric-title">HTTP 5xx Error Rate</div>
          <div className="ent-metric-val" style={{ color: isOutage ? 'var(--sev1-red)' : 'var(--healthy-green)' }}>
            {errorRate.toFixed(1)}%
          </div>
          <div className="ent-metric-sub">
            {isOutage ? '▲ Breached 1.0% SLO Threshold' : 'Nominal (<0.5%)'}
          </div>
        </div>

        <div className="ent-metric-card">
          <div className="ent-metric-title">P99 Payment Latency</div>
          <div className="ent-metric-val" style={{ color: isOutage ? 'var(--sev2-amber)' : 'var(--info-cyan)' }}>
            {Math.round(latency)} ms
          </div>
          <div className="ent-metric-sub">
            {isOutage ? '▲ Upstream Gateway Timeout' : 'Nominal (<50ms)'}
          </div>
        </div>

        <div className="ent-metric-card">
          <div className="ent-metric-title">Redis Pool Capacity</div>
          <div className="ent-metric-val" style={{ color: '#FFF' }}>
            {isOutage ? '200 / 200' : '78 / 200'}
          </div>
          <div className="ent-metric-sub">
            {isOutage ? 'Connections Exhausted' : 'Nominal Pool'}
          </div>
        </div>

        <div className="ent-metric-card">
          <div className="ent-metric-title">Moss In-Process Retrieval</div>
          <div className="ent-metric-val" style={{ color: 'var(--healthy-green)' }}>
            {mossStats ? `${mossStats.p50Ms} ms` : '0.74 ms'}
          </div>
          <div className="ent-metric-sub">
            Hardware-timed Stopwatch P50
          </div>
        </div>
      </div>

      {/* Microservices Catalog Table */}
      <div className="sre-panel">
        <div className="sre-panel-header">
          <div className="sre-panel-title">
            <Server style={{ width: 14, height: 14 }} />
            <span>Monitored Microservices Catalog (6 Services)</span>
          </div>
          <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
            Namespace: production
          </span>
        </div>

        <table className="services-table">
          <thead>
            <tr>
              <th>Service Name</th>
              <th>Domain</th>
              <th>Status</th>
              <th>Error Rate</th>
              <th>P99 Latency</th>
              <th>Pods / Replicas</th>
              <th>Version</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {services.map((svc) => {
              const isPayment = svc.name === 'PaymentService';
              const isCrit = isOutage && isPayment;

              return (
                <tr key={svc.name}>
                  <td>
                    <strong style={{ color: '#FFF', fontFamily: 'var(--font-mono)' }}>{svc.name}</strong>
                  </td>
                  <td style={{ color: 'var(--text-secondary)' }}>
                    {isPayment ? 'Payments & Checkout' : svc.name.replace('Service', ' Domain')}
                  </td>
                  <td>
                    <span className={`sev-badge ${isCrit ? 'sev1' : 'resolved'}`}>
                      {isCrit ? 'CRITICAL (503)' : 'HEALTHY'}
                    </span>
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: isCrit ? 'var(--sev1-red)' : 'var(--text-primary)' }}>
                    {isCrit ? '42.0%' : `${svc.errorRate}%`}
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)', color: isCrit ? 'var(--sev2-amber)' : 'var(--text-secondary)' }}>
                    {isCrit ? '1,840 ms' : `${svc.latencyMs} ms`}
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
                    {isCrit ? '2 / 4 Degraded' : '4 / 4'}
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-tertiary)' }}>
                    {svc.version}
                  </td>
                  <td>
                    {isCrit ? (
                      <button
                        onClick={onSelectIncident}
                        className="nav-link-btn active"
                        style={{ padding: '3px 8px', fontSize: 11 }}
                      >
                        Triage Incident
                      </button>
                    ) : (
                      <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Normal</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
