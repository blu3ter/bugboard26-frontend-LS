import { API_BASE_URL, getAuthHeaders } from './apiConfig';
import type { IssueDto, IssueCreateDto, IssueAssignDto, IssueState } from '../types';

/**
 * Service per la gestione delle Issue (CRUD, Workflow State, Assegnazioni)
 * Completamente sincronizzato con gli endpoint REST di IssueController.java
 */
export class IssueService {
  /**
   * Recupera tutte le issue registrate a sistema
   */
  public async getAllIssues(): Promise<IssueDto[]> {
    const response = await fetch(`${API_BASE_URL}/issues`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Errore nel caricamento delle issue');
    return response.json();
  }

  /**
   * Recupera le issue assegnate all'utente autenticato (GET /issues/me)
   */
  public async getMyIssues(): Promise<IssueDto[]> {
    const response = await fetch(`${API_BASE_URL}/issues/me`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Errore nel caricamento delle tue issue');
    return response.json();
  }

  /**
   * Recupera il dettaglio completo di una singola issue tramite ID
   */
  public async getIssueById(id: number): Promise<IssueDto> {
    const response = await fetch(`${API_BASE_URL}/issues/${id}`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Impossibile caricare il dettaglio della issue');
    return response.json();
  }

  /**
   * Creazione di una nuova issue con supporto opzionale ad allegati immagine.
   * Multipart con parti 'data' (JSON) e 'image' (MultipartFile) per Spring Boot @RequestPart.
   */
  public async createIssue(issueData: IssueCreateDto, imageFile?: File | null): Promise<IssueDto> {
    const formData = new FormData();
    formData.append(
      'data',
      new Blob([JSON.stringify(issueData)], { type: 'application/json' })
    );

    if (imageFile) {
      formData.append('image', imageFile);
    }

    const response = await fetch(`${API_BASE_URL}/issues`, {
      method: 'POST',
      headers: getAuthHeaders(false),
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'Errore durante la creazione della issue');
    }

    return response.json();
  }

  /**
   * Assegna o riassegna una issue a un utente membro del team (Admin)
   * POST /issues/{id}/assign
   */
  public async assignIssue(issueId: number, assigneeId: number): Promise<IssueDto> {
    const payload: IssueAssignDto = { assigneeId };
    const response = await fetch(`${API_BASE_URL}/issues/${issueId}/assign`, {
      method: 'POST',
      headers: getAuthHeaders(true),
      body: JSON.stringify(payload),
    });

    if (!response.ok) throw new Error("Errore durante l'assegnazione della issue");
    return response.json();
  }

  /**
   * Manda la issue in revisione (POST /issues/{id}/review)
   */
  public async sendToReview(issueId: number): Promise<IssueDto> {
    const response = await fetch(`${API_BASE_URL}/issues/${issueId}/review`, {
      method: 'POST',
      headers: getAuthHeaders(true),
    });
    if (!response.ok) throw new Error('Errore durante l\'invio in revisione');
    return response.json();
  }

  /**
   * Rimanda la issue in lavorazione (POST /issues/{id}/send-back)
   */
  public async sendBackToProgress(issueId: number): Promise<IssueDto> {
    const response = await fetch(`${API_BASE_URL}/issues/${issueId}/send-back`, {
      method: 'POST',
      headers: getAuthHeaders(true),
    });
    if (!response.ok) throw new Error('Errore durante il rinvio in lavorazione');
    return response.json();
  }

  /**
   * Chiude la issue approvandola (POST /issues/{id}/close)
   */
  public async closeIssue(issueId: number): Promise<IssueDto> {
    const response = await fetch(`${API_BASE_URL}/issues/${issueId}/close`, {
      method: 'POST',
      headers: getAuthHeaders(true),
    });
    if (!response.ok) throw new Error('Errore durante la chiusura della issue');
    return response.json();
  }

  /**
   * Aggiorna lo stato di avanzamento del workflow orchestrando gli endpoint dedicati
   */
  public async updateIssueState(issueId: number, newState: IssueState): Promise<IssueDto> {
    const normalized = newState.toUpperCase();
    if (normalized === 'REVIEW' || normalized === 'IN_REVIEW') {
      return this.sendToReview(issueId);
    }
    if (normalized === 'IN_PROGRESS') {
      return this.sendBackToProgress(issueId);
    }
    if (normalized === 'DONE' || normalized === 'CLOSED') {
      return this.closeIssue(issueId);
    }
    throw new Error(`Transizione verso lo stato ${newState} non supportata.`);
  }

  /**
   * Recupera le issue in stato di revisione filtrando per lo stato IN_REVIEW
   */
  public async getReviewIssues(): Promise<IssueDto[]> {
    const all = await this.getAllIssues();
    return all.filter((i) => i.state === 'IN_REVIEW' || i.state === 'REVIEW');
  }
}

export const issueService = new IssueService();
