'use client';

import type { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/components/ui/cn';

type EntityEmptyStateProps = {
  title: string;
  description: string;
  actionLabel: string;
  onAction: () => void;
  icon?: ReactNode;
  className?: string;
  style?: React.CSSProperties;
};

export function EntityEmptyState({
  title,
  description,
  actionLabel,
  onAction,
  icon,
  className,
  style,
}: EntityEmptyStateProps) {
  return (
    <Card
      className={cn(
        'flex h-full min-h-0 flex-col items-center justify-center gap-5 px-6 py-8 text-center lg:px-10',
        className,
      )}
      style={style}
    >
      {icon ? (
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-layer2-half text-text/50">
          {icon}
        </div>
      ) : null}
      <div className="max-w-sm space-y-2">
        <p className="text-lg font-semibold text-text">{title}</p>
        <p className="text-sm text-text/60">{description}</p>
      </div>
      <Button type="button" variant="primary" size="sm" className="h-auto px-6 py-2.5" onClick={onAction}>
        {actionLabel}
      </Button>
    </Card>
  );
}
