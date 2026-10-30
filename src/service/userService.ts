import { API_BASE_URL, getAuthHeaders } from './apiConfig';
import type { UserSummaryDto } from '../types';

/**
 * Service per la gestione e recupero utenti per assegnazioni di issue
 */
export class UserService {
  /**
   * Recupera l'elenco dei membri/collaboratori per l'assegnazione
   */
  public async getAllUsers(): Promise<UserSummaryDto[]> {
    const response = await fetch(`${API_BASE_URL}/users`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Errore nel recupero degli utenti');
    return response.json();
  }
}

export const userService = new UserService();

