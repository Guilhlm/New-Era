'use client';

import { cn } from '@/components/ui/cn';
import { typeClass } from '@/lib/typography';

type MonthlyExpensesSearchInputProps = {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
};

const toolbarControlClass = 'h-10 shrink-0';

export function MonthlyExpensesSearchInput({
  value,
  onChange,
  disabled = false,
  className,
}: MonthlyExpensesSearchInputProps) {
  return (
    <input
      type="search"
      value={value}
      disabled={disabled}
      placeholder="Search expenses…"
      className={cn(
        toolbarControlClass,
        'min-w-[11rem] flex-1 rounded-md border border-grey/60 bg-layer2 px-3 outline-none placeholder:text-text/40 focus-visible:ring-2 focus-visible:ring-red/60 sm:max-w-[16rem]',
        typeClass.micro,
        className,
      )}
      onChange={(event) => onChange(event.target.value)}
    />
  );
}
