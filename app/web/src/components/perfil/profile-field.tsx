import type { ReactNode } from 'react';

const fieldInnerPad = 'px-6';

type ProfileFieldProps = {
  label: string;
  children: ReactNode;
  className?: string;
};

export function ProfileField({ label, children, className }: ProfileFieldProps) {
  return (
    <div
      className={`flex h-16 min-w-0 items-center gap-2 overflow-hidden rounded-md bg-layer2-half ${fieldInnerPad} ${className ?? ''}`}
    >
      <span className="shrink-0 text-sm font-semibold text-text">{label}</span>
      {children}
    </div>
  );
}
