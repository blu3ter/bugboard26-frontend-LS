import type { LoginRequestDto, LoginResponseDto } from '../types';
import { validateLoginCredentials } from '../controller/authController';

/**
 * Service Layer
 * 
 * Gestisce la logica applicativa, l'orchestrazione dei flussi di lavoro (workflow),
 * la comunicazione HTTP con le API backend e la persistenza della sessione.
 */

const API_BASE_URL = 'http://localhost:8080';
const TOKEN_KEY = 'bugboard_token';
const USER_KEY = 'bugboard_user';

export class AuthService {
  /**
   * Chiamata di rete verso l'endpoint di login del backend
   */
  public async loginApi(credentials: LoginRequestDto): Promise<LoginResponseDto> {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'Email o password non corretti');
    }

    const data: LoginResponseDto = await response.json();
    return data;
  }

  /**
   * Salva la sessione di autenticazione nel browser
   */
  public saveSession(data: LoginResponseDto): void {
    sessionStorage.setItem(TOKEN_KEY, data.token);
    sessionStorage.setItem(
      USER_KEY,
      JSON.stringify({
        email: data.email,
        name: data.name,
        role: data.role,
      })
    );
  }

  /**
   * Recupera il token di autenticazione corrente
   */
  public getToken(): string | null {
    return sessionStorage.getItem(TOKEN_KEY);
  }

  /**
   * Recupera i dati dell'utente autenticato
   */
  public getUser(): { email: string; name: string; role: string } | null {
    const userJson = sessionStorage.getItem(USER_KEY);
    if (!userJson) return null;
    try {
      return JSON.parse(userJson);
    } catch {
      return null;
    }
  }

  /**
   * Rimuove i dati di sessione (logout)
   */
  public clearSession(): void {
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
  }

  /**
   * Orchestrazione del flusso completo di login:
   * 1. Validazione tramite regole di business del Controller Layer
   * 2. Esecuzione della chiamata API verso il backend
   * 3. Persistenza della sessione
   */
  public async executeLoginWorkflow(credentials: LoginRequestDto): Promise<LoginResponseDto> {
    // 1. Validazione regole di business
    const validation = validateLoginCredentials(credentials);
    if (!validation.isValid) {
      const firstError = Object.values(validation.errors)[0];
      throw new Error(firstError || 'Credenziali non valide');
    }

    // 2. Chiamata API
    const responseData = await this.loginApi(credentials);

    // 3. Persistenza sessione
    this.saveSession(responseData);

    return responseData;
  }
}

export const authService = new AuthService();
