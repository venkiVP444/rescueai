import React, { useState } from 'react';
import {
  Layers,
  Server,
  ArrowRight,
  ShieldCheck,
  Database,
  Network,
  Activity,
  AlertTriangle,
  CheckCircle,
  ExternalLink,
  Cpu,
  RefreshCw,
  GitCommit,
  Filter,
  Zap
} from 'lucide-react';

interface ServiceNode {
  id: string;
  name: string;
  category: 'service' | 'datastore' | 'gateway';
  port: number;
  protocol: string;
  type: string;
  tech: string;
  status: 'nominal' | 'degraded' | 'healthy';
  errorRate: string;
  latency: string;
  throughput: string;
  calls: string[];
  isCriticalPath?: boolean;
  description: string;
}

export const SystemExplorerView: React.FC = () => {
  const [filterCategory, setFilterCategory] = useState<'all' | 'service' | 'datastore' | 'gateway' | 'critical'>('all');
  const [selectedServiceId, setSelectedServiceId] = useState<string>('PaymentService');

  const services: ServiceNode[] = [
    {
      id: 'APIGateway',
      name: 'API Gateway',
      category: 'gateway',
      port: 443,
      protocol: 'HTTPS / Ingress',
      type: 'Edge Reverse Proxy',
      tech: 'Envoy / Go v1.23',
      status: 'nominal',
      errorRate: '0.04%',
      latency: '2.1 ms',
      throughput: '4,850 req/s',
      calls: ['OrderService', 'UserService'],
      isCriticalPath: true,
      description: 'Public TLS termination, rate-limiting, and JWT authentication edge gateway.'
    },
    {
      id: 'OrderService',
      name: 'OrderService',
      category: 'service',
      port: 5002,
      protocol: 'gRPC / HTTP',
      type: 'Domain Orchestrator',
      tech: '.NET 10 C# Core',
      status: 'nominal',
      errorRate: '1.2%',
      latency: '8.4 ms',
      throughput: '1,920 req/s',
      calls: ['PaymentService', 'InventoryService', 'NotificationService'],
      isCriticalPath: true,
      description: 'Manages shopping carts, order state machines, and payment saga orchestration.'
    },
    {
      id: 'PaymentService',
      name: 'PaymentService',
      category: 'service',
      port: 5001,
      protocol: 'HTTP / REST',
      type: 'Transactional Gateway',
      tech: '.NET 10 Clean Architecture',
      status: 'degraded',
      errorRate: '42.0%',
      latency: '1,840 ms',
      throughput: '820 req/s',
      calls: ['Redis Cluster', 'PostgreSQL', 'Acme Payments Gateway v4.2'],
      isCriticalPath: true,
      description: 'Processes credit cards and payment authorizations. Currently failing due to Acme API v4.2 breaking change.'
    },
    {
      id: 'InventoryService',
      name: 'InventoryService',
      category: 'service',
      port: 5003,
      protocol: 'gRPC',
      type: 'Warehouse Inventory',
      tech: 'Rust / Tonic v0.11',
      status: 'nominal',
      errorRate: '0.01%',
      latency: '1.8 ms',
      throughput: '650 req/s',
      calls: ['PostgreSQL'],
      isCriticalPath: false,
      description: 'Manages product catalog stock reservations and inventory allocations.'
    },
    {
      id: 'UserService',
      name: 'UserService',
      category: 'service',
      port: 5004,
      protocol: 'gRPC',
      type: 'Customer Profile',
      tech: 'Node.js / TypeScript',
      status: 'nominal',
      errorRate: '0.00%',
      latency: '3.1 ms',
      throughput: '1,100 req/s',
      calls: ['PostgreSQL'],
      isCriticalPath: false,
      description: 'Customer profile storage, loyalty points, and address validation.'
    },
    {
      id: 'NotificationService',
      name: 'NotificationService',
      category: 'service',
      port: 5005,
      protocol: 'AMQP',
      type: 'Event Consumer',
      tech: 'Python 3.12 / Celery',
      status: 'nominal',
      errorRate: '0.00%',
      latency: '12.0 ms',
      throughput: '420 msgs/s',
      calls: ['RabbitMQ Cluster'],
      isCriticalPath: false,
      description: 'Asynchronous SMS and email notifications triggered on order milestones.'
    },
    {
      id: 'PostgreSQL',
      name: 'PostgreSQL Cluster',
      category: 'datastore',
      port: 5432,
      protocol: 'TCP / Wire v3',
      type: 'Relational Database',
      tech: 'PostgreSQL 16 (HA Multi-AZ)',
      status: 'nominal',
      errorRate: '0.00%',
      latency: '0.8 ms',
      throughput: '3,200 tps',
      calls: [],
      isCriticalPath: false,
      description: 'Primary ACID transactional database with automated failover and read replicas.'
    },
    {
      id: 'RedisCluster',
      name: 'Redis Cluster',
      category: 'datastore',
      port: 6379,
      protocol: 'RESP3',
      type: 'In-Memory Cache',
      tech: 'Redis 7.2 Enterprise',
      status: 'nominal',
      errorRate: '0.00%',
      latency: '0.3 ms',
      throughput: '18,500 ops/s',
      calls: [],
      isCriticalPath: true,
      description: 'Distributed session cache, idempotent idempotency key locks, and rate limits.'
    },
    {
      id: 'RabbitMQCluster',
      name: 'RabbitMQ Cluster',
      category: 'datastore',
      port: 5672,
      protocol: 'AMQP 0-9-1',
      type: 'Message Broker',
      tech: 'RabbitMQ 3.13 / Erlang',
      status: 'nominal',
      errorRate: '0.00%',
      latency: '1.1 ms',
      throughput: '2,400 msgs/s',
      calls: [],
      isCriticalPath: false,
      description: 'Reliable asynchronous message bus for order events and checkout webhooks.'
    },
    {
      id: 'AcmePaymentsGateway',
      name: 'Acme Payments Gateway v4.2',
      category: 'gateway',
      port: 443,
      protocol: 'HTTPS / JSON',
      type: 'Third-Party Provider',
      tech: 'External Bank Gateway',
      status: 'degraded',
      errorRate: '42.0%',
      latency: '1,420 ms',
      throughput: '820 req/s',
      calls: [],
      isCriticalPath: true,
      description: 'External payment processing vendor. Breaking change deployed: renamed customer_id → customerId.'
    }
  ];

  const filteredServices = services.filter(s => {
    if (filterCategory === 'all') return true;
    if (filterCategory === 'critical') return s.isCriticalPath;
    return s.category === filterCategory;
  });

  const selectedService = services.find(s => s.id === selectedServiceId) || services[2];

  return (
    <div className="topology-view-container">
      {/* Header Banner */}
      <div className="topology-header-card">
        <div className="topology-header-left">
          <div className="topology-badge-row">
            <span className="mesh-active-badge">
              <span className="pulse-dot green"></span>
              Service Mesh Active (Istio Injected)
            </span>
            <span className="mesh-tag">Kubernetes v1.30</span>
            <span className="mesh-tag">Namespace: production</span>
            <span className="mesh-tag cyan">10 Monitored Nodes</span>
          </div>
          <h1 className="topology-title">Interactive Cluster Topology &amp; Service Mesh</h1>
          <p className="topology-desc">
            Real-time dependency graph, protocol inspection, and automated failure lineage tracking across microservices and external gateways.
          </p>
        </div>

        <div className="topology-header-right">
          <div className="quick-stat-box">
            <span className="stat-label">Mesh Ingress</span>
            <span className="stat-val">4,850 req/s</span>
          </div>
          <div className="quick-stat-box">
            <span className="stat-label">Critical Outage Path</span>
            <span className="stat-val red">PaymentService (42%)</span>
          </div>
        </div>
      </div>

      {/* Visual Lineage Flow Track */}
      <div className="lineage-flow-card">
        <div className="lineage-card-header">
          <div className="lineage-header-title">
            <Network style={{ width: 16, height: 16, color: 'var(--info-cyan)' }} />
            <span>Trace Lineage: Critical Transaction Outage Path</span>
          </div>
          <span className="lineage-alert-badge">
            <AlertTriangle style={{ width: 13, height: 13 }} />
            Incident INC-105 Root Cause Flow
          </span>
        </div>

        <div className="lineage-interactive-track">
          {/* Node 1: Client */}
          <div className="flow-node">
            <div className="node-icon-bubble">
              <Server style={{ width: 16, height: 16 }} />
            </div>
            <div className="node-info">
              <span className="node-name">Client Checkout</span>
              <span className="node-meta">Public HTTPS</span>
            </div>
          </div>

          <div className="flow-arrow animated">
            <div className="flow-line"></div>
            <ArrowRight style={{ width: 16, height: 16 }} />
          </div>

          {/* Node 2: API Gateway */}
          <div className="flow-node" onClick={() => setSelectedServiceId('APIGateway')}>
            <div className="node-icon-bubble">
              <ShieldCheck style={{ width: 16, height: 16 }} />
            </div>
            <div className="node-info">
              <span className="node-name">API Gateway</span>
              <span className="node-meta">:443 • Envoy</span>
            </div>
          </div>

          <div className="flow-arrow animated">
            <div className="flow-line"></div>
            <ArrowRight style={{ width: 16, height: 16 }} />
          </div>

          {/* Node 3: OrderService */}
          <div className="flow-node" onClick={() => setSelectedServiceId('OrderService')}>
            <div className="node-icon-bubble">
              <Server style={{ width: 16, height: 16 }} />
            </div>
            <div className="node-info">
              <span className="node-name">OrderService</span>
              <span className="node-meta">:5002 • gRPC</span>
            </div>
          </div>

          <div className="flow-arrow animated warning">
            <div className="flow-line red"></div>
            <ArrowRight style={{ width: 16, height: 16, color: 'var(--sev1-red)' }} />
          </div>

          {/* Node 4: PaymentService (FAILING) */}
          <div className="flow-node failing" onClick={() => setSelectedServiceId('PaymentService')}>
            <div className="node-icon-bubble red-pulse">
              <AlertTriangle style={{ width: 16, height: 16 }} />
            </div>
            <div className="node-info">
              <span className="node-name red">PaymentService</span>
              <span className="node-meta red">HTTP 503 Surge (42%)</span>
            </div>
          </div>

          <div className="flow-arrow animated danger">
            <div className="flow-line red dashed"></div>
            <ArrowRight style={{ width: 16, height: 16, color: 'var(--sev1-red)' }} />
          </div>

          {/* Node 5: External Gateway (ROOT CAUSE) */}
          <div className="flow-node root-cause" onClick={() => setSelectedServiceId('AcmePaymentsGateway')}>
            <div className="node-icon-bubble amber-pulse">
              <Zap style={{ width: 16, height: 16 }} />
            </div>
            <div className="node-info">
              <span className="node-name amber">Acme Payments v4.2</span>
              <span className="node-meta amber">Drift: customerId</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Workbench Layout: Service Mesh Grid & Active Node Inspector */}
      <div className="topology-workbench">
        {/* Left Column: Filter Controls & Cards Grid */}
        <div className="workbench-main">
          {/* Filter Tabs */}
          <div className="filter-tab-bar">
            <div className="filter-buttons">
              <button
                onClick={() => setFilterCategory('all')}
                className={`filter-btn ${filterCategory === 'all' ? 'active' : ''}`}
              >
                All Nodes ({services.length})
              </button>
              <button
                onClick={() => setFilterCategory('critical')}
                className={`filter-btn ${filterCategory === 'critical' ? 'active' : ''}`}
              >
                Critical Path ({services.filter(s => s.isCriticalPath).length})
              </button>
              <button
                onClick={() => setFilterCategory('service')}
                className={`filter-btn ${filterCategory === 'service' ? 'active' : ''}`}
              >
                Microservices ({services.filter(s => s.category === 'service').length})
              </button>
              <button
                onClick={() => setFilterCategory('datastore')}
                className={`filter-btn ${filterCategory === 'datastore' ? 'active' : ''}`}
              >
                Datastores ({services.filter(s => s.category === 'datastore').length})
              </button>
              <button
                onClick={() => setFilterCategory('gateway')}
                className={`filter-btn ${filterCategory === 'gateway' ? 'active' : ''}`}
              >
                Gateways ({services.filter(s => s.category === 'gateway').length})
              </button>
            </div>

            <span className="node-count-label">
              Click any node to inspect telemetry
            </span>
          </div>

          {/* Services Grid */}
          <div className="mesh-cards-grid">
            {filteredServices.map((svc) => {
              const isSelected = svc.id === selectedServiceId;
              const isFailing = svc.status === 'degraded';

              return (
                <div
                  key={svc.id}
                  onClick={() => setSelectedServiceId(svc.id)}
                  className={`mesh-node-card ${isSelected ? 'selected' : ''} ${isFailing ? 'failing-card' : ''}`}
                >
                  <div className="card-top-row">
                    <div className="card-identity">
                      <div className={`service-icon-box ${isFailing ? 'failing' : ''}`}>
                        {svc.category === 'datastore' ? (
                          <Database style={{ width: 16, height: 16 }} />
                        ) : svc.category === 'gateway' ? (
                          <ShieldCheck style={{ width: 16, height: 16 }} />
                        ) : (
                          <Server style={{ width: 16, height: 16 }} />
                        )}
                      </div>
                      <div>
                        <div className="service-name">{svc.name}</div>
                        <div className="service-tech">{svc.tech}</div>
                      </div>
                    </div>

                    <span className={`service-status-pill ${svc.status}`}>
                      <span className="pulse-dot"></span>
                      {svc.status === 'degraded' ? 'Degraded' : 'Healthy'}
                    </span>
                  </div>

                  <div className="metrics-strip">
                    <div className="metric-chip">
                      <span className="m-label">Error Rate</span>
                      <span className={`m-val ${isFailing ? 'red' : ''}`}>{svc.errorRate}</span>
                    </div>
                    <div className="metric-chip">
                      <span className="m-label">Latency</span>
                      <span className={`m-val ${isFailing ? 'red' : ''}`}>{svc.latency}</span>
                    </div>
                    <div className="metric-chip">
                      <span className="m-label">RPS</span>
                      <span className="m-val">{svc.throughput}</span>
                    </div>
                  </div>

                  {svc.calls.length > 0 && (
                    <div className="egress-section">
                      <div className="egress-title">Downstream Dependencies ({svc.calls.length}):</div>
                      <div className="egress-pills">
                        {svc.calls.map(c => (
                          <span
                            key={c}
                            className={`dep-pill ${c.includes('Acme') ? 'highlight-amber' : ''}`}
                          >
                            {c}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Node Inspector Drawer */}
        <div className="workbench-sidebar">
          {selectedService && (
            <div className="node-inspector-card">
              <div className="inspector-header">
                <div className="inspector-title-row">
                  <div className="inspector-icon">
                    {selectedService.category === 'datastore' ? (
                      <Database style={{ width: 20, height: 20, color: 'var(--info-cyan)' }} />
                    ) : (
                      <Server style={{ width: 20, height: 20, color: '#38BDF8' }} />
                    )}
                  </div>
                  <div>
                    <h3 className="inspector-name">{selectedService.name}</h3>
                    <span className="inspector-port">Port {selectedService.port} • {selectedService.protocol}</span>
                  </div>
                </div>
                <span className={`service-status-pill ${selectedService.status}`}>
                  {selectedService.status === 'degraded' ? 'Degraded' : 'Active'}
                </span>
              </div>

              <div className="inspector-body">
                <p className="inspector-desc">{selectedService.description}</p>

                <div className="inspector-metric-grid">
                  <div className="ins-stat-box">
                    <span className="ins-stat-lbl">Failure Rate</span>
                    <span className={`ins-stat-val ${selectedService.status === 'degraded' ? 'red' : 'green'}`}>
                      {selectedService.errorRate}
                    </span>
                  </div>
                  <div className="ins-stat-box">
                    <span className="ins-stat-lbl">P99 Latency</span>
                    <span className={`ins-stat-val ${selectedService.status === 'degraded' ? 'red' : 'cyan'}`}>
                      {selectedService.latency}
                    </span>
                  </div>
                  <div className="ins-stat-box">
                    <span className="ins-stat-lbl">Throughput</span>
                    <span className="ins-stat-val">{selectedService.throughput}</span>
                  </div>
                  <div className="ins-stat-box">
                    <span className="ins-stat-lbl">Environment</span>
                    <span className="ins-stat-val">production</span>
                  </div>
                </div>

                <div className="inspector-section">
                  <h4 className="ins-sub-title">Runtime &amp; Protocol Stack</h4>
                  <div className="ins-key-value">
                    <span>Engine</span>
                    <strong>{selectedService.tech}</strong>
                  </div>
                  <div className="ins-key-value">
                    <span>Protocol</span>
                    <strong>{selectedService.protocol}</strong>
                  </div>
                  <div className="ins-key-value">
                    <span>Circuit Breaker</span>
                    <strong style={{ color: selectedService.status === 'degraded' ? 'var(--sev1-red)' : 'var(--healthy-green)' }}>
                      {selectedService.status === 'degraded' ? 'Tripped (Threshold Exceeded)' : 'Closed (Nominal)'}
                    </strong>
                  </div>
                </div>

                {selectedService.calls.length > 0 && (
                  <div className="inspector-section">
                    <h4 className="ins-sub-title">Direct Dependencies</h4>
                    <div className="ins-dep-list">
                      {selectedService.calls.map(dep => (
                        <div key={dep} className="ins-dep-item">
                          <span>{dep}</span>
                          <ArrowRight style={{ width: 12, height: 12, color: 'var(--text-tertiary)' }} />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
