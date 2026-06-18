import { cn } from '@/components/ui/cn';

export function sidebarDayRowClass(active: boolean, className?: string) {
  return cn(
    'flex h-full min-h-0 items-center justify-between gap-2 overflow-hidden rounded-[5px] border bg-layer2-half px-3 transition-colors',
    active ? 'border-red bg-red/10' : 'border-transparent',
    className,
  );
}

/** 2.75rem ≈ padding-top do card (p-5) + título. Alinha conteúdo com stats do PlanHeaderCard. */
export const sidebarContentTopAlignClass =
  'mt-[calc(5.75rem-2.75rem)] lg:mt-[calc(5.5rem-2.75rem)]';

/** Reserva inferior igual ao botão Edit Plan do Workout Plan. */
export const sidebarDayListFooterReserveClass = 'mt-4 h-10 w-full shrink-0';

export const sidebarDayListClass = cn(
  'grid min-h-0 flex-1 grid-rows-7 gap-2 overflow-hidden px-1',
  sidebarContentTopAlignClass,
);

export function sidebarGridListClass(rowCount: number, alignWithStats = true) {
  return cn(
    'grid min-h-0 flex-1 gap-2 overflow-hidden px-1',
    alignWithStats ? sidebarContentTopAlignClass : 'mt-4',
    rowCount === 2 && 'grid-rows-2',
    rowCount === 7 && 'grid-rows-7',
    rowCount === 9 && 'grid-rows-9',
  );
}
