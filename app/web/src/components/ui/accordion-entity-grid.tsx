'use client';

import { useCallback, useMemo, useRef, type ReactNode } from 'react';
import { cn } from '@/components/ui/cn';
import { typeClass, typeToneClass } from '@/lib/typography';
import { useAccordionGridFit } from '@/hooks/use-accordion-grid-fit';
import { useMultiAccordionGridFit } from '@/hooks/use-multi-accordion-grid-fit';
import { normalizeSingleExpanded } from '@/utils/collapse-other-expanded';

type AccordionEntityGridProps<T extends { id: string; expanded?: boolean }> = {
  items: T[];
  loading?: boolean;
  loadingLabel?: string;
  hiddenHintLabel: (count: number) => string;
  renderEmpty: () => ReactNode;
  renderCreateDialog: () => ReactNode;
  renderAddSlot: () => ReactNode;
  renderRow: (context: {
    item: T;
    isExpanded: boolean;
    isHidden: boolean;
    expandedScrolls: boolean;
    bodyMaxHeight?: number;
    bindHeaderRef?: React.Ref<HTMLDivElement | null>;
    bindBodyRef?: React.Ref<HTMLDivElement | null>;
  }) => ReactNode;
  getExpandedBodyCount: (item: T) => number;
  hasDraft: (item: T) => boolean;
  multiExpandWhenFits?: boolean;
  onFitExpandedChange?: (expandedIds: string[]) => void;
  className?: string;
  style?: React.CSSProperties;
};

export function AccordionEntityGrid<T extends { id: string; expanded?: boolean }>({
  items: rawItems,
  loading = false,
  loadingLabel = 'Loading…',
  hiddenHintLabel,
  renderEmpty,
  renderCreateDialog,
  renderAddSlot,
  renderRow,
  getExpandedBodyCount,
  hasDraft,
  multiExpandWhenFits = false,
  onFitExpandedChange,
  className,
  style,
}: AccordionEntityGridProps<T>) {
  const items = useMemo(
    () => (multiExpandWhenFits ? rawItems : normalizeSingleExpanded(rawItems)),
    [multiExpandWhenFits, rawItems],
  );

  const expandedIndex = items.findIndex((item) => item.expanded);
  const hasExpanded = items.some((item) => item.expanded);

  const containerRef = useRef<HTMLDivElement>(null);
  const rowRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const expandedHeaderRef = useRef<HTMLDivElement>(null);
  const expandedBodyRef = useRef<HTMLDivElement>(null);
  const multiHeaderRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const multiBodyRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  const getBodyCount = useCallback((item: T) => getExpandedBodyCount(item), [getExpandedBodyCount]);
  const getHasDraft = useCallback((item: T) => hasDraft(item), [hasDraft]);

  const singleFit = useAccordionGridFit({
    items,
    expandedIndex,
    refs: {
      container: containerRef,
      rows: rowRefs,
      expandedHeader: expandedHeaderRef,
      expandedBody: expandedBodyRef,
    },
    getExpandedBodyCount: getBodyCount,
    hasDraft: getHasDraft,
  });

  const multiFit = useMultiAccordionGridFit({
    items,
    refs: {
      container: containerRef,
      rows: rowRefs,
      headers: multiHeaderRefs,
      bodies: multiBodyRefs,
    },
    getExpandedBodyCount: getBodyCount,
    hasDraft: getHasDraft,
    onFitExpandedChange: multiExpandWhenFits ? onFitExpandedChange : undefined,
  });

  const fit = multiExpandWhenFits ? multiFit : singleFit;
  const { hiddenRowIds, hideAddSlot } = fit;
  const hiddenBelowCount = hiddenRowIds.size;

  const bindMultiHeaderRef = useCallback((itemId: string) => {
    return (element: HTMLDivElement | null) => {
      if (element) multiHeaderRefs.current.set(itemId, element);
      else multiHeaderRefs.current.delete(itemId);
    };
  }, []);

  const bindMultiBodyRef = useCallback((itemId: string) => {
    return (element: HTMLDivElement | null) => {
      if (element) multiBodyRefs.current.set(itemId, element);
      else multiBodyRefs.current.delete(itemId);
    };
  }, []);

  if (loading) {
    return (
      <div className={cn('flex h-full min-h-0 items-center px-6', className)} style={style}>
        <p className={cn(typeClass.body, typeToneClass.muted60)}>{loadingLabel}</p>
      </div>
    );
  }

  return (
    <>
      {renderCreateDialog()}

      {items.length === 0 ? (
        renderEmpty()
      ) : (
        <div
          ref={containerRef}
          className={cn(
            'relative flex h-full min-h-0 flex-col gap-2.5',
            hasExpanded ? 'overflow-hidden' : 'overflow-y-auto [scrollbar-gutter:stable]',
            className,
          )}
          style={style}
        >
          {items.map((item) => {
            const isHidden = hiddenRowIds.has(item.id);
            const isExpanded = Boolean(item.expanded);
            const expandedScrolls = multiExpandWhenFits
              ? isExpanded && multiFit.scrollTargetId === item.id && multiFit.expandedScrolls
              : isExpanded && singleFit.expandedScrolls;
            const bodyMaxHeight = multiExpandWhenFits
              ? isExpanded && multiFit.scrollTargetId === item.id
                ? multiFit.bodyMaxHeight
                : undefined
              : isExpanded
                ? singleFit.bodyMaxHeight
                : undefined;

            return (
              <div
                key={item.id}
                ref={(element) => {
                  if (element) rowRefs.current.set(item.id, element);
                  else rowRefs.current.delete(item.id);
                }}
                className={cn(
                  isHidden && 'hidden',
                  isExpanded && expandedScrolls ? 'min-h-0 flex-1' : 'shrink-0',
                )}
              >
                {renderRow({
                  item,
                  isExpanded,
                  isHidden,
                  expandedScrolls: isExpanded ? expandedScrolls : false,
                  bodyMaxHeight: isExpanded ? bodyMaxHeight : undefined,
                  bindHeaderRef: isExpanded
                    ? multiExpandWhenFits
                      ? bindMultiHeaderRef(item.id)
                      : expandedHeaderRef
                    : undefined,
                  bindBodyRef: isExpanded
                    ? multiExpandWhenFits
                      ? bindMultiBodyRef(item.id)
                      : expandedBodyRef
                    : undefined,
                })}
              </div>
            );
          })}

          {!hideAddSlot ? <div className="min-h-[72px] flex-1">{renderAddSlot()}</div> : null}

          {hiddenBelowCount > 0 ? (
            <p
              className={cn(
                'pointer-events-none absolute bottom-1 left-0 right-0 text-center',
                typeClass.overline,
                'text-text/35',
              )}
            >
              {hiddenHintLabel(hiddenBelowCount)}
            </p>
          ) : null}
        </div>
      )}
    </>
  );
}
