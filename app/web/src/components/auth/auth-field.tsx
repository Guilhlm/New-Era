'use client';

import { cn } from '@/components/ui/cn';
import type { InputHTMLAttributes, ReactNode } from 'react';

type AuthFieldProps = {
  icon: ReactNode;
  right?: ReactNode;
  /** Sobrescreve a cor automática do texto digitado. */
  inputClassName?: string;
} & InputHTMLAttributes<HTMLInputElement>;

function authInputTextClass(value: InputHTMLAttributes<HTMLInputElement>['value']) {
  return String(value ?? '').length > 0 ? 'text-red' : 'text-input-idle';
}

export function AuthField({
  icon,
  right,
  className = '',
  inputClassName,
  value,
  ...props
}: AuthFieldProps) {
  return (
    <div
      className={`flex h-16 items-center gap-3 rounded-xl bg-layer2-half px-4 text-text ${className}`}
    >
      <span className="ml-4 shrink-0 text-red [&_svg]:text-current">{icon}</span>
      <input
        value={value}
        className={cn(
          'ml-2 min-w-0 flex-1 bg-transparent type-body outline-none placeholder:text-text/40',
          inputClassName ?? authInputTextClass(value),
        )}
        {...props}
      />
      {right ? (
        <span className="mr-4 shrink-0 text-red [&_button]:cursor-pointer [&_button]:text-red [&_svg]:text-current">
          {right}
        </span>
      ) : null}
    </div>
  );
}
