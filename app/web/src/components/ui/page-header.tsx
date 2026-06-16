import type { HTMLAttributes } from 'react';
import { cn } from '@/components/ui/cn';
import { typeClass, typeToneClass } from '@/lib/typography';

type PageHeaderProps = HTMLAttributes<HTMLElement> & {
  title: string;
  description?: string;
};

export function PageHeader({ title, description = 'Content coming soon.', className, ...props }: PageHeaderProps) {
  return (
    <section className={cn('space-y-2', className)} {...props}>
      <h1 className={cn(typeClass.page, typeToneClass.default)}>{title}</h1>
      <p className={cn(typeClass.body, typeToneClass.muted)}>{description}</p>
    </section>
  );
}
