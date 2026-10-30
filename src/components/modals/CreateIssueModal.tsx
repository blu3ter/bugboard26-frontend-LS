import React, { useState, useRef } from 'react';
import type { FormEvent, ChangeEvent } from 'react';
import { issueService } from '../../service/issueService';
import { TagSelector } from '../tags/TagSelector';
import type { IssueDto, IssueType } from '../../types';
import '../../pages/CreateIssueView/CreateIssueView.css';

export interface CreateIssueModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: (newIssue: IssueDto) => void;
}

export const CreateIssueModal: React.FC<CreateIssueModalProps> = ({
  isOpen,
  onClose,
  onCreated,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [issueType, setIssueType] = useState<IssueType>('BUG');
  const [isUrgent, setIsUrgent] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleToggleUrgent = (checked: boolean) => {
    setIsUrgent(checked);
    if (checked && !tags.includes('urgent')) {
      setTags([...tags, 'urgent']);
    } else if (!checked) {
      setTags(tags.filter((t) => t.toLowerCase() !== 'urgent'));
    }
  };

  const handleTagsChange = (newTags: string[]) => {
    setTags(newTags);
    const hasUrgent = newTags.some((t) => t.toLowerCase() === 'urgent');
    setIsUrgent(hasUrgent);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMessage('Il titolo della issue è obbligatorio.');
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage(null);

      const created = await issueService.createIssue(
        {
          title: title.trim(),
          description: description.trim(),
          type: issueType,
          isUrgent,
          tagNames: tags,
        },
        selectedFile
      );

      // Reset form
      setTitle('');
      setDescription('');
      setTags([]);
      setSelectedFile(null);
      setIsUrgent(false);

      if (onCreated) {
        onCreated(created);
      }
      onClose();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage('Errore durante la creazione della segnalazione');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="create-issue-page-wrapper">
      <div className="create-issue-modal-backdrop" onClick={onClose}>
        <div
          className="create-issue-modal"
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
        >
          {/* Header */}
          <div className="modal-header">
            <div className="header-icon-container">
              <span className="material-symbols-outlined" style={{ color: '#38bdf8' }}>
                add_task
              </span>
            </div>
            <div className="header-text-group">
              <h1 className="header-title">Crea Nuova Issue</h1>
              <p className="header-subtitle">
                Segnala un bug o descrivi una nuova richiesta per il team di sviluppo.
              </p>
            </div>
            <button
              type="button"
              className="modal-close-button"
              onClick={onClose}
              aria-label="Chiudi"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          {/* Form Body */}
          <form className="modal-body-scrollable" onSubmit={handleSubmit}>
            {errorMessage && (
              <div style={{
                backgroundColor: 'rgba(239, 68, 68, 0.15)',
                color: '#f87171',
                padding: '10px 14px',
                borderRadius: '8px',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                fontSize: '0.85rem'
              }}>
                {errorMessage}
              </div>
            )}

            {/* Titolo */}
            <div className="field-group">
              <label className="field-label">
                Titolo <span className="field-required-marker">*</span>
              </label>
              <input
                type="text"
                className="issue-title-input"
                placeholder="es. Errore di autenticazione al refresh della pagina"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            {/* Tipo Issue */}
            <div className="field-group">
              <label className="field-label">Tipologia Issue</label>
              <div className="issue-type-grid">
                {(['BUG', 'FEATURE', 'QUESTION', 'DOCUMENTATION'] as IssueType[]).map((type) => (
                  <button
                    key={type}
                    type="button"
                    className={`type-radio-card ${issueType === type ? 'is-selected' : ''}`}
                    onClick={() => setIssueType(type)}
                  >
                    <span className="type-title">{type}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Switch Urgente */}
            <div className="urgency-banner-card">
              <div className="urgency-text-group">
                <span className="urgency-title">Segnala come Urgente</span>
                <span className="urgency-subtitle">
                  Evidenzia il ticket per dare massima priorità di assegnazione
                </span>
              </div>
              <label className="toggle-switch-container">
                <input
                  type="checkbox"
                  className="toggle-switch-input"
                  checked={isUrgent}
                  onChange={(e) => handleToggleUrgent(e.target.checked)}
                />
                <span className="toggle-switch-slider"></span>
              </label>
            </div>

            {/* Descrizione */}
            <div className="field-group">
              <label className="field-label">Descrizione Dettagliata</label>
              <textarea
                className="markdown-textarea"
                rows={5}
                placeholder="Descrivi i passaggi per riprodurre il problema o le specifiche richieste..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {/* Etichette/Tag (Req. 10) */}
            <div className="field-group">
              <label className="field-label">Etichette Personalizzabili</label>
              <TagSelector
                selectedTags={tags}
                onChange={handleTagsChange}
              />
            </div>

            {/* Allegato Immagine (Req. 2) */}
            <div className="field-group">
              <label className="field-label">Allegato Immagine (Opzionale)</label>
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
              <div
                className="attachment-dropzone"
                onClick={() => fileInputRef.current?.click()}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '28px', color: '#60a5fa' }}>
                  upload_file
                </span>
                <span style={{ fontSize: '0.85rem' }}>
                  {selectedFile ? selectedFile.name : 'Clicca per selezionare un screenshot o immagine'}
                </span>
                {selectedFile && (
                  <button
                    type="button"
                    style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', fontSize: '0.75rem' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedFile(null);
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                  >
                    Rimuovi
                  </button>
                )}
              </div>
            </div>
          </form>

          {/* Footer */}
          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose} disabled={isLoading}>
              Annulla
            </button>
            <button
              type="button"
              className="btn-primary"
              onClick={handleSubmit}
              disabled={isLoading || !title.trim()}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                send
              </span>
              <span>{isLoading ? 'Creazione in corso...' : 'Crea Issue'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
