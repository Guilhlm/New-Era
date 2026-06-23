'use client';

import type { Dispatch, SetStateAction } from 'react';
import { toastAuthError, toastUpdated } from '@/lib/app-toast';
import {
  createWorkoutGroup,
  deleteWorkoutGroup,
  updateWorkoutGroup,
} from '@/services/workout';
import { HttpError } from '@/services/http';
import type { TrainingDayPlanVm } from '@/types/training';
import { collapseOtherGroups } from '@/utils/training-constants';
import { CRUD_TOAST } from '@/utils/crud-toast-messages';

type UseWorkoutGroupMutationsParams = {
  plan: TrainingDayPlanVm;
  setPlan: Dispatch<SetStateAction<TrainingDayPlanVm>>;
  selectedWeekday: number;
  setSaving: (value: boolean) => void;
  createGroupOpen: boolean;
  setCreateGroupOpen: (value: boolean) => void;
};

export function useWorkoutGroupMutations({
  plan,
  setPlan,
  selectedWeekday,
  setSaving,
  createGroupOpen,
  setCreateGroupOpen,
}: UseWorkoutGroupMutationsParams) {
  function openCreateGroup() {
    setCreateGroupOpen(true);
  }

  function closeCreateGroup() {
    setCreateGroupOpen(false);
  }

  async function createGroup(name: string, timeMinutes?: number | null) {
    setSaving(true);
    try {
      const { group } = await createWorkoutGroup({
        weekday: selectedWeekday,
        name,
        timeMinutes: timeMinutes ?? 40,
      });
      setPlan((prev) => ({
        ...prev,
        groups: [...prev.groups, { ...group, expanded: false, draft: null }],
      }));
      setCreateGroupOpen(false);
      toastUpdated(CRUD_TOAST.workoutGroupCreated);
    } catch (error) {
      toastAuthError(error instanceof HttpError ? error.message : 'Could not create group.');
    } finally {
      setSaving(false);
    }
  }

  async function editGroup(groupId: string, name: string, timeMinutes: number | null) {
    setSaving(true);
    try {
      const { group } = await updateWorkoutGroup(groupId, { name, timeMinutes });
      setPlan((prev) => ({
        ...prev,
        groups: prev.groups.map((entry) =>
          entry.id === groupId ? { ...entry, name: group.name, timeMinutes: group.timeMinutes } : entry,
        ),
      }));
      toastUpdated(CRUD_TOAST.workoutGroupUpdated);
    } catch (error) {
      toastAuthError(error instanceof HttpError ? error.message : 'Could not update group.');
    } finally {
      setSaving(false);
    }
  }

  async function removeGroup(groupId: string) {
    setSaving(true);
    try {
      await deleteWorkoutGroup(groupId);
      setPlan((prev) => ({
        ...prev,
        groups: prev.groups.filter((entry) => entry.id !== groupId),
      }));
      toastUpdated(CRUD_TOAST.workoutGroupDeleted);
    } catch (error) {
      toastAuthError(error instanceof HttpError ? error.message : 'Could not delete group.');
    } finally {
      setSaving(false);
    }
  }

  function toggleGroupExpanded(groupId: string) {
    setPlan((prev) => {
      const target = prev.groups.find((group) => group.id === groupId);
      if (!target) return prev;

      return {
        ...prev,
        groups: prev.groups.map((group) =>
          group.id === groupId ? { ...group, expanded: !group.expanded } : group,
        ),
      };
    });
  }

  function syncExpandedGroups(expandedIds: string[]) {
    setPlan((prev) => {
      const current = prev.groups.filter((group) => group.expanded).map((group) => group.id);
      if (
        current.length === expandedIds.length &&
        current.every((id, index) => id === expandedIds[index])
      ) {
        return prev;
      }

      const expandedSet = new Set(expandedIds);
      return {
        ...prev,
        groups: prev.groups.map((group) => ({
          ...group,
          expanded: expandedSet.has(group.id),
        })),
      };
    });
  }

  return {
    actions: {
      openCreateGroup,
      closeCreateGroup,
      createGroup,
      editGroup,
      removeGroup,
      toggleGroupExpanded,
      syncExpandedGroups,
    },
    ui: {
      createGroupOpen,
    },
    plan,
  };
}
