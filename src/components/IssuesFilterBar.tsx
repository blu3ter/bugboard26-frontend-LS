import React from 'react';

interface IssuesFilterBarProps {
  searchPlaceholder?: string;
  search: string;
  onSearchChange: (value: string) => void;
  type: string;
  onTypeChange: (value: string) => void;
  state: string;
  onStateChange: (value: string) => void;
  urgentOnly: boolean;
  onUrgentChange: (value: boolean) => void;
  onReset: () => void;
}

export const IssuesFilterBar: React.FC<IssuesFilterBarProps> = ({ 
  searchPlaceholder = "Search...",
  search,
  onSearchChange,
  type,
  onTypeChange,
  state,
  onStateChange,
  urgentOnly,
  onUrgentChange,
  onReset
}) => {
  return (
    <section className="filters-section">
      <div className="search-box">
        <span className="material-symbols-outlined">search</span>
        <input 
          type="text" 
          placeholder={searchPlaceholder} 
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      
      <div className="dropdowns-group">
        <div className="custom-select">
          <select value={type} onChange={(e) => onTypeChange(e.target.value)}>
            <option value="">Type (All)</option>
            <option value="BUG">Bug</option>
            <option value="FEATURE">Feature</option>
            <option value="QUESTION">Question</option>
            <option value="DOCUMENTATION">Documentation</option>
          </select>
          <span className="material-symbols-outlined">arrow_drop_down</span>
        </div>

        <div className="custom-select">
          <select value={state} onChange={(e) => onStateChange(e.target.value)}>
            <option value="">Status (All)</option>
            <option value="TODO">To Do</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="REVIEW">In Review</option>
            <option value="DONE">Closed</option>
          </select>
          <span className="material-symbols-outlined">arrow_drop_down</span>
        </div>

        <div className="custom-select">
          <select 
            value={urgentOnly ? "urgente" : ""} 
            onChange={(e) => onUrgentChange(e.target.value === "urgente")}
          >
            <option value="">Priority (All)</option>
            <option value="urgente" style={{ color: 'var(--error)', fontWeight: 'bold' }}>Urgent Only</option>
          </select>
          <span className="material-symbols-outlined">arrow_drop_down</span>
        </div>
        
        <button className="btn-ghost" title="Clear Filters" onClick={onReset}>
          <span className="material-symbols-outlined">filter_alt_off</span>
        </button>
      </div>
    </section>
  );
};
