import { NextResponse } from 'next/server';

import { appConfig } from '@/config';

const API = appConfig.apiUrl.replace(/\/$/, '');

export async function POST(request: Request) {
  const body = await request.json();
  const res = await fetch(`${API}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const text = await res.text();
  if (!res.ok) {
    let message = text || 'Login failed';
    try {
      const j = JSON.parse(text) as { message?: string | string[] };
      if (j.message) {
        message = Array.isArray(j.message) ? j.message.join(', ') : j.message;
      }
    } catch {
      /* keep text */
    }
    return NextResponse.json({ error: message }, { status: res.status });
  }

  let data: { accessToken?: string };
  try {
    data = JSON.parse(text) as { accessToken?: string };
  } catch {
    return NextResponse.json({ error: 'Invalid API response' }, { status: 502 });
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
