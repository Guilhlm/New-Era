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
  const { token } = await getAuthedToken();
  if (!token) {
    return unauthenticatedResponse();
  }

  const { id: mealId } = await context.params;
  if (!isValidResourceId(mealId)) {
    return invalidIdResponse();
  }

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
    res = await fetch(`${backendApiUrl}/diet/${encodeURIComponent(mealId)}/items`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
      cache: 'no-store',
    });
  } catch {
    return unreachableApiResponse();
  }

  const text = await res.text();
  if (!res.ok) {
    return upstreamErrorResponse(text, res.status, 'Failed to create item');
  }

  try {
    const item = JSON.parse(text) as DietFoodItemRecord;
    return NextResponse.json({ item: mapFoodItemToVm({ ...item, mealId }) });
  } catch {
    return invalidApiResponse();
  }
}
