import React, { useState } from 'react';
import type { KeyboardEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import './CreateIssueView.css';

type IssueType = 'bug' | 'feature' | 'question' | 'documentation' | null;

export const CreateIssueView: React.FC = () => {
  const navigate = useNavigate();
  const [issueType, setIssueType] = useState<IssueType>(null);
  const [labels, setLabels] = useState<string[]>([]);
  const [labelInput, setLabelInput] = useState('');

  const handleAddLabel = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && labelInput.trim() !== '') {
      e.preventDefault();
      const newLabel = labelInput.trim().toUpperCase();
      if (!labels.includes(newLabel)) {
        setLabels([...labels, newLabel]);
      }
      setLabelInput('');
    }
  };

  const removeLabel = (labelToRemove: string) => {
    setLabels(labels.filter(label => label !== labelToRemove));
  };

  const toggleUrgent = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent form submission
    if (labels.includes('URGENT')) {
      removeLabel('URGENT');
    } else {
      setLabels(['URGENT', ...labels]);
    }
  };

  return (
    <div className="create-issue-view">
      <div className="page-title-row">
        <h1 className="page-title">Create New Issue</h1>
      </div>

      <form className="form-card" onSubmit={(e) => { e.preventDefault(); navigate('/dashboard/my-issues'); }}>
        
        {/* Title & Description */}
        <div>
          <label className="input-label" htmlFor="issue-title">Issue Title</label>
          <input 
            id="issue-title"
            className="text-input" 
            placeholder="e.g. Login button is not responding" 
            required
          />
        </div>

        <div>
          <label className="input-label">Description</label>
          <div className="editor-container">
            <div className="editor-toolbar">
              <button type="button" className="toolbar-btn" title="Bold">
                <span className="material-symbols-outlined">format_bold</span>
              </button>
              <button type="button" className="toolbar-btn" title="Italic">
                <span className="material-symbols-outlined">format_italic</span>
              </button>
              <button type="button" className="toolbar-btn" title="Bulleted List">
                <span className="material-symbols-outlined">format_list_bulleted</span>
              </button>
              <button type="button" className="toolbar-btn" title="Code">
                <span className="material-symbols-outlined">code</span>
              </button>
            </div>
            <textarea 
              className="editor-textarea" 
              placeholder="Include details, steps to reproduce, expected behavior, etc."
              required
            ></textarea>
          </div>
        </div>

        {/* Issue Type */}
        <div>
          <p className="input-label">Issue Type</p>
          <div className="type-grid">
            <button 
              type="button" 
              className={`type-btn ${issueType === 'bug' ? 'selected' : ''}`} 
              data-type="bug"
              onClick={() => setIssueType('bug')}
            >
              Bug
            </button>
            <button 
              type="button" 
              className={`type-btn ${issueType === 'feature' ? 'selected' : ''}`} 
              data-type="feature"
              onClick={() => setIssueType('feature')}
            >
              Feature
            </button>
            <button 
              type="button" 
              className={`type-btn ${issueType === 'question' ? 'selected' : ''}`} 
              data-type="question"
              onClick={() => setIssueType('question')}
            >
              Question
            </button>
            <button 
              type="button" 
              className={`type-btn ${issueType === 'documentation' ? 'selected' : ''}`} 
              data-type="documentation"
              onClick={() => setIssueType('documentation')}
            >
              Documentation
            </button>
          </div>
        </div>

        {/* Labels & Urgency */}
        <div className="labels-grid">
          <div>
            <label className="input-label" htmlFor="label-input">Labels</label>
            <input 
              id="label-input"
              className="text-input" 
              placeholder="Type and press Enter to add a label..." 
              value={labelInput}
              onChange={(e) => setLabelInput(e.target.value)}
              onKeyDown={handleAddLabel}
            />
            <div className="labels-container">
              {labels.map(label => (
                <span key={label} className={`tag-label ${label === 'URGENT' ? 'urgent' : ''}`}>
                  {label}
                  <button type="button" className="tag-remove-btn" onClick={() => removeLabel(label)}>
                    <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>close</span>
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div className="urgent-btn-container">
            <button type="button" className="btn-urgent" onClick={toggleUrgent}>
              <span className="material-symbols-outlined">bolt</span>
              {labels.includes('URGENT') ? 'Remove URGENT Flag' : 'Mark as URGENT'}
            </button>
          </div>
        </div>

        {/* Attachments */}
        <div>
          <p className="input-label">Attachments</p>
          <div className="dropzone">
            <div className="dropzone-icon">
              <span className="material-symbols-outlined" style={{ fontSize: '32px' }}>upload_file</span>
            </div>
            <p style={{ fontWeight: 600, color: 'var(--primary)', marginBottom: '4px' }}>Drag files here <span style={{ color: 'var(--on-surface-variant)', fontWeight: 400 }}>or click to upload</span></p>
            <p style={{ fontSize: '12px', color: 'var(--on-surface-variant)' }}>PNG, JPG, GIF, PDF up to 10MB</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="actions-row">
          <button type="button" className="btn-cancel" onClick={() => navigate('/dashboard')}>
            Cancel
          </button>
          <button type="submit" className="btn-create">
            Create Issue
          </button>
        </div>
        
      </form>
    </div>
  );
};
