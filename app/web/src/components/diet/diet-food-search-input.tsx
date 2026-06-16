'use client';

import { useEffect, useRef } from 'react';
import { cn } from '@/components/ui/cn';
import { useFoodSearch } from '@/hooks/use-food-search';
import { typeClass, typeToneClass } from '@/lib/typography';
import type { FoodSearchResult } from '@/types/foods';

type DietFoodSearchInputProps = {
  onSelect: (food: FoodSearchResult) => void;
  disabled?: boolean;
  placeholder?: string;
  autoFocus?: boolean;
};

export function DietFoodSearchInput({
  onSelect,
  disabled = false,
  placeholder = 'Search ingredient…',
  autoFocus = false,
}: DietFoodSearchInputProps) {
  const { query, setQuery, results, loading, open, setOpen, selectFood } = useFoodSearch();
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!autoFocus || disabled) return;
    const frame = requestAnimationFrame(() => inputRef.current?.focus());
    return () => cancelAnimationFrame(frame);
  }, [autoFocus, disabled]);

  useEffect(() => {
    function onPointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, [setOpen]);

  return (
    <div ref={containerRef} className="relative min-w-0 flex-1">
      <input
        ref={inputRef}
        type="text"
        value={query}
        disabled={disabled}
        autoFocus={autoFocus}
        placeholder={placeholder}
        className={cn('w-full rounded-md bg-layer2 px-3 py-2 text-text outline-none placeholder:text-text/40 focus-visible:ring-2 focus-visible:ring-red/60', typeClass.body)}
        onChange={(event) => setQuery(event.target.value)}
        onFocus={() => {
          if (results.length > 0) setOpen(true);
        }}
      />

      {open && (loading || results.length > 0) ? (
        <div className="absolute z-20 mt-1 max-h-52 w-full overflow-auto rounded-md border border-layer2-half bg-layer1 shadow-lg">
          {loading ? (
            <p className={cn('px-3 py-2', typeClass.caption, typeToneClass.muted60)}>Searching…</p>
          ) : results.length === 0 ? (
            <p className={cn('px-3 py-2', typeClass.caption, typeToneClass.muted60)}>Nenhum ingrediente encontrado.</p>
          ) : (
            results.map((food) => (
              <button
                key={food.id}
                type="button"
                className="flex w-full flex-col items-start gap-0.5 px-3 py-2 text-left hover:bg-layer2-half"
                onClick={() => onSelect(selectFood(food))}
              >
                <span className={cn('truncate', typeClass.bodyStrong, typeToneClass.default)}>{food.displayName}</span>
                <span className={cn('truncate', typeClass.caption, typeToneClass.muted60)}>
                  {food.per100gLabel} · TACO
                </span>
              </button>
            ))
          )}
        </div>
      ) : null}
    </div>
  );
}
