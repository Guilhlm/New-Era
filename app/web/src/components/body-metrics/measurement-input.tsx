'use client';

import { useState } from 'react';
import { cn } from '@/components/ui/cn';
import { typeClass } from '@/lib/typography';
import { formatSavedMeasurementInputDisplay, type MeasurementInputSide } from '@/utils/body-measure';

type MeasurementInputProps = {
  field: string;
  value: string;
  toneClass: string;
  side: MeasurementInputSide;
  ariaLabel: string;
  placeholder: string;
  disabled: boolean;
  inputBaseClass: string;
  savedFieldTextClass: string;
  onChange: (field: string, value: string) => void;
};

const cellClass = cn('w-full min-w-0 rounded-md bg-layer2 px-3 py-3 text-center leading-snug', typeClass.body);

/**
 * Input de circunferência alinhado ao padrão dos demais formulários (`inputBaseClass` injetado pelo hook).
 * - Quando o valor está **salvo**, o input mostra um rótulo formatado (`Left 42 cm`, etc.).
 * - Ao focar, volta ao número puro para edição.
 */
export function MeasurementInput({
  field,
  value,
  toneClass,
  side,
  ariaLabel,
  placeholder,
  disabled,
  inputBaseClass,
  savedFieldTextClass,
  onChange,
}: MeasurementInputProps) {
  const [focused, setFocused] = useState(false);
  const isSaved = toneClass === savedFieldTextClass;
  const displayValue = isSaved && !focused ? formatSavedMeasurementInputDisplay(value, side) : value;

  return (
    <input
      inputMode="decimal"
      name={field}
      autoComplete="off"
      aria-label={ariaLabel}
      placeholder={placeholder}
      disabled={disabled}
      className={cn(inputBaseClass, toneClass, cellClass, disabled ? 'opacity-60' : '')}
      value={displayValue}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      onChange={(e) => onChange(field, e.target.value)}
    />
  );
}
