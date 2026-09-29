import React, { useEffect, useState } from 'react';
import '../AllIssuesView/AllIssuesView.css';
import './MyIssuesView.css';
import { IssuesFilterBar } from '../../components/IssuesFilterBar';
import { issueService } from '../../service/issueService';
import type { IssueDto } from '../../types/issue.types';

export const MyIssuesView: React.FC = () => {
  const [issues, setIssues] = useState<IssueDto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchIssues = async () => {
      try {
        const data = await issueService.getMyIssues();
        setIssues(data);
      } catch (error) {
        console.error("Failed to fetch my issues", error);
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

  const todoCount = issues.filter(i => i.state === 'TODO').length;
  const inProgressCount = issues.filter(i => i.state === 'IN_PROGRESS').length;
  const doneCount = issues.filter(i => i.state === 'DONE').length;
  const urgentCount = issues.filter(i => i.isUrgent).length;
  const totalCount = issues.length;
  const completedPercentage = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;
  
  return (
    <div className="issues-view-container">
      {/* Search Bar Full Width */}
      <IssuesFilterBar searchPlaceholder="Search your issues..." />

      {/* Split Layout (Left: Grid, Right: Sidebar) */}
      <div className="my-issues-layout" style={{ marginTop: '24px' }}>
        {/* Main Content Area (Left side) */}
        <div className="my-issues-main-content">
          {loading ? (
            <p>Caricamento issues...</p>
          ) : issues.length === 0 ? (
            <p>Nessuna issue trovata.</p>
          ) : (
            <div className="issues-grid">
              {issues.map(issue => (
                <article key={issue.id} className={`issue-card ${issue.state === 'DONE' ? 'card-closed' : ''}`} style={issue.isUrgent ? { borderColor: 'rgba(186,26,26,0.5)' } : {}}>
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
                  {issue.reporterFullName && <p className="issue-project">Reporter: {issue.reporterFullName}</p>}
                  
                  <div className="card-footer">
                    <span className={`badge ${getBadgeClass(issue.type)}`}>
                      <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>{getTypeIcon(issue.type)}</span> {issue.type}
                    </span>
                    <span className={`badge ${getStateBadgeClass(issue.state)}`}>
                      <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>list</span> {issue.state}
                    </span>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar Area (Right side) */}
        <aside className="my-issues-sidebar">
          <div className="summary-panel">
            
            <div className="summary-header">
              <h2 className="summary-title">
                <span className="material-symbols-outlined" style={{ color: 'var(--primary)' }}>analytics</span> 
                Tasks Summary
              </h2>
              <span className="summary-total-badge">{totalCount} Total</span>
            </div>

            <div className="metrics-list">
              <div className="metric-item metric-todo">
                <div className="metric-item-left">
                  <div className="metric-icon-wrapper">
                    <span className="material-symbols-outlined">pending_actions</span>
                  </div>
                  <div className="metric-info">
                    <span className="metric-name">To Do</span>
                    <span className="metric-desc">In priority queue</span>
                  </div>
                </div>
                <span className="metric-value">{todoCount}</span>
              </div>

              <div className="metric-item metric-urgent">
                <div className="metric-item-left">
                  <div className="metric-icon-wrapper">
                    <span className="material-symbols-outlined">priority_high</span>
                  </div>
                  <div className="metric-info">
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <span className="metric-name">Urgent</span>
                      <span className="active-badge">Active</span>
                    </div>
                    <span className="metric-desc">Immediate action</span>
                  </div>
                </div>
                <span className="metric-value">{urgentCount}</span>
              </div>

              <div className="metric-item metric-progress">
                <div className="metric-item-left">
                  <div className="metric-icon-wrapper">
                    <span className="material-symbols-outlined">autorenew</span>
                  </div>
                  <div className="metric-info">
                    <span className="metric-name">In Progress</span>
                    <span className="metric-desc">Under development</span>
                  </div>
                </div>
                <span className="metric-value">{inProgressCount}</span>
              </div>

              <div className="metric-item metric-done">
                <div className="metric-item-left">
                  <div className="metric-icon-wrapper">
                    <span className="material-symbols-outlined">done_all</span>
                  </div>
                  <div className="metric-info">
                    <span className="metric-name">Completed</span>
                    <span className="metric-desc">Resolved & verified</span>
                  </div>
                </div>
                <span className="metric-value">{doneCount}</span>
              </div>
            </div>

            <div className="chart-section">
              <div className="chart-header">
                <span className="chart-title">Progress Status</span>
                <span className="chart-badge">{doneCount} of {totalCount} resolved</span>
              </div>
              
              <div className="donut-container">
                <svg className="donut-svg" viewBox="0 0 120 120">
                  <circle className="donut-bg" cx="60" cy="60" r="48"></circle>
                  <circle className="donut-segment segment-todo" cx="60" cy="60" r="48" style={{ strokeDashoffset: '0' }}></circle>
                </svg>
                <div className="donut-text">
                  <span className="donut-percentage">{completedPercentage}%</span>
                  <span className="donut-label">Completed</span>
                </div>
              </div>

              <div className="chart-legend">
                <div className="legend-item">
                  <span className="legend-dot bg-todo"></span>
                  <span className="legend-text">To Do</span>
                </div>
                <div className="legend-item">
                  <span className="legend-dot bg-urgent"></span>
                  <span className="legend-text">Urgent</span>
                </div>
                <div className="legend-item">
                  <span className="legend-dot bg-progress"></span>
                  <span className="legend-text">In Progress</span>
                </div>
                <div className="legend-item">
                  <span className="legend-dot bg-done"></span>
                  <span className="legend-text">Completed</span>
                </div>
              </div>
            </div>

          </div>
        </aside>
      </div>
    </div>
  );
};

