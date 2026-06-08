import { postJson } from '@/services/http';

type AuthResult = { ok: true };

export type LoginInput = {
  identifier: string;
  password: string;
};

export type RegisterInput = {
  name: string;
  email: string;
  password: string;
  cpf: string;
};

export type ResetPasswordInput = {
  email: string;
  cpf: string;
  newPassword: string;
};

export function login(input: LoginInput) {
  return postJson<AuthResult, LoginInput>('/api/auth/login', input);
}

export function register(input: RegisterInput) {
  return postJson<AuthResult, RegisterInput>('/api/auth/register', input);
}

export function resetPassword(input: ResetPasswordInput) {
  return postJson<AuthResult, ResetPasswordInput>('/api/auth/reset-password', input);
}

export function logout() {
  return postJson<AuthResult, Record<string, never>>('/api/auth/logout', {});
}
