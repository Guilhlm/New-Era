'use client';

import { type ReactNode, useEffect, useRef } from 'react';
import { cn } from '@/components/ui/cn';
import { typeClass, typeToneClass } from '@/lib/typography';

type AutocompleteSearchInputProps<T> = {
  query: string;
  onQueryChange: (value: string) => void;
  results: T[];
  loading: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (item: T) => void;
  getKey: (item: T) => string;
  renderItem: (item: T) => ReactNode;
  placeholder?: string;
  disabled?: boolean;
  autoFocus?: boolean;
  loadingLabel?: string;
  emptyLabel?: string;
  /** `default` = block input (diet); `toolbar` = compact bordered input (wallet). */
  variant?: 'default' | 'toolbar';
  className?: string;
};

export function AutocompleteSearchInput<T>({
  query,
  onQueryChange,
  results,
  loading,
  open,
  onOpenChange,
  onSelect,
  getKey,
  renderItem,
  placeholder = 'Search…',
  disabled = false,
  autoFocus = false,
  loadingLabel = 'Searching…',
  emptyLabel = 'No results found.',
  variant = 'default',
  className,
}: AutocompleteSearchInputProps<T>) {
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
        onOpenChange(false);
      }
    }
    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, [onOpenChange]);

  const isToolbar = variant === 'toolbar';
  const hasQuery = query.trim().length > 0;
  const showDropdown = open && (loading || results.length > 0 || hasQuery);

  return (
    <div
      ref={containerRef}
      className={cn(
        isToolbar ? 'relative min-w-[11rem] flex-1 sm:max-w-[16rem]' : 'relative min-w-0 flex-1',
        className,
      )}
    >
      <input
        ref={inputRef}
        type={isToolbar ? 'search' : 'text'}
        value={query}
        disabled={disabled}
        autoFocus={autoFocus}
        placeholder={placeholder}
        className={cn(
          'w-full rounded-md bg-layer2 outline-none placeholder:text-text/40 focus-visible:ring-2 focus-visible:ring-red/60',
          isToolbar
            ? cn('h-10 shrink-0 border border-grey/60 px-3', typeClass.micro)
            : cn('px-3 py-2 text-text', typeClass.body),
        )}
        onChange={(event) => onQueryChange(event.target.value)}
        onFocus={() => {
          if (results.length > 0 || loading) onOpenChange(true);
        }}
      />

      {showDropdown ? (
        <div
          className={cn(
            'absolute mt-1 w-full overflow-auto rounded-md border bg-layer1 shadow-lg',
            isToolbar ? 'z-30 max-h-56 border-grey/60' : 'z-20 max-h-52 border-layer2-half',
          )}
        >
          {loading ? (
            <p className={cn('px-3 py-2', typeClass.caption, typeToneClass.muted60)}>{loadingLabel}</p>
          ) : results.length === 0 ? (
            <p className={cn('px-3 py-2', typeClass.caption, typeToneClass.muted60)}>{emptyLabel}</p>
          ) : (
            results.map((item) => (
              <button
                key={getKey(item)}
                type="button"
                className="flex w-full flex-col items-start gap-0.5 px-3 py-2 text-left hover:bg-layer2-half"
                onClick={() => onSelect(item)}
              >
                {renderItem(item)}
              </button>
            ))
          )}
        </div>
      ) : null}
    </div>
  );
}
