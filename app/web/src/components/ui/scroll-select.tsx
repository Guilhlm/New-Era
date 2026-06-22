'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { TbChevronDown } from 'react-icons/tb';
import { cn } from '@/components/ui/cn';

type ScrollSelectProps<T extends string | number> = {
  value: T;
  onChange: (value: T) => void;
  options: readonly T[];
  formatOption: (value: T) => string;
  className?: string;
  menuClassName?: string;
  disabled?: boolean;
};

export function ScrollSelect<T extends string | number>({
  value,
  onChange,
  options,
  formatOption,
  className,
  menuClassName,
  disabled = false,
}: ScrollSelectProps<T>) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const listboxId = useId();

  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        onClick={() => setOpen((current) => !current)}
        className={cn(
          'flex h-9 w-full items-center justify-between gap-2 rounded-md bg-layer2 px-3 text-text outline-none focus-visible:ring-2 focus-visible:ring-red/50 disabled:cursor-not-allowed disabled:opacity-60',
          className,
        )}
      >
        <span className="min-w-0 truncate text-left">{formatOption(value)}</span>
        <TbChevronDown
          className={cn('h-4 w-4 shrink-0 text-text/60 transition-transform', open && 'rotate-180')}
          aria-hidden
        />
      </button>

      {open ? (
        <ul
          id={listboxId}
          role="listbox"
          className={cn(
            'absolute z-50 mt-1 max-h-36 w-full overflow-y-auto rounded-md border border-layer2-half bg-layer2 py-1 shadow-lg',
            menuClassName,
          )}
        >
          {options.map((option) => {
            const selected = option === value;
            return (
              <li key={String(option)} role="presentation">
                <button
                  type="button"
                  role="option"
                  aria-selected={selected}
                  onClick={() => {
                    onChange(option);
                    setOpen(false);
                  }}
                  className={cn(
                    'block w-full px-3 py-2 text-left text-text hover:bg-layer2-half',
                    selected && 'bg-layer2-half',
                  )}
                >
                  {formatOption(option)}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
