import React, { useEffect, useState } from 'react';
import '../AllIssuesView/AllIssuesView.css';
import './MyIssuesView.css';
import { IssuesFilterBar } from '../../components/IssuesFilterBar';
import { useIssuesFilter } from '../../hooks/useIssuesFilter';
import { issueService } from '../../service/issueService';
import type { IssueDto } from '../../types/issue.types';

export const MyIssuesView: React.FC = () => {
  const [issues, setIssues] = useState<IssueDto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  
  const {
    search,
    setSearch,
    type,
    setType,
    state,
    setState,
    urgentOnly,
    setUrgentOnly,
    filteredIssues,
    resetFilters,
  } = useIssuesFilter(issues);

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

  const todoCount = filteredIssues.filter(i => i.state === 'TODO').length;
  const inProgressCount = filteredIssues.filter(i => i.state === 'IN_PROGRESS').length;
  const doneCount = filteredIssues.filter(i => i.state === 'DONE').length;
  const urgentCount = filteredIssues.filter(i => i.isUrgent).length;
  const totalCount = filteredIssues.length;
  const completedPercentage = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;

  return (
    <div className="issues-view-container">
      {/* Search Bar Full Width */}
      <IssuesFilterBar 
        searchPlaceholder="Search your issues..." 
        search={search}
        onSearchChange={setSearch}
        type={type}
        onTypeChange={setType}
        state={state}
        onStateChange={setState}
        urgentOnly={urgentOnly}
        onUrgentChange={setUrgentOnly}
        onReset={resetFilters}
      />

      {/* Split Layout (Left: Grid, Right: Sidebar) */}
      <div className="my-issues-layout" style={{ marginTop: '24px' }}>
        {/* Main Content Area (Left side) */}
        <div className="my-issues-main-content">
          {loading ? (
            <p>Loading issues...</p>
          ) : filteredIssues.length === 0 ? (
            <p>No issue  found.</p>
          ) : (
            <div className="issues-grid">
              {filteredIssues.map(issue => {
                const typeStyle = getTypeStyles(issue.type);
                return (
                  <article key={issue.id} className={`issue-card ${issue.state === 'DONE' ? 'card-closed' : ''}`} style={issue.isUrgent ? { borderColor: 'rgba(186,26,26,0.5)' } : {}}>
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
                      <button className={`btn-check ${issue.state === 'DONE' ? 'btn-checked' : ''}`} disabled={issue.state === 'DONE'}>
                        <span className="material-symbols-outlined" style={issue.state === 'DONE' ? { fontVariationSettings: '"FILL" 1' } : {}}>check_circle</span>
                      </button>
                    </div>

                    <h3 className={`issue-title ${issue.state === 'DONE' ? 'issue-title-closed' : ''}`}>{issue.title}</h3>
                    {issue.reporterFullName && <p className="issue-project" style={{ marginBottom: '8px' }}>Assigned by: {issue.reporterFullName}</p>}

                    <div className="card-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                        <span className="badge" style={{ backgroundColor: typeStyle.badgeBg, border: `1px solid ${typeStyle.badgeBorder}`, color: typeStyle.textColor }}>
                          <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>{typeStyle.icon}</span> {issue.type}
                        </span>
                        <span className={`badge ${getStateBadgeClass(issue.state)}`}>
                          <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>pending_actions</span> {getStateText(issue.state)}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-secondary)', fontSize: '12px' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>chat_bubble</span>
                        <span>{issue.commentsCount || 0}</span>
                      </div>
                    </div>
                  </article>
                );
              })}
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

