type ExpandableEntity = {
  id: string;
  expanded?: boolean;
  draft?: unknown | null;
};

export function normalizeSingleExpanded<T extends { id: string; expanded?: boolean }>(items: T[]) {
  const expandedId = items.find((item) => item.expanded)?.id ?? null;
  if (!expandedId) return items;

  return items.map((item) => ({
    ...item,
    expanded: item.id === expandedId,
  }));
}

export function collapseOtherExpanded<T extends ExpandableEntity>(
  items: T[],
  activeId: string,
  clearDrafts = true,
): T[] {
  return items.map((item) => {
    if (item.id === activeId) {
      return { ...item, expanded: true };
    }
    return {
      ...item,
      expanded: false,
      draft: clearDrafts ? null : item.draft,
    } as T;
  });
}
