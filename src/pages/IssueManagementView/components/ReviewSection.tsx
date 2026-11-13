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
        Loading issues in review...
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
        <p style={{ margin: 0, fontWeight: 500 }}>No issues waiting for review!</p>
        <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
          All tickets submitted for verification have been resolved or processed.
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
            <th>Title</th>
            <th>Type</th>
            <th>Tags</th>
            <th>Reported by</th>
            <th>Review Actions</th>
          </tr>
        </thead>
        <tbody>
          {issues.map((issue) => (
            <tr key={issue.id}>
              <td>
                <span style={{ fontFamily: 'monospace', fontWeight: 600, color: '#60a5fa' }}>
                  BB-{issue.id}
                </span>
              </td>
              <td>
                <strong style={{ color: '#f1f5f9' }}>{issue.title}</strong>
              </td>
              <td>
                <span style={{ fontSize: '0.78rem', textTransform: 'uppercase', color: '#cbd5e1', fontWeight: 600 }}>
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
                    Details
                  </button>
                  <button
                    type="button"
                    className="btn-action-sm approve"
                    onClick={() => onApprove(issue.id)}
                  >
                    Approve
                  </button>
                  <button
                    type="button"
                    className="btn-action-sm reject"
                    onClick={() => onReject(issue.id)}
                  >
                    Reject
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

