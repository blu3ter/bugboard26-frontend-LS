import React, { useEffect, useState, useCallback, useRef } from 'react';
import { issueService } from '../../service/issueService';
import { commentService } from '../../service/commentService';
import { authService } from '../../service/authService';
import { formatByteSize } from '../../utils/format';
import { TagSelector } from '../tags/TagSelector';
import { CommentList, CommentForm } from '../comments';
import type { IssueDto, CommentDto, IssueState, IssueType } from '../../types';
import {
  IssueMetaGrid,
  IssueDescriptionSection,
  IssueAttachmentsSection,
  IssueWorkflowStepper,
} from './issue-detail';
import type { StagedAttachment } from './issue-detail';
import '../../pages/IssueDetailsView/IssueDetailsView.css';

const ISSUE_TYPES: IssueType[] = ['BUG', 'FEATURE', 'QUESTION', 'DOCUMENTATION'];
const MAX_IMAGE_BYTES = 1 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/gif'];

export interface IssueDetailModalProps {
  issueId: number | null;
  onClose: () => void;
  onIssueUpdated?: (updatedIssue: IssueDto) => void;
  isAdmin?: boolean;
}

interface IssueDetailModalContentProps {
  issueId: number;
  onClose: () => void;
  onIssueUpdated?: (updatedIssue: IssueDto) => void;
  isAdmin: boolean;
}

const IssueDetailModalContent: React.FC<IssueDetailModalContentProps> = ({
  issueId,
  onClose,
  onIssueUpdated,
  isAdmin,
}) => {
  const [issue, setIssue] = useState<IssueDto | null>(null);
  const [comments, setComments] = useState<CommentDto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [commentsLoading, setCommentsLoading] = useState<boolean>(true);
  const [stateUpdating, setStateUpdating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // Edit mode state
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [savingEdit, setSavingEdit] = useState<boolean>(false);
  const [draftTitle, setDraftTitle] = useState<string>('');
  const [draftDescription, setDraftDescription] = useState<string>('');
  const [draftType, setDraftType] = useState<IssueType>('BUG');
  const [draftIsUrgent, setDraftIsUrgent] = useState<boolean>(false);
  const [draftTags, setDraftTags] = useState<string[]>([]);
  const [stagedAttachment, setStagedAttachment] = useState<StagedAttachment | null>(null);
  const [removeExistingImage, setRemoveExistingImage] = useState<boolean>(false);
  const [imageError, setImageError] = useState<string | null>(null);

  const previewUrlRef = useRef<string | null>(null);

  const clearStagedAttachment = useCallback(() => {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    }
    setStagedAttachment(null);
  }, []);

  useEffect(() => {
    return () => {
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
        previewUrlRef.current = null;
      }
    };
  }, []);

  const loadComments = useCallback(async (id: number) => {
    setCommentsLoading(true);
    try {
      const commentsData = await commentService.getCommentsByIssue(id);
      setComments(commentsData);
    } catch {
      // Tolleranza errore sui commenti per non bloccare la vista dell'issue
    } finally {
      setCommentsLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;

    issueService
      .getIssueById(issueId)
      .then((data) => {
        if (!active) return;
        setIssue(data);
        setError(null);
      })
      .catch((err: unknown) => {
        if (!active) return;
        setError(err instanceof Error ? err.message : 'Impossibile caricare i dettagli della issue');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    commentService
      .getCommentsByIssue(issueId)
      .then((commentsData) => {
        if (active) setComments(commentsData);
      })
      .catch(() => {
        // Tolleranza errore sui commenti per non bloccare la vista dell'issue
      })
      .finally(() => {
        if (active) setCommentsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [issueId]);

  const currentUser = authService.getUser();
  const effectiveIsAdmin = currentUser
    ? currentUser.role?.toUpperCase() === 'ADMIN'
    : isAdmin;

  const normalizedState = issue?.state?.toUpperCase() || 'TODO';
  const isClosed = normalizedState === 'CLOSED' || normalizedState === 'DONE';
  const isAssignedToCurrentUser = Boolean(
    currentUser?.email &&
      issue?.assigneeEmail &&
      currentUser.email.trim().toLowerCase() === issue.assigneeEmail.trim().toLowerCase()
  );
  const canModifyIssue = Boolean(issue && !isClosed && (effectiveIsAdmin || isAssignedToCurrentUser));

  const enterEditMode = () => {
    if (!issue || !canModifyIssue) return;
    clearStagedAttachment();
    setDraftTitle(issue.title || '');
    setDraftDescription(issue.description || '');
    setDraftType(issue.type || 'BUG');
    setDraftIsUrgent(Boolean(issue.isUrgent));
    setDraftTags(issue.tags || []);
    setRemoveExistingImage(false);
    setImageError(null);
    setActionError(null);
    setIsEditing(true);
  };

  const cancelEditMode = useCallback(() => {
    if (savingEdit) return;
    clearStagedAttachment();
    setRemoveExistingImage(false);
    setImageError(null);
    setActionError(null);
    setIsEditing(false);
  }, [clearStagedAttachment, savingEdit]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (isEditing) {
          cancelEditMode();
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isEditing, cancelEditMode, onClose]);

  const handleSelectImageFile = (file: File) => {
    const isValidType =
      ALLOWED_IMAGE_TYPES.includes(file.type) || /\.(png|jpe?g|gif)$/i.test(file.name);

    if (!isValidType) {
      setImageError('Formato non supportato. Seleziona un’immagine PNG, JPG o GIF.');
      return;
    }

    if (file.size > MAX_IMAGE_BYTES) {
      setImageError('Il file supera il limite massimo di 1 MB.');
      return;
    }

    clearStagedAttachment();
    const previewUrl = URL.createObjectURL(file);
    previewUrlRef.current = previewUrl;
    setImageError(null);
    setRemoveExistingImage(false);
    setStagedAttachment({
      file,
      previewUrl,
      sizeLabel: formatByteSize(file.size) || `${file.size} B`,
    });
  };

  const handleRemoveImage = () => {
    clearStagedAttachment();
    setImageError(null);
    setRemoveExistingImage(true);
  };

  const handleSaveEdit = async () => {
    if (!issue || !canModifyIssue || savingEdit) return;

    const trimmedTitle = draftTitle.trim();
    if (!trimmedTitle) {
      setActionError('Il titolo della issue non può essere vuoto.');
      return;
    }

    try {
      setSavingEdit(true);
      setActionError(null);
      const updated = await issueService.updateIssue(
        issue.id,
        {
          title: trimmedTitle,
          description: draftDescription,
          isUrgent: draftIsUrgent,
          type: draftType,
          tagNames: draftTags,
          removeImage: removeExistingImage && !stagedAttachment,
        },
        stagedAttachment?.file ?? null
      );
      setIssue(updated);
      clearStagedAttachment();
      setRemoveExistingImage(false);
      setIsEditing(false);
      if (onIssueUpdated) onIssueUpdated(updated);
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : 'Errore durante il salvataggio delle modifiche');
    } finally {
      setSavingEdit(false);
    }
  };

  const handleStateChange = async (newState: IssueState) => {
    if (!issue || stateUpdating || isClosed) return;
    try {
      setStateUpdating(true);
      setActionError(null);
      const updated = await issueService.updateIssueState(issue.id, newState);
      setIssue(updated);
      if (onIssueUpdated) onIssueUpdated(updated);
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : 'Errore nel cambio stato');
    } finally {
      setStateUpdating(false);
    }
  };

  const handleAddComment = async (text: string) => {
    if (!issue) return;
    const newComment = await commentService.addComment(issue.id, text);
    const nextCommentsCount = comments.length + 1;
    setComments((prev) => [...prev, newComment]);
    const updated = { ...issue, commentsCount: nextCommentsCount };
    setIssue(updated);
    if (onIssueUpdated) onIssueUpdated(updated);
  };

  const canSendToReview = Boolean(
    issue &&
      !isClosed &&
      normalizedState === 'IN_PROGRESS' &&
      (effectiveIsAdmin || isAssignedToCurrentUser)
  );
  const canAdminReview = Boolean(
    issue &&
      !isClosed &&
      effectiveIsAdmin &&
      (normalizedState === 'REVIEW' || normalizedState === 'IN_REVIEW')
  );
  const showFooter = !loading && !error && (isEditing || canSendToReview || canAdminReview);

  return (
    <div className="issue-detail-overlay" onClick={isEditing ? undefined : onClose}>
      <main
        className="issue-detail-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="issue-detail-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <header className="issue-detail-header">
          <div className="header-top-row">
            <div className="header-info-col">
              {isEditing ? (
                <div className="issue-edit-badges-bar">
                  <div className="edit-type-selector" role="group" aria-label="Tipo issue">
                    {ISSUE_TYPES.map((typeOption) => (
                      <button
                        key={typeOption}
                        type="button"
                        className={`edit-type-chip type-${typeOption.toLowerCase()} ${
                          draftType === typeOption ? 'is-selected' : ''
                        }`}
                        onClick={() => setDraftType(typeOption)}
                      >
                        {typeOption}
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    className={`edit-urgent-toggle ${draftIsUrgent ? 'is-active' : ''}`}
                    aria-pressed={draftIsUrgent}
                    onClick={() => setDraftIsUrgent((prev) => !prev)}
                  >
                    <span className="material-symbols-outlined badge-urgent-icon">warning</span>
                    <span>URGENTE</span>
                  </button>

                  <span className="issue-code-tag">BB-{issue?.id ?? issueId}</span>
                </div>
              ) : (
                <div className="badges-row">
                  <span className={`issue-type-badge type-${issue?.type?.toLowerCase() || 'bug'}`}>
                    {issue?.type || 'BUG'}
                  </span>
                  <span className="badge-state-pill">
                    <span className="state-pill-dot" aria-hidden="true" />
                    <span>{issue?.state || 'TODO'}</span>
                  </span>
                  {issue?.isUrgent && (
                    <span className="badge-urgent-flag">
                      <span className="material-symbols-outlined badge-urgent-icon">warning</span>
                      <span>URGENTE</span>
                    </span>
                  )}
                  {isClosed && (
                    <span className="badge-readonly-pill" title="Le issue chiuse non possono essere modificate">
                      <span className="material-symbols-outlined" aria-hidden="true">lock</span>
                      <span>Sola lettura</span>
                    </span>
                  )}
                  <span className="issue-code-tag">BB-{issue?.id ?? issueId}</span>
                </div>
              )}

              {isEditing ? (
                <input
                  id="issue-detail-modal-title"
                  type="text"
                  className="issue-edit-title-input"
                  value={draftTitle}
                  onChange={(e) => setDraftTitle(e.target.value)}
                  placeholder="Titolo della issue..."
                  maxLength={200}
                  autoFocus
                />
              ) : (
                <h1 id="issue-detail-modal-title" className="issue-main-title">
                  {loading ? 'Caricamento issue...' : issue?.title}
                </h1>
              )}
            </div>

            <div className="header-actions-col">
              {canModifyIssue && !isEditing && (
                <button
                  type="button"
                  className="btn-edit-issue"
                  onClick={enterEditMode}
                >
                  <span className="material-symbols-outlined" aria-hidden="true">edit</span>
                  <span>Modifica</span>
                </button>
              )}
              <button
                type="button"
                className="btn-close-modal"
                onClick={onClose}
                aria-label="Chiudi modale"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
          </div>
        </header>

        {/* Content Body */}
        <div className="issue-detail-body custom-scrollbar">
          {error ? (
            <div className="issue-modal-error-banner">{error}</div>
          ) : loading || !issue ? (
            <div className="issue-modal-loading-state">
              Caricamento dettagli issue in corso...
            </div>
          ) : (
            <>
              <IssueMetaGrid issue={issue} />

              <IssueDescriptionSection
                description={issue.description}
                isEditing={isEditing}
                draftDescription={draftDescription}
                onDescriptionChange={setDraftDescription}
              />

              <IssueAttachmentsSection
                issue={issue}
                isEditing={isEditing}
                stagedAttachment={stagedAttachment}
                removeExistingImage={removeExistingImage}
                imageError={imageError}
                onSelectFile={handleSelectImageFile}
                onRemoveImage={handleRemoveImage}
              />

              <IssueWorkflowStepper currentState={issue.state} />

              {actionError && (
                <div className="issue-action-error-banner" role="alert">
                  <span className="material-symbols-outlined" aria-hidden="true">error</span>
                  <span>{actionError}</span>
                </div>
              )}

              {/* Sezione Etichette (Req. 10) */}
              <section className="issue-tags-section">
                <h3 className="section-label">Etichette Personalizzate</h3>
                <TagSelector
                  selectedTags={isEditing ? draftTags : issue.tags || []}
                  onChange={setDraftTags}
                  readOnly={!isEditing}
                />
              </section>

              {/* Sezione Commenti (Req. 5) */}
              <section className="comments-section-container">
                <div className="comments-feed-header">
                  <div className="comments-feed-title">
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>forum</span>
                    <span>Commenti &amp; Discussione ({comments.length})</span>
                  </div>
                  <button
                    type="button"
                    className="refresh-feed-btn"
                    onClick={() => loadComments(issue.id)}
                  >
                    Ricarica
                  </button>
                </div>

                <CommentList comments={comments} loading={commentsLoading} />
                <CommentForm onSubmit={handleAddComment} />
              </section>
            </>
          )}
        </div>

        {/* Footer con azioni di salvataggio (edit) o workflow (view) allineate in basso a destra */}
        {showFooter && (
          <footer className="issue-detail-footer">
            <div className="footer-actions-group">
              {isEditing ? (
                <>
                  <button
                    type="button"
                    className="btn-footer-secondary"
                    disabled={savingEdit}
                    onClick={cancelEditMode}
                  >
                    Annulla
                  </button>
                  <button
                    type="button"
                    className="btn-state-action"
                    disabled={savingEdit || !draftTitle.trim()}
                    onClick={handleSaveEdit}
                  >
                    <span className="material-symbols-outlined btn-action-arrow" aria-hidden="true">
                      check
                    </span>
                    <span>{savingEdit ? 'Salvataggio...' : 'Salva modifiche'}</span>
                  </button>
                </>
              ) : (
                <>
                  {canSendToReview && (
                    <button
                      type="button"
                      className="btn-state-action"
                      disabled={stateUpdating}
                      onClick={() => handleStateChange('IN_REVIEW')}
                    >
                      <span>{stateUpdating ? 'Invio in corso...' : 'Invia in Review'}</span>
                      <span className="material-symbols-outlined btn-action-arrow" aria-hidden="true">
                        arrow_forward
                      </span>
                    </button>
                  )}

                  {canAdminReview && (
                    <>
                      <button
                        type="button"
                        className="btn-state-action reject"
                        disabled={stateUpdating}
                        onClick={() => handleStateChange('IN_PROGRESS')}
                      >
                        Richiedi Modifiche
                      </button>
                      <button
                        type="button"
                        className="btn-state-action approve"
                        disabled={stateUpdating}
                        onClick={() => handleStateChange('DONE')}
                      >
                        Approva (Done)
                      </button>
                    </>
                  )}
                </>
              )}
            </div>
          </footer>
        )}
      </main>
    </div>
  );
};

export const IssueDetailModal: React.FC<IssueDetailModalProps> = ({
  issueId,
  onClose,
  onIssueUpdated,
  isAdmin = false,
}) => {
  if (issueId === null) return null;

  return (
    <IssueDetailModalContent
      key={issueId}
      issueId={issueId}
      onClose={onClose}
      onIssueUpdated={onIssueUpdated}
      isAdmin={isAdmin}
    />
  );
};
