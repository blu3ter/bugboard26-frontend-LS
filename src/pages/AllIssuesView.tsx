import React from 'react';
import './AllIssuesView.css';

interface AllIssuesViewProps {
  // Pass isAdmin from your auth context or global state
  isAdmin?: boolean;
}

export const AllIssuesView: React.FC<AllIssuesViewProps> = ({ isAdmin = true }) => {
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
              <option value="domanda">Domanda</option>
              <option value="documentazione">Documentazione</option>
            </select>
            <span className="material-symbols-outlined">arrow_drop_down</span>
          </div>

          <div className="custom-select">
            <select>
              <option value="">Stato (Tutti)</option>
              <option value="todo">Todo</option>
              <option value="in_lavorazione">In Lavorazione</option>
              <option value="in_verifica">In Verifica</option>
              <option value="chiuso">Chiuso</option>
            </select>
            <span className="material-symbols-outlined">arrow_drop_down</span>
          </div>

          <div className="custom-select">
            <select>
              <option value="">Priorità (Tutte)</option>
              <option value="urgente" style={{ color: 'var(--error)', fontWeight: 'bold' }}>Solo urgenti</option>
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
            
            <div className="assignee-info">
              <span className="assignee-text">Svolta da: Mario Rossi</span>
              <span className="comments-count">
                <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>chat_bubble</span> 5
              </span>
            </div>
            
            {isAdmin && (
              <button className="btn-assign" title="Riassegna">
                <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>sync</span>
                <span>Assegna</span>
              </button>
            )}
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
            
            <div className="assignee-info">
              <span className="comments-count">
                <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>chat_bubble</span> 12
              </span>
            </div>
            
            {isAdmin && (
              <button className="btn-assign ml-auto" title="Assegna">
                <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>person_add</span>
                <span>Assegna</span>
              </button>
            )}
          </div>
        </article>

        {/* Card 3: BUG IN VERIFICA */}
        <article className="issue-card" style={{ borderColor: 'rgba(186,26,26,0.5)' }}>
          <div className="card-accent-line" style={{ backgroundColor: '#ba1a1a' }}></div>
          
          <div className="card-header">
            <div className="card-id-group">
              <span className="issue-id">BB-1021</span>
            </div>
            <button className="btn-check">
              <span className="material-symbols-outlined">check_circle</span>
            </button>
          </div>
          
          <h3 className="issue-title">Null Pointer Exception on User Login Flow</h3>
          <p className="issue-project">Project: Auth Service</p>
          
          <div className="card-footer">
            <span className="badge badge-bug">
              <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>bug_report</span> Bug
            </span>
            <span className="badge badge-in-review">
              <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>visibility</span> In Verifica
            </span>
            
            <div className="assignee-info">
              <span className="assignee-text">Svolta da: Giulia Verdi</span>
              <span className="comments-count">
                <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>chat_bubble</span> 3
              </span>
            </div>
            
            {isAdmin && (
              <button className="btn-assign" title="Riassegna">
                <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>cached</span>
                <span>Assegna</span>
              </button>
            )}
          </div>
        </article>

        {/* Card 4: DOCUMENTAZIONE CHIUSO */}
        <article className="issue-card card-closed">
          <div className="card-accent-line" style={{ backgroundColor: 'var(--secondary)' }}></div>
          
          <div className="card-header">
            <div className="card-id-group">
              <span className="issue-id">BB-0988</span>
            </div>
            <button className="btn-check btn-checked" disabled>
              <span className="material-symbols-outlined" style={{ fontVariationSettings: '"FILL" 1' }}>check_circle</span>
            </button>
          </div>
          
          <h3 className="issue-title issue-title-closed">Update API Docs for Payment Gateway v2</h3>
          <p className="issue-project">Project: Developer Docs</p>
          
          <div className="card-footer">
            <span className="badge badge-documentation">
              <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>description</span> Documentazione
            </span>
            <span className="badge badge-closed">
              <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>done_all</span> Chiuso
            </span>
            
            <div className="assignee-info" style={{ marginLeft: 'auto' }}>
              <span className="comments-count">
                <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>chat_bubble</span> 8
              </span>
            </div>
          </div>
        </article>
      </div>
    </div>
  );
};
