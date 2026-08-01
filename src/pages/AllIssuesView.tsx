import React from 'react';
import './AllIssuesView.css';

export const AllIssuesView: React.FC = () => {
  return (
    <div className="issues-view-container">
      {/* Filters & Search */}
      <section className="filters-section">
        <div className="search-box">
          <span className="material-symbols-outlined">search</span>
          <input type="text" placeholder="Cerca ID, titolo, progetto..." />
        </div>
        
        <div className="dropdowns-group">
          <div className="custom-select">
            <select>
              <option value="">Tipo (Tutti)</option>
              <option value="bug">Bug</option>
              <option value="feature">Feature</option>
            </select>
            <span className="material-symbols-outlined">arrow_drop_down</span>
          </div>

          <div className="custom-select">
            <select>
              <option value="">Stato (Tutti)</option>
              <option value="todo">Todo</option>
              <option value="in_lavorazione">In Lavorazione</option>
            </select>
            <span className="material-symbols-outlined">arrow_drop_down</span>
          </div>
          
          <button className="btn-ghost" title="Azzera Filtri">
            <span className="material-symbols-outlined">filter_alt_off</span>
          </button>
        </div>
      </section>

      {/* Grid of Issues */}
      <div className="issues-grid">
        {/* Card 1: Urgent Bug */}
        <article className="issue-card" style={{ borderColor: 'rgba(186,26,26,0.5)' }}>
          <div className="card-accent-line" style={{ backgroundColor: '#ba1a1a' }}></div>
          
          <div className="card-header">
            <div className="card-id-group">
              <span className="issue-id">BB-1042</span>
              <span className="badge-urgent">
                <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>warning</span> URGENTE
              </span>
            </div>
            <button className="btn-check">
              <span className="material-symbols-outlined">check_circle</span>
            </button>
          </div>
          
          <h3 className="issue-title">Database Connection Timeout on Production Cluster</h3>
          <p className="issue-project">Project: Core Backend</p>
          
          <div className="card-footer">
            <span className="badge badge-bug">
              <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>bug_report</span> Bug
            </span>
            <span className="badge badge-in-progress">
              <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>autorenew</span> In Lavorazione
            </span>
            <div className="comments-count">
              <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>chat_bubble</span> 5
            </div>
          </div>
        </article>

        {/* Card 2: Feature Todo */}
        <article className="issue-card">
          <div className="card-accent-line" style={{ backgroundColor: 'var(--primary)' }}></div>
          
          <div className="card-header">
            <div className="card-id-group">
              <span className="issue-id">BB-1045</span>
            </div>
            <button className="btn-check">
              <span className="material-symbols-outlined">check_circle</span>
            </button>
          </div>
          
          <h3 className="issue-title">Implement Dark Mode Toggle for User Settings</h3>
          <p className="issue-project">Project: Web Frontend App</p>
          
          <div className="card-footer">
            <span className="badge badge-feature">
              <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>add_box</span> Feature
            </span>
            <span className="badge badge-todo">
              <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>list</span> Todo
            </span>
            <div className="comments-count">
              <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>chat_bubble</span> 2
            </div>
          </div>
        </article>
      </div>
    </div>
  );
};
