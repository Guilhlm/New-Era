import type { ComponentPropsWithoutRef, ElementType } from 'react';
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
