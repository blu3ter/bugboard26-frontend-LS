export interface LoginRequestDto {
  email: string;
  password: string;
  role?: string;
  name?: string;
}

export interface RegisterRequestDto {
  email: string;
  password: string;
  role?: string;
  firstName: string;
  lastName: string;
}
