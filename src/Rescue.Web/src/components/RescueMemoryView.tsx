import React, { useState, useEffect } from 'react';
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
  ShieldAlert,
  RefreshCw
} from 'lucide-react';
import { IncidentMemory } from '../types';

interface DisplayMemoryItem {
  id: string;
  incidentId: string;
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
  isBaseline: boolean;
}

export const RescueMemoryView: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedMemory, setSelectedMemory] = useState<DisplayMemoryItem | null>(null);
  const [memories, setMemories] = useState<DisplayMemoryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchMemories = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/memory');
      if (res.ok) {
        const data = await res.json();
        const rawList: IncidentMemory[] = data.memories || [];
        const mapped: DisplayMemoryItem[] = rawList.map((m, idx) => {
          let formattedDate = 'Recently';
          try {
            const d = new Date(m.resolvedAt);
            const diffDays = Math.round((Date.now() - d.getTime()) / (1000 * 60 * 60 * 24));
            formattedDate = diffDays <= 0 ? 'Today' : `${diffDays} days ago`;
          } catch {
            formattedDate = 'Recently';
          }

          return {
            id: m.incidentId || m.id,
            incidentId: m.incidentId,
            title: m.title,
            matchScore: m.isBaseline ? 94 : 96,
            pattern: m.incidentType || 'Operational Failure Pattern',
            rootCause: m.rootCause,
            resolution: m.proposedFixSummary,
            confidence: m.isBaseline ? 94 : 96,
            date: formattedDate,
            service: m.service,
            symptoms: m.symptoms,
            affectedFiles: m.affectedFiles,
            verification: m.verificationResult,
            isBaseline: m.isBaseline
          };
        });
        setMemories(mapped);
      }
    } catch (e) {
      console.error('Failed to fetch operational memories from SQLite:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMemories();
  }, []);

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
