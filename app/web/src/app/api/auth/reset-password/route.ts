import { NextResponse } from 'next/server';

import {
  unreachableApiResponse,
  upstreamErrorResponse,
} from '@/app/api/_lib/api-error';
import { appConfig } from '@/config';

const API = appConfig.apiUrl.replace(/\/$/, '');

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const payload = {
    email: typeof body.email === 'string' ? body.email : '',
    cpf: typeof body.cpf === 'string' ? body.cpf : '',
    newPassword: typeof body.newPassword === 'string' ? body.newPassword : '',
  };

  let res: Response;
  try {
    res = await fetch(`${API}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      cache: 'no-store',
    });
  } catch {
    return unreachableApiResponse();
  }

  const text = await res.text();
  if (!res.ok) {
    return upstreamErrorResponse(text, res.status, 'Could not reset password');
  }

  return NextResponse.json({ ok: true });
}
