'use client';

import { useEffect, useMemo, useRef } from 'react';
import { cn } from '@/components/ui/cn';
import { typeClass, typeToneClass } from '@/lib/typography';
import { DietFoodSearchInput } from '@/components/diet/diet-food-search-input';
import { DietIngredientMacroStrip } from '@/components/diet/diet-ingredient-macro-strip';
import { useGramsInput } from '@/hooks/use-grams-input';
import type { DietIngredientDraftVm } from '@/types/diet';
import type { FoodSearchResult } from '@/types/foods';
import { scaleMacrosFrom100g } from '@/utils/food-nutrition';
import { MdCheck, MdClose } from 'react-icons/md';

type DietIngredientDraftRowProps = {
  data: DietIngredientDraftVm;
  actions: {
    onSelectFood: (food: FoodSearchResult) => void;
    onChangeGrams: (grams: number) => void;
    onConfirm: () => void;
    onCancel: () => void;
  };
  ui?: { disabled?: boolean; saving?: boolean };
};

export function DietIngredientDraftRow({ data, actions, ui }: DietIngredientDraftRowProps) {
  const hasFood = Boolean(data.externalFoodId);
  const blocked = ui?.disabled || ui?.saving;
  const resetKey = `${data.draftKey}:${data.externalFoodId ?? 'none'}`;
  const gramsInputRef = useRef<HTMLInputElement>(null);

  const { text, setFromInput, parsed, resolveGrams } = useGramsInput(data.totalGrams, resetKey);

  const macros = useMemo(() => {
    const grams = parsed !== null && parsed > 0 ? parsed : 0;
    return scaleMacrosFrom100g(data.per100g, grams);
  }, [parsed, data.per100g]);

  const canConfirm = parsed !== null && parsed > 0;

  useEffect(() => {
    if (!hasFood || blocked) return;
    const frame = requestAnimationFrame(() => {
      gramsInputRef.current?.focus();
      gramsInputRef.current?.select();
    });
    return () => cancelAnimationFrame(frame);
  }, [hasFood, resetKey, blocked]);

  function commitGrams() {
    const next = resolveGrams();
    if (next !== null) actions.onChangeGrams(next);
  }

  function handleConfirm() {
    const next = resolveGrams();
    if (next !== null) actions.onChangeGrams(next);
    actions.onConfirm();
  }

  if (!hasFood) {
    return (
      <div className="rounded-xl border border-red/30 bg-layer2-half px-4 py-3">
        <DietFoodSearchInput
          autoFocus
          disabled={blocked}
          placeholder="Search ingredient…"
          onSelect={actions.onSelectFood}
        />
        <p className={cn('mt-2', typeClass.caption, 'text-text/50')}>Search and select an ingredient.</p>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 rounded-xl border border-red/30 bg-layer2-half px-4 py-3">
      <div className="min-w-0 flex-1">
        <p className={cn('truncate', typeClass.bodyStrong, typeToneClass.default)}>{data.name}</p>
      </div>

      <div className="flex shrink-0 items-center gap-1.5">
        <label className="sr-only" htmlFor={`grams-${data.draftKey}`}>
          Quantity in grams
        </label>
        <input
          id={`grams-${data.draftKey}`}
          ref={gramsInputRef}
          type="text"
          inputMode="numeric"
          autoComplete="off"
          disabled={blocked}
          placeholder="100"
          value={text}
          className={cn(
            'w-16 rounded-md bg-layer2 px-2.5 py-1.5 outline-none',
            typeClass.body,
            typeToneClass.default,
            'placeholder:text-text/35 focus-visible:ring-2 focus-visible:ring-red/60',
            blocked && 'opacity-60',
          )}
          onChange={(event) => {
            const value = event.target.value;
            if (!/^\d*$/.test(value)) return;
            setFromInput(value);
          }}
          onBlur={commitGrams}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault();
              if (canConfirm) handleConfirm();
            }
          }}
        />
        <span className={cn(typeClass.bodyStrong, typeToneClass.muted60)}>g</span>
      </div>

      {canConfirm ? (
        <DietIngredientMacroStrip
          calories={macros.calories}
          protein={macros.protein}
          carbs={macros.carbs}
          fats={macros.fats}
        />
      ) : null}

      <div className="flex shrink-0 items-center gap-2">
        <button
          type="button"
          aria-label="Save ingredient"
          disabled={blocked || !canConfirm}
          className={cn(
            'inline-flex h-9 w-9 items-center justify-center rounded-md bg-layer2 text-text/70 transition',
            !blocked && canConfirm && 'text-red hover:bg-layer2-half hover:text-text',
          )}
          onClick={handleConfirm}
        >
          <MdCheck className="h-5 w-5" aria-hidden />
        </button>
        <button
          type="button"
          aria-label="Cancel ingredient"
          disabled={blocked}
          className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-layer2 text-text/70 transition hover:bg-layer2-half"
          onClick={actions.onCancel}
        >
          <MdClose className="h-5 w-5" aria-hidden />
        </button>
      </div>
    </div>
  );
}
