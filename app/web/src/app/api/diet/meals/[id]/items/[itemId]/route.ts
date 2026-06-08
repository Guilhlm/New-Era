import { NextResponse } from 'next/server';

import { backendApiUrl, getAuthedUserId } from '@/app/api/_lib/auth';
import { mapFoodItemToVm, type DietFoodItemRecord } from '@/utils/diet-mapper';

type RouteContext = { params: Promise<{ id: string; itemId: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  const { token } = await getAuthedUserId();
  if (!token) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const { id: mealId, itemId } = await context.params;
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
    res = await fetch(`${backendApiUrl}/diet/${mealId}/items/${itemId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ totalGrams }),
      cache: 'no-store',
    });
  } catch {
    return NextResponse.json({ error: 'Unable to reach the API.' }, { status: 503 });
  }

  const text = await res.text();
  if (!res.ok) {
    return NextResponse.json({ error: text || 'Failed to update item' }, { status: res.status });
  }

  try {
    const item = JSON.parse(text) as DietFoodItemRecord;
    return NextResponse.json({ item: mapFoodItemToVm({ ...item, mealId }) });
  } catch {
    return NextResponse.json({ error: 'Invalid API response' }, { status: 502 });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { token } = await getAuthedUserId();
  if (!token) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const { id: mealId, itemId } = await context.params;

  let res: Response;
  try {
    res = await fetch(`${backendApiUrl}/diet/${mealId}/items/${itemId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });
  } catch {
    return NextResponse.json({ error: 'Unable to reach the API.' }, { status: 503 });
  }

  if (!res.ok) {
    const text = await res.text();
    return NextResponse.json({ error: text || 'Failed to delete item' }, { status: res.status });
  }

  return NextResponse.json({ ok: true });
}
