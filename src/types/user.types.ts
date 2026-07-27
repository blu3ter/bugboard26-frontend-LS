export interface UserSummaryDto {
  id: number;
  firstName: string;
  lastName: string;
  role: string;
  /** Restituito automaticamente dal serializzatore JSON di SpringBoot grazie a getFullName() */
  fullName?: string;
}
