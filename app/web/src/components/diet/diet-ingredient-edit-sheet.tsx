'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/components/ui/cn';
import { NativeDialog } from '@/components/ui/native-dialog';
import { typeClass, typeToneClass } from '@/lib/typography';
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
        <p className={cn(typeClass.title, typeToneClass.default)}>Edit ingredient</p>
        <p className={cn('mt-1', typeClass.body, typeToneClass.muted60)}>{item.name}</p>
      </div>

      <label className={cn('flex flex-col gap-2', typeClass.body)}>
        <span className="text-text/60">Grams</span>
        <input
          type="text"
          inputMode="numeric"
          autoComplete="off"
          disabled={saving}
          value={gramsText}
          className={cn(
            'rounded-md bg-layer2 px-3 py-2 outline-none focus-visible:ring-2 focus-visible:ring-red/60',
            typeClass.body,
            typeToneClass.default,
          )}
          onChange={(event) => {
            const value = event.target.value;
            if (/^\d*$/.test(value)) setGramsText(value);
          }}
        />
      </label>

      <div className={cn('rounded-md bg-layer2-half px-3 py-2', typeClass.caption, 'text-text/70')}>
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
          variant="secondary"
          size="sm"
          disabled={saving}
          onClick={onClose}
        >
          Cancel
        </Button>
      </div>

      <Button
        type="button"
        variant="destructive"
        size="sm"
        disabled={saving}
        className="w-full"
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
