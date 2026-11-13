import React from 'react';
import { renderFormattedMarkdown } from '../../../utils/markdown';

interface IssueDescriptionSectionProps {
  description?: string;
  isEditing?: boolean;
  draftDescription?: string;
  onDescriptionChange?: (value: string) => void;
}

/**
 * Sezione descrizione dell'issue: mostra il markdown formattato in lettura
 * oppure una textarea controllata in modalità modifica.
 */
export const IssueDescriptionSection: React.FC<IssueDescriptionSectionProps> = ({
  description,
  isEditing = false,
  draftDescription = '',
  onDescriptionChange,
}) => {
  const hasDescription = Boolean(description?.trim());

  return (
    <section className="issue-section-block">
      <div className="issue-section-header">
        <div className="issue-section-title-group">
          <span className="material-symbols-outlined issue-section-icon" aria-hidden="true">
            notes
          </span>
          <h3 className="section-label">Descrizione</h3>
        </div>
        <span className="section-hint">Markdown supportato</span>
      </div>

      {isEditing ? (
        <div className="issue-description-card is-editing">
          <textarea
            className="issue-edit-description-textarea"
            rows={5}
            placeholder="Descrivi il problema, i passaggi per riprodurlo o i dettagli..."
            value={draftDescription}
            onChange={(e) => onDescriptionChange?.(e.target.value)}
          />
        </div>
      ) : (
        <div className="issue-description-card">
          {hasDescription ? (
            renderFormattedMarkdown(description!.trim())
          ) : (
            <p className="description-empty-text">Nessuna descrizione fornita.</p>
          )}
        </div>
      )}
    </section>
  );
};
