import { NextResponse } from 'next/server';

import { backendApiUrl, getAuthedUserId } from '@/app/api/_lib/auth';
import { mapFoodItemToVm, type DietFoodItemRecord } from '@/utils/diet-mapper';

type RouteContext = { params: Promise<{ id: string }> };

const ITEM_KEYS = [
  'name',
  'totalGrams',
  'externalSource',
  'externalFoodId',
  'caloriesPer100g',
  'proteinPer100g',
  'carbsPer100g',
  'fatsPer100g',
] as const;

function pickItemBody(body: Record<string, unknown>) {
  const payload: Record<string, unknown> = {};
  for (const key of ITEM_KEYS) {
    if (key in body) payload[key] = body[key];
  }
  return payload;
}

export async function POST(request: Request, context: RouteContext) {
  const { token } = await getAuthedUserId();
  if (!token) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const { id: mealId } = await context.params;
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const payload = pickItemBody(body);
  if (Object.keys(payload).length !== ITEM_KEYS.length) {
    return NextResponse.json({ error: 'Invalid food item payload' }, { status: 400 });
  }

  let res: Response;
  try {
    res = await fetch(`${backendApiUrl}/diet/${mealId}/items`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
      cache: 'no-store',
    });
  } catch {
    return NextResponse.json({ error: 'Unable to reach the API.' }, { status: 503 });
  }

  const text = await res.text();
  if (!res.ok) {
    return NextResponse.json({ error: text || 'Failed to create item' }, { status: res.status });
  }

  try {
    const item = JSON.parse(text) as DietFoodItemRecord;
    return NextResponse.json({ item: mapFoodItemToVm({ ...item, mealId }) });
  } catch {
    return NextResponse.json({ error: 'Invalid API response' }, { status: 502 });
  }
}
