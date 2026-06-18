import type { IconType } from 'react-icons';

export type FinanceGoalAccent = {
  color: string;
  barClassName: string;
};

export type FinanceGoalVm = {
  id: string;
  label: string;
  description: string;
  target: number;
  current: number;
  deadline: string;
  icon: IconType;
  accent: FinanceGoalAccent;
  isSystem?: boolean;
  isLocked?: boolean;
  activities?: FinanceGoalActivityVm[];
};

export type FinanceGoalSortKey = 'progress' | 'name' | 'deadline' | 'target';

export type FinanceGoalActivityVm = {
  id: string;
  label: string;
  date: string;
  amount: number;
  canDelete?: boolean;
};

export const FINANCE_GOAL_ACCENT_PRESETS: FinanceGoalAccent[] = [
  { color: '#c45c4a', barClassName: 'bg-red' },
  { color: '#16a34a', barClassName: 'bg-green' },
  { color: '#2563eb', barClassName: 'bg-blue-500' },
  { color: '#d97706', barClassName: 'bg-amber-500' },
  { color: '#7c3aed', barClassName: 'bg-violet-500' },
];

export const INITIAL_FINANCE_GOALS: FinanceGoalVm[] = [];

export function computeGoalPercent(goal: Pick<FinanceGoalVm, 'target' | 'current'>) {
  if (goal.target <= 0) return 0;
  return Math.min(100, Math.round((goal.current / goal.target) * 100));
}

export function computeGoalRemaining(goal: Pick<FinanceGoalVm, 'target' | 'current'>) {
  return Math.max(0, goal.target - goal.current);
}

export function computeGoalsTotals(goals: FinanceGoalVm[]) {
  const totalSaved = goals.reduce((sum, goal) => sum + goal.current, 0);
  const totalTarget = goals.reduce((sum, goal) => sum + goal.target, 0);
  const avgProgress = totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0;
  return { totalSaved, totalTarget, avgProgress, activeCount: goals.length };
}

export function sortFinanceGoals(goals: FinanceGoalVm[], sortKey: FinanceGoalSortKey) {
  const sorted = [...goals];
  sorted.sort((a, b) => {
    switch (sortKey) {
      case 'name':
        return a.label.localeCompare(b.label, 'en-US');
      case 'deadline':
        return a.deadline.localeCompare(b.deadline, 'en-US');
      case 'target':
        return b.target - a.target;
      case 'progress':
      default:
        return computeGoalPercent(b) - computeGoalPercent(a);
    }
  });
  return sorted;
}

export function monthsUntilGoalDeadline(deadline: string) {
  const match = deadline.match(/^([A-Za-z]{3})\/(\d{4})$/);
  if (!match) return null;

  const monthMap: Record<string, number> = {
    jan: 0,
    fev: 1,
    mar: 2,
    abr: 3,
    mai: 4,
    jun: 5,
    jul: 6,
    ago: 7,
    set: 8,
    out: 9,
    nov: 10,
    dez: 11,
  };

  const month = monthMap[match[1]!.toLowerCase()];
  const year = Number(match[2]);
  if (month === undefined || !Number.isFinite(year)) return null;

  const now = new Date();
  const target = new Date(year, month + 1, 0);
  const diffMs = target.getTime() - now.getTime();
  if (diffMs <= 0) return 0;
  return Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24 * 30)));
}

export function computeMonthlySavingsNeeded(goal: FinanceGoalVm) {
  const remaining = computeGoalRemaining(goal);
  const months = monthsUntilGoalDeadline(goal.deadline);
  if (months === null || months <= 0) return remaining;
  return Math.ceil(remaining / months);
}

export function classifyGoalPace(goal: FinanceGoalVm) {
  const percent = computeGoalPercent(goal);
  if (percent >= 100) {
    return { status: 'completed' as const, label: 'Completed' };
  }

  const months = monthsUntilGoalDeadline(goal.deadline);
  const monthlyNeeded = computeMonthlySavingsNeeded(goal);
  const monthlyActual = goal.current > 0 && months !== null && months > 0 ? goal.current / Math.max(1, 12 - months) : 0;

  if (months !== null && months <= 2 && percent < 80) {
    return { status: 'urgent' as const, label: 'Urgent' };
  }
  if (monthlyActual >= monthlyNeeded * 0.85) {
    return { status: 'on_track' as const, label: 'On track' };
  }
  return { status: 'behind' as const, label: 'Behind' };
}

export function getGoalRecentActivities(_goalId: string) {
  return [];
}
