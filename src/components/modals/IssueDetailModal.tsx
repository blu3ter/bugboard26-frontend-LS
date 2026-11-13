import React, { useEffect, useState, useCallback } from 'react';
import { issueService } from '../../service/issueService';
import { commentService } from '../../service/commentService';
import { TagSelector } from '../tags/TagSelector';
import { CommentList, CommentForm } from '../comments';
import type { IssueDto, CommentDto, IssueState } from '../../types';
import {
  IssueMetaGrid,
  IssueDescriptionSection,
  IssueAttachmentsSection,
  IssueWorkflowStepper,
} from './issue-detail';
import '../../pages/IssueDetailsView/IssueDetailsView.css';

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

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleTagsChange = (newTags: string[]) => {
    if (!issue) return;
    const updated = { ...issue, tags: newTags };
    setIssue(updated);
    if (onIssueUpdated) onIssueUpdated(updated);
  };

  const handleStateChange = async (newState: IssueState) => {
    if (!issue || stateUpdating) return;
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

  const normalizedState = issue?.state?.toUpperCase() || 'TODO';
  const canSendToReview = Boolean(issue && normalizedState === 'IN_PROGRESS');
  const canAdminReview = Boolean(
    issue && isAdmin && (normalizedState === 'REVIEW' || normalizedState === 'IN_REVIEW')
  );
  const hasFooterActions = !loading && !error && (canSendToReview || canAdminReview);

  return (
    <div className="issue-detail-overlay" onClick={onClose}>
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
                <span className="issue-code-tag">BB-{issue?.id ?? issueId}</span>
              </div>
              <h1 id="issue-detail-modal-title" className="issue-main-title">
                {loading ? 'Caricamento issue...' : issue?.title}
              </h1>
            </div>

            <button
              type="button"
              className="btn-close-modal"
              onClick={onClose}
              aria-label="Chiudi modale"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
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

              <IssueDescriptionSection description={issue.description} />

              <IssueAttachmentsSection issue={issue} />

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
                  selectedTags={issue.tags || []}
                  onChange={handleTagsChange}
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

        {/* Footer con azioni workflow allineate in basso a destra */}
        {hasFooterActions && (
          <footer className="issue-detail-footer">
            <div className="footer-actions-group">
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
