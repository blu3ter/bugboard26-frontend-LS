import React from 'react';

interface IssuesFilterBarProps {
  searchPlaceholder?: string;
}

export const IssuesFilterBar: React.FC<IssuesFilterBarProps> = ({ 
  searchPlaceholder = "Search..."
}) => {
  return (
    <section className="filters-section">
      <div className="search-box">
        <span className="material-symbols-outlined">search</span>
        <input type="text" placeholder={searchPlaceholder} />
      </div>
      
      <div className="dropdowns-group">
        <div className="custom-select">
          <select>
            <option value="">Type (All)</option>
            <option value="bug">Bug</option>
            <option value="feature">Feature</option>
            <option value="domanda">Question</option>
            <option value="documentazione">Documentation</option>
          </select>
          <span className="material-symbols-outlined">arrow_drop_down</span>
        </div>

        <div className="custom-select">
          <select>
            <option value="">Status (All)</option>
            <option value="todo">To Do</option>
            <option value="in_lavorazione">In Progress</option>
            <option value="in_verifica">In Review</option>
            <option value="chiuso">Closed</option>
          </select>
          <span className="material-symbols-outlined">arrow_drop_down</span>
        </div>

        <div className="custom-select">
          <select>
            <option value="">Priority (All)</option>
            <option value="urgente" style={{ color: 'var(--error)', fontWeight: 'bold' }}>Urgent Only</option>
          </select>
          <span className="material-symbols-outlined">arrow_drop_down</span>
        </div>
        
        <button className="btn-ghost" title="Clear Filters">
          <span className="material-symbols-outlined">filter_alt_off</span>
        </button>
      </div>
    </section>
  );
};
