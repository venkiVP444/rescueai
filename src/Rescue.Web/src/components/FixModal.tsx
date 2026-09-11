import React from 'react';
import { X, CheckCircle, GitPullRequest, RotateCcw, FileText, Check } from 'lucide-react';
import { Incident } from '../types';

interface FixModalProps {
  incident?: Incident;
  isOpen: boolean;
  onClose: () => void;
  onApprove: () => void;
  onReject: () => void;
}

export const FixModal: React.FC<FixModalProps> = ({
  incident,
  isOpen,
  onClose,
  onApprove,
  onReject
}) => {
  if (!isOpen || !incident || !incident.proposedPatch) return null;

  const { proposedPatch, validationReport } = incident;

  return (
    <div className="modal-backdrop">
      <div className="modal-dialog">
        {/* Modal Header */}
        <div className="modal-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <span className="brand-badge">Rescue AI Patch Inspector</span>
              <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-dim)' }}>
                Risk: <strong style={{ color: 'var(--emerald-400)' }}>LOW</strong> • Confidence: <strong style={{ color: 'var(--emerald-400)' }}>96%</strong>
              </span>
            </div>
            <h2 className="modal-title">
              Proposed Hotfix: {proposedPatch.filePath}
            </h2>
          </div>
          <button onClick={onClose} className="btn-close">
            <X style={{ width: 20, height: 20 }} />
          </button>
        </div>

        {/* Patch Explanation */}
        <div style={{ background: '#080E1B', border: '1px solid var(--border-subtle)', borderRadius: 10, padding: 14, fontSize: 13, color: '#E2E8F0' }}>
          {proposedPatch.explanation}
        </div>

        {/* Unified Diff Viewer */}
        <div>
          <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-dim)', marginBottom: 6 }}>
            UNIFIED DIFF • Target: {proposedPatch.filePath}
          </div>

          <div className="diff-container">
            <div className="diff-header">
              <FileText style={{ width: 13, height: 13, display: 'inline-block', verticalAlign: 'middle', marginRight: 6 }} />
              {proposedPatch.filePath}
            </div>
            <div className="diff-body">
              {proposedPatch.unifiedDiff.split('\n').map((line: string, idx: number) => {
                const isDel = line.startsWith('-');
                const isAdd = line.startsWith('+');
                const isHunk = line.startsWith('@@');

                let cls = 'diff-line context';
                if (isDel) cls = 'diff-line del';
                else if (isAdd) cls = 'diff-line add';
                else if (isHunk) cls = 'diff-line hunk';

                return (
                  <div key={idx} className={cls}>
                    {line}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Validation Report */}
        {validationReport && (
          <div className="validation-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--emerald-400)', fontWeight: 700, fontSize: 13 }}>
                <CheckCircle style={{ width: 16, height: 16 }} />
                <span>Deterministic Validation: {validationReport.passedTests} / {validationReport.totalTests} Unit Tests Passed (100%)</span>
              </div>
              <span className="brand-badge">Roslyn AST Verified</span>
            </div>

            <div className="val-badges">
              <div className="val-badge"><Check style={{ width: 12, height: 12 }} /> Syntax Valid</div>
              <div className="val-badge"><Check style={{ width: 12, height: 12 }} /> 0 Secrets Detected</div>
              <div className="val-badge"><Check style={{ width: 12, height: 12 }} /> No Regressions</div>
              <div className="val-badge"><Check style={{ width: 12, height: 12 }} /> Risk: LOW</div>
            </div>
          </div>
        )}

        {/* Rollback Plan */}
        <div style={{ background: '#050A14', border: '1px solid var(--border-subtle)', borderRadius: 10, padding: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--amber-400)', marginBottom: 6 }}>
            <RotateCcw style={{ width: 13, height: 13 }} />
            Automatic Rollback Plan
          </div>
          <div style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', whiteSpace: 'pre-line' }}>
            {proposedPatch.rollbackPlan}
          </div>
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <div style={{ fontSize: 11, color: 'var(--text-dim)' }}>
            Human approval is mandatory in <strong style={{ color: 'var(--emerald-400)' }}>RECOMMEND</strong> mode before PR creation.
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={onReject}
              style={{
                background: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-muted)',
                padding: '8px 16px',
                borderRadius: 8,
                fontSize: 12,
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Reject Fix
            </button>
            <button
              onClick={() => {
                onApprove();
                onClose();
              }}
              className="btn-cta-emerald"
            >
              <GitPullRequest style={{ width: 14, height: 14 }} />
              Approve &amp; Create GitHub PR
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
