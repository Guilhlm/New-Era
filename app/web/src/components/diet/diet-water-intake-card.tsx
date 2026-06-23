'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/components/ui/cn';
import { sidebarDayListFooterReserveClass } from '@/components/ui/sidebar-day-row';
import { typeClass, typeToneClass } from '@/lib/typography';
import { DietWaterGlassGrid } from '@/components/diet/diet-water-glass-grid';
import { DietWaterGoalDialog } from '@/components/diet/diet-water-goal-dialog';
import { DietWaterProgressRing } from '@/components/diet/diet-water-progress-ring';
import { GiGlassShot } from 'react-icons/gi';

type DietWaterIntakeCardProps = {
  data: {
    consumedLabel: string;
    targetLabel: string;
    progressPercent: number;
    glassCount: number;
    draftGlassCount: number;
    perGlass: number;
    filledCount: number;
    isComplete: boolean;
    editing: boolean;
    dirty: boolean;
    draft: string;
    allDaysDraft: string;
  };
  actions: {
    onGlassClick: (index: number) => void;
    onStartEdit: () => void;
    onSaveEdit: () => void;
    onCancelEdit: () => void;
    onWaterTotalChange: (value: string) => void;
    onAllDaysDraftChange: (value: string) => void;
    onApplyGoalToAllDays: () => void;
  };
  ui?: {
    loading?: boolean;
    saving?: boolean;
    disabled?: boolean;
  };
  className?: string;
};

export function DietWaterIntakeCard({ data, actions, ui, className }: DietWaterIntakeCardProps) {
  const blocked = ui?.disabled || ui?.loading || ui?.saving;

  return (
    <>
      <Card className={cn('flex h-full min-h-0 flex-col gap-4 overflow-hidden p-5 lg:p-6', className)}>
        <div className="flex shrink-0 items-center gap-3 rounded-[5px] bg-layer2-half px-3 py-3 sm:px-4">
          <GiGlassShot className="h-5 w-5 shrink-0 text-[color:var(--color-wallet-usd)]" aria-hidden />

          <div className="min-w-0 flex-1">
            <p className={cn(typeClass.caption, typeToneClass.muted60)}>Consumed</p>
            <p className={cn('tabular-nums', typeClass.bodyStrong, 'text-[color:var(--color-wallet-usd)]')}>
              {data.consumedLabel}
            </p>
          </div>

          <div className="h-8 w-px shrink-0 bg-layer2" aria-hidden />

          <div className="min-w-0 flex-1">
            <p className={cn(typeClass.caption, typeToneClass.muted60)}>Goal</p>
            <p className={cn('tabular-nums', typeClass.bodyStrong, typeToneClass.default)}>{data.targetLabel}</p>
          </div>

          <DietWaterProgressRing percent={data.progressPercent} />
        </div>

        <div className="flex min-h-0 flex-1 flex-col">
          {ui?.loading ? (
            <p className={cn(typeClass.body, typeToneClass.muted60)}>Loading…</p>
          ) : (
            <DietWaterGlassGrid
              data={{
                glassCount: data.glassCount,
                filledCount: data.filledCount,
                isComplete: data.isComplete,
                perGlass: data.perGlass,
              }}
              actions={{ onGlassClick: actions.onGlassClick }}
              ui={{ disabled: blocked }}
            />
          )}
        </div>

        <Button
          type="button"
          variant="primary"
          size="md"
          disabled={blocked}
          className={sidebarDayListFooterReserveClass}
          onClick={actions.onStartEdit}
        >
          Edit Goal
        </Button>
      </Card>

      <DietWaterGoalDialog
        open={data.editing}
        draft={data.draft}
        allDaysDraft={data.allDaysDraft}
        glassCount={data.draftGlassCount}
        dirty={data.dirty}
        saving={ui?.saving}
        disabled={blocked}
        onClose={actions.onCancelEdit}
        onSave={actions.onSaveEdit}
        onDraftChange={actions.onWaterTotalChange}
        onAllDaysDraftChange={actions.onAllDaysDraftChange}
        onApplyToAllDays={actions.onApplyGoalToAllDays}
      />
    </>
  );
}
