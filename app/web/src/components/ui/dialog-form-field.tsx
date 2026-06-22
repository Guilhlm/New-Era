'use client';

import type { ReactNode } from 'react';
import { cn } from '@/components/ui/cn';
import { dialogFormFieldClass } from '@/components/ui/dialog-form-layout';
import { typeClass, typeToneClass } from '@/lib/typography';

type DialogFormFieldProps = {
  label: string;
  /** Helper text rendered below the control. */
  hint?: ReactNode;
  children: ReactNode;
  className?: string;
};

export function DialogFormField({ label, hint, children, className }: DialogFormFieldProps) {
  return (
    <label className={cn(dialogFormFieldClass, className)}>
      <span className={cn(typeClass.caption, typeToneClass.muted60)}>{label}</span>
      {children}
      {hint ? <span className={cn(typeClass.micro, typeToneClass.muted60)}>{hint}</span> : null}
    </label>
  );
}
