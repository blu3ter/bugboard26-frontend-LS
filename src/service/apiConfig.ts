import { authService } from './authService';

export const API_BASE_URL = 'http://localhost:8080';

/**
 * Genera gli headers per le richieste HTTP autenticate tramite Bearer Token.
 * 
 * @param isJson Se true (default), aggiunge 'Content-Type': 'application/json'.
 *               Se false (es. Multipart/FormData), non imposta il Content-Type,
 *               consentendo al browser di impostare il boundary corretto in autonomia.
 */
export const getAuthHeaders = (isJson: boolean = true): HeadersInit => {
  const token = authService.getToken();
  const headers: Record<string, string> = {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  if (isJson) {
    headers['Content-Type'] = 'application/json';
  }

  return headers;
};
