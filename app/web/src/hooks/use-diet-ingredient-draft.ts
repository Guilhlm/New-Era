'use client';

import { useState, type Dispatch, SetStateAction } from 'react';
import { toastAuthError, toastUpdated } from '@/lib/app-toast';
import {
  createDietFoodItem,
  deleteDietFoodItem,
  updateDietFoodItem,
} from '@/services/diet';
import { HttpError } from '@/services/http';
import type { DietFoodItemVm, DietMealVm } from '@/types/diet';
import type { FoodMacrosPer100g, FoodSearchResult } from '@/types/foods';
import { collapseOtherMeals } from '@/utils/diet-constants';
import {
  buildIngredientDraft,
  formatIngredientDescription,
  scaleMacrosFrom100g,
  updateDraftGrams,
} from '@/utils/food-nutrition';
import { CRUD_TOAST } from '@/utils/crud-toast-messages';

export type DietManualDraftPatch = {
  name?: string;
} & Partial<FoodMacrosPer100g>;

type UseDietIngredientDraftParams = {
  meals: DietMealVm[];
  setMeals: Dispatch<SetStateAction<DietMealVm[]>>;
  setSaving: (value: boolean) => void;
};

export function useDietIngredientDraft({ meals, setMeals, setSaving }: UseDietIngredientDraftParams) {
  const [editItem, setEditItem] = useState<{ mealId: string; item: DietFoodItemVm } | null>(null);

  function startIngredientDraft(mealId: string) {
    setMeals((prev) =>
      collapseOtherMeals(prev, mealId).map((meal) =>
        meal.id !== mealId
          ? meal
          : {
              ...meal,
              draft: {
                id: '',
                draftKey: `draft-${Date.now()}`,
                mealId,
                status: 'draft',
                name: '',
                description: '',
                totalGrams: 0,
                externalSource: null,
                externalFoodId: null,
                per100g: { calories: 0, protein: 0, carbs: 0, fats: 0 },
                calories: 0,
                protein: 0,
                carbs: 0,
                fats: 0,
              },
            },
      ),
    );
  }

  function selectDraftFood(mealId: string, food: FoodSearchResult) {
    setMeals((prev) =>
      prev.map((meal) => {
        if (meal.id !== mealId || !meal.draft) return meal;
        return {
          ...meal,
          draft: buildIngredientDraft(mealId, food, 0, meal.draft.draftKey),
        };
      }),
    );
  }

  function startManualDraft(mealId: string) {
    setMeals((prev) =>
      prev.map((meal) => {
        if (meal.id !== mealId || !meal.draft) return meal;
        return {
          ...meal,
          draft: {
            ...meal.draft,
            status: 'draft',
            externalSource: 'manual',
            externalFoodId: null,
            name: '',
            description: '',
            totalGrams: 0,
            per100g: { calories: 0, protein: 0, carbs: 0, fats: 0 },
            calories: 0,
            protein: 0,
            carbs: 0,
            fats: 0,
          },
        };
      }),
    );
  }

  function changeManualDraft(mealId: string, patch: DietManualDraftPatch) {
    setMeals((prev) =>
      prev.map((meal) => {
        if (meal.id !== mealId || meal.draft?.externalSource !== 'manual') return meal;
        const draft = meal.draft;
        const name = patch.name ?? draft.name;
        const per100g: FoodMacrosPer100g = {
          calories: patch.calories ?? draft.per100g.calories,
          protein: patch.protein ?? draft.per100g.protein,
          carbs: patch.carbs ?? draft.per100g.carbs,
          fats: patch.fats ?? draft.per100g.fats,
        };
        const scaled = scaleMacrosFrom100g(per100g, draft.totalGrams);
        return {
          ...meal,
          draft: {
            ...draft,
            name,
            per100g,
            description: formatIngredientDescription(draft.totalGrams, name),
            calories: scaled.calories,
            protein: scaled.protein,
            carbs: scaled.carbs,
            fats: scaled.fats,
          },
        };
      }),
    );
  }

  function changeDraftGrams(mealId: string, grams: number) {
    if (!Number.isFinite(grams) || grams <= 0) return;
    setMeals((prev) =>
      prev.map((meal) => {
        if (meal.id !== mealId || !meal.draft) return meal;
        const draft = meal.draft;
        const ready = Boolean(draft.externalFoodId) || draft.externalSource === 'manual';
        if (!ready) return meal;
        return { ...meal, draft: updateDraftGrams(draft, grams) };
      }),
    );
  }

  async function confirmDraft(mealId: string) {
    const meal = meals.find((entry) => entry.id === mealId);
    const draft = meal?.draft;
    if (!draft) return;

    const isManual = draft.externalSource === 'manual';
    const isTaco = draft.externalSource === 'taco' && Boolean(draft.externalFoodId);
    if (!isManual && !isTaco) return;
    if (draft.totalGrams <= 0) return;
    if (isManual && !draft.name.trim()) return;

    setSaving(true);
    try {
      const { item } = await createDietFoodItem(mealId, {
        name: draft.name.trim(),
        totalGrams: draft.totalGrams,
        externalSource: isManual ? 'manual' : 'taco',
        externalFoodId: draft.externalFoodId ?? null,
        caloriesPer100g: draft.per100g.calories,
        proteinPer100g: draft.per100g.protein,
        carbsPer100g: draft.per100g.carbs,
        fatsPer100g: draft.per100g.fats,
      });

      setMeals((prev) =>
        prev.map((entry) =>
          entry.id === mealId
            ? {
                ...entry,
                draft: null,
                items: [...entry.items, { ...item, status: 'saved' }],
              }
            : entry,
        ),
      );
      toastUpdated(CRUD_TOAST.ingredientCreated);
    } catch (error) {
      toastAuthError(error instanceof HttpError ? error.message : 'Could not save ingredient.');
    } finally {
      setSaving(false);
    }
  }

  function cancelDraft(mealId: string) {
    setMeals((prev) =>
      prev.map((meal) => (meal.id === mealId ? { ...meal, draft: null } : meal)),
    );
  }

  function openEditItem(mealId: string, item: DietFoodItemVm) {
    setEditItem({ mealId, item });
  }

  function openEditItemByIds(mealId: string, itemId: string) {
    const meal = meals.find((entry) => entry.id === mealId);
    const item = meal?.items.find((entry) => entry.id === itemId);
    if (item) openEditItem(mealId, item);
  }

  async function saveEditItem(grams: number) {
    if (!editItem) return;
    setSaving(true);
    try {
      const { item } = await updateDietFoodItem(editItem.mealId, editItem.item.id, { totalGrams: grams });
      setMeals((prev) =>
        prev.map((meal) =>
          meal.id === editItem.mealId
            ? {
                ...meal,
                items: meal.items.map((entry) => (entry.id === item.id ? item : entry)),
              }
            : meal,
        ),
      );
      setEditItem(null);
      toastUpdated(CRUD_TOAST.ingredientUpdated);
    } catch (error) {
      toastAuthError(error instanceof HttpError ? error.message : 'Could not update ingredient.');
    } finally {
      setSaving(false);
    }
  }

  async function deleteEditItem() {
    if (!editItem) return;
    setSaving(true);
    try {
      await deleteDietFoodItem(editItem.mealId, editItem.item.id);
      setMeals((prev) =>
        prev.map((meal) =>
          meal.id === editItem.mealId
            ? { ...meal, items: meal.items.filter((entry) => entry.id !== editItem.item.id) }
            : meal,
        ),
      );
      setEditItem(null);
      toastUpdated(CRUD_TOAST.ingredientDeleted);
    } catch (error) {
      toastAuthError(error instanceof HttpError ? error.message : 'Could not delete ingredient.');
    } finally {
      setSaving(false);
    }
  }

  return {
    data: {
      editItem,
    },
    actions: {
      startIngredientDraft,
      selectDraftFood,
      startManualDraft,
      changeManualDraft,
      changeDraftGrams,
      confirmDraft,
      cancelDraft,
      openEditItem,
      openEditItemByIds,
      saveEditItem,
      deleteEditItem,
      closeEditItem: () => setEditItem(null),
    },
  };
}
