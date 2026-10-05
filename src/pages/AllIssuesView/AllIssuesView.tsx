import React, { useEffect, useState } from 'react';
import './AllIssuesView.css';
import { IssuesFilterBar } from '../../components/IssuesFilterBar';
import { issueService } from '../../service/issueService';
import type { IssueDto } from '../../types/issue.types';

interface AllIssuesViewProps {
  isAdmin?: boolean;
}

export const AllIssuesView: React.FC<AllIssuesViewProps> = ({ isAdmin = true }) => {
  const [issues, setIssues] = useState<IssueDto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchIssues = async () => {
      try {
        const data = await issueService.getAllIssues();
        setIssues(data);
      } catch (error) {
        console.error("Failed to fetch all issues", error);
      } finally {
        setLoading(false);
      }
    };
    fetchIssues();
  }, []);

  const getTypeStyles = (type: string) => {
    switch (type) {
      case 'BUG':
        return { color: '#ef4444', icon: 'bug_report', badgeBg: 'rgba(239, 68, 68, 0.1)', badgeBorder: '#ef4444', textColor: '#ef4444' };
      case 'FEATURE':
        return { color: '#10b981', icon: 'add_box', badgeBg: 'rgba(16, 185, 129, 0.1)', badgeBorder: '#10b981', textColor: '#10b981' };
      case 'QUESTION':
        return { color: '#fbbf24', icon: 'help', badgeBg: 'rgba(251, 191, 36, 0.1)', badgeBorder: '#fbbf24', textColor: '#fbbf24' };
      case 'DOCUMENTATION':
        return { color: '#2563eb', icon: 'description', badgeBg: 'rgba(37, 99, 235, 0.1)', badgeBorder: '#2563eb', textColor: '#2563eb' };
      default:
        return { color: 'var(--primary)', icon: 'list', badgeBg: 'var(--surface-container-high)', badgeBorder: 'var(--border-color)', textColor: 'var(--text-secondary)' };
    }
  };

  const getStateText = (state: string) => {
    switch (state) {
      case 'TODO': return 'To do';
      case 'IN_PROGRESS': return 'In progress';
      case 'REVIEW': return 'Review';
      case 'DONE': return 'Closed';
      default: return state;
    }
  };

  const getStateBadgeClass = (state: string) => {
    switch (state) {
      case 'TODO': return 'badge-todo';
      case 'IN_PROGRESS': return 'badge-in-progress';
      case 'REVIEW': return 'badge-in-review';
      case 'DONE': return 'badge-closed';
      default: return 'badge-todo';
    }
  };

  return (
    <div className="issues-view-container">
      {/* Filters & Search */}
      <IssuesFilterBar searchPlaceholder="Search ID, title, project..." />

      {/* Grid of Issues */}
      <div className="issues-grid">
        {loading ? (
          <p>Loading issues...</p>
        ) : issues.length === 0 ? (
          <p>No issues found.</p>
        ) : (
          issues.map((issue) => {
            const typeStyle = getTypeStyles(issue.type);
            return (
              <article
                key={issue.id}
                className={`issue-card ${issue.state === 'DONE' ? 'card-closed' : ''}`}
                style={issue.isUrgent ? { borderColor: 'rgba(186,26,26,0.5)' } : {}}
              >
                <div className="card-accent-line" style={{ backgroundColor: typeStyle.color }}></div>

                <div className="card-header">
                  <div className="card-id-group">
                    <span className="issue-id">BB-{issue.id}</span>
                    {issue.isUrgent && (
                      <span className="badge-urgent">
                        <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>warning</span> URGENT
                      </span>
                    )}
                  </div>
                </div>

                <h3 className={`issue-title ${issue.state === 'DONE' ? 'issue-title-closed' : ''}`}>{issue.title}</h3>
                {issue.reporterFullName && (
                  <p className="issue-project">Reporter: {issue.reporterFullName}</p>
                )}

                <div className="card-footer">
                  <span className="badge" style={{ backgroundColor: typeStyle.badgeBg, border: `1px solid ${typeStyle.badgeBorder}`, color: typeStyle.textColor }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>{typeStyle.icon}</span> {issue.type}
                  </span>
                  <span className={`badge ${getStateBadgeClass(issue.state)}`}>
                    <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>list</span> {getStateText(issue.state)}
                  </span>

                  <div className="assignee-info">
                    {issue.assigneeFullName && (
                      <span className="assignee-text">Assigned to: {issue.assigneeFullName}</span>
                    )}
                  </div>

                  {isAdmin && (
                    <button className="btn-assign" style={!issue.assigneeFullName ? { marginLeft: 'auto' } : {}} title="Assign / Reassign">
                      <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>{issue.assigneeFullName ? 'sync' : 'person_add'}</span>
                      <span>{issue.assigneeFullName ? 'Reassign' : 'Assign'}</span>
                    </button>
                  )}
                </div>
              </article>
            );
          })
        )}
      </div>
    </div>
  );
};
