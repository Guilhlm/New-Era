'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { NativeDialog } from '@/components/ui/native-dialog';
import type { DietFoodItemVm } from '@/types/diet';
import { scaleMacrosFrom100g } from '@/utils/food-nutrition';

type EditIngredientFormProps = {
  item: DietFoodItemVm;
  saving: boolean;
  onClose: () => void;
  onSave: (grams: number) => void;
  onDelete: () => void;
};

function EditIngredientForm({ item, saving, onClose, onSave, onDelete }: EditIngredientFormProps) {
  const [gramsText, setGramsText] = useState(String(item.totalGrams));

  const parsedGrams = gramsText === '' ? null : Number(gramsText);
  const previewGrams = parsedGrams !== null && parsedGrams > 0 ? parsedGrams : item.totalGrams;
  const preview = scaleMacrosFrom100g(item.per100g, previewGrams);

  return (
    <form
      method="dialog"
      className="flex flex-col gap-4 p-5"
      onSubmit={(event) => {
        event.preventDefault();
        if (parsedGrams !== null && parsedGrams > 0) onSave(parsedGrams);
      }}
    >
      <div>
        <p className="text-lg font-semibold text-text">Edit ingredient</p>
        <p className="mt-1 text-sm text-text/60">{item.name}</p>
      </div>

      <label className="flex flex-col gap-2 text-sm">
        <span className="text-text/60">Grams</span>
        <input
          type="text"
          inputMode="numeric"
          autoComplete="off"
          disabled={saving}
          value={gramsText}
          className="rounded-md bg-layer2 px-3 py-2 text-text outline-none focus-visible:ring-2 focus-visible:ring-red/60"
          onChange={(event) => {
            const value = event.target.value;
            if (/^\d*$/.test(value)) setGramsText(value);
          }}
        />
      </label>

      <div className="rounded-md bg-layer2-half px-3 py-2 text-xs text-text/70">
        {preview.calories} Kcal · {preview.protein}g Protein · {preview.carbs}g Carb · {preview.fats}g Fat
      </div>

      <div className="flex items-center gap-2">
        <Button
          type="submit"
          variant="primary"
          size="sm"
          disabled={saving || parsedGrams === null || parsedGrams <= 0}
          className="flex-1"
        >
          {saving ? 'Saving…' : 'Save'}
        </Button>
        <Button
          type="button"
          variant="primary"
          size="sm"
          disabled={saving}
          className="bg-layer2 text-text hover:bg-layer2-half"
          onClick={onClose}
        >
          Cancel
        </Button>
      </div>

      <Button
        type="button"
        variant="primary"
        size="sm"
        disabled={saving}
        className="w-full bg-red hover:bg-red/90"
        onClick={onDelete}
      >
        Delete ingredient
      </Button>
    </form>
  );
}

type DietIngredientEditSheetProps = {
  open: boolean;
  item: DietFoodItemVm | null;
  onClose: () => void;
  onSave: (grams: number) => void;
  onDelete: () => void;
  saving?: boolean;
};

export function DietIngredientEditSheet({
  open,
  item,
  onClose,
  onSave,
  onDelete,
  saving = false,
}: DietIngredientEditSheetProps) {
  if (!item) return null;

  return (
    <NativeDialog open={open} onClose={onClose}>
      {open ? (
        <EditIngredientForm
          key={item.id}
          item={item}
          saving={saving}
          onClose={onClose}
          onSave={onSave}
          onDelete={onDelete}
        />
      ) : null}
    </NativeDialog>
  );
}
