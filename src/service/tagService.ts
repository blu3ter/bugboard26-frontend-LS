import { API_BASE_URL, getAuthHeaders } from './apiConfig';
import type { TagDto } from '../types';

/**
 * Service per la gestione delle etichette/tag (Req. 10)
 */
export class TagService {
  /**
   * Recupera la lista globale di tag disponibili a sistema
   */
  public async getAllTags(): Promise<TagDto[]> {
    const response = await fetch(`${API_BASE_URL}/tags`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      // Fallback a lista vuota per resilienza UI
      return [];
    }
    return response.json();
  }
}

export const tagService = new TagService();

