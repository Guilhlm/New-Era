'use client';

import { cn } from '@/components/ui/cn';
import { typeClass } from '@/lib/typography';

type FilterSearchInputProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
};

/** Local-filter search box (no dropdown), styled to match toolbar controls. */
export function FilterSearchInput({
  value,
  onChange,
  placeholder = 'Search…',
  disabled = false,
  className,
}: FilterSearchInputProps) {
  return (
    <input
      type="search"
      value={value}
      disabled={disabled}
      placeholder={placeholder}
      className={cn(
        'h-10 min-w-[11rem] flex-1 shrink-0 rounded-md border border-grey/60 bg-layer2 px-3 outline-none placeholder:text-text/40 focus-visible:ring-2 focus-visible:ring-red/60 sm:max-w-[16rem]',
        typeClass.micro,
        className,
      )}
      onChange={(event) => onChange(event.target.value)}
    />
  );
}
