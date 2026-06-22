'use client';

import { AutocompleteSearchInput } from '@/components/ui/autocomplete-search-input';
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

  return (
    <AutocompleteSearchInput
      variant="default"
      query={query}
      onQueryChange={setQuery}
      results={results}
      loading={loading}
      open={open}
      onOpenChange={setOpen}
      onSelect={(food) => onSelect(selectFood(food))}
      getKey={(food) => food.id}
      placeholder={placeholder}
      disabled={disabled}
      autoFocus={autoFocus}
      emptyLabel="No ingredients found."
      renderItem={(food) => (
        <>
          <span className={cn('truncate', typeClass.bodyStrong, typeToneClass.default)}>
            {food.displayName}
          </span>
          <span className={cn('truncate', typeClass.caption, typeToneClass.muted60)}>
            {food.per100gLabel} · TACO
          </span>
        </>
      )}
    />
  );
}
