import type { IssueAssignDto, IssueCreateDto, IssueDto } from '../types/issue.types';

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

  private async request<T>(path: string, options: RequestInit = {}, defaultError = 'Request failed'): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      throw new Error(errorText || defaultError);
    }

    return await response.json();
  }

  public async getAllIssues(tag?: string): Promise<IssueDto[]> {
    const path = tag ? `/issues?tag=${encodeURIComponent(tag)}` : '/issues';
    return this.request<IssueDto[]>(path, { method: 'GET' }, 'Failed to fetch issues');
  }

  public async getMyIssues(): Promise<IssueDto[]> {
    return this.request<IssueDto[]>('/issues/me', { method: 'GET' }, 'Failed to fetch assigned issues');
  }

  public async getIssueById(id: number | string): Promise<IssueDto> {
    return this.request<IssueDto>(`/issues/${id}`, { method: 'GET' }, 'Failed to fetch issue details');
  }

  public async assignIssue(id: number | string, assigneeId: number): Promise<IssueDto> {
    const body: IssueAssignDto = { assigneeId };
    return this.request<IssueDto>(
      `/issues/${id}/assign`,
      { method: 'POST', body: JSON.stringify(body) },
      'Failed to assign issue'
    );
  }

  public async sendToReview(id: number | string): Promise<IssueDto> {
    return this.request<IssueDto>(`/issues/${id}/review`, { method: 'POST' }, 'Failed to send issue to review');
  }

  public async sendBackToProgress(id: number | string): Promise<IssueDto> {
    return this.request<IssueDto>(`/issues/${id}/send-back`, { method: 'POST' }, 'Failed to send issue back to progress');
  }

  public async closeIssue(id: number | string): Promise<IssueDto> {
    return this.request<IssueDto>(`/issues/${id}/close`, { method: 'POST' }, 'Failed to close issue');
  }

  public async createIssue(dto: IssueCreateDto, image?: File): Promise<IssueDto> {
    const formData = new FormData();
    formData.append('data', new Blob([JSON.stringify(dto)], { type: 'application/json' }));
    if (image) {
      formData.append('image', image);
    }

    const token = sessionStorage.getItem(TOKEN_KEY);
    const response = await fetch(`${API_BASE_URL}/issues`, {
      method: 'POST',
      headers: token ? { 'Authorization': `Bearer ${token}` } : {},
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      throw new Error(errorText || 'Failed to create issue');
    }

    return await response.json();
  }
}

export const issueService = new IssueService();
