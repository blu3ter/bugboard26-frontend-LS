import React, { useEffect, useRef, useState } from 'react';
import { formatByteSize } from '../../../utils/format';
import type { IssueDto } from '../../../types';

export interface StagedAttachment {
  file: File;
  previewUrl: string;
  sizeLabel: string;
}

interface IssueAttachmentsSectionProps {
  issue: IssueDto;
  isEditing?: boolean;
  stagedAttachment?: StagedAttachment | null;
  removeExistingImage?: boolean;
  imageError?: string | null;
  onSelectFile?: (file: File) => void;
  onRemoveImage?: () => void;
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

function resolveExistingAttachment(issue: IssueDto): ResolvedAttachment | null {
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

function resolveStagedAttachment(staged: StagedAttachment): ResolvedAttachment {
  const ext = staged.file.name.split('.').pop()?.toUpperCase() || 'IMG';
  return {
    src: staged.previewUrl,
    name: staged.file.name,
    formatLabel: ext === 'JPEG' ? 'JPG' : ext,
    sizeLabel: staged.sizeLabel,
  };
}

/**
 * Sezione allegati immagine dell'issue:
 * - In lettura mostra la card preview con download, apertura scheda e lightbox.
 * - In modifica consente caricamento, sostituzione o rimozione dell'immagine.
 */
export const IssueAttachmentsSection: React.FC<IssueAttachmentsSectionProps> = ({
  issue,
  isEditing = false,
  stagedAttachment = null,
  removeExistingImage = false,
  imageError = null,
  onSelectFile,
  onRemoveImage,
}) => {
  const [lightboxIssueId, setLightboxIssueId] = useState<number | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const existingAttachment = removeExistingImage ? null : resolveExistingAttachment(issue);
  const activeAttachment = stagedAttachment
    ? resolveStagedAttachment(stagedAttachment)
    : existingAttachment;

  const lightboxOpen = Boolean(activeAttachment) && lightboxIssueId === issue.id;

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

  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onSelectFile?.(file);
    }
    event.target.value = '';
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(false);
    const file = event.dataTransfer.files?.[0];
    if (file) {
      onSelectFile?.(file);
    }
  };

  return (
    <section className="issue-section-block">
      <div className="issue-section-header">
        <div className="issue-section-title-group">
          <span className="material-symbols-outlined issue-section-icon" aria-hidden="true">
            image
          </span>
          <h3 className="section-label">Allegati ({activeAttachment ? 1 : 0})</h3>
        </div>
        {activeAttachment && (
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

      {isEditing && (
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/gif"
          onChange={handleFileInputChange}
          style={{ display: 'none' }}
        />
      )}

      {activeAttachment ? (
        <div className="issue-attachments-grid">
          <article className="issue-attachment-card">
            <div
              className="attachment-preview-media"
              role="button"
              tabIndex={0}
              aria-label={`Ingrandisci ${activeAttachment.name}`}
              onClick={() => setLightboxIssueId(issue.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setLightboxIssueId(issue.id);
                }
              }}
            >
              <img
                src={activeAttachment.src}
                alt={activeAttachment.name}
                className="attachment-preview-img"
              />
              <span className="attachment-expand-badge" aria-hidden="true">
                <span className="material-symbols-outlined">open_in_full</span>
              </span>
            </div>

            <div className="attachment-card-footer">
              <div className="attachment-file-meta">
                <span className="attachment-file-name" title={activeAttachment.name}>
                  {activeAttachment.name}
                </span>
                <span className="attachment-file-details">
                  {activeAttachment.sizeLabel
                    ? `${activeAttachment.formatLabel} • ${activeAttachment.sizeLabel}`
                    : `${activeAttachment.formatLabel} • Immagine allegata`}
                </span>
              </div>

              <div className="attachment-card-actions">
                {isEditing ? (
                  <>
                    <button
                      type="button"
                      className="btn-attachment-edit-replace"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      Sostituisci
                    </button>
                    <button
                      type="button"
                      className="btn-attachment-edit-remove"
                      onClick={() => onRemoveImage?.()}
                    >
                      Rimuovi
                    </button>
                  </>
                ) : (
                  <>
                    <a
                      href={activeAttachment.src}
                      download={activeAttachment.name}
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
                      onClick={() => handleOpenInNewTab(activeAttachment.src)}
                    >
                      <span className="material-symbols-outlined">open_in_new</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          </article>
        </div>
      ) : isEditing ? (
        <div
          className={`attachment-edit-dropzone ${isDragOver ? 'is-drag-over' : ''}`}
          role="button"
          tabIndex={0}
          onClick={() => fileInputRef.current?.click()}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              fileInputRef.current?.click();
            }
          }}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragOver(true);
          }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
        >
          <span className="material-symbols-outlined" aria-hidden="true">
            add_photo_alternate
          </span>
          <div className="attachment-dropzone-copy">
            <span className="attachment-dropzone-title">
              Clicca o trascina qui un&apos;immagine
            </span>
            <span className="attachment-dropzone-hint">
              PNG, JPG o GIF · max 1 MB
            </span>
          </div>
        </div>
      ) : (
        <div className="attachments-empty-state">
          <span className="material-symbols-outlined" aria-hidden="true">
            hide_image
          </span>
          <span>Nessuna immagine allegata a questa issue.</span>
        </div>
      )}

      {imageError && (
        <p className="attachment-edit-error" role="alert">
          {imageError}
        </p>
      )}

      {lightboxOpen && activeAttachment && (
        <div
          className="issue-attachment-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={`Anteprima di ${activeAttachment.name}`}
          onClick={() => setLightboxIssueId(null)}
        >
          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            <div className="lightbox-header">
              <span className="lightbox-filename">{activeAttachment.name}</span>
              <button
                type="button"
                className="btn-close-lightbox"
                onClick={() => setLightboxIssueId(null)}
                aria-label="Chiudi anteprima"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <img
              src={activeAttachment.src}
              alt={activeAttachment.name}
              className="lightbox-full-img"
            />
          </div>
        </div>
      )}
    </section>
  );
};
