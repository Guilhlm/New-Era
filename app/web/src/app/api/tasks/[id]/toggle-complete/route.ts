import { NextResponse } from 'next/server';

import {
  invalidApiResponse,
  unauthenticatedResponse,
  unreachableApiResponse,
  upstreamErrorResponse,
} from '@/app/api/_lib/api-error';
import { backendApiUrl, getAuthedToken } from '@/app/api/_lib/auth';
import { invalidIdResponse, isValidResourceId } from '@/app/api/_lib/params';
import { mapTaskToVm, type DailyTaskRecord, type TaskDisciplineRecord } from '@/utils/task-mapper';

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
    res = await fetch(`${backendApiUrl}/tasks/${encodeURIComponent(id)}/toggle-complete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({}),
      cache: 'no-store',
    });
  } catch {
    return unreachableApiResponse();
  }

  const text = await res.text();
  if (!res.ok) {
    return upstreamErrorResponse(text, res.status, 'Failed to toggle task');
  }

  try {
    const parsed = JSON.parse(text) as {
      task: DailyTaskRecord;
      discipline: TaskDisciplineRecord;
      dietDiscipline: TaskDisciplineRecord;
    };
    return NextResponse.json({
      task: mapTaskToVm(parsed.task),
      discipline: parsed.discipline,
      dietDiscipline: parsed.dietDiscipline,
    });
  } catch {
    return invalidApiResponse();
  }
}
