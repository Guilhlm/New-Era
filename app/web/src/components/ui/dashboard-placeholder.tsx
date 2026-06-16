'use client';

import { Card } from '@/components/ui/card';
import { cn } from '@/components/ui/cn';
import { typeClass, typeToneClass } from '@/lib/typography';

type DashboardPlaceholderProps = {
  title: string;
  description?: string;
  className?: string;
};

export function DashboardPlaceholder({
  title,
  description = 'This area is coming soon. The layout follows the dashboard pattern used across the app.',
  className,
}: DashboardPlaceholderProps) {
  return (
    <div className={cn('flex h-full min-h-0 flex-1 flex-col overflow-hidden', className)}>
      <Card className="flex h-full min-h-0 flex-col overflow-hidden px-6 py-8">
        <div className="flex min-h-0 flex-1 flex-col justify-center gap-3 overflow-auto">
          <h1 className={cn(typeClass.title, typeToneClass.accent)}>{title}</h1>
          <p className={cn('max-w-xl', typeClass.body, typeToneClass.muted60)}>{description}</p>
        </div>
      </Card>
    </div>
  );
}
