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

export async function POST(_request: Request, context: RouteContext) {
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
    res = await fetch(`${backendApiUrl}/diet/${encodeURIComponent(id)}/duplicate`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });
  } catch {
    return unreachableApiResponse();
  }

  const text = await res.text();
  if (!res.ok) {
    return upstreamErrorResponse(text, res.status, 'Failed to duplicate meal');
  }

  try {
    return NextResponse.json({ meal: mapMealToVm(JSON.parse(text) as DietMealRecord) });
  } catch {
    return invalidApiResponse();
  }
}
