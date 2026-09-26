import React from 'react';
import '../AllIssuesView/AllIssuesView.css';
import './MyIssuesView.css';

export const MyIssuesView: React.FC = () => {
  return (
    <div className="my-issues-layout">
      {/* Main Content Area (Left side) */}
      <div className="my-issues-main-content">
        <section className="filters-section">
          <div className="search-box">
            <span className="material-symbols-outlined">search</span>
            <input type="text" placeholder="Cerca tra le tue issue..." />
          </div>
        </section>

        <div className="issues-grid">
          {/* Card Example */}
          <article className="issue-card">
            <div className="card-accent-line" style={{ backgroundColor: 'var(--primary)' }}></div>
            
            <div className="card-header">
              <div className="card-id-group">
                <span className="issue-id">BB-1021</span>
              </div>
              <button className="btn-check">
                <span className="material-symbols-outlined">check_circle</span>
              </button>
            </div>
            
            <h3 className="issue-title">Risolvere bug sulla login page</h3>
            <p className="issue-project">Assegnato a te</p>
            
            <div className="card-footer">
              <span className="badge badge-feature">
                <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>bug_report</span> Bug
              </span>
              <span className="badge badge-todo">
                <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>list</span> Todo
              </span>
              <div className="comments-count">
                <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>chat_bubble</span> 0
              </div>
            </div>
          </article>
        </div>
      </div>

      {/* Sidebar Area (Right side) */}
      <aside className="my-issues-sidebar">
        <div className="summary-panel">
          
          <div className="summary-header">
            <h2 className="summary-title">
              <span className="material-symbols-outlined" style={{ color: 'var(--primary)' }}>analytics</span> 
              Riepilogo Task
            </h2>
            <span className="summary-total-badge">4 Totali</span>
          </div>

          <div className="metrics-list">
            <div className="metric-item metric-todo">
              <div className="metric-item-left">
                <div className="metric-icon-wrapper">
                  <span className="material-symbols-outlined">pending_actions</span>
                </div>
                <div className="metric-info">
                  <span className="metric-name">Da fare</span>
                  <span className="metric-desc">In coda di priorità</span>
                </div>
              </div>
              <span className="metric-value">2</span>
            </div>

            <div className="metric-item metric-urgent">
              <div className="metric-item-left">
                <div className="metric-icon-wrapper">
                  <span className="material-symbols-outlined">priority_high</span>
                </div>
                <div className="metric-info">
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <span className="metric-name">Urgenti</span>
                    <span className="active-badge">Attivo</span>
                  </div>
                  <span className="metric-desc">Intervento immediato</span>
                </div>
              </div>
              <span className="metric-value">1</span>
            </div>

            <div className="metric-item metric-progress">
              <div className="metric-item-left">
                <div className="metric-icon-wrapper">
                  <span className="material-symbols-outlined">autorenew</span>
                </div>
                <div className="metric-info">
                  <span className="metric-name">In Lavorazione</span>
                  <span className="metric-desc">In corso di sviluppo</span>
                </div>
              </div>
              <span className="metric-value">1</span>
            </div>

            <div className="metric-item metric-done">
              <div className="metric-item-left">
                <div className="metric-icon-wrapper">
                  <span className="material-symbols-outlined">done_all</span>
                </div>
                <div className="metric-info">
                  <span className="metric-name">Completate</span>
                  <span className="metric-desc">Risolte e verificate</span>
                </div>
              </div>
              <span className="metric-value">1</span>
            </div>
          </div>

          <div className="chart-section">
            <div className="chart-header">
              <span className="chart-title">Stato Avanzamento</span>
              <span className="chart-badge">1 di 4 risolte</span>
            </div>
            
            <div className="donut-container">
              <svg className="donut-svg" viewBox="0 0 120 120">
                <circle className="donut-bg" cx="60" cy="60" r="48"></circle>
                <circle className="donut-segment segment-todo" cx="60" cy="60" r="48"></circle>
                <circle className="donut-segment segment-urgent" cx="60" cy="60" r="48"></circle>
                <circle className="donut-segment segment-progress" cx="60" cy="60" r="48"></circle>
                <circle className="donut-segment segment-done" cx="60" cy="60" r="48"></circle>
              </svg>
              <div className="donut-text">
                <span className="donut-percentage">25%</span>
                <span className="donut-label">Completato</span>
              </div>
            </div>

            <div className="chart-legend">
              <div className="legend-item">
                <span className="legend-dot bg-todo"></span>
                <span className="legend-text">Da fare (50%)</span>
              </div>
              <div className="legend-item">
                <span className="legend-dot bg-urgent"></span>
                <span className="legend-text">Urgenti (25%)</span>
              </div>
              <div className="legend-item">
                <span className="legend-dot bg-progress"></span>
                <span className="legend-text">In corso (25%)</span>
              </div>
              <div className="legend-item">
                <span className="legend-dot bg-done"></span>
                <span className="legend-text">Completate (25%)</span>
              </div>
            </div>
          </div>

        </div>
      </aside>
    </div>
  );
};
