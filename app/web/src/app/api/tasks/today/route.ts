import { NextResponse } from 'next/server';

import {
  invalidApiResponse,
  unauthenticatedResponse,
  unreachableApiResponse,
  upstreamErrorResponse,
} from '@/app/api/_lib/api-error';
import { backendApiUrl, getAuthedToken } from '@/app/api/_lib/auth';
import {
  mapTasksToHomeVm,
  mapTasksToVm,
  type DailyTaskRecord,
  type TaskDisciplineRecord,
} from '@/utils/task-mapper';

export async function GET() {
  const { token } = await getAuthedToken();
  if (!token) {
    return unauthenticatedResponse();
  }

  let res: Response;
  try {
    res = await fetch(`${backendApiUrl}/tasks/today`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });
  } catch {
    return unreachableApiResponse();
  }

  const text = await res.text();
  if (!res.ok) {
    return upstreamErrorResponse(text, res.status, 'Failed to load today tasks');
  }

  try {
    const parsed = JSON.parse(text) as {
      weekday: number;
      tasks: DailyTaskRecord[];
      discipline: TaskDisciplineRecord;
      dietDiscipline: TaskDisciplineRecord;
    };
    return NextResponse.json({
      weekday: parsed.weekday,
      tasks: mapTasksToVm(parsed.tasks),
      homeTasks: mapTasksToHomeVm(parsed.tasks),
      discipline: parsed.discipline,
      dietDiscipline: parsed.dietDiscipline,
    });
  } catch {
    return invalidApiResponse();
  }
}
