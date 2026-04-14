import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

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
  'themePreference',
] as const;

export async function PATCH(request: Request) {
  const token = (await cookies()).get('auth_token')?.value;
  if (!token) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
  }

  const meRes = await fetch(`${API}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });

  if (!meRes.ok) {
    return NextResponse.json({ error: 'Sessão inválida' }, { status: 401 });
  }

  const me = (await meRes.json()) as { id?: string };
  if (!me?.id) {
    return NextResponse.json({ error: 'Usuário inválido' }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 });
  }

  const payload: Record<string, unknown> = {};
  for (const key of ALLOWED) {
    const v = body[key];
    if (v === undefined || v === '') continue;
    if (key === 'password' && typeof v === 'string' && v.trim().length === 0) continue;
    payload[key] = v;
  }

  if (Object.keys(payload).length === 0) {
    return NextResponse.json({ error: 'Nada para atualizar' }, { status: 400 });
  }

  const res = await fetch(`${API}/users/${me.id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const text = await res.text();
  if (!res.ok) {
    let message = text || 'Falha ao atualizar';
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
    const updated = JSON.parse(text) as Record<string, unknown> & {
      passwordHash?: string;
    };
    delete updated.passwordHash;
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: 'Resposta inválida da API' }, { status: 502 });
  }
}
