import type { HTMLAttributes } from 'react';
import { cn } from '@/components/ui/cn';

type BadgeVariant = 'solid' | 'muted';

const variantClass: Record<BadgeVariant, string> = {
  solid: 'bg-red text-text',
  muted: 'bg-layer2-half text-red',
};

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: BadgeVariant;
};

export function Badge({ className, variant = 'solid', ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center justify-center rounded-full px-2 py-0.5 text-xs font-medium',
        variantClass[variant],
        className,
      )}
      {...props}
    />
  );
}
