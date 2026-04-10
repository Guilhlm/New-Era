'use client';

import type { InputHTMLAttributes, ReactNode } from 'react';

type AuthFieldProps = {
  icon: ReactNode;
  right?: ReactNode;
} & InputHTMLAttributes<HTMLInputElement>;

export function AuthField({ icon, right, className = '', ...props }: AuthFieldProps) {
  return (
    <div
      className={`flex h-[68px] items-center gap-3 rounded-[10px] border border-grey bg-layer2 px-4 text-grey ${className}`}
    >
      <span className="ml-4 shrink-0 text-grey">{icon}</span>
      <input
        className="min-w-0 ml-2 flex-1 bg-transparent text-[15px] text-grey-text outline-none placeholder:text-grey"
        {...props}
      />
      {right ? (
        <span className="mr-4 shrink-0 text-grey-text [&_button]:cursor-pointer [&_button]:text-grey-text [&_svg]:text-current">
          {right}
        </span>
      ) : null}
    </div>
  );
}
