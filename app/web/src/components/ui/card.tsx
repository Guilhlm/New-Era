import type { ComponentPropsWithoutRef, ElementType, HTMLAttributes } from 'react';
import { cn } from '@/components/ui/cn';

type CardVariant = 'ring' | 'border';
type CardPadding = 'sm' | 'md' | 'lg' | 'none';

const variantClass: Record<CardVariant, string> = {
  ring: 'bg-layer1 ring-1 ring-grey/40',
  border: 'border border-grey',
};

const paddingClass: Record<CardPadding, string> = {
  none: '',
  sm: 'p-4',
  md: 'p-5',
  lg: 'p-6',
};

type CardProps<T extends ElementType> = {
  as?: T;
  variant?: CardVariant;
  padding?: CardPadding;
  className?: string;
} & Omit<ComponentPropsWithoutRef<T>, 'as' | 'className'>;

export function Card<T extends ElementType = 'section'>({
  as,
  className,
  variant = 'ring',
  padding = 'none',
  ...props
}: CardProps<T>) {
  const Tag = as ?? 'section';
  return <Tag className={cn('rounded-xl', variantClass[variant], paddingClass[padding], className)} {...props} />;
}

export function CardHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('space-y-1', className)} {...props} />;
}

export function CardTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn('text-sm font-semibold text-text', className)} {...props} />;
}

export function CardDescription({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn('text-sm text-text/70', className)} {...props} />;
}

export function CardContent({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn(className)} {...props} />;
}
