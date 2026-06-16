import { cookies } from 'next/headers';

import { appConfig } from '@/config';

const API = appConfig.apiUrl.replace(/\/$/, '');

/** Reads the session cookie only — no upstream /auth/me round-trip. */
export async function getAuthedToken() {
  const token = (await cookies()).get('auth_token')?.value ?? null;
  return { token };
}

export async function getAuthedUserId() {
  const token = (await cookies()).get('auth_token')?.value;
  if (!token) return { token: null, userId: null };

  let meRes: Response;
  try {
    meRes = await fetch(`${API}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });
  } catch {
    return { token: null, userId: null };
  }

  if (!meRes.ok) return { token: null, userId: null };

  const me = (await meRes.json()) as { id?: string };
  return { token, userId: me?.id ?? null };
}

export { API as backendApiUrl };
