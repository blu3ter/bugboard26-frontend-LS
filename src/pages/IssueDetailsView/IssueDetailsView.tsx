import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { authService } from '../../service/authService';
import { commentService } from '../../service/commentService';
import { issueService } from '../../service/issueService';
import type { CommentDto } from '../../types/comment.types';
import type { IssueDto } from '../../types/issue.types';
import './IssueDetailsView.css';

const TYPE_META: Record<string, { label: string; className: string }> = {
  BUG: { label: 'Bug', className: 'type-bug' },
  FEATURE: { label: 'Feature', className: 'type-feature' },
  QUESTION: { label: 'Question', className: 'type-question' },
  DOCUMENTATION: { label: 'Documentation', className: 'type-documentation' },
};

const STATE_META: Record<string, { label: string; className: string; showPulse?: boolean }> = {
  TODO: { label: 'Da Fare', className: 'badge-todo' },
  IN_PROGRESS: { label: 'In Lavorazione', className: 'badge-in-progress', showPulse: true },
  IN_REVIEW: { label: 'In Verifica', className: 'badge-in-review' },
  REVIEW: { label: 'In Verifica', className: 'badge-in-review' },
  CLOSED: { label: 'Chiusa', className: 'badge-closed' },
  DONE: { label: 'Chiusa', className: 'badge-closed' },
};

const TAG_COLOR_CLASS: Record<string, string> = {
  backend: 'tag-backend-color',
  frontend: 'tag-frontend-color',
  security: 'tag-security-color',
  database: 'tag-database-color',
  'ui/ux': 'tag-uiux-color',
  urgent: 'tag-urgent-color',
};

function formatIssueDate(isoDate?: string): string {
  if (!isoDate) return '';
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return isoDate;
  return date.toLocaleDateString('it-IT', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function formatCommentDate(isoDate?: string): string {
  if (!isoDate) return '';
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return isoDate;
  return date.toLocaleString('it-IT', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getCommentAuthorName(comment: CommentDto): string {
  const full = `${comment.authorName || ''} ${comment.authorLastName || ''}`.trim();
  return full || 'Collaboratore';
}

function getCommentInitials(comment: CommentDto): string {
  const first = comment.authorName?.trim()?.[0] || '';
  const last = comment.authorLastName?.trim()?.[0] || '';
  const initials = `${first}${last}`.toUpperCase();
  return initials || 'U';
}

function getTagColorClass(tagName: string): string {
  return TAG_COLOR_CLASS[tagName.toLowerCase()] || 'tag-default-color';
}

function renderTypeIcon(type: string) {
  switch (type?.toUpperCase()) {
    case 'FEATURE':
      return (
        <svg className="issue-type-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 5v14M5 12h14" />
        </svg>
      );
    case 'QUESTION':
      return (
        <svg className="issue-type-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
          <path d="M12 17h.01" />
        </svg>
      );
    case 'DOCUMENTATION':
      return (
        <svg className="issue-type-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
        </svg>
      );
    case 'BUG':
    default:
      return (
        <svg className="issue-type-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect width="8" height="14" x="8" y="6" rx="4" />
          <path d="m19 7-3 2" />
          <path d="m5 7 3 2" />
          <path d="m19 19-3-2" />
          <path d="m5 19 3-2" />
          <path d="M20 13h-4" />
          <path d="M4 13h4" />
          <path d="m10 4 1 2" />
          <path d="m14 4-1 2" />
        </svg>
      );
  }
}

export const IssueDetailsView: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [issue, setIssue] = useState<IssueDto | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Comments state
  const [comments, setComments] = useState<CommentDto[]>([]);
  const [commentsLoading, setCommentsLoading] = useState<boolean>(false);
  const [commentsError, setCommentsError] = useState<string | null>(null);
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState<boolean>(false);
  const [commentSubmitError, setCommentSubmitError] = useState<string | null>(null);
  const commentTextareaRef = useRef<HTMLTextAreaElement | null>(null);

  const loadComments = useCallback(async (issueId: string) => {
    setCommentsLoading(true);
    setCommentsError(null);
    try {
      const data = await commentService.getComments(issueId);
      setComments(data);
    } catch (err) {
      setCommentsError(err instanceof Error ? err.message : 'Impossibile caricare i commenti.');
    } finally {
      setCommentsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!id) {
      setError('ID issue non specificato nell’URL.');
      setLoading(false);
      return;
    }

    let isMounted = true;
    const fetchIssueAndComments = async () => {
      setLoading(true);
      setError(null);
      try {
        const issueData = await issueService.getIssueById(id);
        if (!isMounted) return;
        setIssue(issueData);

        setCommentsLoading(true);
        setCommentsError(null);
        try {
          const commentsData = await commentService.getComments(id);
          if (isMounted) {
            setComments(commentsData);
          }
        } catch (commentErr) {
          if (isMounted) {
            setCommentsError(
              commentErr instanceof Error ? commentErr.message : 'Impossibile caricare i commenti.'
            );
          }
        } finally {
          if (isMounted) {
            setCommentsLoading(false);
          }
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Impossibile caricare i dettagli della issue.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchIssueAndComments();
    return () => {
      isMounted = false;
    };
  }, [id]);

  const handleClose = () => {
    navigate(-1);
  };

  const applyFormat = (wrapper: string) => {
    const textarea = commentTextareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = newComment.slice(start, end) || 'testo';
    const updated = newComment.slice(0, start) + wrapper + selected + wrapper + newComment.slice(end);
    setNewComment(updated);

    requestAnimationFrame(() => {
      textarea.focus();
      const cursorStart = start + wrapper.length;
      textarea.setSelectionRange(cursorStart, cursorStart + selected.length);
    });
  };

  const handleAddComment = async () => {
    const trimmed = newComment.trim();
    if (!trimmed || !id || submittingComment) return;

    setSubmittingComment(true);
    setCommentSubmitError(null);
    try {
      const saved = await commentService.addComment(id, trimmed);
      setComments((prev) => [...prev, saved]);
      setNewComment('');
    } catch (err) {
      setCommentSubmitError(
        err instanceof Error ? err.message : 'Errore durante l’invio del commento.'
      );
    } finally {
      setSubmittingComment(false);
    }
  };

  const [actionLoading, setActionLoading] = useState<'review' | 'send-back' | 'close' | null>(null);
  const [actionFeedback, setActionFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleStateAction = async (action: 'review' | 'send-back' | 'close') => {
    if (!id || actionLoading) return;

    const actionConfig = {
      review: {
        call: () => issueService.sendToReview(id),
        successMessage: 'Issue inviata in verifica con successo.',
      },
      'send-back': {
        call: () => issueService.sendBackToProgress(id),
        successMessage: 'Issue rimandata in lavorazione.',
      },
      close: {
        call: () => issueService.closeIssue(id),
        successMessage: 'Issue chiusa con successo.',
      },
    }[action];

    setActionLoading(action);
    setActionFeedback(null);
    try {
      const updatedIssue = await actionConfig.call();
      setIssue(updatedIssue);
      setActionFeedback({ type: 'success', message: actionConfig.successMessage });
    } catch (err) {
      setActionFeedback({
        type: 'error',
        message: err instanceof Error ? err.message : 'Operazione non riuscita.',
      });
    } finally {
      setActionLoading(null);
    }
  };

  const typeKey = issue?.type?.toUpperCase() || 'BUG';
  const typeMeta = TYPE_META[typeKey] || { label: issue?.type || 'Issue', className: 'type-bug' };

  const stateKey = issue?.state?.toUpperCase() || 'TODO';
  const stateMeta = STATE_META[stateKey] || { label: issue?.state || 'TODO', className: 'badge-todo' };

  const currentUser = authService.getUser();
  const isAdmin = currentUser?.role?.toUpperCase().includes('ADMIN') ?? false;
  const isAssignee =
    Boolean(currentUser?.email) &&
    issue?.assigneeEmail?.toLowerCase() === currentUser?.email?.toLowerCase();

  const canSendToReview = stateKey === 'IN_PROGRESS' && (isAdmin || isAssignee);
  const canSendBack = (stateKey === 'IN_REVIEW' || stateKey === 'REVIEW') && isAdmin;
  const canCloseIssue = stateKey !== 'CLOSED' && stateKey !== 'DONE' && isAdmin;

  return (
    <div className="issue-detail-overlay">
      {/* Ambient Lighting Background */}
      <div className="issue-detail-ambient-bg" aria-hidden="true">
        <div className="ambient-badge ambient-blue-1"></div>
        <div className="ambient-badge ambient-amber-1"></div>
        <div className="ambient-badge ambient-red-1"></div>
        <div className="ambient-badge ambient-emerald-1"></div>
        <div className="ambient-badge ambient-cyan-1"></div>
        <div className="ambient-badge ambient-rose-1"></div>
        <div className="ambient-badge ambient-cyan-2"></div>
        <div className="ambient-badge ambient-pink-1"></div>
        <div className="ambient-badge ambient-emerald-2"></div>
        <div className="ambient-badge ambient-blue-2"></div>
        <div className="ambient-badge ambient-purple-1"></div>
      </div>

      {/* Main Issue Detail Modal */}
      <main className="issue-detail-modal">
        {loading ? (
          <div className="issue-detail-state-box">
            <p>Caricamento dettagli issue...</p>
          </div>
        ) : error || !issue ? (
          <div className="issue-detail-state-box">
            <p className="issue-detail-error-text">{error || 'Issue non trovata.'}</p>
            <button type="button" className="btn-footer-cancel" onClick={handleClose}>
              Torna indietro
            </button>
          </div>
        ) : (
          <>
            {/* Modal Header */}
            <header className="issue-detail-header" data-purpose="modal-header">
              <div className="header-top-row">
                <div className="header-info-col">
                  {/* Brand and Status Badges */}
                  <div className="badges-row">
                    <span className={`issue-type-badge ${typeMeta.className}`}>
                      {renderTypeIcon(typeKey)}
                      <span>{typeMeta.label}</span>
                    </span>

                    <span className={stateMeta.className}>
                      {stateMeta.showPulse && <span className="pulse-indicator"></span>}
                      {stateMeta.label}
                    </span>

                    {issue.isUrgent && (
                      <span className="badge-urgent">
                        <svg className="badge-urgent-icon" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            clipRule="evenodd"
                            fillRule="evenodd"
                            d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z"
                          />
                        </svg>
                        URGENTE
                      </span>
                    )}
                  </div>

                  {/* Title Row */}
                  <h1 className="issue-title-heading">
                    <span className="issue-key-code">BB-{issue.id}</span>
                    <span className="issue-dot-sep">·</span>
                    <span>{issue.title}</span>
                  </h1>

                  {/* Meta author & assignees */}
                  <div className="issue-meta-row">
                    <span>
                      Segnalato da <strong>{issue.reporterFullName || issue.reporterEmail}</strong>
                      {issue.creationDate ? ` il ${formatIssueDate(issue.creationDate)}` : ''}
                    </span>
                    <span className="meta-sep">·</span>
                    <span>
                      {issue.assigneeFullName ? (
                        <>
                          Assegnato ad <strong className="assignee-name">{issue.assigneeFullName}</strong>
                        </>
                      ) : (
                        'Non ancora assegnata'
                      )}
                    </span>
                  </div>
                </div>

                {/* Close Button */}
                <button
                  type="button"
                  className="btn-close-modal"
                  aria-label="Chiudi Modale"
                  onClick={handleClose}
                >
                  <svg className="close-icon-svg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </header>

            {/* Modal Body */}
            <div className="issue-detail-body custom-scrollbar" data-purpose="modal-content">
              {/* Section 1: Issue Description */}
              <section data-purpose="issue-description">
                <div className="section-header-line">
                  <h2 className="section-label">Descrizione del Problema</h2>
                </div>

                <div className="description-card">
                  {issue.description?.trim() ? (
                    <p className="description-text">{issue.description}</p>
                  ) : (
                    <p className="empty-section-hint">Nessuna descrizione fornita per questa issue.</p>
                  )}
                </div>
              </section>

              {/* Section 2: Tags / Etichette */}
              <section data-purpose="issue-tags">
                <div className="section-header-line">
                  <h2 className="section-label">Etichette &amp; Ambito</h2>
                </div>
                <div className="tags-wrapper-box">
                  {issue.tags && issue.tags.length > 0 ? (
                    issue.tags.map((tag) => (
                      <span key={tag} className={`tag-item-pill ${getTagColorClass(tag)}`}>
                        #{tag}
                      </span>
                    ))
                  ) : (
                    <p className="empty-section-hint">Nessuna etichetta associata.</p>
                  )}
                </div>
              </section>

              {/* Section 3: Comments Feed */}
              <section className="comments-section-container" data-purpose="issue-discussion">
                <div className="section-header-line">
                  <h2 className="section-label">Attività &amp; Discussione ({comments.length})</h2>
                  <button
                    type="button"
                    className="refresh-feed-btn"
                    disabled={commentsLoading}
                    onClick={() => id && loadComments(id)}
                  >
                    {commentsLoading ? 'Aggiornamento...' : 'Aggiorna feed'}
                  </button>
                </div>

                {commentsError && <p className="comment-error-banner">{commentsError}</p>}

                {commentsLoading && comments.length === 0 ? (
                  <p className="empty-section-hint">Caricamento commenti...</p>
                ) : comments.length === 0 ? (
                  <p className="empty-section-hint">Nessun commento presente. Avvia la discussione qui sotto.</p>
                ) : (
                  comments.map((comment) => (
                    <div key={comment.id} className="comment-card-box">
                      <div className="comment-avatar-bubble">{getCommentInitials(comment)}</div>
                      <div className="comment-body-col">
                        <div className="comment-author-row">
                          <div className="comment-author-badge">
                            <span className="comment-user-name">{getCommentAuthorName(comment)}</span>
                          </div>
                          <time className="comment-timestamp">{formatCommentDate(comment.creationDate)}</time>
                        </div>
                        <p className="comment-message-text">{comment.text}</p>
                      </div>
                    </div>
                  ))
                )}

                {commentSubmitError && <p className="comment-error-banner">{commentSubmitError}</p>}

                {/* Add Comment Input Area */}
                <div className="new-comment-editor">
                  <textarea
                    ref={commentTextareaRef}
                    className="comment-input-textarea"
                    rows={2}
                    maxLength={2000}
                    placeholder="Scrivi una risposta tecnica o premi Ctrl+Invio per inviare..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    onKeyDown={(e) => {
                      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                        e.preventDefault();
                        handleAddComment();
                      }
                    }}
                    disabled={submittingComment}
                  ></textarea>
                  <div className="editor-bottom-bar">
                    <div className="editor-formatting-tools">
                      <button
                        type="button"
                        className="btn-format-tool"
                        title="Grassetto"
                        onClick={() => applyFormat('**')}
                      >
                        <strong>B</strong>
                      </button>
                      <button
                        type="button"
                        className="btn-format-tool"
                        title="Corsivo"
                        onClick={() => applyFormat('*')}
                      >
                        <em>I</em>
                      </button>
                      <button
                        type="button"
                        className="btn-format-tool font-mono"
                        title="Codice inline"
                        onClick={() => applyFormat('`')}
                      >
                        &lt;/&gt;
                      </button>
                    </div>
                    <button
                      type="button"
                      className="btn-submit-comment"
                      onClick={handleAddComment}
                      disabled={submittingComment || !newComment.trim()}
                    >
                      <svg className="send-comment-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                      {submittingComment ? 'Invio...' : 'Invia Commento'}
                    </button>
                  </div>
                </div>
              </section>
            </div>

            {/* Feedback banner for state transitions */}
            {actionFeedback && (
              <div
                className={`action-feedback-bar ${actionFeedback.type === 'error' ? 'is-error' : 'is-success'}`}
                role="status"
              >
                {actionFeedback.message}
              </div>
            )}

            {/* Modal Footer */}
            <footer className="issue-detail-footer" data-purpose="modal-footer">
              <div className="footer-visibility-info">
                <svg className="visibility-shield-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
                <span>Visibile a tutti i collaboratori autorizzati di BugBoard26</span>
              </div>

              <div className="footer-actions-group">
                <button type="button" className="btn-footer-cancel" onClick={handleClose}>
                  Chiudi
                </button>

                {canSendBack && (
                  <button
                    type="button"
                    className="btn-footer-warning"
                    disabled={actionLoading !== null}
                    onClick={() => handleStateAction('send-back')}
                  >
                    {actionLoading === 'send-back' ? 'Invio...' : 'Rimanda in Lavorazione'}
                  </button>
                )}

                {canCloseIssue && (
                  <button
                    type="button"
                    className="btn-footer-success"
                    disabled={actionLoading !== null}
                    onClick={() => handleStateAction('close')}
                  >
                    {actionLoading === 'close' ? 'Chiusura...' : 'Chiudi Issue'}
                  </button>
                )}

                {canSendToReview && (
                  <button
                    type="button"
                    className="btn-footer-submit"
                    disabled={actionLoading !== null}
                    onClick={() => handleStateAction('review')}
                  >
                    <svg className="submit-check-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    {actionLoading === 'review' ? 'Invio...' : 'Invia in Verifica'}
                  </button>
                )}
              </div>
            </footer>
          </>
        )}
      </main>
    </div>
  );
};
