import React, { useEffect, useState, useCallback } from 'react';
import { issueService } from '../../service/issueService';
import { commentService } from '../../service/commentService';
import { TagSelector } from '../tags/TagSelector';
import { CommentList, CommentForm } from '../comments';
import type { IssueDto, CommentDto, IssueState } from '../../types';
import '../../pages/IssueDetailsView/IssueDetailsView.css';

function renderInlineMarkdown(line: string): React.ReactNode[] {
  const tokenRegex = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g;
  return line.split(tokenRegex).map((part, idx) => {
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
      return <strong key={idx}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
      return <em key={idx}>{part.slice(1, -1)}</em>;
    }
    if (part.startsWith('`') && part.endsWith('`') && part.length > 2) {
      return (
        <code key={idx} className="inline-code">
          {part.slice(1, -1)}
        </code>
      );
    }
    return <React.Fragment key={idx}>{part}</React.Fragment>;
  });
}

function renderFormattedMarkdown(text: string): React.ReactNode {
  const lines = text.split('\n');
  const blocks: React.ReactNode[] = [];
  let listItems: React.ReactNode[] = [];

  const flushList = (keyPrefix: number) => {
    if (listItems.length > 0) {
      blocks.push(
        <ul key={`ul-${keyPrefix}`} className="reproduction-list">
          {listItems}
        </ul>
      );
      listItems = [];
    }
  };

  lines.forEach((line, index) => {
    const bulletMatch = line.match(/^\s*[-•*]\s+(.*)$/);
    if (bulletMatch) {
      listItems.push(<li key={`li-${index}`}>{renderInlineMarkdown(bulletMatch[1])}</li>);
      return;
    }

    flushList(index);
    if (line.trim() === '') {
      blocks.push(<br key={`br-${index}`} />);
    } else {
      blocks.push(
        <p key={`p-${index}`} className="description-text">
          {renderInlineMarkdown(line)}
        </p>
      );
    }
  });

  flushList(lines.length);
  return blocks;
}

export interface IssueDetailModalProps {
  issueId: number | null;
  onClose: () => void;
  onIssueUpdated?: (updatedIssue: IssueDto) => void;
  isAdmin?: boolean;
}

export const IssueDetailModal: React.FC<IssueDetailModalProps> = ({
  issueId,
  onClose,
  onIssueUpdated,
  isAdmin = false,
}) => {
  const [issue, setIssue] = useState<IssueDto | null>(null);
  const [comments, setComments] = useState<CommentDto[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [commentsLoading, setCommentsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchIssueData = useCallback(async (id: number) => {
    try {
      setLoading(true);
      setError(null);
      const data = await issueService.getIssueById(id);
      setIssue(data);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Impossibile caricare i dettagli della issue');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchComments = useCallback(async (id: number) => {
    try {
      setCommentsLoading(true);
      const commentsData = await commentService.getCommentsByIssue(id);
      setComments(commentsData);
    } catch {
      // Tolleranza errore sui commenti per non bloccare la vista dell'issue
    } finally {
      setCommentsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (issueId !== null) {
      fetchIssueData(issueId);
      fetchComments(issueId);
    } else {
      setIssue(null);
      setComments([]);
    }
  }, [issueId, fetchIssueData, fetchComments]);

  if (issueId === null) return null;

  const handleTagsChange = (newTags: string[]) => {
    if (!issue) return;
    const updated = { ...issue, tags: newTags };
    setIssue(updated);
    if (onIssueUpdated) onIssueUpdated(updated);
  };

  const handleStateChange = async (newState: IssueState) => {
    if (!issue) return;
    try {
      const updated = await issueService.updateIssueState(issue.id, newState);
      setIssue(updated);
      if (onIssueUpdated) onIssueUpdated(updated);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Errore nel cambio stato');
    }
  };

  const handleAddComment = async (text: string) => {
    if (!issue) return;
    const newComment = await commentService.addComment(issue.id, text);
    setComments((prev) => [...prev, newComment]);
  };

  return (
    <div className="issue-detail-overlay" onClick={onClose}>
      <main className="issue-detail-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <header className="issue-detail-header">
          <div className="header-top-row">
            <div className="header-info-col">
              <div className="badges-row">
                <span className={`issue-type-badge type-${issue?.type?.toLowerCase() || 'bug'}`}>
                  {issue?.type || 'BUG'}
                </span>
                <span className="badge-state-pill">
                  {issue?.state || 'TODO'}
                </span>
                {issue?.isUrgent && (
                  <span className="badge-urgent-flag">
                    <span className="material-symbols-outlined" style={{ fontSize: '13px' }}>warning</span>
                    URGENTE
                  </span>
                )}
                <span className="issue-code-tag">BB-{issue?.id}</span>
              </div>
              <h1 className="issue-main-title">
                {loading ? 'Caricamento issue...' : issue?.title}
              </h1>
            </div>

            <button type="button" className="close-action-button" onClick={onClose} aria-label="Chiudi modale">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
        </header>

        {/* Content Body */}
        <div className="issue-detail-body">
          {error ? (
            <div style={{ color: '#f87171', padding: '20px', textAlign: 'center' }}>{error}</div>
          ) : loading || !issue ? (
            <div style={{ padding: '30px', textAlign: 'center', color: '#94a3b8' }}>
              Caricamento dettagli issue in corso...
            </div>
          ) : (
            <>
              {/* Metadati / Assegnatari */}
              <div className="issue-meta-summary-bar">
                <div className="meta-member-item">
                  <span className="meta-label">Segnalato da:</span>
                  <span className="meta-value">{issue.reporterFullName || issue.reporterEmail || 'Utente'}</span>
                </div>
                <div className="meta-member-item">
                  <span className="meta-label">Assegnato a:</span>
                  <span className="meta-value">
                    {issue.assigneeFullName || issue.assigneeEmail || 'Non ancora assegnata'}
                  </span>
                </div>
                <div className="meta-member-item">
                  <span className="meta-label">Data:</span>
                  <span className="meta-value">
                    {new Date(issue.creationDate).toLocaleDateString('it-IT')}
                  </span>
                </div>
              </div>

              {/* Descrizione */}
              <section className="issue-description-box">
                <h3 className="section-label">Descrizione</h3>
                {issue.description?.trim() ? (
                  renderFormattedMarkdown(issue.description)
                ) : (
                  <p className="description-text">Nessuna descrizione fornita.</p>
                )}
              </section>

              {/* Workflow Actions */}
              <section className="issue-workflow-bar">
                <span className="section-label">Avanzamento Stato:</span>
                <div className="workflow-buttons-group">
                  {issue.state === 'TODO' && (
                    <button
                      type="button"
                      className="btn-state-action"
                      onClick={() => handleStateChange('IN_PROGRESS')}
                    >
                      Avvia Lavorazione
                    </button>
                  )}
                  {issue.state === 'IN_PROGRESS' && (
                    <button
                      type="button"
                      className="btn-state-action"
                      onClick={() => handleStateChange('REVIEW')}
                    >
                      Invia in Review
                    </button>
                  )}
                  {isAdmin && (issue.state === 'REVIEW' || issue.state === 'IN_REVIEW') && (
                    <>
                      <button
                        type="button"
                        className="btn-state-action approve"
                        onClick={() => handleStateChange('DONE')}
                      >
                        Approva (Done)
                      </button>
                      <button
                        type="button"
                        className="btn-state-action reject"
                        onClick={() => handleStateChange('IN_PROGRESS')}
                      >
                        Richiedi Modifiche
                      </button>
                    </>
                  )}
                </div>
              </section>

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
                    <span>Commenti & Discussione ({comments.length})</span>
                  </div>
                  <button
                    type="button"
                    className="refresh-feed-btn"
                    onClick={() => fetchComments(issue.id)}
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
      </main>
    </div>
  );
};

