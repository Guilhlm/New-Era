'use client';

import { Card } from '@/components/ui/card';
import { cn } from '@/components/ui/cn';

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
          <h1 className="text-lg font-semibold text-red">{title}</h1>
          <p className="max-w-xl text-sm text-text/65">{description}</p>
        </div>
      </Card>
    </div>
  );
}
