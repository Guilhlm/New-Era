import { getJson, patchJson } from '@/services/http';
import type { MeUser } from '@/types/profile';

export type UpdateProfileInput = {
  name?: string;
  email?: string;
  phone?: string | null;
  birthDate?: string | null;
  monthlyIncome?: number | null;
  password?: string;
  photoUser?: string;
  themePreference?: 'dark' | 'light';
};

export function getProfile() {
  return getJson<MeUser>('/api/auth/me');
}

export function updateProfile(input: UpdateProfileInput) {
  return patchJson<MeUser, UpdateProfileInput>('/api/user/profile', input);
}
