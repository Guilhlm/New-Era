'use client';

import { ActivityChartCard } from '@/components/perfil/activity-chart-card';
import { DisciplineCard } from '@/components/perfil/discipline-card';
import { ProfileFormCard } from '@/components/perfil/profile-form-card';
import { WalletCard } from '@/components/perfil/wallet-card';
import { useSiteTheme } from '@/components/theme-provider';
import { useProfileChart } from '@/hooks/use-profile-chart';
import { useProfileDashboardState } from '@/hooks/use-profile-dashboard-state';

export function PerfilDashboard() {
  const profile = useProfileDashboardState();
  const chart = useProfileChart();
  const { theme, toggleTheme } = useSiteTheme();

  if (profile.loadError) {
    return (
      <p className="text-sm text-red" role="alert">
        {profile.loadError}
      </p>
    );
  }

  if (!profile.user) {
    return <p className="text-sm text-text">Loading…</p>;
  }

  return (
    <div
      className="flex h-full min-h-0 flex-1 flex-col gap-2.5 lg:grid lg:min-h-0 lg:flex-1 lg:gap-2.5"
      style={{
        gridTemplateColumns: 'repeat(5, minmax(0, 1fr))',
        gridTemplateRows: 'minmax(210px, auto) minmax(240px, 1fr)',
      }}
    >
      <ProfileFormCard
        data={{
          userName: profile.user?.name ?? '',
          isAdmin: Boolean(profile.user?.isAdmin),
          form: profile.form.data,
          formUi: profile.form.ui,
          password: profile.form.password,
          avatarPhoto: profile.avatar.data.avatarPhoto,
          photoUploading: profile.avatar.data.photoUploading,
        }}
        actions={{
          onSubmit: profile.form.actions.submit,
          setName: profile.form.actions.setName,
          setEmail: profile.form.actions.setEmail,
          setBirthDate: profile.form.actions.setBirthDate,
          setPhoneEditable: profile.form.actions.setPhoneEditable,
          setMonthlyIncome: profile.form.actions.setMonthlyIncome,
          setNewPassword: profile.form.password.actions.setNewPassword,
          openPasswordEdit: profile.form.password.actions.openEditMode,
          handlePasswordBlur: profile.form.password.actions.handleBlur,
          togglePasswordVisibility: profile.form.password.actions.toggleVisibility,
          onAvatarFileChange: profile.avatar.actions.onAvatarFileChange,
          avatarInputRef: profile.avatar.refs.avatarInputRef,
        }}
        themeControls={{ theme, toggleTheme }}
      />

      <WalletCard balanceUsd={profile.balanceUsd} />

      <DisciplineCard
        disciplineRaw={profile.disciplineRaw}
        disciplineLabel={profile.disciplineLabel}
      />

      <ActivityChartCard chart={chart} />
    </div>
  );
}
