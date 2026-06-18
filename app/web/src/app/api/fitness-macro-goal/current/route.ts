import { NextResponse } from 'next/server';

import {
  invalidApiResponse,
  unauthenticatedResponse,
  unreachableApiResponse,
  upstreamErrorResponse,
} from '@/app/api/_lib/api-error';
import { backendApiUrl, getAuthedToken } from '@/app/api/_lib/auth';

type FitnessMacroGoal = {
  id: string;
  userId: string;
  weightGoal?: string | number | null;
  calories?: number | null;
  updatedAt?: string;
};

function toOptionalNumber(value: unknown): number | null | undefined {
  if (value === undefined) return undefined;
  if (value === null || value === '') return null;
  const n = typeof value === 'number' ? value : Number(String(value).replace(',', '.'));
  return Number.isFinite(n) ? n : undefined;
}

function toOptionalInt(value: unknown): number | null | undefined {
  const n = toOptionalNumber(value);
  if (n === undefined) return undefined;
  if (n === null) return null;
  return Math.trunc(n);
}

function pickGoalPatch(body: Record<string, unknown>) {
  const payload: Record<string, unknown> = {};
  if ('weightGoal' in body) {
    const weightGoal = toOptionalNumber(body.weightGoal);
    if (weightGoal !== undefined) payload.weightGoal = weightGoal;
  }
  if ('calories' in body) {
    const calories = toOptionalInt(body.calories);
    if (calories !== undefined) payload.calories = calories;
  }
  return payload;
}

async function fetchCurrentGoal(token: string) {
  let res: Response;
  try {
    res = await fetch(`${backendApiUrl}/fitness-macro-goals/current`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });
  } catch {
    return { ok: false as const, unreachable: true as const, status: 503, text: '' };
  }

  const text = await res.text();
  return { ok: res.ok, unreachable: false as const, status: res.status, text };
}

export async function GET() {
  const { token } = await getAuthedToken();
  if (!token) {
    return unauthenticatedResponse();
  }

  const result = await fetchCurrentGoal(token);
  if (!result.ok) {
    if (result.unreachable) {
      return unreachableApiResponse();
    }
    return upstreamErrorResponse(result.text, result.status, 'Failed to load goals');
  }

  if (!result.text || result.text === 'null') {
    return NextResponse.json({ goal: null });
  }

  try {
    const goal = JSON.parse(result.text) as FitnessMacroGoal | null;
    return NextResponse.json({ goal: goal ?? null });
  } catch {
    return invalidApiResponse();
  }
}

export async function PATCH(request: Request) {
  const { token } = await getAuthedToken();
  if (!token) {
    return unauthenticatedResponse();
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const updates = pickGoalPatch(body);
  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'Nothing to update' }, { status: 400 });
  }

  const currentResult = await fetchCurrentGoal(token);
  if (!currentResult.ok) {
    if (currentResult.unreachable) {
      return unreachableApiResponse();
    }
    return upstreamErrorResponse(currentResult.text, currentResult.status, 'Failed to load goals');
  }

  let latest: FitnessMacroGoal | null = null;
  if (currentResult.text && currentResult.text !== 'null') {
    try {
      latest = JSON.parse(currentResult.text) as FitnessMacroGoal;
    } catch {
      return invalidApiResponse();
    }
  }

  if (!latest?.id) {
    let createRes: Response;
    try {
      createRes = await fetch(`${backendApiUrl}/fitness-macro-goals`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      });
    } catch {
      return unreachableApiResponse();
    }

    const text = await createRes.text();
    if (!createRes.ok) {
      return upstreamErrorResponse(text, createRes.status, 'Failed to create goal');
    }

    try {
      const created = JSON.parse(text) as FitnessMacroGoal;
      return NextResponse.json({ goal: created });
    } catch {
      return invalidApiResponse();
    }
  }

  let patchRes: Response;
  try {
    patchRes = await fetch(
      `${backendApiUrl}/fitness-macro-goals/${encodeURIComponent(latest.id)}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      },
    );
  } catch {
    return unreachableApiResponse();
  }

  const text = await patchRes.text();
  if (!patchRes.ok) {
    return upstreamErrorResponse(text, patchRes.status, 'Failed to update goal');
  }

  try {
    const updated = JSON.parse(text) as FitnessMacroGoal;
    return NextResponse.json({ goal: updated });
  } catch {
    return invalidApiResponse();
  }
}
