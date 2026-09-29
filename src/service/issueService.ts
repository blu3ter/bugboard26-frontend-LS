import type { IssueDto } from '../types/issue.types';

const API_BASE_URL = 'http://localhost:8080';
const TOKEN_KEY = 'bugboard_token';

class IssueService {
  private getHeaders(): HeadersInit {
    const token = sessionStorage.getItem(TOKEN_KEY);
    return {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
  }

  public async getAllIssues(tag?: string): Promise<IssueDto[]> {
    const url = tag ? `${API_BASE_URL}/issues?tag=${encodeURIComponent(tag)}` : `${API_BASE_URL}/issues`;
    const response = await fetch(url, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Errore durante il recupero delle issues');
    }

    return await response.json();
  }

  public async getMyIssues(): Promise<IssueDto[]> {
    const response = await fetch(`${API_BASE_URL}/issues/me`, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Errore durante il recupero delle issues assegnate');
    }

    return await response.json();
  }
}

export const issueService = new IssueService();
