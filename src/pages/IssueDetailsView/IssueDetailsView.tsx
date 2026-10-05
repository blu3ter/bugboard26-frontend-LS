import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './IssueDetailsView.css';

interface Comment {
  id: string;
  author: string;
  role: string;
  timestamp: string;
  avatarText: string;
  avatarGradient?: string;
  content: string;
}

interface IssueTag {
  id: string;
  label: string;
  colorClass: string;
  removable: boolean;
}

export const IssueDetailsView: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  // State for tags
  const [tags, setTags] = useState<IssueTag[]>([
    { id: 'backend', label: '#backend', colorClass: 'tag-backend-color', removable: true },
    { id: 'security', label: '#security', colorClass: 'tag-security-color', removable: true },
    { id: 'database', label: '#database', colorClass: 'tag-database-color', removable: true },
    { id: 'urgent', label: '#urgent', colorClass: 'tag-urgent-color', removable: false },
  ]);

  // Comments state
  const [comments, setComments] = useState<Comment[]>([
    {
      id: 'c-1',
      author: 'Elena De Luca',
      role: 'DBA Lead',
      timestamp: '1 ora fa',
      avatarText: 'ED',
      content:
        "Ho controllato i log dell'RDS: c'è un lock prolungato sulla tabella `user_sessions` generato dalla migrazione `#20260928_idx`. Ho predisposto un hotfix per riavviare il pooling a 250 connessioni e rilasciare l'indice non bloccante.",
    },
  ]);

  const [newComment, setNewComment] = useState('');

  const handleClose = () => {
    navigate(-1);
  };

  const handleRemoveTag = (tagId: string) => {
    setTags((prev) => prev.filter((t) => t.id !== tagId));
  };

  const handleAddComment = () => {
    if (!newComment.trim()) return;
    const commentItem: Comment = {
      id: `c-${Date.now()}`,
      author: 'Tu (CurrentUser)',
      role: 'Dev',
      timestamp: 'Adesso',
      avatarText: 'ME',
      content: newComment.trim(),
    };
    setComments((prev) => [...prev, commentItem]);
    setNewComment('');
  };

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
        {/* Modal Header */}
        <header className="issue-detail-header" data-purpose="modal-header">
          <div className="header-top-row">
            <div className="header-info-col">
              {/* Brand and Status Badges */}
              <div className="badges-row">
                {/* Issue Type Badge (Bug) */}
                <span className="issue-type-badge type-bug">
                  <svg
                    className="issue-type-icon"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
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
                  <span>Bug</span>
                </span>

                <span className="badge-in-progress">
                  <span className="pulse-indicator"></span>
                  In Lavorazione
                </span>

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
              </div>

              {/* Title Row */}
              <h1 className="issue-title-heading">
                <span className="issue-key-code">{id || 'BB-1042'}</span>
                <span className="issue-dot-sep">·</span>
                <span>Database Connection Timeout</span>
              </h1>

              {/* Meta author & assignees */}
              <div className="issue-meta-row">
                <span>
                  Segnalato da <strong>Luca Verdi</strong> il 28 Set 2026
                </span>
                <span className="meta-sep">·</span>
                <span>
                  Assegnato ad <strong className="assignee-name">Alessandro Conti</strong>
                </span>
                <span className="meta-sep">·</span>
                <span className="on-call-badge">
                  <svg className="on-call-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  On-Call Alert Notificato
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
              <span className="section-hint">Formattato in Markdown</span>
            </div>

            <div className="description-card">
              <p>
                Durante il picco di traffico serale tra le 20:30 e le 21:00 UTC, i microservizi di autenticazione e billing riscontrano un blocco totale nella risoluzione delle query verso l'istanza primaria Postgres. I pod del cluster Kubernetes hanno iniziato a fallire i controlli di liveness probe.
              </p>

              {/* Monospace Error Snippet */}
              <div className="stacktrace-box">
                <div className="stacktrace-header">
                  <span>Stack trace catturato dal container:</span>
                  <span className="stacktrace-severity">Severity: Critical</span>
                </div>
                <div className="stacktrace-code-block">
                  <code>[ERROR] pg_pool_exhausted: timeout 5000ms exceeded in pool (max_connections: 120, active: 120, queued: 48) at Client.query (/srv/app/node_modules/pg-pool/index.js:312:11)</code>
                </div>
              </div>

              {/* Reproduction Steps */}
              <div className="reproduction-steps">
                <h3 className="reproduction-title">Passi per riprodurre il timeout:</h3>
                <ul className="reproduction-list">
                  <li>
                    Eseguire un test di carico concorrente con 150 sessioni attive su <code className="inline-code">/api/v2/auth/verify-session</code>.
                  </li>
                  <li>
                    Osservare il tempo di acquisizione dal pool di connessioni superare la soglia di guardia fissata a 5000ms.
                  </li>
                  <li>
                    I thread vanno in deadlock senza rilasciare il client a causa delle transazioni lasciate aperte nei fallback di rete.
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 2: Attachments */}
          <section data-purpose="issue-attachments">
            <div className="section-header-line">
              <h2 className="section-label">Allegati e Log Visivi</h2>
            </div>
            <div className="attachments-grid">
              <div className="attachment-card">
                <div className="attachment-icon-wrapper">
                  <svg className="attachment-file-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <div className="attachment-meta-info">
                  <p className="attachment-filename">auth_error_screenshot_v2.png</p>
                  <p className="attachment-size-time">1.4 MB · Caricato 2 ore fa</p>
                </div>
                <button type="button" className="btn-preview-attachment" title="Visualizza anteprima">
                  <svg className="preview-eye-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </button>
              </div>
            </div>
          </section>

          {/* Section 3: Tags / Etichette */}
          <section data-purpose="issue-tags">
            <div className="section-header-line">
              <h2 className="section-label">Etichette &amp; Ambito</h2>
            </div>
            <div className="tags-wrapper-box">
              {tags.map((tag) => (
                <span key={tag.id} className={`tag-item-pill ${tag.colorClass}`}>
                  {tag.label}
                  {tag.removable && (
                    <button
                      type="button"
                      className="btn-remove-tag"
                      aria-label={`Rimuovi tag ${tag.label}`}
                      onClick={() => handleRemoveTag(tag.id)}
                    >
                      <svg className="tag-close-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </span>
              ))}

              <button type="button" className="btn-add-tag-trigger">
                <svg className="add-tag-plus-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
                Aggiungi etichetta...
              </button>
            </div>
          </section>

          {/* Section 4: Comments Feed */}
          <section className="comments-section-container" data-purpose="issue-discussion">
            <div className="section-header-line">
              <h2 className="section-label">Attività &amp; Discussione ({comments.length})</h2>
              <button type="button" className="refresh-feed-btn">
                Aggiorna feed
              </button>
            </div>

            {/* Comments List */}
            {comments.map((comment) => (
              <div key={comment.id} className="comment-card-box">
                <div className="comment-avatar-bubble">{comment.avatarText}</div>
                <div className="comment-body-col">
                  <div className="comment-author-row">
                    <div className="comment-author-badge">
                      <span className="comment-user-name">{comment.author}</span>
                      <span className="comment-role-tag">{comment.role}</span>
                    </div>
                    <time className="comment-timestamp">{comment.timestamp}</time>
                  </div>
                  <p className="comment-message-text">{comment.content}</p>
                </div>
              </div>
            ))}

            {/* Add Comment Input Area */}
            <div className="new-comment-editor">
              <textarea
                className="comment-input-textarea"
                rows={2}
                placeholder="Scrivi una risposta tecnica o menziona un collaboratore (@nome)..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
              ></textarea>
              <div className="editor-bottom-bar">
                <div className="editor-formatting-tools">
                  <button type="button" className="btn-format-tool" title="Grassetto">
                    <strong>B</strong>
                  </button>
                  <button type="button" className="btn-format-tool" title="Corsivo">
                    <em>I</em>
                  </button>
                  <button type="button" className="btn-format-tool font-mono" title="Codice inline">
                    &lt;/&gt;
                  </button>
                </div>
                <button type="button" className="btn-submit-comment" onClick={handleAddComment}>
                  <svg className="send-comment-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                  Invia Commento
                </button>
              </div>
            </div>
          </section>
        </div>

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
            <button type="button" className="btn-footer-submit">
              <svg className="submit-check-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              Invia in Verifica
            </button>
          </div>
        </footer>
      </main>
    </div>
  );
};
