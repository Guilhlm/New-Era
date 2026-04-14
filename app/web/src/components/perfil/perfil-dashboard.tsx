'use client';

import { ActivityChartCard } from '@/components/perfil/activity-chart-card';
import { DisciplineCard } from '@/components/perfil/discipline-card';
import { ProfileFormCard } from '@/components/perfil/profile-form-card';
import { WalletCard } from '@/components/perfil/wallet-card';
import { useSiteTheme } from '@/components/theme-provider';
import { useProfileChart } from '@/hooks/use-profile-chart';
import { useProfileDashboardState } from '@/hooks/use-profile-dashboard-state';
import { formatPhoneBrEditable } from '@/utils/profile';

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
    return <p className="text-sm text-text">Carregando…</p>;
  }

  return (
    <div
      className="flex h-full min-h-0 flex-1 flex-col gap-2.5 lg:grid lg:min-h-0 lg:flex-1 lg:gap-2.5"
      style={{
        gridTemplateColumns: 'repeat(5, minmax(0, 1fr))',
        gridTemplateRows: 'minmax(168px, auto) minmax(280px, 1fr)',
      }}
    >
      <ProfileFormCard
        userName={profile.user.name}
        isAdmin={profile.user.isAdmin}
        theme={theme}
        toggleTheme={toggleTheme}
        avatarInputRef={profile.avatarInputRef}
        onAvatarFileChange={profile.onAvatarFileChange}
        photoUploading={profile.photoUploading}
        avatarPhoto={profile.avatarPhoto}
        name={profile.name}
        setName={profile.setName}
        ageValue={profile.age != null ? String(profile.age) : '—'}
        email={profile.email}
        setEmail={profile.setEmail}
        birthDate={profile.birthDate}
        setBirthDate={profile.setBirthDate}
        phone={profile.phone}
        setPhone={(v) => profile.setPhone(formatPhoneBrEditable(v))}
        monthlyIncome={profile.monthlyIncome}
        setMonthlyIncome={profile.setMonthlyIncome}
        inputBaseClass={profile.inputBaseClass}
        savedFieldTextClass={profile.savedFieldTextClass}
        toneUnchanged={profile.toneUnchanged}
        editBaselineName={profile.editBaseline?.name ?? ''}
        editBaselineEmail={profile.editBaseline?.email ?? ''}
        editBaselineBirthDate={profile.editBaseline?.birthDate ?? ''}
        editBaselinePhoneDigits={profile.editBaseline?.phoneDigits ?? ''}
        editBaselineMonthlyIncome={profile.editBaseline?.monthlyIncome ?? ''}
        pwdSurfaceMode={profile.pwdSurfaceMode}
        setPwdSurfaceMode={profile.setPwdSurfaceMode}
        showPass={profile.showPass}
        setShowPass={profile.setShowPass}
        newPassword={profile.newPassword}
        setNewPassword={profile.setNewPassword}
        tonePwdField={profile.tonePwdField}
        pwdEyeRed={profile.pwdEyeRed}
        pwdEyeEnabled={profile.pwdEyeEnabled}
        passwordMask={profile.passwordMask}
        onSave={profile.onSave}
        saving={profile.saving}
        hasUnsavedChanges={profile.hasUnsavedChanges}
      />

      <WalletCard balanceUsd={profile.balanceUsd} />

      <DisciplineCard
        disciplineRaw={profile.disciplineRaw}
        disciplineLabel={profile.disciplineLabel}
      />

      <ActivityChartCard
        chartTab={chart.chartTab}
        setChartTab={chart.setChartTab}
        period={chart.period}
        setPeriod={chart.setPeriod}
        heights={chart.heights}
      />
    </div>
  );
}
