import React from 'react';
import { renderFormattedMarkdown } from '../../../utils/markdown';

interface IssueDescriptionSectionProps {
  description?: string;
}

/**
 * Sezione descrizione dell'issue con supporto al rendering markdown leggero.
 */
export const IssueDescriptionSection: React.FC<IssueDescriptionSectionProps> = ({ description }) => {
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

      <div className="issue-description-card">
        {hasDescription ? (
          renderFormattedMarkdown(description!.trim())
        ) : (
          <p className="description-empty-text">Nessuna descrizione fornita.</p>
        )}
      </div>
    </section>
  );
};

