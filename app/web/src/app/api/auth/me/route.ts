import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

import {
  invalidApiResponse,
  unauthenticatedResponse,
  unreachableApiResponse,
  upstreamErrorResponse,
} from '@/app/api/_lib/api-error';
import { appConfig } from '@/config';

const API = appConfig.apiUrl.replace(/\/$/, '');

export async function GET() {
  const token = (await cookies()).get('auth_token')?.value;
  if (!token) {
    return unauthenticatedResponse();
  }

  let res: Response;
  try {
    res = await fetch(`${API}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });
  } catch {
    return unreachableApiResponse();
  }

  const text = await res.text();
  if (!res.ok) {
    return upstreamErrorResponse(text, res.status, 'Failed to load profile');
  }

  try {
    const data = JSON.parse(text) as unknown;
    return NextResponse.json(data);
  } catch {
    return invalidApiResponse();
  }
}
