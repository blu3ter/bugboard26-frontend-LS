import React from 'react';
import './AllIssuesView.css';

export const MyIssuesView: React.FC = () => {
  return (
    <div className="issues-view-container">
      {/* Filters & Search */}
      <section className="filters-section">
        <div className="search-box">
          <span className="material-symbols-outlined">search</span>
          <input type="text" placeholder="Cerca tra le tue issue..." />
        </div>
      </section>

      {/* Grid of Issues */}
      <div className="issues-grid">
        {/* Placeholder per le tue issue (Stile riutilizzato da AllIssuesView) */}
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
  );
};
