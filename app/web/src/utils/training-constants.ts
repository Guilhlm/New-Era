import type { TrainingMuscleGroupVm } from '@/types/training';
import { collapseOtherExpanded } from '@/utils/collapse-other-expanded';
import { WEEKDAYS, weekdayLabelForIndex } from '@/utils/weekdays';

export const TRAINING_WEEKDAYS = WEEKDAYS;

export function collapseOtherGroups(
  groups: TrainingMuscleGroupVm[],
  activeGroupId: string,
  clearDrafts = true,
) {
  return collapseOtherExpanded(groups, activeGroupId, clearDrafts);
}

export function withFirstGroupExpanded(groups: TrainingMuscleGroupVm[]): TrainingMuscleGroupVm[] {
  if (groups.length === 0) return groups;

  return groups.map((group, index) => ({
    ...group,
    expanded: index === 0,
    draft: null,
  }));
}

export function defaultPlanTitleForWeekday(weekday: number) {
  return weekdayLabelForIndex(weekday);
}
