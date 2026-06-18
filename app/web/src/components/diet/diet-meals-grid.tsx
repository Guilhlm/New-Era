'use client';

import { useCallback } from 'react';
import { DietAddMealSlot } from '@/components/diet/diet-add-meal-slot';
import { DietCreateMealDialog } from '@/components/diet/diet-create-meal-dialog';
import { DietMealCard } from '@/components/diet/diet-meal-card';
import { DietMealsEmptyState } from '@/components/diet/diet-meals-empty-state';
import { AccordionEntityGrid } from '@/components/ui/accordion-entity-grid';
import type { DietMealVm } from '@/types/diet';
import type { FoodSearchResult } from '@/types/foods';

type DietMealsGridProps = {
  data: {
    meals: DietMealVm[];
  };
  actions: {
    onCreateMeal: () => void;
    onConfirmCreateMeal: (name: string) => void;
    onCloseCreateMeal: () => void;
    onRenameMeal: (mealId: string, name: string) => void;
    onDeleteMeal: (mealId: string) => void;
    onToggleMealExpanded: (mealId: string) => void;
    onStartIngredientDraft: (mealId: string) => void;
    onSelectDraftFood: (mealId: string, food: FoodSearchResult) => void;
    onChangeDraftGrams: (mealId: string, grams: number) => void;
    onConfirmDraft: (mealId: string) => void;
    onCancelDraft: (mealId: string) => void;
    onEditItem: (mealId: string, itemId: string) => void;
  };
  ui?: {
    loading?: boolean;
    saving?: boolean;
    createMealOpen?: boolean;
  };
  className?: string;
  style?: React.CSSProperties;
};

export function DietMealsGrid({ data, actions, ui, className, style }: DietMealsGridProps) {
  const getExpandedBodyCount = useCallback(
    (meal: DietMealVm) => meal.items.filter((item) => item.status === 'saved').length,
    [],
  );
  const hasDraft = useCallback((meal: DietMealVm) => Boolean(meal.draft), []);

  return (
    <AccordionEntityGrid
      items={data.meals}
      loading={ui?.loading}
      loadingLabel="Loading meals…"
      hiddenHintLabel={(count) =>
        `+${count} meal${count === 1 ? '' : 's'} below — collapse to view`
      }
      getExpandedBodyCount={getExpandedBodyCount}
      hasDraft={hasDraft}
      className={className}
      style={style}
      renderCreateDialog={() => (
        <DietCreateMealDialog
          open={Boolean(ui?.createMealOpen)}
          saving={ui?.saving}
          onClose={actions.onCloseCreateMeal}
          onCreate={actions.onConfirmCreateMeal}
        />
      )}
      renderEmpty={() => (
        <DietMealsEmptyState
          onCreateMeal={actions.onCreateMeal}
          className={className}
          style={style}
        />
      )}
      renderAddSlot={() => (
        <DietAddMealSlot onAddMeal={actions.onCreateMeal} className="h-full min-h-[72px]" />
      )}
      renderRow={({ item: meal, isExpanded, expandedScrolls, bodyMaxHeight, bindHeaderRef, bindBodyRef }) => (
        <DietMealCard
          data={meal}
          ui={{
            disabled: ui?.loading,
            saving: ui?.saving,
            expandedScrolls: isExpanded ? expandedScrolls : undefined,
            ingredientsMaxHeight: isExpanded ? bodyMaxHeight : undefined,
          }}
          bindHeaderRef={bindHeaderRef}
          bindIngredientsRef={bindBodyRef}
          actions={{
            onToggleExpanded: () => actions.onToggleMealExpanded(meal.id),
            onAddIngredient: () => actions.onStartIngredientDraft(meal.id),
            onRenameMeal: (name) => actions.onRenameMeal(meal.id, name),
            onDeleteMeal: () => actions.onDeleteMeal(meal.id),
            onSelectDraftFood: (food) => actions.onSelectDraftFood(meal.id, food),
            onChangeDraftGrams: (grams) => actions.onChangeDraftGrams(meal.id, grams),
            onConfirmDraft: () => actions.onConfirmDraft(meal.id),
            onCancelDraft: () => actions.onCancelDraft(meal.id),
            onEditItem: (itemId) => actions.onEditItem(meal.id, itemId),
          }}
        />
      )}
    />
  );
}
