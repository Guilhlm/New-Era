'use client';

import { AddEntitySlot } from '@/components/ui/add-entity-slot';

type TaskAddTaskSlotProps = {
  onAddTask: () => void;
  className?: string;
};

export function TaskAddTaskSlot({ onAddTask, className }: TaskAddTaskSlotProps) {
  return <AddEntitySlot label="Add another task" onAdd={onAddTask} className={className} />;
}
