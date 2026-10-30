import { API_BASE_URL, getAuthHeaders } from './apiConfig';
import type { CommentDto, CreateCommentDto } from '../types';

/**
 * Service per la gestione dei commenti associati alle issue (Req. 5)
 */
export class CommentService {
  /**
   * Recupera la cronologia dei commenti per una determinata issue
   */
  public async getCommentsByIssue(issueId: number): Promise<CommentDto[]> {
    const response = await fetch(`${API_BASE_URL}/issues/${issueId}/comments`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Errore nel recupero dei commenti');
    return response.json();
  }

  /**
   * Invia un nuovo commento associato alla issue
   */
  public async addComment(issueId: number, text: string): Promise<CommentDto> {
    const payload: CreateCommentDto = { text: text.trim() };
    const response = await fetch(`${API_BASE_URL}/issues/${issueId}/comments`, {
      method: 'POST',
      headers: getAuthHeaders(true),
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || "Errore durante l'invio del commento");
    }

    return response.json();
  }
}

export const commentService = new CommentService();
