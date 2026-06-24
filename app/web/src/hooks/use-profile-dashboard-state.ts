'use client';

import { useMemo } from 'react';
import { useDeleteAccount } from '@/hooks/use-delete-account';
import { useProfileAvatar } from '@/hooks/use-profile-avatar';
import { useProfileForm } from '@/hooks/use-profile-form';
import { useProfileQuery } from '@/hooks/use-profile-query';
import { numFromDecimal } from '@/utils/profile';

export function useProfileDashboardState() {
  const profileQuery = useProfileQuery();
  const user = profileQuery.data.user;
  const form = useProfileForm({
    user,
    onProfileUpdated: profileQuery.actions.reloadUser,
  });
  const avatar = useProfileAvatar({
    photoUser: user?.photoUser,
    onProfileUpdated: profileQuery.actions.reloadUser,
  });
  const deleteAccount = useDeleteAccount();

  const balanceUsd = useMemo(() => numFromDecimal(user?.totalBalance), [user]);
  const disciplineRaw = user?.disciplineLevel != null ? Number(user.disciplineLevel) : 0;
  const disciplineLabel =
    Math.abs(disciplineRaw - Math.round(disciplineRaw)) < 1e-6
      ? `${Math.round(disciplineRaw)}%`
      : `${disciplineRaw.toFixed(1)}%`;

  return {
    user,
    loadError: profileQuery.data.loadError,
    balanceUsd,
    disciplineRaw,
    disciplineLabel,
    form,
    avatar,
    deleteAccount,
  };
}

export type ProfileDashboardState = ReturnType<typeof useProfileDashboardState>;
