import React from 'react';
import type { CommentDto } from '../../types';
import { CommentItem } from './CommentItem';

export interface CommentListProps {
  comments: CommentDto[];
  loading?: boolean;
}

/**
 * Componente Molecolare CommentList (Req. 5)
 * Mostra l'elenco cronologico dei commenti o lo stato vuoto.
 */
export const CommentList: React.FC<CommentListProps> = ({ comments, loading = false }) => {
  if (loading) {
    return (
      <div className="comments-empty-state">
        <span className="material-symbols-outlined" style={{ animation: 'spin 1s linear infinite' }}>
          autorenew
        </span>
        <span>Caricamento commenti in corso...</span>
      </div>
    );
  }

  if (comments.length === 0) {
    return (
      <div className="comments-empty-state">
        <span className="material-symbols-outlined" style={{ fontSize: '28px', opacity: 0.6 }}>
          chat_bubble_outline
        </span>
        <span>Nessun commento presente per questa issue. Sii il primo a commentare!</span>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {comments.map((comment) => (
        <CommentItem key={comment.id} comment={comment} />
      ))}
    </div>
  );
};

