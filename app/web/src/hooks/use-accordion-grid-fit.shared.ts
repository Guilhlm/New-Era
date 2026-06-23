export const GRID_GAP_PX = 10;
export const ADD_SLOT_MIN_PX = 72;
export const EXPANDED_BODY_GAP_PX = 24;

export type AccordionGridFitState = {
  hiddenRowIds: Set<string>;
  hideAddSlot: boolean;
  expandedScrolls: boolean;
  bodyMaxHeight?: number;
};

export function rowHeight(rows: Map<string, HTMLDivElement>, id: string) {
  return rows.get(id)?.offsetHeight ?? 0;
}

export function bodyNaturalHeight(body: HTMLDivElement | null) {
  if (!body) return 0;

  const prevMaxHeight = body.style.maxHeight;
  body.style.maxHeight = 'none';
  const height = body.scrollHeight;
  body.style.maxHeight = prevMaxHeight;

  return height;
}
