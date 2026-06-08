'use client';

import { DietMacroSummaryCard } from '@/components/diet/diet-macro-summary-card';
import { PlanHeaderCard } from '@/components/ui/plan-header-card';
import type { DietMacroSummaryVm } from '@/types/diet';
import { MdChevronLeft, MdChevronRight } from 'react-icons/md';

type DietPlanHeaderCardProps = {
  data: {
    title: string;
    weekdayLabel: string;
    weekdayShortLabel: string;
    macroSummaries: DietMacroSummaryVm[];
  };
  actions: {
    onPrevDay: () => void;
    onNextDay: () => void;
  };
  className?: string;
  style?: React.CSSProperties;
};

export function DietPlanHeaderCard({
  data,
  actions,
  className,
  style,
}: DietPlanHeaderCardProps) {
  return (
    <PlanHeaderCard
      title={data.title}
      className={className}
      style={style}
      statsClassName="pt-4"
      rightSlot={
        <div
          className="flex shrink-0 items-center rounded-lg bg-layer2-half p-1"
          role="group"
          aria-label="Selecionar dia da semana"
        >
          <button
            type="button"
            aria-label="Dia anterior"
            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-text/70 transition-colors hover:bg-red/15 hover:text-red focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red/60 active:scale-95"
            onClick={actions.onPrevDay}
          >
            <MdChevronLeft className="h-5 w-5" aria-hidden />
          </button>

          <span className="min-w-[3.25rem] px-2 text-center text-sm font-semibold tabular-nums text-text sm:min-w-[6.75rem]">
            <span className="sm:hidden">{data.weekdayShortLabel}</span>
            <span className="hidden sm:inline">{data.weekdayLabel}</span>
          </span>

          <button
            type="button"
            aria-label="Próximo dia"
            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-text/70 transition-colors hover:bg-red/15 hover:text-red focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red/60 active:scale-95"
            onClick={actions.onNextDay}
          >
            <MdChevronRight className="h-5 w-5" aria-hidden />
          </button>
        </div>
      }
      statsSlot={data.macroSummaries.map((summary) => (
        <DietMacroSummaryCard key={summary.key} data={summary} />
      ))}
    />
  );
}
