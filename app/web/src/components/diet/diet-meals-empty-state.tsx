'use client';

import { EntityEmptyState } from '@/components/ui/entity-empty-state';
import { MdOutlineRestaurantMenu } from 'react-icons/md';

type DietMealsEmptyStateProps = {
  onCreateMeal: () => void;
  className?: string;
  style?: React.CSSProperties;
};

export function DietMealsEmptyState({ onCreateMeal, className, style }: DietMealsEmptyStateProps) {
  return (
    <EntityEmptyState
      title="No meals yet"
      description="Create your first meal to start building your diet plan for the day."
      actionLabel="Create Meal"
      onAction={onCreateMeal}
      icon={<MdOutlineRestaurantMenu className="h-7 w-7" aria-hidden />}
      className={className}
      style={style}
    />
  );
}
