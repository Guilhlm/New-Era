'use client';

import { FilterSearchInput } from '@/components/ui/filter-search-input';

type MonthlyExpensesSearchInputProps = {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
};

export function MonthlyExpensesSearchInput({
  value,
  onChange,
  disabled = false,
  className,
}: MonthlyExpensesSearchInputProps) {
  return (
    <FilterSearchInput
      value={value}
      onChange={onChange}
      disabled={disabled}
      placeholder="Search expenses…"
      className={className}
    />
  );
}
