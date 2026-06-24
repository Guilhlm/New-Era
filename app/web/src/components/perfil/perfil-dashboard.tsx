'use client';

import { ActivityChartCard } from '@/components/perfil/activity-chart-card';
import { DisciplineCard } from '@/components/perfil/discipline-card';
import { ProfileFormCard } from '@/components/perfil/profile-form-card';
import { WalletCard } from '@/components/perfil/wallet-card';
import { useProfileChart } from '@/hooks/use-profile-chart';
import { useProfileDashboardState } from '@/hooks/use-profile-dashboard-state';
import { disciplineLabelFromPercent } from '@/utils/task-mapper';

export function PerfilDashboard() {
  const profile = useProfileDashboardState();
  const chart = useProfileChart();

  if (profile.loadError) {
    return (
      <p className="type-body text-red" role="alert">
        {profile.loadError}
      </p>
    );
  }

  if (!profile.user) {
    return <p className="type-body text-text">Loading…</p>;
  }

  const disciplineRaw =
    chart.days.length > 0 ? chart.weekAverage : profile.disciplineRaw;
  const disciplineLabel = disciplineLabelFromPercent(disciplineRaw);

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
          deletingAccount: profile.deleteAccount.data.deleting,
          onDeleteAccount: () => void profile.deleteAccount.actions.runDeleteAccount(),
        }}
      />

      <WalletCard balanceUsd={profile.balanceUsd} />

      <DisciplineCard disciplineRaw={disciplineRaw} disciplineLabel={disciplineLabel} />

      <ActivityChartCard chart={chart} style={{ gridColumn: '3 / 6', gridRow: '2 / 3' }} />
    </div>
  );
}
