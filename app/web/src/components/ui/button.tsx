import { forwardRef } from 'react';
import type { ButtonHTMLAttributes } from 'react';
import { cn } from '@/components/ui/cn';
import { typeClass } from '@/lib/typography';

type ButtonVariant = 'primary' | 'secondary' | 'destructive' | 'ghost' | 'ghostIcon';
type ButtonSize = 'sm' | 'md' | 'lg' | 'icon';
type ButtonRadius = 'md' | 'xl';

const baseClass =
  'inline-flex cursor-pointer items-center justify-center transition-colors duration-150 disabled:cursor-not-allowed';

const variantClass: Record<ButtonVariant, string> = {
  primary: 'bg-red text-on-accent hover:bg-layer2-half hover:text-text disabled:opacity-60',
  secondary: 'bg-layer2 text-text hover:bg-layer2-half disabled:opacity-60',
  destructive: 'bg-red text-on-accent hover:bg-layer2-half hover:text-text disabled:opacity-60',
  ghost: 'text-text hover:bg-[var(--color-hover-ghost)] hover:text-text',
  ghostIcon: 'text-red hover:bg-layer2-half hover:brightness-110',
};

const sizeClass: Record<ButtonSize, string> = {
  sm: cn('h-10 px-4', typeClass.bodyStrong),
  md: cn('h-12 px-5', typeClass.bodyStrong),
  lg: cn('h-16 w-full max-w-full', typeClass.bodyStrong),
  icon: 'h-12 w-12 p-2',
};

const radiusClass: Record<ButtonRadius, string> = {
  md: 'rounded-md',
  xl: 'rounded-xl',
};

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  radius?: ButtonRadius;
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant = 'primary', size = 'md', radius = 'md', type = 'button', disabled, ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={cn(baseClass, variantClass[variant], sizeClass[size], radiusClass[radius], className)}
      disabled={Boolean(disabled)}
      {...props}
    />
  );
});
