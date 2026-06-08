'use client';

import { AddEntitySlot } from '@/components/ui/add-entity-slot';

type TrainingAddGroupSlotProps = {
  onAddGroup: () => void;
  className?: string;
};

export function TrainingAddGroupSlot({ onAddGroup, className }: TrainingAddGroupSlotProps) {
  return <AddEntitySlot label="Add another group" onAdd={onAddGroup} className={className} />;
}
