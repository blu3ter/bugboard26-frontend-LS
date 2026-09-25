import type { LoginRequestDto } from '../types';

/**
 * Controller Layer (Domain / Business Rules & Use Cases)
 * 
 * Contiene logica pura, indipendente da React e da servizi esterni.
 * Definisce regole di validazione, trasformazioni di entità e casi d'uso di business.
 */

export interface ValidationResult {
  isValid: boolean;
  errors: {
    email?: string;
    password?: string;
  };
}

/**
 * Valida il formato dell'email secondo le regole di business
 */
export const validateEmail = (email: string): string | null => {
  if (!email || email.trim() === '') {
    return 'L\'email o username è obbligatoria.';
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return 'Inserisci un indirizzo email valido.';
  }
  return null;
};

/**
 * Valida la password secondo le regole di business
 */
export const validatePassword = (password: string): string | null => {
  if (!password || password.trim() === '') {
    return 'La password è obbligatoria.';
  }
  if (password.length < 4) {
    return 'La password deve contenere almeno 4 caratteri.';
  }
  return null;
};

/**
 * Valida le credenziali fornite per il login
 */
export const validateLoginCredentials = (credentials: LoginRequestDto): ValidationResult => {
  const emailError = validateEmail(credentials.email);
  const passwordError = validatePassword(credentials.password);

  const errors: ValidationResult['errors'] = {};
  if (emailError) errors.email = emailError;
  if (passwordError) errors.password = passwordError;

  return {
    isValid: !emailError && !passwordError,
    errors,
  };
};

/**
 * Costruisce il messaggio di benvenuto formattato per l'utente autenticato
 */
export const formatWelcomeMessage = (user: { name?: string; email: string }): string => {
  const displayName = user.name && user.name.trim() !== '' ? user.name : user.email;
  return `Benvenuto ${displayName}!`;
};
