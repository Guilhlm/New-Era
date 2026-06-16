'use client';

import type { InputHTMLAttributes, ReactNode } from 'react';

type AuthFieldProps = {
  icon: ReactNode;
  right?: ReactNode;
  /** Classes extra no `<input>` (ex.: cor igual ao formulário de perfil). */
  inputClassName?: string;
} & InputHTMLAttributes<HTMLInputElement>;

export function AuthField({
  icon,
  right,
  className = '',
  inputClassName = 'text-input-idle',
  ...props
}: AuthFieldProps) {
  return (
    <div
      className={`flex h-16 items-center gap-3 rounded-xl bg-layer2-half px-4 text-text ${className}`}
    >
      <span className="ml-4 shrink-0 text-red [&_svg]:text-current">{icon}</span>
      <input
        className={`ml-2 min-w-0 flex-1 bg-transparent type-body outline-none placeholder:text-text/40 ${inputClassName}`}
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
