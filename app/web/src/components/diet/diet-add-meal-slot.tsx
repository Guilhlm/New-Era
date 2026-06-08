'use client';

import { AddEntitySlot } from '@/components/ui/add-entity-slot';

type DietAddMealSlotProps = {
  onAddMeal: () => void;
  className?: string;
};

export function DietAddMealSlot({ onAddMeal, className }: DietAddMealSlotProps) {
  return <AddEntitySlot label="Add another meal" onAdd={onAddMeal} className={className} />;
}
