'use client';

import { Card } from '@/components/ui/card';
import { cn } from '@/components/ui/cn';
import { MdEdit } from 'react-icons/md';

type WeightGoalCardProps = {
  data: {
    value: string;
    caption: string;
    percent: number;
  };
  actions: {
    onEdit: () => void;
  };
  className?: string;
};

export function WeightGoalCard({ data, actions, className }: WeightGoalCardProps) {
  const percent = Math.min(100, Math.max(0, data.percent));

  return (
    <Card className={cn('flex h-full min-h-0 flex-col p-5 lg:p-6', className)}>
      <div className="flex items-start gap-3">
        <div className="min-w-0">
          <p className="text-lg font-semibold text-text">{data.caption}</p>
          <p className="mt-2 text-3xl font-semibold text-text">{data.value}</p>
        </div>

        <button
          type="button"
          className="ml-auto inline-flex h-9 w-9 items-center justify-center rounded-full bg-layer2-half text-text/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red/60"
          aria-label="Editar meta de peso"
          onClick={actions.onEdit}
        >
          <MdEdit className="h-5 w-5" aria-hidden />
        </button>
      </div>

      <div className="mt-auto pt-4">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium uppercase tracking-wide text-text/60">Progress</p>
          <p className="text-xs font-medium text-text/70">{percent}%</p>
        </div>
        <div className="mt-2 h-2 w-full rounded-full bg-layer2">
          <div className="h-2 rounded-full bg-red" style={{ width: `${percent}%` }} aria-hidden />
        </div>
      </div>
    </Card>
  );
}

