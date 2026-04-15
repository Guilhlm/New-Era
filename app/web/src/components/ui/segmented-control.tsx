import type { ButtonHTMLAttributes, HTMLAttributes } from 'react';
import { cn } from '@/components/ui/cn';

type SegmentedControlVariant = 'soft' | 'pill';

const containerVariantClass: Record<SegmentedControlVariant, string> = {
  soft: 'rounded-lg bg-layer2 p-0.5 text-xs',
  pill: 'rounded-full border border-grey bg-layer2 p-0.5 text-xs',
};

type SegmentedControlProps = HTMLAttributes<HTMLDivElement> & {
  variant?: SegmentedControlVariant;
};

export function SegmentedControl({ className, variant = 'soft', ...props }: SegmentedControlProps) {
  return <div className={cn('flex', containerVariantClass[variant], className)} {...props} />;
}

type SegmentedControlItemProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  active?: boolean;
  shape?: 'md' | 'full';
};

export function SegmentedControlItem({
  className,
  active = false,
  shape = 'md',
  type = 'button',
  ...props
}: SegmentedControlItemProps) {
  return (
    <button
      type={type}
      className={cn(
        'cursor-pointer font-medium transition',
        shape === 'md' ? 'rounded-md px-3 py-1.5' : 'rounded-full px-2.5 py-1',
        active ? 'bg-red text-text' : 'bg-layer2 text-grey hover:text-text',
        className,
      )}
      {...props}
    />
  );
}
