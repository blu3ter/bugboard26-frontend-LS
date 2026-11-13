import React from 'react';
import type { IssueDto } from '../../../types';

interface IssueMetaGridProps {
  issue: IssueDto;
}

function getInitials(label?: string): string {
  if (!label) return '?';
  const cleaned = label.includes('@') ? label.split('@')[0].replace(/[._-]+/g, ' ') : label;
  const parts = cleaned.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

function formatCreationDate(rawDate?: string): string {
  if (!rawDate) return '—';
  const parsed = new Date(rawDate);
  return Number.isNaN(parsed.getTime()) ? '—' : parsed.toLocaleDateString('it-IT');
}

/**
 * Griglia a 3 card per i metadati principali dell'issue:
 * segnalatore, assegnatario e data di creazione.
 */
export const IssueMetaGrid: React.FC<IssueMetaGridProps> = ({ issue }) => {
  const reporterLabel = issue.reporterFullName || issue.reporterEmail || 'Utente';
  const hasAssignee = Boolean(issue.assigneeFullName || issue.assigneeEmail);
  const assigneeLabel = issue.assigneeFullName || issue.assigneeEmail || 'Non ancora assegnata';

  return (
    <section className="issue-meta-grid" aria-label="Metadati issue">
      <div className="issue-meta-card">
        <div className="meta-avatar-box meta-avatar-neutral" aria-hidden="true">
          {getInitials(reporterLabel)}
        </div>
        <div className="meta-card-content">
          <span className="meta-card-label">Segnalato da</span>
          <span className="meta-card-value" title={reporterLabel}>
            {reporterLabel}
          </span>
        </div>
      </div>

      <div className="issue-meta-card">
        <div
          className={`meta-avatar-box ${hasAssignee ? 'meta-avatar-assignee' : 'meta-avatar-unassigned'}`}
          aria-hidden="true"
        >
          {hasAssignee ? (
            getInitials(assigneeLabel)
          ) : (
            <span className="material-symbols-outlined meta-unassigned-icon">person_off</span>
          )}
        </div>
        <div className="meta-card-content">
          <span className="meta-card-label">Assegnato a</span>
          <span
            className={`meta-card-value ${!hasAssignee ? 'is-muted' : ''}`}
            title={assigneeLabel}
          >
            {assigneeLabel}
          </span>
        </div>
      </div>

      <div className="issue-meta-card">
        <div className="meta-avatar-box meta-icon-calendar" aria-hidden="true">
          <span className="material-symbols-outlined">calendar_today</span>
        </div>
        <div className="meta-card-content">
          <span className="meta-card-label">Data creazione</span>
          <span className="meta-card-value">{formatCreationDate(issue.creationDate)}</span>
        </div>
      </div>
    </section>
  );
};

