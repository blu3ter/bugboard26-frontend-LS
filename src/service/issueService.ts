import { API_BASE_URL, getAuthHeaders } from './apiConfig';
import type { IssueDto, IssueCreateDto, IssueAssignDto, IssueState } from '../types';

/**
 * Service per la gestione delle Issue (CRUD, Workflow State, Assegnazioni)
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
   * Recupera le issue assegnate all'utente autenticato
   */
  public async getMyIssues(): Promise<IssueDto[]> {
    const response = await fetch(`${API_BASE_URL}/issues/my`, {
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
   * Utilizza FormData con Blob JSON per compatibilità con Spring Boot @RequestPart("issue").
   */
  public async createIssue(issueData: IssueCreateDto, imageFile?: File | null): Promise<IssueDto> {
    const formData = new FormData();
    formData.append(
      'issue',
      new Blob([JSON.stringify(issueData)], { type: 'application/json' })
    );

    if (imageFile) {
      formData.append('file', imageFile);
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
   */
  public async assignIssue(issueId: number, assigneeId: number): Promise<IssueDto> {
    const payload: IssueAssignDto = { assigneeId };
    const response = await fetch(`${API_BASE_URL}/issues/${issueId}/assign`, {
      method: 'PATCH',
      headers: getAuthHeaders(true),
      body: JSON.stringify(payload),
    });

    if (!response.ok) throw new Error("Errore durante l'assegnazione della issue");
    return response.json();
  }

  /**
   * Aggiorna lo stato di avanzamento del workflow di una issue (TODO, IN_PROGRESS, REVIEW, DONE)
   */
  public async updateIssueState(issueId: number, newState: IssueState): Promise<IssueDto> {
    const response = await fetch(`${API_BASE_URL}/issues/${issueId}/state`, {
      method: 'PATCH',
      headers: getAuthHeaders(true),
      body: JSON.stringify({ state: newState }),
    });

    if (!response.ok) throw new Error("Errore durante l'aggiornamento dello stato");
    return response.json();
  }

  /**
   * Recupera le issue in stato di revisione (REVIEW)
   */
  public async getReviewIssues(): Promise<IssueDto[]> {
    const response = await fetch(`${API_BASE_URL}/issues?state=REVIEW`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Errore nel recupero delle issue in revisione');
    return response.json();
  }
}

export const issueService = new IssueService();

