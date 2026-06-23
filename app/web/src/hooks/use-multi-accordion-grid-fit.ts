'use client';

import { useCallback, useLayoutEffect, useRef, useState } from 'react';
import {
  ADD_SLOT_MIN_PX,
  EXPANDED_BODY_GAP_PX,
  GRID_GAP_PX,
  bodyNaturalHeight,
  rowHeight,
  type AccordionGridFitState,
} from '@/hooks/use-accordion-grid-fit.shared';

export type MultiAccordionGridFitRefs = {
  container: React.RefObject<HTMLDivElement | null>;
  rows: React.MutableRefObject<Map<string, HTMLDivElement>>;
  headers: React.MutableRefObject<Map<string, HTMLDivElement>>;
  bodies: React.MutableRefObject<Map<string, HTMLDivElement>>;
};

type MultiAccordionGridFitOptions<T extends { id: string; expanded?: boolean }> = {
  items: T[];
  refs: MultiAccordionGridFitRefs;
  getExpandedBodyCount: (item: T) => number;
  hasDraft: (item: T) => boolean;
  onFitExpandedChange?: (expandedIds: string[]) => void;
};

export type MultiAccordionGridFitState = AccordionGridFitState & {
  scrollTargetId: string | null;
};

function expandedIdsInOrder<T extends { id: string; expanded?: boolean }>(items: T[]) {
  return items.filter((item) => item.expanded).map((item) => item.id);
}

function idsEqual(left: string[], right: string[]) {
  return left.length === right.length && left.every((id, index) => id === right[index]);
}

function expandedIndexSet<T extends { id: string; expanded?: boolean }>(items: T[]) {
  return new Set(
    items.flatMap((item, index) => (item.expanded ? [index] : [])),
  );
}

function measureLayout<T extends { id: string; expanded?: boolean }>({
  items,
  expandedIndexes,
  refs,
  hideAddSlot,
  hiddenBelowCount,
  scrollItemId,
  scrollBodyMaxHeight,
}: {
  items: T[];
  expandedIndexes: Set<number>;
  refs: MultiAccordionGridFitRefs;
  hideAddSlot: boolean;
  hiddenBelowCount: number;
  scrollItemId: string | null;
  scrollBodyMaxHeight?: number;
}) {
  const lastVisibleIndex = items.length - 1 - hiddenBelowCount;
  let total = 0;

  for (let index = 0; index <= lastVisibleIndex; index += 1) {
    if (index > 0) total += GRID_GAP_PX;

    const item = items[index];
    if (!item) continue;

    if (expandedIndexes.has(index)) {
      total += refs.headers.current.get(item.id)?.offsetHeight ?? 0;
      total += EXPANDED_BODY_GAP_PX;

      if (item.id === scrollItemId && scrollBodyMaxHeight !== undefined) {
        total += scrollBodyMaxHeight;
      } else {
        total += bodyNaturalHeight(refs.bodies.current.get(item.id) ?? null);
      }
      continue;
    }

    total += rowHeight(refs.rows.current, item.id);
  }

  if (!hideAddSlot) {
    total += GRID_GAP_PX;
    total += ADD_SLOT_MIN_PX;
  }

  return total;
}

function layoutFits<T extends { id: string; expanded?: boolean }>(
  items: T[],
  expandedIndexes: Set<number>,
  refs: MultiAccordionGridFitRefs,
  containerH: number,
  scrollItemId: string | null = null,
  scrollBodyMaxHeight?: number,
) {
  let hideAdd = false;
  let hiddenBelow = 0;

  while (true) {
    const total = measureLayout({
      items,
      expandedIndexes,
      refs,
      hideAddSlot: hideAdd,
      hiddenBelowCount: hiddenBelow,
      scrollItemId,
      scrollBodyMaxHeight,
    });

    if (total <= containerH) {
      return { fits: true, hideAdd, hiddenBelow, scrollItemId, scrollBodyMaxHeight };
    }

    if (!hideAdd) {
      hideAdd = true;
      continue;
    }

    if (hiddenBelow < items.length - expandedIndexes.size) {
      hiddenBelow += 1;
      continue;
    }

    return { fits: false, hideAdd, hiddenBelow, scrollItemId, scrollBodyMaxHeight };
  }
}

export function useMultiAccordionGridFit<T extends { id: string; expanded?: boolean }>({
  items,
  refs,
  getExpandedBodyCount,
  hasDraft,
  onFitExpandedChange,
}: MultiAccordionGridFitOptions<T>) {
  const [state, setState] = useState<MultiAccordionGridFitState>({
    hiddenRowIds: new Set(),
    hideAddSlot: false,
    expandedScrolls: false,
    scrollTargetId: null,
  });

  const pendingIdsRef = useRef<string[] | null>(null);
  const expandedSignature = items
    .map((item) => `${item.id}:${item.expanded ? 1 : 0}`)
    .join('|');
  const bodySignature = items
    .filter((item) => item.expanded)
    .map((item) => `${item.id}:${getExpandedBodyCount(item)}:${hasDraft(item)}`)
    .join('|');

  const reconcile = useCallback(() => {
    const container = refs.container.current;
    if (!container) return;

    const containerH = container.clientHeight;
    const currentExpanded = expandedIdsInOrder(items);

    if (currentExpanded.length === 0) {
      pendingIdsRef.current = null;
      setState({
        hiddenRowIds: new Set(),
        hideAddSlot: false,
        expandedScrolls: false,
        scrollTargetId: null,
      });
      return;
    }

    const pending = pendingIdsRef.current;
    if (pending && !idsEqual(currentExpanded, pending)) {
      onFitExpandedChange?.(pending);
      return;
    }
    pendingIdsRef.current = null;

    const applyResolvedLayout = (result: ReturnType<typeof layoutFits>) => {
      const hiddenRowIds = new Set(
        items.slice(items.length - result.hiddenBelow).map((item) => item.id),
      );

      setState({
        hiddenRowIds,
        hideAddSlot: result.hideAdd,
        expandedScrolls: result.scrollBodyMaxHeight !== undefined,
        bodyMaxHeight: result.scrollBodyMaxHeight,
        scrollTargetId: result.scrollItemId,
      });
    };

    for (let index = 0; index < items.length - 1; index += 1) {
      const current = items[index];
      const next = items[index + 1];
      if (!current?.expanded || next?.expanded) continue;

      const trialIds = items.map((item, itemIndex) =>
        itemIndex === index + 1 ? { ...item, expanded: true } : item,
      );
      const trialIndexes = expandedIndexSet(trialIds);
      const result = layoutFits(trialIds, trialIndexes, refs, containerH);
      if (result.fits) {
        pendingIdsRef.current = expandedIdsInOrder(trialIds);
        onFitExpandedChange?.(pendingIdsRef.current);
        return;
      }
    }

    let expandedIndexes = expandedIndexSet(items);
    let fitResult = layoutFits(items, expandedIndexes, refs, containerH);
    if (fitResult.fits) {
      applyResolvedLayout(fitResult);
      return;
    }

    const expandedIndices = [...expandedIndexes].sort((a, b) => b - a);

    for (const index of expandedIndices) {
      const scrollItemId = items[index]?.id ?? null;
      if (!scrollItemId) continue;

      const naturalBody = bodyNaturalHeight(refs.bodies.current.get(scrollItemId) ?? null);
      const withoutScroll = layoutFits(items, expandedIndexes, refs, containerH);
      const fixedWithoutBody = measureLayout({
        items,
        expandedIndexes,
        refs,
        hideAddSlot: withoutScroll.hideAdd,
        hiddenBelowCount: withoutScroll.hiddenBelow,
        scrollItemId: null,
      });
      const available = containerH - fixedWithoutBody;
      const bodyMaxHeight = naturalBody <= available ? undefined : Math.max(available, 96);

      fitResult = layoutFits(
        items,
        expandedIndexes,
        refs,
        containerH,
        scrollItemId,
        bodyMaxHeight,
      );

      if (fitResult.fits) {
        applyResolvedLayout(fitResult);
        return;
      }
    }

    for (const index of expandedIndices) {
      if (expandedIndexes.size <= 1) break;

      expandedIndexes = new Set([...expandedIndexes].filter((value) => value !== index));
      const trialItems = items.map((item, itemIndex) => ({
        ...item,
        expanded: expandedIndexes.has(itemIndex),
      }));
      pendingIdsRef.current = expandedIdsInOrder(trialItems);
      onFitExpandedChange?.(pendingIdsRef.current);
      return;
    }

    const lastExpandedIndex = Math.max(...expandedIndexes);
    const scrollItemId = items[lastExpandedIndex]?.id ?? null;
    if (scrollItemId) {
      const naturalBody = bodyNaturalHeight(refs.bodies.current.get(scrollItemId) ?? null);
      const base = layoutFits(items, expandedIndexes, refs, containerH);
      const fixedWithoutBody = measureLayout({
        items,
        expandedIndexes,
        refs,
        hideAddSlot: base.hideAdd,
        hiddenBelowCount: base.hiddenBelow,
        scrollItemId: null,
      });
      const available = containerH - fixedWithoutBody;
      const bodyMaxHeight = Math.max(available, 96);

      fitResult = layoutFits(
        items,
        expandedIndexes,
        refs,
        containerH,
        scrollItemId,
        naturalBody <= available ? undefined : bodyMaxHeight,
      );

      if (fitResult.fits) {
        applyResolvedLayout(fitResult);
        return;
      }
    }

    setState({
      hiddenRowIds: new Set(),
      hideAddSlot: true,
      expandedScrolls: false,
      scrollTargetId: null,
    });
  }, [items, onFitExpandedChange]);

  useLayoutEffect(() => {
    reconcile();
    const raf = requestAnimationFrame(reconcile);

    const container = refs.container.current;
    if (!container) {
      return () => cancelAnimationFrame(raf);
    }

    const observer = new ResizeObserver(reconcile);
    observer.observe(container);
    refs.rows.current.forEach((element) => observer.observe(element));
    refs.headers.current.forEach((element) => observer.observe(element));
    refs.bodies.current.forEach((element) => observer.observe(element));

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
    };
  }, [reconcile, expandedSignature, bodySignature]);

  return state;
}
