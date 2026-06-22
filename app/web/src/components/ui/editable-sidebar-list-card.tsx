'use client';

import type { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/components/ui/cn';
import {
  sidebarDayListFooterReserveClass,
  sidebarGridListClass,
} from '@/components/ui/sidebar-day-row';
import { typeClass, typeToneClass } from '@/lib/typography';

type EditableSidebarListCardProps = {
  title: string;
  rowCount: number;
  /** Aligns the list top with the PlanHeaderCard stats (default true). */
  alignWithStats?: boolean;
  loading: boolean;
  saving: boolean;
  editing: boolean;
  hasDirty: boolean;
  onToggleEdit: () => void;
  /** Mapped row elements, rendered when not loading. */
  children: ReactNode;
  loadingLabel?: string;
  footerLabels: { edit: string; save: string; done: string; saving: string };
  className?: string;
};

export function EditableSidebarListCard({
  title,
  rowCount,
  alignWithStats = true,
  loading,
  saving,
  editing,
  hasDirty,
  onToggleEdit,
  children,
  loadingLabel = 'Loading…',
  footerLabels,
  className,
}: EditableSidebarListCardProps) {
  const blocked = loading || saving;
  const footerLabel = saving
    ? footerLabels.saving
    : editing
      ? hasDirty
        ? footerLabels.save
        : footerLabels.done
      : footerLabels.edit;

  return (
    <Card className={cn('flex h-full min-h-0 flex-col overflow-hidden p-5 lg:p-6', className)}>
      <p className={cn('shrink-0 text-center', typeClass.title, typeToneClass.default)}>{title}</p>

      <div className={sidebarGridListClass(rowCount, alignWithStats)}>
        {loading ? (
          <div
            className={cn(
              'col-span-full flex h-full items-center justify-center rounded-[5px] bg-layer2-half px-3',
              typeClass.body,
              typeToneClass.muted60,
            )}
          >
            {loadingLabel}
          </div>
        ) : (
          children
        )}
      </div>

      <Button
        type="button"
        variant="primary"
        size="md"
        disabled={blocked}
        className={sidebarDayListFooterReserveClass}
        onClick={() => void onToggleEdit()}
      >
        {footerLabel}
      </Button>
    </Card>
  );
}
