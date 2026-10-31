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

  const getAccentColor = (issue: IssueDto) => {
    if (issue.isUrgent) return '#ba1a1a';
    if (issue.type === 'FEATURE') return 'var(--primary)';
    if (issue.type === 'DOCUMENTATION') return 'var(--secondary)';
    return 'var(--primary)';
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'BUG': return 'bug_report';
      case 'FEATURE': return 'add_box';
      case 'DOCUMENTATION': return 'description';
      default: return 'list';
    }
  };

  const getBadgeClass = (type: string) => {
    switch (type) {
      case 'BUG': return 'badge-bug';
      case 'FEATURE': return 'badge-feature';
      case 'DOCUMENTATION': return 'badge-documentation';
      default: return 'badge-todo';
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
          <p>Caricamento issues...</p>
        ) : issues.length === 0 ? (
          <p>Nessuna issue trovata.</p>
        ) : (
          issues.map((issue) => (
            <article 
              key={issue.id} 
              className={`issue-card ${issue.state === 'DONE' ? 'card-closed' : ''}`}
              style={issue.isUrgent ? { borderColor: 'rgba(186,26,26,0.5)' } : {}}
            >
              <div className="card-accent-line" style={{ backgroundColor: getAccentColor(issue) }}></div>
              
              <div className="card-header">
                <div className="card-id-group">
                  <span className="issue-id">BB-{issue.id}</span>
                  {issue.isUrgent && (
                    <span className="badge-urgent">
                      <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>warning</span> URGENTE
                    </span>
                  )}
                </div>
                <button className={`btn-check ${issue.state === 'DONE' ? 'btn-checked' : ''}`} disabled={issue.state === 'DONE'}>
                  <span className="material-symbols-outlined" style={issue.state === 'DONE' ? { fontVariationSettings: '"FILL" 1' } : {}}>check_circle</span>
                </button>
              </div>
              
              <h3 className={`issue-title ${issue.state === 'DONE' ? 'issue-title-closed' : ''}`}>{issue.title}</h3>
              {issue.reporterFullName && (
                <p className="issue-project">Reporter: {issue.reporterFullName}</p>
              )}
              
              <div className="card-footer">
                <span className={`badge ${getBadgeClass(issue.type)}`}>
                  <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>{getTypeIcon(issue.type)}</span> {issue.type}
                </span>
                <span className={`badge ${getStateBadgeClass(issue.state)}`}>
                  <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>list</span> {issue.state}
                </span>
                
                <div className="assignee-info">
                  {issue.assigneeFullName && (
                    <span className="assignee-text">Assegnato a: {issue.assigneeFullName}</span>
                  )}
                </div>
                
                {isAdmin && (
                  <button className="btn-assign" style={!issue.assigneeFullName ? { marginLeft: 'auto' } : {}} title="Assegna/Riassegna">
                    <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>{issue.assigneeFullName ? 'sync' : 'person_add'}</span>
                    <span>Assegna</span>
                  </button>
                )}
              </div>
            </article>
          ))
        )}
      </div>
    </div>
  );
};
