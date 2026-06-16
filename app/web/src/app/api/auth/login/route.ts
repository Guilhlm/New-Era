import { NextResponse } from 'next/server';

import {
  invalidApiResponse,
  unreachableApiResponse,
  upstreamErrorResponse,
} from '@/app/api/_lib/api-error';
import { appConfig } from '@/config';

const API = appConfig.apiUrl.replace(/\/$/, '');

export async function POST(request: Request) {
  const body = await request.json();
  let res: Response;
  try {
    res = await fetch(`${API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch {
    return unreachableApiResponse();
  }

  const text = await res.text();
  if (!res.ok) {
    return upstreamErrorResponse(text, res.status, 'Login failed');
  }

  let data: { accessToken?: string };
  try {
    data = JSON.parse(text) as { accessToken?: string };
  } catch {
    return invalidApiResponse();
  }

  if (!data.accessToken) {
    return NextResponse.json({ error: 'Missing token' }, { status: 502 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set('auth_token', data.accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });
  return response;
}
