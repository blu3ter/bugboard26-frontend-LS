import React from 'react';
import type { CommentDto } from '../../types';

export interface CommentItemProps {
  comment: CommentDto;
}

/**
 * Calcola le iniziali del nome dell'autore (es. "Mario Rossi" -> "MR")
 */
const getAuthorInitials = (firstName: string, lastName: string): string => {
  const f = firstName ? firstName.trim()[0] : '';
  const l = lastName ? lastName.trim()[0] : '';
  return `${f}${l}`.toUpperCase() || 'U';
};

/**
 * Formatta una data ISO 8601 in formato leggibile italiano
 */
const formatDate = (isoDate: string): string => {
  try {
    const date = new Date(isoDate);
    if (isNaN(date.getTime())) return isoDate;
    return date.toLocaleDateString('it-IT', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return isoDate;
  }
};

/**
 * Componente Atomico CommentItem (Req. 5)
 */
export const CommentItem: React.FC<CommentItemProps> = ({ comment }) => {
  const initials = getAuthorInitials(comment.authorName, comment.authorLastName);
  const fullName = `${comment.authorName || ''} ${comment.authorLastName || ''}`.trim() || 'Utente';

  return (
    <div className="comment-card-box">
      <div className="comment-avatar-bubble">
        {initials}
      </div>
      <div className="comment-body-col">
        <div className="comment-author-row">
          <div className="comment-author-badge">
            <span className="comment-user-name">{fullName}</span>
          </div>
          <span className="comment-timestamp">{formatDate(comment.creationDate)}</span>
        </div>
        <p className="comment-message-text">{comment.text}</p>
      </div>
    </div>
  );
};

