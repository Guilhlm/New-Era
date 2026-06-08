'use client';

import { cn } from '@/components/ui/cn';

type DietIngredientGramsLabelProps = {
  name: string;
  gramsText?: string;
  grams?: number;
  editable?: boolean;
  disabled?: boolean;
  onGramsTextChange?: (value: string) => void;
  onGramsBlur?: () => void;
};

export function DietIngredientGramsLabel({
  name,
  gramsText,
  grams,
  editable = false,
  disabled = false,
  onGramsTextChange,
  onGramsBlur,
}: DietIngredientGramsLabelProps) {
  if (!editable) {
    return (
      <p className="min-w-0 truncate text-sm font-semibold text-text">
        {grams}g - {name}
      </p>
    );
  }

  const text = gramsText ?? '';

  return (
    <div className="flex min-w-0 items-baseline">
      <input
        type="text"
        inputMode="numeric"
        autoComplete="off"
        disabled={disabled}
        aria-label="Gramas"
        value={text}
        style={{ width: `${Math.max(2, text.length || 1)}ch` }}
        className={cn(
          'min-w-[2ch] max-w-[5rem] bg-transparent text-sm font-semibold text-text outline-none',
          'border-b border-transparent focus:border-red/50',
          disabled && 'opacity-60',
        )}
        onChange={(event) => onGramsTextChange?.(event.target.value)}
        onBlur={onGramsBlur}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            event.preventDefault();
            onGramsBlur?.();
            (event.target as HTMLInputElement).blur();
          }
        }}
      />
      <span className="truncate text-sm font-semibold text-text">g - {name}</span>
    </div>
  );
}
