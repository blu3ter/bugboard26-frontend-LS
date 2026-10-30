import React from 'react';
import type { IssueDto } from '../../../types';
import { TagBadge } from '../../../components/tags/TagBadge';

export interface ReviewSectionProps {
  issues: IssueDto[];
  loading: boolean;
  onApprove: (issueId: number) => Promise<void>;
  onReject: (issueId: number) => Promise<void>;
  onOpenDetail: (issueId: number) => void;
}

export const ReviewSection: React.FC<ReviewSectionProps> = ({
  issues,
  loading,
  onApprove,
  onReject,
  onOpenDetail,
}) => {
  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
        Caricamento issue in revisione...
      </div>
    );
  }

  if (issues.length === 0) {
    return (
      <div style={{
        padding: '50px 20px',
        textAlign: 'center',
        backgroundColor: '#0e1526',
        borderRadius: '12px',
        border: '1px dashed rgba(255, 255, 255, 0.1)',
        color: '#94a3b8'
      }}>
        <span className="material-symbols-outlined" style={{ fontSize: '36px', opacity: 0.5, marginBottom: '8px' }}>
          task_alt
        </span>
        <p style={{ margin: 0, fontWeight: 500 }}>Nessuna issue in attesa di revisione!</p>
        <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
          Tutti i ticket inviati per verifica sono stati completati o elaborati.
        </span>
      </div>
    );
  }

  return (
    <div className="management-table-card">
      <table className="management-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Titolo</th>
            <th>Tipologia</th>
            <th>Etichette</th>
            <th>Segnalato da</th>
            <th>Azioni di Revisione</th>
          </tr>
        </thead>
        <tbody>
          {issues.map((issue) => (
            <tr key={issue.id}>
              <td>
                <span style={{ fontFamily: 'monospace', fontWeight: 600, color: '#38bdf8' }}>
                  BB-{issue.id}
                </span>
              </td>
              <td>
                <strong style={{ color: '#f1f5f9' }}>{issue.title}</strong>
              </td>
              <td>
                <span style={{ fontSize: '0.78rem', textTransform: 'uppercase', color: '#a5b4fc' }}>
                  {issue.type}
                </span>
              </td>
              <td>
                <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                  {issue.tags && issue.tags.map((tag) => (
                    <TagBadge key={tag} name={tag} size="sm" />
                  ))}
                </div>
              </td>
              <td>{issue.reporterFullName || issue.reporterEmail}</td>
              <td>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    className="btn-action-sm details"
                    onClick={() => onOpenDetail(issue.id)}
                  >
                    Dettagli
                  </button>
                  <button
                    type="button"
                    className="btn-action-sm approve"
                    onClick={() => onApprove(issue.id)}
                  >
                    Approva
                  </button>
                  <button
                    type="button"
                    className="btn-action-sm reject"
                    onClick={() => onReject(issue.id)}
                  >
                    Rifiuta
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

