'use client';

import { DietIngredientGramsLabel } from '@/components/diet/diet-ingredient-grams-label';
import { DietIngredientMacroStrip } from '@/components/diet/diet-ingredient-macro-strip';
import type { DietFoodItemVm } from '@/types/diet';
import { MdSettings } from 'react-icons/md';

type DietFoodItemRowProps = {
  data: DietFoodItemVm;
  actions: {
    onSettings: () => void;
  };
  ui?: {
    disabled?: boolean;
  };
};

export function DietFoodItemRow({ data, actions, ui }: DietFoodItemRowProps) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-layer2-half px-4 py-3">
      <div className="min-w-0 flex-1">
        <DietIngredientGramsLabel name={data.name} grams={data.totalGrams} />
        <div className="mt-1.5 sm:hidden">
          <p className="text-xs text-text/55">
            {data.calories} Kcal · {data.protein}g P · {data.carbs}g C · {data.fats}g F
          </p>
        </div>
      </div>

      <DietIngredientMacroStrip
        calories={data.calories}
        protein={data.protein}
        carbs={data.carbs}
        fats={data.fats}
      />

      <button
        type="button"
        aria-label="Edit ingredient"
        disabled={ui?.disabled}
        className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-layer2 text-text/70 hover:text-text"
        onClick={actions.onSettings}
      >
        <MdSettings className="h-5 w-5" aria-hidden />
      </button>
    </div>
  );
}
