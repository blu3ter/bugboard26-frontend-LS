import React, { useState } from 'react';

export interface CommentFormProps {
  onSubmit: (text: string) => Promise<void>;
  disabled?: boolean;
}

const MAX_COMMENT_LENGTH = 2000;

/**
 * Componente Molecolare CommentForm (Req. 5)
 * Gestisce l'input controllato del nuovo commento e lo stato di invio.
 */
export const CommentForm: React.FC<CommentFormProps> = ({ onSubmit, disabled = false }) => {
  const [text, setText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || isSubmitting || disabled) return;

    try {
      setIsSubmitting(true);
      await onSubmit(text.trim());
      setText('');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="new-comment-editor" onSubmit={handleSubmit}>
      <div className="comment-form-header">
        <span className="comment-char-hint">
          Max {MAX_COMMENT_LENGTH} caratteri{' '}
          <span className={`comment-char-counter ${text.length >= MAX_COMMENT_LENGTH ? 'is-max' : ''}`}>
            ({text.length}/{MAX_COMMENT_LENGTH})
          </span>
        </span>
      </div>
      <textarea
        className="comment-input-textarea"
        placeholder="Scrivi un aggiornamento o commento su questa issue..."
        maxLength={MAX_COMMENT_LENGTH}
        value={text}
        onChange={(e) => setText(e.target.value)}
        disabled={isSubmitting || disabled}
        rows={3}
      />
      <div className="comment-form-footer">
        <button
          type="submit"
          className="btn-submit-comment"
          disabled={!text.trim() || isSubmitting || disabled}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>send</span>
          <span>{isSubmitting ? 'Invio in corso...' : 'Invia Commento'}</span>
        </button>
      </div>
    </form>
  );
};

