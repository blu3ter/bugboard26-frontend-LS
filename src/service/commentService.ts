import type { CommentDto, CreateCommentDto } from '../types/comment.types';

const API_BASE_URL = 'http://localhost:8080';
const TOKEN_KEY = 'bugboard_token';

class CommentService {
  private getHeaders(): HeadersInit {
    const token = sessionStorage.getItem(TOKEN_KEY);
    return {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
  }

  public async getComments(issueId: number | string): Promise<CommentDto[]> {
    const response = await fetch(`${API_BASE_URL}/issues/${issueId}/comments`, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      throw new Error(errorText || 'Failed to fetch comments');
    }

    return await response.json();
  }

  public async addComment(issueId: number | string, text: string): Promise<CommentDto> {
    const body: CreateCommentDto = { text };
    const response = await fetch(`${API_BASE_URL}/issues/${issueId}/comments`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      throw new Error(errorText || 'Failed to post comment');
    }

    return await response.json();
  }
}

export const commentService = new CommentService();

