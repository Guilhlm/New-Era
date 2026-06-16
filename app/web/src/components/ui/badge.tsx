import type { HTMLAttributes } from 'react';
import { cn } from '@/components/ui/cn';
import { typeClass } from '@/lib/typography';

type BadgeVariant = 'solid' | 'muted';

const variantClass: Record<BadgeVariant, string> = {
  solid: 'bg-red text-on-accent',
  muted: 'bg-layer2-half text-red',
};

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: BadgeVariant;
};

export function Badge({ className, variant = 'solid', ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center justify-center rounded-full px-2 py-0.5',
        typeClass.label,
        variantClass[variant],
        className,
      )}
      {...props}
    />
  );
}
