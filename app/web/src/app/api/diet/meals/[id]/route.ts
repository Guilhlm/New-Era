import { NextResponse } from 'next/server';

import {
  invalidApiResponse,
  unauthenticatedResponse,
  unreachableApiResponse,
  upstreamErrorResponse,
} from '@/app/api/_lib/api-error';
import { backendApiUrl, getAuthedToken } from '@/app/api/_lib/auth';
import { invalidIdResponse, isValidResourceId } from '@/app/api/_lib/params';
import { mapMealToVm, type DietMealRecord } from '@/utils/diet-mapper';

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  const { token } = await getAuthedToken();
  if (!token) {
    return unauthenticatedResponse();
  }

  const { id } = await context.params;
  if (!isValidResourceId(id)) {
    return invalidIdResponse();
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const name = typeof body.name === 'string' ? body.name.trim() : '';
  if (!name) {
    return NextResponse.json({ error: 'Meal name is required' }, { status: 400 });
  }

  let res: Response;
  try {
    res = await fetch(`${backendApiUrl}/diet/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name }),
      cache: 'no-store',
    });
  } catch {
    return unreachableApiResponse();
  }

  const text = await res.text();
  if (!res.ok) {
    return upstreamErrorResponse(text, res.status, 'Failed to update meal');
  }

  try {
    return NextResponse.json({ meal: mapMealToVm(JSON.parse(text) as DietMealRecord) });
  } catch {
    return invalidApiResponse();
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { token } = await getAuthedToken();
  if (!token) {
    return unauthenticatedResponse();
  }

  const { id } = await context.params;
  if (!isValidResourceId(id)) {
    return invalidIdResponse();
  }

  let res: Response;
  try {
    res = await fetch(`${backendApiUrl}/diet/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });
  } catch {
    return unreachableApiResponse();
  }

  if (!res.ok) {
    const text = await res.text();
    return upstreamErrorResponse(text, res.status, 'Failed to delete meal');
  }

  return NextResponse.json({ ok: true });
}
