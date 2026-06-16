import { NextResponse } from 'next/server';

import {
  invalidApiResponse,
  unauthenticatedResponse,
  unreachableApiResponse,
  upstreamErrorResponse,
} from '@/app/api/_lib/api-error';
import { backendApiUrl, getAuthedToken } from '@/app/api/_lib/auth';

export async function proxyFinanceGet(path: string) {
  const { token } = await getAuthedToken();
  if (!token) {
    return unauthenticatedResponse();
  }

  let res: Response;
  try {
    res = await fetch(`${backendApiUrl}${path}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });
  } catch {
    return unreachableApiResponse();
  }

  const text = await res.text();
  if (!res.ok) {
    return upstreamErrorResponse(text, res.status, 'Finance request failed');
  }

  try {
    return NextResponse.json(text ? JSON.parse(text) : {});
  } catch {
    return invalidApiResponse();
  }
}

export async function proxyFinanceWrite(
  path: string,
  method: 'POST' | 'PATCH' | 'DELETE',
  body?: Record<string, unknown>,
) {
  const { token } = await getAuthedToken();
  if (!token) {
    return unauthenticatedResponse();
  }

  let res: Response;
  try {
    res = await fetch(`${backendApiUrl}${path}`, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        ...(body ? { 'Content-Type': 'application/json' } : {}),
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
      cache: 'no-store',
    });
  } catch {
    return unreachableApiResponse();
  }

  const text = await res.text();
  if (!res.ok) {
    return upstreamErrorResponse(text, res.status, 'Finance request failed');
  }

  if (method === 'DELETE') {
    return NextResponse.json(text ? JSON.parse(text) : { ok: true });
  }

  try {
    return NextResponse.json(text ? JSON.parse(text) : {});
  } catch {
    return invalidApiResponse();
  }
}
