'use client';

import { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/components/ui/cn';
import { DietFoodItemRow } from '@/components/diet/diet-food-item-row';
import { DietIngredientDraftRow } from '@/components/diet/diet-ingredient-draft-row';
import {
  DietMealCollapsedIngredientsLine,
  getMealCollapsedKcalLabel,
} from '@/components/diet/diet-meal-collapsed-summary';
import { DietMealOptionsMenu } from '@/components/diet/diet-meal-options-menu';
import type { DietIngredientDraftVm, DietMealVm } from '@/types/diet';
import type { FoodSearchResult } from '@/types/foods';
import { MdExpandMore } from 'react-icons/md';

type DietMealCardProps = {
  data: DietMealVm;
  actions: {
    onToggleExpanded: () => void;
    onAddIngredient: () => void;
    onRenameMeal: (name: string) => void;
    onDeleteMeal: () => void;
    onSelectDraftFood: (food: FoodSearchResult) => void;
    onChangeDraftGrams: (grams: number) => void;
    onConfirmDraft: () => void;
    onCancelDraft: () => void;
    onEditItem: (itemId: string) => void;
  };
  ui?: {
    disabled?: boolean;
    saving?: boolean;
    expandedScrolls?: boolean;
    ingredientsMaxHeight?: number;
  };
  bindHeaderRef?: React.RefObject<HTMLDivElement | null>;
  bindIngredientsRef?: React.RefObject<HTMLDivElement | null>;
  className?: string;
};

function MealCardActions({
  blocked,
  hasDraft,
  mealName,
  onAddIngredient,
  onRenameMeal,
  onDeleteMeal,
}: {
  blocked?: boolean;
  hasDraft: boolean;
  mealName: string;
  onAddIngredient: () => void;
  onRenameMeal: (name: string) => void;
  onDeleteMeal: () => void;
}) {
  return (
    <>
      <Button
        type="button"
        variant="primary"
        size="md"
        className="h-[2.7rem] shrink-0 px-[1.125rem] text-xs"
        disabled={blocked || hasDraft}
        onClick={onAddIngredient}
      >
        New Ingredient +
      </Button>

      <DietMealOptionsMenu
        mealName={mealName}
        disabled={blocked}
        onRename={onRenameMeal}
        onDelete={onDeleteMeal}
      />
    </>
  );
}

export function DietMealCard({ data, actions, ui, bindHeaderRef, bindIngredientsRef, className }: DietMealCardProps) {
  const savedItems = data.items.filter((item) => item.status === 'saved');
  const isExpanded = Boolean(data.expanded);
  const blocked = ui?.disabled || ui?.saving;
  const expandedScrolls = Boolean(ui?.expandedScrolls);
  const kcalLabel = useMemo(() => getMealCollapsedKcalLabel(savedItems), [savedItems]);

  return (
    <div className={cn('flex min-h-0 flex-col', isExpanded && expandedScrolls && 'h-full', className)}>
      <Card
        className={cn(
          'flex px-6 lg:px-8',
          isExpanded
            ? expandedScrolls
              ? 'h-full min-h-0 flex-col overflow-hidden pt-5 pb-4 lg:pt-6 lg:pb-5'
              : 'shrink-0 flex-col pt-5 pb-4 lg:pt-6 lg:pb-5'
            : 'shrink-0 items-center py-4 lg:py-5',
        )}
      >
        {isExpanded ? (
          <>
            <div ref={bindHeaderRef} className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                aria-expanded={isExpanded}
                className="inline-flex min-w-0 flex-1 items-center gap-1 text-left text-base font-semibold text-text"
                onClick={actions.onToggleExpanded}
              >
                <span className="truncate">{data.name}</span>
                <MdExpandMore
                  className="h-5 w-5 shrink-0 rotate-180 text-text/70 transition-transform duration-200"
                  aria-hidden
                />
              </button>

              <MealCardActions
                blocked={blocked}
                hasDraft={Boolean(data.draft)}
                mealName={data.name}
                onAddIngredient={actions.onAddIngredient}
                onRenameMeal={actions.onRenameMeal}
                onDeleteMeal={actions.onDeleteMeal}
              />
            </div>

            <div
              ref={bindIngredientsRef}
              className={cn(
                'mt-5 flex flex-col lg:mt-6',
                expandedScrolls && 'scrollbar-none overflow-y-auto',
              )}
              style={
                expandedScrolls && ui?.ingredientsMaxHeight
                  ? { maxHeight: ui.ingredientsMaxHeight }
                  : undefined
              }
            >
              {data.draft ? (
                <div className="mb-2.5 shrink-0">
                  <DietIngredientDraftRow
                    data={data.draft as DietIngredientDraftVm}
                    ui={{ disabled: blocked, saving: ui?.saving }}
                    actions={{
                      onSelectFood: actions.onSelectDraftFood,
                      onChangeGrams: actions.onChangeDraftGrams,
                      onConfirm: actions.onConfirmDraft,
                      onCancel: actions.onCancelDraft,
                    }}
                  />
                </div>
              ) : null}

              {savedItems.length > 0 ? (
                <div className="flex shrink-0 flex-col gap-2.5 pr-1">
                  {savedItems.map((item) => (
                    <DietFoodItemRow
                      key={item.id}
                      data={item}
                      ui={{ disabled: blocked }}
                      actions={{
                        onSettings: () => actions.onEditItem(item.id),
                      }}
                    />
                  ))}
                </div>
              ) : !data.draft ? (
                <p className="shrink-0 text-sm text-text/50">
                  Nenhum ingrediente ainda. Use New Ingredient + para adicionar.
                </p>
              ) : null}
            </div>
          </>
        ) : (
          <div className="flex w-full min-w-0 items-center gap-3 lg:gap-4">
            <button
              type="button"
              aria-expanded={isExpanded}
              className="inline-flex max-w-[9rem] shrink-0 items-center gap-1 text-left text-base font-semibold text-text lg:max-w-[11rem]"
              onClick={actions.onToggleExpanded}
            >
              <span className="truncate">{data.name}</span>
              <MdExpandMore className="h-5 w-5 shrink-0 text-text/70" aria-hidden />
            </button>

            <span className="shrink-0 text-sm font-semibold tabular-nums text-red">{kcalLabel}</span>

            <div className="flex min-h-0 min-w-0 flex-1 items-center justify-center px-1">
              <div className="w-full min-w-0 text-center">
                <DietMealCollapsedIngredientsLine items={savedItems} />
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <MealCardActions
                blocked={blocked}
                hasDraft={Boolean(data.draft)}
                mealName={data.name}
                onAddIngredient={actions.onAddIngredient}
                onRenameMeal={actions.onRenameMeal}
                onDeleteMeal={actions.onDeleteMeal}
              />
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
