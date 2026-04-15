import type { HTMLAttributes } from 'react';
import { cn } from '@/components/ui/cn';

type PageHeaderProps = HTMLAttributes<HTMLElement> & {
  title: string;
  description?: string;
};

export function PageHeader({ title, description = 'Content coming soon.', className, ...props }: PageHeaderProps) {
  return (
    <section className={cn('space-y-2', className)} {...props}>
      <h1 className="text-2xl font-semibold text-text">{title}</h1>
      <p className="text-sm text-text/70">{description}</p>
    </section>
  );
}
