'use client';

import { useLayoutEffect, useState } from 'react';
import {
  ADD_SLOT_MIN_PX,
  EXPANDED_BODY_GAP_PX,
  GRID_GAP_PX,
  bodyNaturalHeight,
  rowHeight,
  type AccordionGridFitState,
} from '@/hooks/use-accordion-grid-fit.shared';

export type { AccordionGridFitState } from '@/hooks/use-accordion-grid-fit.shared';

type AccordionGridFitRefs = {
  container: React.RefObject<HTMLDivElement | null>;
  rows: React.MutableRefObject<Map<string, HTMLDivElement>>;
  expandedHeader: React.RefObject<HTMLDivElement | null>;
  expandedBody: React.RefObject<HTMLDivElement | null>;
};

type AccordionGridFitOptions<T extends { id: string }> = {
  items: T[];
  expandedIndex: number;
  refs: AccordionGridFitRefs;
  getExpandedBodyCount: (item: T) => number;
  hasDraft: (item: T) => boolean;
};

export function useAccordionGridFit<T extends { id: string }>({
  items,
  expandedIndex,
  refs,
  getExpandedBodyCount,
  hasDraft,
}: AccordionGridFitOptions<T>) {
  const [state, setState] = useState<AccordionGridFitState>({
    hiddenRowIds: new Set(),
    hideAddSlot: false,
    expandedScrolls: false,
  });

  const expandedItem = expandedIndex >= 0 ? items[expandedIndex] : null;
  const expandedBodyCount = expandedItem ? getExpandedBodyCount(expandedItem) : 0;
  const expandedHasDraft = expandedItem ? hasDraft(expandedItem) : false;

  useLayoutEffect(() => {
    if (expandedIndex < 0) {
      setState({
        hiddenRowIds: new Set(),
        hideAddSlot: false,
        expandedScrolls: false,
      });
      return;
    }

    const container = refs.container.current;
    if (!container) return;

    const reconcile = () => {
      if (!refs.container.current) return;

      const containerH = refs.container.current.clientHeight;
      const itemsBelow = items.slice(expandedIndex + 1);
      const headerH = refs.expandedHeader.current?.offsetHeight ?? 0;
      const bodyNatural = bodyNaturalHeight(refs.expandedBody.current);

      let usedAbove = 0;
      for (let i = 0; i < expandedIndex; i++) {
        usedAbove += rowHeight(refs.rows.current, items[i].id);
      }

      let hideAdd = false;
      let hiddenCount = 0;
      let available = 0;
      let expandedScrolls = false;

      while (true) {
        const visibleBelow = itemsBelow.slice(0, itemsBelow.length - hiddenCount);

        let fixedH = usedAbove + headerH + EXPANDED_BODY_GAP_PX;
        for (const item of visibleBelow) {
          fixedH += rowHeight(refs.rows.current, item.id);
        }
        if (!hideAdd) fixedH += ADD_SLOT_MIN_PX;

        const itemCount = expandedIndex + 1 + visibleBelow.length + (!hideAdd ? 1 : 0);
        fixedH += Math.max(0, itemCount - 1) * GRID_GAP_PX;

        available = containerH - fixedH;

        if (bodyNatural <= available) {
          expandedScrolls = false;
          break;
        }

        if (!hideAdd) {
          hideAdd = true;
          continue;
        }

        if (hiddenCount < itemsBelow.length) {
          hiddenCount++;
          continue;
        }

        expandedScrolls = true;
        break;
      }

      const hiddenRowIds = new Set(
        itemsBelow.slice(itemsBelow.length - hiddenCount).map((item) => item.id),
      );

      setState({
        hiddenRowIds,
        hideAddSlot: hideAdd,
        expandedScrolls,
        bodyMaxHeight: expandedScrolls ? Math.max(available, 96) : undefined,
      });
    };

    reconcile();
    const raf = requestAnimationFrame(reconcile);

    const observer = new ResizeObserver(reconcile);
    observer.observe(container);

    refs.rows.current.forEach((element) => observer.observe(element));
    if (refs.expandedHeader.current) observer.observe(refs.expandedHeader.current);
    if (refs.expandedBody.current) observer.observe(refs.expandedBody.current);

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
    };
  }, [items, expandedIndex, expandedBodyCount, expandedHasDraft, getExpandedBodyCount, hasDraft]);

  return state;
}
