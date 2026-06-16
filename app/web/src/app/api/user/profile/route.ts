import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

import {
  invalidApiResponse,
  unauthenticatedResponse,
  upstreamErrorResponse,
} from '@/app/api/_lib/api-error';
import { appConfig } from '@/config';

const API = appConfig.apiUrl.replace(/\/$/, '');

const ALLOWED = [
  'name',
  'email',
  'phone',
  'birthDate',
  'monthlyIncome',
  'password',
  'photoUser',
] as const;

const PHOTO_DATA_URL_PATTERN = /^data:image\/(jpeg|jpg|png|webp|gif);base64,/;

/** Avatars may only be HTTPS URLs or base64 image data URLs. */
function isSafePhotoUser(value: unknown): value is string {
  if (typeof value !== 'string') return false;
  return value.startsWith('https://') || PHOTO_DATA_URL_PATTERN.test(value);
}

export async function PATCH(request: Request) {
  const token = (await cookies()).get('auth_token')?.value;
  if (!token) {
    return unauthenticatedResponse();
  }

  const meRes = await fetch(`${API}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });

  if (!meRes.ok) {
    return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
  }

  const me = (await meRes.json()) as { id?: string };
  if (!me?.id) {
    return NextResponse.json({ error: 'Invalid user' }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const payload: Record<string, unknown> = {};
  for (const key of ALLOWED) {
    const v = body[key];
    if (v === undefined || v === '') continue;
    if (key === 'password' && typeof v === 'string' && v.trim().length === 0) continue;
    if (key === 'photoUser' && !isSafePhotoUser(v)) {
      return NextResponse.json(
        { error: 'Avatar must be an HTTPS URL or an image data URL.' },
        { status: 400 },
      );
    }
    payload[key] = v;
  }

  if (Object.keys(payload).length === 0) {
    return NextResponse.json({ error: 'Nothing to update' }, { status: 400 });
  }

  const res = await fetch(`${API}/users/${encodeURIComponent(me.id)}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const text = await res.text();
  if (!res.ok) {
    return upstreamErrorResponse(text, res.status, 'Failed to update');
  }

  try {
    const updated = JSON.parse(text) as Record<string, unknown> & {
      passwordHash?: string;
    };
    delete updated.passwordHash;
    return NextResponse.json(updated);
  } catch {
    return invalidApiResponse();
  }
}
