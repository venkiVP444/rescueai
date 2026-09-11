import React from 'react';
import { Layers, Server, ArrowRight, ShieldCheck, Database, Network } from 'lucide-react';

export const SystemExplorerView: React.FC = () => {
  const services = [
    { name: 'API Gateway', port: 443, protocol: 'HTTPS / Ingress', type: 'Edge Routing', calls: ['OrderService', 'UserService'] },
    { name: 'OrderService', port: 5002, protocol: 'gRPC / HTTP', type: 'Domain Orchestration', calls: ['PaymentService', 'InventoryService', 'NotificationService'] },
    { name: 'PaymentService', port: 5001, protocol: 'HTTP / REST', type: 'Transactional Gateway', calls: ['Redis Cluster', 'PostgreSQL', 'Acme Payments Gateway v4.2'] },
    { name: 'InventoryService', port: 5003, protocol: 'gRPC', type: 'Warehouse & Stock', calls: ['PostgreSQL'] },
    { name: 'UserService', port: 5004, protocol: 'gRPC', type: 'Customer Identity', calls: ['PostgreSQL'] },
    { name: 'NotificationService', port: 5005, protocol: 'AMQP', type: 'Async Consumer', calls: ['RabbitMQ Cluster'] }
  ];

  return (
    <div>
      {/* Header */}
      <div className="incident-header-bar">
        <div>
          <div className="incident-badge-row">
            <span className="sev-badge resolved">SERVICE MESH ACTIVE</span>
            <span className="status-chip">Kubernetes Cluster</span>
            <span className="status-chip">Istio Sidecar Injected</span>
          </div>
          <h1 className="incident-title-text">Service Mesh Topology &amp; Lineage</h1>
          <div className="incident-meta-sub">
            <span>Namespace: <strong>production</strong></span>
            <span>•</span>
            <span>Mesh Coverage: <strong>100% Ingress &amp; Egress Monitored</strong></span>
            <span>•</span>
            <span>Nodes: <strong>6 Services • 3 Datastores • 1 External Gateway</strong></span>
          </div>
        </div>
      </div>

      {/* Request Lineage & Failure Path */}
      <div className="sre-panel">
        <div className="sre-panel-header">
          <div className="sre-panel-title">
            <Network style={{ width: 14, height: 14 }} />
            <span>Trace Lineage: Critical Transaction Path</span>
          </div>
          <span style={{ fontSize: 11, color: 'var(--sev1-red)', fontWeight: 700 }}>
            Incident INC-105 Failure Lineage
          </span>
        </div>
        <div className="sre-panel-body">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', fontSize: 12 }}>
            <span className="status-chip" style={{ background: 'var(--bg-surface-2)', color: '#FFF' }}>
              Client Browser
            </span>
            <ArrowRight style={{ width: 13, height: 13, color: 'var(--text-tertiary)' }} />
            <span className="status-chip" style={{ background: 'var(--bg-surface-2)', color: '#FFF' }}>
              API Gateway (:443)
            </span>
            <ArrowRight style={{ width: 13, height: 13, color: 'var(--text-tertiary)' }} />
            <span className="status-chip" style={{ background: 'var(--bg-surface-2)', color: '#FFF' }}>
              OrderService (:5002)
            </span>
            <ArrowRight style={{ width: 13, height: 13, color: 'var(--text-tertiary)' }} />
            <span className="sev-badge sev1" style={{ padding: '4px 10px' }}>
              PaymentService (:5001) [Cascading 503 Spike]
            </span>
            <ArrowRight style={{ width: 13, height: 13, color: 'var(--text-tertiary)' }} />
            <span className="sev-badge" style={{ background: 'var(--sev2-bg)', color: 'var(--sev2-amber)', border: '1px solid var(--sev2-border)', padding: '4px 10px' }}>
              Acme Payments Gateway v4.2 [Contract Drift: customer_id]
            </span>
          </div>
        </div>
      </div>

      {/* Services Mesh Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 14 }}>
        {services.map((svc) => (
          <div key={svc.name} className="sre-panel" style={{ marginBottom: 0 }}>
            <div className="sre-panel-header">
              <strong style={{ color: '#FFF', fontFamily: 'var(--font-mono)' }}>{svc.name}</strong>
              <span className="status-chip" style={{ fontSize: 10 }}>Port {svc.port} • {svc.protocol}</span>
            </div>
            <div className="sre-panel-body" style={{ fontSize: 12 }}>
              <div style={{ color: 'var(--text-secondary)', marginBottom: 8 }}>{svc.type}</div>
              <div style={{ fontSize: 11, color: 'var(--text-tertiary)', textTransform: 'uppercase', marginBottom: 4 }}>
                Downstream Egress ({svc.calls.length}):
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                {svc.calls.map((dep) => {
                  const isExternal = dep.includes('Acme');
                  return (
                    <span
                      key={dep}
                      className="status-chip"
                      style={{
                        fontSize: 11,
                        color: isExternal ? 'var(--sev2-amber)' : 'var(--info-cyan)',
                        borderColor: isExternal ? 'var(--sev2-border)' : undefined
                      }}
                    >
                      {dep}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
