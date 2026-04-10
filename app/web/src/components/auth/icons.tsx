'use client';

import type { ComponentProps } from 'react';
import { FaEye, FaEyeSlash, FaKey, FaUser } from 'react-icons/fa6';

function cn(base: string, className?: string) {
  return [base, className].filter(Boolean).join(' ');
}

export function IconUser({ className, ...props }: ComponentProps<typeof FaUser>) {
  return <FaUser className={cn('h-5 w-5 shrink-0', className)} aria-hidden {...props} />;
}

export function IconKey({ className, ...props }: ComponentProps<typeof FaKey>) {
  return <FaKey className={cn('h-5 w-5 shrink-0', className)} aria-hidden {...props} />;
}

export function IconEye({ className, ...props }: ComponentProps<typeof FaEye>) {
  return <FaEye className={cn('h-5 w-5 shrink-0', className)} aria-hidden {...props} />;
}

export function IconEyeOff({ className, ...props }: ComponentProps<typeof FaEyeSlash>) {
  return <FaEyeSlash className={cn('h-5 w-5 shrink-0', className)} aria-hidden {...props} />;
}
