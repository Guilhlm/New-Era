'use client';

import { cn } from '@/components/ui/cn';
import { sidebarDayRowClass } from '@/components/ui/sidebar-day-row';
import { typeClass, typeToneClass } from '@/lib/typography';

const inputClass =
  'min-w-0 flex-1 bg-transparent text-right outline-none placeholder:text-text/40 focus-visible:ring-0';

type LabelValueRowProps = {
  label: string;
  valueLabel: string;
  /** When editing, the controlled draft value of the input. */
  draft: string;
  editing: boolean;
  disabled?: boolean;
  placeholder?: string;
  inputMode?: 'decimal' | 'numeric';
  /** `sidebar` reuses sidebarDayRowClass; `plain` uses the lighter half-layer surface. */
  variant?: 'plain' | 'sidebar';
  onChange: (value: string) => void;
};

export function LabelValueRow({
  label,
  valueLabel,
  draft,
  editing,
  disabled = false,
  placeholder,
  inputMode = 'decimal',
  variant = 'plain',
  onChange,
}: LabelValueRowProps) {
  const containerClass =
    variant === 'sidebar'
      ? cn(sidebarDayRowClass(false), 'min-w-0')
      : 'flex h-full min-h-0 items-center justify-between gap-2 overflow-hidden rounded-[5px] bg-layer2-half px-3 py-2';

  return (
    <div className={containerClass}>
      <span className={cn('min-w-0 truncate', typeClass.body, typeToneClass.muted60)}>{label}</span>

      {editing ? (
        <input
          inputMode={inputMode}
          autoComplete="off"
          aria-label={label}
          disabled={disabled}
          className={cn(inputClass, typeClass.body, disabled ? 'opacity-60' : 'text-text')}
          value={draft}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
        />
      ) : (
        <span className={cn('shrink-0 truncate text-right', typeClass.body, typeToneClass.default)}>
          {valueLabel}
        </span>
      )}
    </div>
  );
}
