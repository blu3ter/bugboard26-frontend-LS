import React, { useState } from 'react';
import type { KeyboardEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import './CreateIssueView.css';

type IssueType = 'bug' | 'feature' | 'domanda' | 'documentazione' | null;

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
    if (labels.includes('URGENTE')) {
      removeLabel('URGENTE');
    } else {
      setLabels(['URGENTE', ...labels]);
    }
  };

  return (
    <div className="create-issue-view">
      <div className="page-title-row">
        <h1 className="page-title">Crea Nuova Issue</h1>
      </div>

      <form className="form-card" onSubmit={(e) => { e.preventDefault(); navigate('/dashboard/my-issues'); }}>
        
        {/* Title & Description */}
        <div>
          <label className="input-label" htmlFor="issue-title">Titolo Issue</label>
          <input 
            id="issue-title"
            className="text-input" 
            placeholder="Es: Il pulsante di login non risponde al click" 
            required
          />
        </div>

        <div>
          <label className="input-label">Descrizione</label>
          <div className="editor-container">
            <div className="editor-toolbar">
              <button type="button" className="toolbar-btn" title="Grassetto">
                <span className="material-symbols-outlined">format_bold</span>
              </button>
              <button type="button" className="toolbar-btn" title="Corsivo">
                <span className="material-symbols-outlined">format_italic</span>
              </button>
              <button type="button" className="toolbar-btn" title="Lista puntata">
                <span className="material-symbols-outlined">format_list_bulleted</span>
              </button>
              <button type="button" className="toolbar-btn" title="Codice">
                <span className="material-symbols-outlined">code</span>
              </button>
            </div>
            <textarea 
              className="editor-textarea" 
              placeholder="Includi dettagli, step per riprodurre, comportamento atteso, etc."
              required
            ></textarea>
          </div>
        </div>

        {/* Issue Type */}
        <div>
          <p className="input-label">Tipo di Issue</p>
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
              className={`type-btn ${issueType === 'domanda' ? 'selected' : ''}`} 
              data-type="domanda"
              onClick={() => setIssueType('domanda')}
            >
              Domanda
            </button>
            <button 
              type="button" 
              className={`type-btn ${issueType === 'documentazione' ? 'selected' : ''}`} 
              data-type="documentazione"
              onClick={() => setIssueType('documentazione')}
            >
              Documentazione
            </button>
          </div>
        </div>

        {/* Labels & Urgency */}
        <div className="labels-grid">
          <div>
            <label className="input-label" htmlFor="label-input">Etichette</label>
            <input 
              id="label-input"
              className="text-input" 
              placeholder="Scrivi e premi Invio per aggiungere un'etichetta..." 
              value={labelInput}
              onChange={(e) => setLabelInput(e.target.value)}
              onKeyDown={handleAddLabel}
            />
            <div className="labels-container">
              {labels.map(label => (
                <span key={label} className={`tag-label ${label === 'URGENTE' ? 'urgent' : ''}`}>
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
              {labels.includes('URGENTE') ? 'Rimuovi Segnalazione URGENTE' : 'Segnala come URGENTE'}
            </button>
          </div>
        </div>

        {/* Attachments */}
        <div>
          <p className="input-label">Allegati</p>
          <div className="dropzone">
            <div className="dropzone-icon">
              <span className="material-symbols-outlined" style={{ fontSize: '32px' }}>upload_file</span>
            </div>
            <p style={{ fontWeight: 600, color: 'var(--primary)', marginBottom: '4px' }}>Trascina i file qui <span style={{ color: 'var(--on-surface-variant)', fontWeight: 400 }}>o clicca per caricare</span></p>
            <p style={{ fontSize: '12px', color: 'var(--on-surface-variant)' }}>PNG, JPG, GIF, PDF fino a 10MB</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="actions-row">
          <button type="button" className="btn-cancel" onClick={() => navigate('/dashboard')}>
            Annulla
          </button>
          <button type="submit" className="btn-create">
            Crea Issue
          </button>
        </div>
        
      </form>
    </div>
  );
};
