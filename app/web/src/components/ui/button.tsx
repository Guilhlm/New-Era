import { forwardRef } from 'react';
import type { ButtonHTMLAttributes } from 'react';
import { cn } from '@/components/ui/cn';

type ButtonVariant = 'primary' | 'ghost' | 'ghostIcon';
type ButtonSize = 'sm' | 'md' | 'lg' | 'icon';
type ButtonRadius = 'md' | 'xl';

const baseClass =
  'inline-flex cursor-pointer items-center justify-center font-semibold transition disabled:cursor-not-allowed';

const variantClass: Record<ButtonVariant, string> = {
  primary: 'bg-red text-text hover:opacity-90 disabled:opacity-60',
  ghost: 'text-text hover:bg-white/5 hover:text-text',
  ghostIcon: 'text-red hover:bg-layer2-half hover:brightness-110',
};

const sizeClass: Record<ButtonSize, string> = {
  sm: 'h-10 px-4 text-sm',
  md: 'h-12 px-5 text-sm',
  lg: 'h-16 w-full max-w-full text-sm',
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
  { className, variant = 'primary', size = 'md', radius = 'md', type = 'button', ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={cn(baseClass, variantClass[variant], sizeClass[size], radiusClass[radius], className)}
      {...props}
    />
  );
});
