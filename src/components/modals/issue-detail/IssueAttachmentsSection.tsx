import React, { useEffect, useState } from 'react';
import type { IssueDto } from '../../../types';

interface IssueAttachmentsSectionProps {
  issue: IssueDto;
}

interface ResolvedAttachment {
  src: string;
  name: string;
  formatLabel: string;
  sizeLabel?: string;
}

function detectMimeFromBase64(raw: string): string {
  if (raw.startsWith('/9j/')) return 'image/jpeg';
  if (raw.startsWith('R0lGOD')) return 'image/gif';
  if (raw.startsWith('UklGR')) return 'image/webp';
  return 'image/png';
}

function formatByteSize(bytes?: number | null): string | undefined {
  if (!bytes || bytes <= 0) return undefined;
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function resolveIssueAttachment(issue: IssueDto): ResolvedAttachment | null {
  const raw = issue.imageUrl || issue.imageBase64 || issue.image;
  if (!raw || typeof raw !== 'string') return null;

  const trimmed = raw.trim();
  if (!trimmed) return null;

  const isDirectUrl =
    trimmed.startsWith('data:') ||
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('/') ||
    trimmed.startsWith('blob:');

  const mime = issue.imageContentType || detectMimeFromBase64(trimmed);
  const src = isDirectUrl ? trimmed : `data:${mime};base64,${trimmed}`;

  const mimeSubtype = (src.match(/^data:image\/([a-zA-Z0-9+.-]+);/)?.[1] || mime.split('/')[1] || 'PNG')
    .replace('jpeg', 'JPG')
    .toUpperCase();

  return {
    src,
    name: issue.imageName || `allegato-BB-${issue.id}.${mimeSubtype.toLowerCase()}`,
    formatLabel: mimeSubtype,
    sizeLabel: formatByteSize(issue.imageSizeBytes),
  };
}

/**
 * Sezione allegati immagine dell'issue con preview compatta, download,
 * apertura in nuova scheda e lightbox a schermo intero.
 */
export const IssueAttachmentsSection: React.FC<IssueAttachmentsSectionProps> = ({ issue }) => {
  const [lightboxIssueId, setLightboxIssueId] = useState<number | null>(null);
  const attachment = resolveIssueAttachment(issue);
  const lightboxOpen = Boolean(attachment) && lightboxIssueId === issue.id;

  useEffect(() => {
    if (!lightboxOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        setLightboxIssueId(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [lightboxOpen]);

  const handleOpenInNewTab = async (src: string) => {
    if (!src.startsWith('data:')) {
      window.open(src, '_blank', 'noopener,noreferrer');
      return;
    }
    try {
      const response = await fetch(src);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      window.open(blobUrl, '_blank', 'noopener,noreferrer');
      setTimeout(() => URL.revokeObjectURL(blobUrl), 60_000);
    } catch {
      setLightboxIssueId(issue.id);
    }
  };

  return (
    <section className="issue-section-block">
      <div className="issue-section-header">
        <div className="issue-section-title-group">
          <span className="material-symbols-outlined issue-section-icon" aria-hidden="true">
            image
          </span>
          <h3 className="section-label">Allegati ({attachment ? 1 : 0})</h3>
        </div>
        {attachment && (
          <button
            type="button"
            className="attachment-zoom-hint-btn"
            onClick={() => setLightboxIssueId(issue.id)}
          >
            <span className="material-symbols-outlined" aria-hidden="true">
              zoom_in
            </span>
            <span>Clicca per ingrandire</span>
          </button>
        )}
      </div>

      {attachment ? (
        <div className="issue-attachments-grid">
          <article className="issue-attachment-card">
            <div
              className="attachment-preview-media"
              role="button"
              tabIndex={0}
              aria-label={`Ingrandisci ${attachment.name}`}
              onClick={() => setLightboxIssueId(issue.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setLightboxIssueId(issue.id);
                }
              }}
            >
              <img src={attachment.src} alt={attachment.name} className="attachment-preview-img" />
              <span className="attachment-expand-badge" aria-hidden="true">
                <span className="material-symbols-outlined">open_in_full</span>
              </span>
            </div>

            <div className="attachment-card-footer">
              <div className="attachment-file-meta">
                <span className="attachment-file-name" title={attachment.name}>
                  {attachment.name}
                </span>
                <span className="attachment-file-details">
                  {attachment.sizeLabel
                    ? `${attachment.formatLabel} • ${attachment.sizeLabel}`
                    : `${attachment.formatLabel} • Immagine allegata`}
                </span>
              </div>

              <div className="attachment-card-actions">
                <a
                  href={attachment.src}
                  download={attachment.name}
                  className="btn-attachment-icon"
                  title="Scarica immagine"
                  aria-label="Scarica immagine"
                >
                  <span className="material-symbols-outlined">download</span>
                </a>
                <button
                  type="button"
                  className="btn-attachment-icon"
                  title="Apri in una nuova scheda"
                  aria-label="Apri in una nuova scheda"
                  onClick={() => handleOpenInNewTab(attachment.src)}
                >
                  <span className="material-symbols-outlined">open_in_new</span>
                </button>
              </div>
            </div>
          </article>
        </div>
      ) : (
        <div className="attachments-empty-state">
          <span className="material-symbols-outlined" aria-hidden="true">
            hide_image
          </span>
          <span>Nessuna immagine allegata a questa issue.</span>
        </div>
      )}

      {lightboxOpen && attachment && (
        <div
          className="issue-attachment-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={`Anteprima di ${attachment.name}`}
          onClick={() => setLightboxIssueId(null)}
        >
          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            <div className="lightbox-header">
              <span className="lightbox-filename">{attachment.name}</span>
              <button
                type="button"
                className="btn-close-lightbox"
                onClick={() => setLightboxIssueId(null)}
                aria-label="Chiudi anteprima"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <img src={attachment.src} alt={attachment.name} className="lightbox-full-img" />
          </div>
        </div>
      )}
    </section>
  );
};
