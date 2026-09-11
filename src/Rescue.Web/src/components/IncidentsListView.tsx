import React, { useState } from 'react';
import { Search, Filter, ArrowRight, CheckCircle, AlertTriangle, Clock, RefreshCw, Play } from 'lucide-react';
import { Incident } from '../types';

interface IncidentsListViewProps {
  incident?: Incident;
  onSelectIncident: (incidentId: string) => void;
  onTriggerDemo: () => void;
  loading: boolean;
}

export const IncidentsListView: React.FC<IncidentsListViewProps> = ({
  incident,
  onSelectIncident,
  onTriggerDemo,
  loading
}) => {
  const [filter, setFilter] = useState<'All' | 'Active' | 'P1' | 'P2' | 'Resolved'>('All');
  const [searchTerm, setSearchTerm] = useState('');

  const liveStatus = incident
    ? incident.status === 'Resolved'
      ? 'Resolved'
      : incident.status === 'AwaitingApproval'
      ? 'Waiting for Approval'
      : 'Investigating'
    : 'Resolved';

  const allIncidents = [
    {
      id: incident?.id || 'INC-105',
      title: incident?.title || 'Payment Service Failing During Customer Checkout',
      service: incident?.service || 'PaymentService',
      severity: 'P1 CRITICAL',
      status: incident ? liveStatus : 'Resolved',
      confidence: `${incident?.correlation?.score ?? 96}%`,
      detected: '14:32 (Today)',
      errorRate: `${incident?.errorRateBefore ?? 42.0}%`,
      isLive: !!incident && incident.status !== 'Resolved'
    },
    {
      id: 'INC-104',
      title: 'Order Processing Database Latency Surge',
      service: 'OrdersService',
      severity: 'P2 HIGH',
      status: 'Resolved',
      confidence: '91%',
      detected: 'Yesterday',
      errorRate: '12.4%',
      isLive: false
    },
    {
      id: 'INC-101',
      title: 'Inventory Service Stock Lock Contention',
      service: 'InventoryService',
      severity: 'P2 HIGH',
      status: 'Resolved',
      confidence: '89%',
      detected: '3 days ago',
      errorRate: '8.2%',
      isLive: false
    },
    {
      id: 'INC-098',
      title: 'Authentication Gateway Token Expiry Outage',
      service: 'AuthGateway',
      severity: 'P1 CRITICAL',
      status: 'Resolved',
      confidence: '98%',
      detected: '5 days ago',
      errorRate: '68.0%',
      isLive: false
    }
  ];

  const filteredIncidents = allIncidents.filter(item => {
    if (filter === 'Active' && item.status === 'Resolved') return false;
    if (filter === 'Resolved' && item.status !== 'Resolved') return false;
    if (filter === 'P1' && !item.severity.includes('P1')) return false;
    if (filter === 'P2' && !item.severity.includes('P2')) return false;

    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return (
        item.id.toLowerCase().includes(q) ||
        item.title.toLowerCase().includes(q) ||
        item.service.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="view-content-pane">
      {/* Pane Header */}
      <div className="pane-header-row">
        <div>
          <div className="pane-breadcrumbs">
            <span>Platform</span>
            <span>•</span>
            <span>Incident Registry</span>
          </div>
          <h1 className="pane-main-title">All Incidents</h1>
          <p className="pane-subtitle-text">
            Historical log and active incident investigations across your services.
          </p>
        </div>

        <div className="pane-header-actions">
          <button
            onClick={onTriggerDemo}
            disabled={loading}
            className="btn-primary-action"
            title="Trigger simulated payment incident"
          >
            <Play style={{ width: 14, height: 14, fill: 'currentColor' }} />
            <span>{loading ? 'Analyzing...' : '⚡ Simulate Outage (Demo)'}</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="table-controls-bar">
        <div className="filter-chip-group">
          {(['All', 'Active', 'P1', 'P2', 'Resolved'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`filter-chip ${filter === f ? 'active' : ''}`}
            >
              {f === 'Active' ? 'Needs Attention' : f === 'P1' ? 'P1 Critical' : f === 'P2' ? 'P2 High' : f}
              {f === 'Active' && incident && incident.status !== 'Resolved' && (
                <span className="filter-count-dot"></span>
              )}
            </button>
          ))}
        </div>

        <div className="search-input-wrapper">
          <Search className="search-icon" />
          <input
            type="text"
            placeholder="Search by incident name or ID..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      {/* Incidents Table */}
      <div className="enterprise-card table-card">
        <table className="enterprise-table">
          <thead>
            <tr>
              <th>Incident &amp; Description</th>
              <th>Impacted Service</th>
              <th>Severity</th>
              <th>Current Status</th>
              <th>Confidence</th>
              <th>When Detected</th>
              <th style={{ textAlign: 'right' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredIncidents.length > 0 ? (
              filteredIncidents.map(inc => (
                <tr
                  key={inc.id}
                  onClick={() => onSelectIncident(inc.id)}
                  className={`table-clickable-row ${inc.isLive ? 'live-incident-row' : ''}`}
                >
                  <td>
                    <div className="incident-id-cell">
                      <span className="inc-id-tag">{inc.id}</span>
                      <span className="inc-title-text">{inc.title}</span>
                    </div>
                  </td>
                  <td>
                    <span className="service-name-tag">{inc.service}</span>
                  </td>
                  <td>
                    <span className={`badge-severity ${inc.severity.includes('P1') ? 'p1' : 'p2'}`}>
                      {inc.severity}
                    </span>
                  </td>
                  <td>
                    <span
                      className={`status-chip ${
                        inc.status === 'Resolved'
                          ? 'resolved'
                          : inc.status.includes('Waiting')
                          ? 'pending'
                          : 'active'
                      }`}
                    >
                      {inc.status}
                    </span>
                  </td>
                  <td>
                    <span className="confidence-pill">{inc.confidence}</span>
                  </td>
                  <td>
                    <span className="timestamp-text">{inc.detected}</span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        onSelectIncident(inc.id);
                      }}
                      className={inc.isLive ? 'btn-table-action-primary' : 'btn-table-action-secondary'}
                    >
                      <span>{inc.isLive ? 'Investigate ➔' : 'View Details'}</span>
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="empty-table-row" style={{ textAlign: 'center', padding: '32px', color: '#64748B' }}>
                  No incidents match the selected filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
