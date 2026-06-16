'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/components/ui/cn';
import { typeClass, typeToneClass } from '@/lib/typography';
import { REST_DAY_LABEL } from '@/utils/training-mapper';
import { MdExpandMore } from 'react-icons/md';

type TrainingPlanDayMenuProps = {
  displayTitle: string;
  sheetTitle: string | null;
  isActive: boolean;
  disabled?: boolean;
  onSelectRestDay: () => void;
  onSelectSheet: () => void;
  onRemoveSheet: () => void;
};

export function TrainingPlanDayMenu({
  displayTitle,
  sheetTitle,
  isActive,
  disabled = false,
  onSelectRestDay,
  onSelectSheet,
  onRemoveSheet,
}: TrainingPlanDayMenuProps) {
  const [open, setOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState<{ top: number; left: number } | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const canSelectSheet = Boolean(sheetTitle);

  useEffect(() => {
    function onPointerDown(event: MouseEvent) {
      const target = event.target as Node;
      if (triggerRef.current?.contains(target)) return;
      if ((target as Element).closest?.('[data-training-plan-day-menu]')) return;
      setOpen(false);
    }

    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, []);

  useEffect(() => {
    if (!open || !triggerRef.current) {
      setMenuPosition(null);
      return;
    }

    function updatePosition() {
      const trigger = triggerRef.current;
      if (!trigger) return;
      const rect = trigger.getBoundingClientRect();
      setMenuPosition({
        top: rect.bottom + 4,
        left: rect.right - 176,
      });
    }

    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);
    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [open]);

  const menu =
    open && menuPosition && typeof document !== 'undefined'
      ? createPortal(
          <div
            data-training-plan-day-menu
            className="fixed z-50 min-w-44 overflow-hidden rounded-md border border-layer2-half bg-layer1 shadow-lg"
            style={{ top: menuPosition.top, left: menuPosition.left }}
          >
            <button
              type="button"
              className={cn(
                'block w-full px-3 py-2 text-left hover:bg-layer2-half',
                typeClass.body,
                !isActive ? 'text-red' : 'text-text',
              )}
              onClick={() => {
                setOpen(false);
                onSelectRestDay();
              }}
            >
              {REST_DAY_LABEL}
            </button>
            {canSelectSheet ? (
              <button
                type="button"
                className={cn(
                  'block w-full px-3 py-2 text-left hover:bg-layer2-half',
                typeClass.body,
                  isActive ? 'text-red' : 'text-text',
                )}
                onClick={() => {
                  setOpen(false);
                  onSelectSheet();
                }}
              >
                {sheetTitle}
              </button>
            ) : null}
            {canSelectSheet ? (
              <button
                type="button"
                className={cn('block w-full border-t border-layer2-half px-3 py-2 text-left hover:bg-red/10', typeClass.body, typeToneClass.accent)}
                onClick={() => {
                  setOpen(false);
                  onRemoveSheet();
                }}
              >
                Remove sheet
              </button>
            ) : null}
          </div>,
          document.body,
        )
      : null;

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-label={`Alterar plano: ${displayTitle}`}
        disabled={disabled || !canSelectSheet}
        className={cn(
          'inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-text/50 transition-colors hover:bg-layer2-half hover:text-text/70 disabled:cursor-default disabled:opacity-40',
          open && 'bg-layer2-half text-text/70',
        )}
        onClick={(event) => {
          event.stopPropagation();
          if (!canSelectSheet) return;
          setOpen((value) => !value);
        }}
      >
        <MdExpandMore className={cn('h-5 w-5 transition-transform', open && 'rotate-180')} aria-hidden />
      </button>
      {menu}
    </>
  );
}
