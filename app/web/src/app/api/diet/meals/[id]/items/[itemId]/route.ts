import { NextResponse } from 'next/server';

import {
  invalidApiResponse,
  unauthenticatedResponse,
  unreachableApiResponse,
  upstreamErrorResponse,
} from '@/app/api/_lib/api-error';
import { backendApiUrl, getAuthedToken } from '@/app/api/_lib/auth';
import { invalidIdResponse, isValidResourceId } from '@/app/api/_lib/params';
import { mapFoodItemToVm, type DietFoodItemRecord } from '@/utils/diet-mapper';

type RouteContext = { params: Promise<{ id: string; itemId: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  const { token } = await getAuthedToken();
  if (!token) {
    return unauthenticatedResponse();
  }

  const { id: mealId, itemId } = await context.params;
  if (!isValidResourceId(mealId) || !isValidResourceId(itemId)) {
    return invalidIdResponse();
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const totalGrams = Number(body.totalGrams);
  if (!Number.isFinite(totalGrams) || totalGrams <= 0) {
    return NextResponse.json({ error: 'Invalid grams' }, { status: 400 });
  }

  let res: Response;
  try {
    res = await fetch(
      `${backendApiUrl}/diet/${encodeURIComponent(mealId)}/items/${encodeURIComponent(itemId)}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ totalGrams }),
        cache: 'no-store',
      },
    );
  } catch {
    return unreachableApiResponse();
  }

  const text = await res.text();
  if (!res.ok) {
    return upstreamErrorResponse(text, res.status, 'Failed to update item');
  }

  try {
    const item = JSON.parse(text) as DietFoodItemRecord;
    return NextResponse.json({ item: mapFoodItemToVm({ ...item, mealId }) });
  } catch {
    return invalidApiResponse();
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { token } = await getAuthedToken();
  if (!token) {
    return unauthenticatedResponse();
  }

  const { id: mealId, itemId } = await context.params;
  if (!isValidResourceId(mealId) || !isValidResourceId(itemId)) {
    return invalidIdResponse();
  }

  let res: Response;
  try {
    res = await fetch(
      `${backendApiUrl}/diet/${encodeURIComponent(mealId)}/items/${encodeURIComponent(itemId)}`,
      {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
      },
    );
  } catch {
    return unreachableApiResponse();
  }

  if (!res.ok) {
    const text = await res.text();
    return upstreamErrorResponse(text, res.status, 'Failed to delete item');
  }

  return NextResponse.json({ ok: true });
}
