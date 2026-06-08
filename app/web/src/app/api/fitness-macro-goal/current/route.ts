import { NextResponse } from 'next/server';

import { backendApiUrl, getAuthedUserId } from '@/app/api/_lib/auth';

type FitnessMacroGoal = {
  id: string;
  userId: string;
  weightGoal?: string | number | null;
  calories?: number | null;
  updatedAt?: string;
};

const GOAL_PATCH_KEYS = ['weightGoal', 'calories'] as const;

function pickGoalPatch(body: Record<string, unknown>) {
  const payload: Record<string, unknown> = {};
  for (const key of GOAL_PATCH_KEYS) {
    if (key in body) payload[key] = body[key];
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
    return { ok: false as const, status: 503, text: 'Unable to reach the API.' };
  }

  const text = await res.text();
  return { ok: res.ok, status: res.status, text };
}

export async function GET() {
  const { token } = await getAuthedUserId();
  if (!token) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const result = await fetchCurrentGoal(token);
  if (!result.ok) {
    return NextResponse.json(
      { error: result.text || 'Failed to load goals' },
      { status: result.status },
    );
  }

  if (!result.text || result.text === 'null') {
    return NextResponse.json({ goal: null });
  }

  try {
    const goal = JSON.parse(result.text) as FitnessMacroGoal | null;
    return NextResponse.json({ goal: goal ?? null });
  } catch {
    return NextResponse.json({ error: 'Invalid API response' }, { status: 502 });
  }
}

export async function PATCH(request: Request) {
  const { token } = await getAuthedUserId();
  if (!token) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
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
    return NextResponse.json(
      { error: currentResult.text || 'Failed to load goals' },
      { status: currentResult.status },
    );
  }

  let latest: FitnessMacroGoal | null = null;
  if (currentResult.text && currentResult.text !== 'null') {
    try {
      latest = JSON.parse(currentResult.text) as FitnessMacroGoal;
    } catch {
      return NextResponse.json({ error: 'Invalid API response' }, { status: 502 });
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
      return NextResponse.json(
        { error: 'Unable to reach the API. Make sure the backend is running on port 6001.' },
        { status: 503 },
      );
    }

    const text = await createRes.text();
    if (!createRes.ok) {
      return NextResponse.json({ error: text || 'Failed to create goal' }, { status: createRes.status });
    }

    try {
      const created = JSON.parse(text) as FitnessMacroGoal;
      return NextResponse.json({ goal: created });
    } catch {
      return NextResponse.json({ error: 'Invalid API response' }, { status: 502 });
    }
  }

  let patchRes: Response;
  try {
    patchRes = await fetch(`${backendApiUrl}/fitness-macro-goals/${latest.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(updates),
    });
  } catch {
    return NextResponse.json(
      { error: 'Unable to reach the API. Make sure the backend is running on port 6001.' },
      { status: 503 },
    );
  }

  const text = await patchRes.text();
  if (!patchRes.ok) {
    return NextResponse.json({ error: text || 'Failed to update goal' }, { status: patchRes.status });
  }

  try {
    const updated = JSON.parse(text) as FitnessMacroGoal;
    return NextResponse.json({ goal: updated });
  } catch {
    return NextResponse.json({ error: 'Invalid API response' }, { status: 502 });
  }
}
