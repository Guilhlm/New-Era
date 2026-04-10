import { NextResponse } from 'next/server';

import { appConfig } from '@/config';

const API = appConfig.apiUrl.replace(/\/$/, '');

export async function POST(request: Request) {
  const body = await request.json();
  const res = await fetch(`${API}/auth/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const text = await res.text();
  if (!res.ok) {
    let message = text || 'Could not reset password';
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
    const data = JSON.parse(text) as { ok?: boolean; newPassword?: string };
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: 'Invalid API response' }, { status: 502 });
  }
}
