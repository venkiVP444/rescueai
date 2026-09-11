import React, { useState } from 'react';
import {
  Brain,
  Search,
  ArrowRight,
  CheckCircle,
  Clock,
  Sparkles,
  ExternalLink,
  X,
  FileCode,
  ShieldAlert
} from 'lucide-react';
import { IncidentMemory } from '../types';

interface MemoryItem {
  id: string;
  title: string;
  matchScore: number;
  pattern: string;
  rootCause: string;
  resolution: string;
  confidence: number;
  date: string;
  service: string;
  symptoms: string;
  affectedFiles: string;
  verification: string;
}

export const RescueMemoryView: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedMemory, setSelectedMemory] = useState<MemoryItem | null>(null);

  const memories: MemoryItem[] = [
    {
      id: 'INC-001',
      title: 'Payment Partner API Field Name Mismatch',
      matchScore: 94,
      pattern: 'External partner changed JSON property name without backwards compatibility',
      rootCause: 'Payment gateway renamed customer_id to customerId without alias fallback',
      resolution: 'Updated serialization mapping in ApiClient.cs and verified 8 of 8 regression tests',
      confidence: 94,
      date: '12 days ago',
      service: 'PaymentService',
      symptoms: '42% of customer checkouts failing with HTTP 503 errors and JSON parsing exceptions',
      affectedFiles: 'src/PaymentService/Clients/AcmePaymentsClient.cs',
      verification: 'Staging error rate plummeted to 1.6%. Solution verified and merged via GitHub PR #89.'
    },
    {
      id: 'INC-003',
      title: 'Redis Database Connection Pool Saturated',
      matchScore: 88,
      pattern: 'Connection exhaustion under high customer checkout traffic',
      rootCause: 'Unreleased database connections inside CheckoutHandler.cs during payment surges',
      resolution: 'Refactored to singleton connection multiplexer with keep-alive ping and pool size 200',
      confidence: 88,
      date: '3 weeks ago',
      service: 'CheckoutService',
      symptoms: 'Timeout errors when customers clicked "Place Order" during flash sale',
      affectedFiles: 'src/CheckoutService/Infrastructure/RedisPool.cs',
      verification: 'Peak traffic sustained 4,500 req/s with pool utilization under 15%.'
    },
    {
      id: 'INC-002',
      title: 'Authentication Token Expiration Collision',
      matchScore: 82,
      pattern: 'Multiple requests trying to refresh the same expired token at the same second',
      rootCause: 'Missing lock on token refresh endpoint causing duplicate invalidations',
      resolution: 'Added distributed mutex lock and refreshed token 30 seconds before expiration',
      confidence: 82,
      date: '1 month ago',
      service: 'AuthGateway',
      symptoms: 'Users occasionally logged out during checkout checkout step',
      affectedFiles: 'src/AuthGateway/Services/TokenRefreshWorker.cs',
      verification: 'Zero unexpected logouts observed across 14 consecutive days.'
    }
  ];

  const filteredMemories = memories.filter(m => {
    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    return (
      m.id.toLowerCase().includes(q) ||
      m.title.toLowerCase().includes(q) ||
      m.service.toLowerCase().includes(q) ||
      m.pattern.toLowerCase().includes(q) ||
      m.rootCause.toLowerCase().includes(q)
    );
  });

  return (
    <div className="view-content-pane">
      {/* Header */}
      <div className="pane-header-row">
        <div>
          <div className="pane-breadcrumbs">
            <span>Operational Knowledge</span>
            <span>•</span>
            <span>Persistent Memory</span>
          </div>
          <h1 className="pane-main-title">RESCUE Learned Memory</h1>
          <p className="pane-subtitle-text">
            Previous resolved incidents RESCUE remembers to solve new issues in seconds.
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="table-controls-bar">
        <div className="search-input-wrapper" style={{ maxWidth: 450 }}>
          <Search className="search-icon" />
          <input
            type="text"
            placeholder="Search past solutions by problem, service, or keyword..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="memory-stats-badge">
          <Brain style={{ width: 15, height: 15, color: '#7C3AED' }} />
          <span>{memories.length} Learned Solutions Saved in Operational Memory</span>
        </div>
      </div>

      {/* Incident Memory Cards Grid */}
      <div className="memory-cards-grid">
        {filteredMemories.map(m => (
          <div key={m.id} className="enterprise-card memory-incident-card">
            <div className="memory-card-header">
              <div className="memory-id-block">
                <span className="memory-id-tag">{m.id}</span>
                <span className="memory-service-tag">{m.service}</span>
              </div>
              <div className="memory-confidence-pill">
                <Sparkles style={{ width: 13, height: 13, color: '#7C3AED' }} />
                <span>{m.confidence}% match to today&apos;s issue</span>
              </div>
            </div>

            <h3 className="memory-card-title">{m.title}</h3>

            <div className="memory-meta-rows">
              <div className="memory-meta-item">
                <span className="meta-lbl">Failure Pattern:</span>
                <span className="meta-val">{m.pattern}</span>
              </div>
              <div className="memory-meta-item">
                <span className="meta-lbl">Root Cause:</span>
                <span className="meta-val">{m.rootCause}</span>
              </div>
              <div className="memory-meta-item">
                <span className="meta-lbl">How it was Solved:</span>
                <span className="meta-val">{m.resolution}</span>
              </div>
            </div>

            <div className="memory-card-footer">
              <span className="memory-date-tag">
                <Clock style={{ width: 13, height: 13 }} />
                <span>Resolved {m.date}</span>
              </span>

              <button
                onClick={() => setSelectedMemory(m)}
                className="btn-text-action"
              >
                <span>View Full Solution ➔</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal / Drawer for Full Historical Incident */}
      {selectedMemory && (
        <div className="modal-backdrop" onClick={() => setSelectedMemory(null)}>
          <div className="modal-dialog-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header-row">
              <div className="modal-title-group">
                <span className="memory-id-tag">{selectedMemory.id}</span>
                <h2 style={{ fontSize: 18, fontWeight: 700, color: '#0F172A', marginTop: 4 }}>
                  {selectedMemory.title}
                </h2>
              </div>
              <button
                onClick={() => setSelectedMemory(null)}
                className="btn-modal-close"
              >
                <X style={{ width: 18, height: 18 }} />
              </button>
            </div>

            <div className="modal-body-scroll">
              <div className="modal-info-grid">
                <div>
                  <span className="info-key">Impacted Service:</span>
                  <span className="info-value">{selectedMemory.service}</span>
                </div>
                <div>
                  <span className="info-key">Resolution Date:</span>
                  <span className="info-value">{selectedMemory.date}</span>
                </div>
                <div>
                  <span className="info-key">Match Relevance:</span>
                  <span className="info-value purple">{selectedMemory.confidence}%</span>
                </div>
              </div>

              <div className="modal-section-block">
                <h4>What Broke (Symptoms)</h4>
                <p>{selectedMemory.symptoms}</p>
              </div>

              <div className="modal-section-block">
                <h4>Why It Happened (Root Cause)</h4>
                <p>{selectedMemory.rootCause}</p>
              </div>

              <div className="modal-section-block">
                <h4>Verified Code Fix Applied</h4>
                <p>{selectedMemory.resolution}</p>
                <div className="code-pill">
                  <FileCode style={{ width: 14, height: 14 }} />
                  <span>{selectedMemory.affectedFiles}</span>
                </div>
              </div>

              <div className="modal-section-block">
                <h4>Verification &amp; Recovery Outcome</h4>
                <p>{selectedMemory.verification}</p>
              </div>
            </div>

            <div className="modal-footer-row">
              <button
                onClick={() => setSelectedMemory(null)}
                className="btn-secondary-action"
              >
                Close Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
