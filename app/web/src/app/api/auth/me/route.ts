import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

import { appConfig } from '@/config';

const API = appConfig.apiUrl.replace(/\/$/, '');

export async function GET() {
  const token = (await cookies()).get('auth_token')?.value;
  if (!token) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  let res: Response;
  try {
    res = await fetch(`${API}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });
  } catch {
    return NextResponse.json(
      { error: 'Backend unavailable right now' },
      { status: 503 },
    );
  }

  const text = await res.text();
  if (!res.ok) {
    let message = text || 'Failed to load profile';
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

  try {
    const data = JSON.parse(text) as unknown;
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: 'Invalid API response' }, { status: 502 });
  }
}
