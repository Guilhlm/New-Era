import NextImage from 'next/image';
import type { FormEvent } from 'react';
import { IoMoonOutline, IoSunnyOutline } from 'react-icons/io5';
import { MdOutlineCameraAlt } from 'react-icons/md';
import { IconEye, IconEyeOff } from '@/components/auth/icons';
import { ProfileField } from '@/components/perfil/profile-field';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

type ProfileFormCardProps = {
  userName: string;
  isAdmin: boolean;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  avatarInputRef: React.RefObject<HTMLInputElement | null>;
  onAvatarFileChange: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  photoUploading: boolean;
  avatarPhoto: string | null;
  name: string;
  setName: (v: string) => void;
  ageValue: string;
  email: string;
  setEmail: (v: string) => void;
  birthDate: string;
  setBirthDate: (v: string) => void;
  phone: string;
  setPhone: (v: string) => void;
  monthlyIncome: string;
  setMonthlyIncome: (v: string) => void;
  inputBaseClass: string;
  savedFieldTextClass: string;
  toneUnchanged: (current: string, baseline: string, normalize?: (s: string) => string) => string;
  editBaselineName: string;
  editBaselineEmail: string;
  editBaselineBirthDate: string;
  editBaselinePhoneDigits: string;
  editBaselineMonthlyIncome: string;
  pwdSurfaceMode: 'mask' | 'edit';
  setPwdSurfaceMode: (mode: 'mask' | 'edit') => void;
  showPass: boolean;
  setShowPass: (setter: (prev: boolean) => boolean) => void;
  newPassword: string;
  setNewPassword: (v: string) => void;
  tonePwdField: () => string;
  pwdEyeRed: boolean;
  pwdEyeEnabled: boolean;
  passwordMask: string;
  onSave: (e: FormEvent) => Promise<void>;
  saving: boolean;
  hasUnsavedChanges: boolean;
};

export function ProfileFormCard({
  userName,
  isAdmin,
  theme,
  toggleTheme,
  avatarInputRef,
  onAvatarFileChange,
  photoUploading,
  avatarPhoto,
  name,
  setName,
  ageValue,
  email,
  setEmail,
  birthDate,
  setBirthDate,
  phone,
  setPhone,
  monthlyIncome,
  setMonthlyIncome,
  inputBaseClass,
  savedFieldTextClass,
  toneUnchanged,
  editBaselineName,
  editBaselineEmail,
  editBaselineBirthDate,
  editBaselinePhoneDigits,
  editBaselineMonthlyIncome,
  pwdSurfaceMode,
  setPwdSurfaceMode,
  showPass,
  setShowPass,
  newPassword,
  setNewPassword,
  tonePwdField,
  pwdEyeRed,
  pwdEyeEnabled,
  passwordMask,
  onSave,
  saving,
  hasUnsavedChanges,
}: ProfileFormCardProps) {
  return (
    <Card
      as="form"
      onSubmit={onSave}
      className="flex h-full min-h-0 flex-col px-6 py-5 shadow-sm lg:px-7 lg:py-6"
      style={{ gridColumn: '1 / 3', gridRow: '1 / 3' }}
    >
      <div className="mb-4 mt-4 flex items-start justify-between gap-2">
        <Badge
          variant="muted"
          className="h-12 w-fit max-w-full justify-center rounded-md px-10 text-xs uppercase tracking-wide"
        >
          {isAdmin ? 'Administrador' : 'Membro'}
        </Badge>
        <Button
          type="button"
          suppressHydrationWarning
          onClick={toggleTheme}
          variant="ghostIcon"
          size="icon"
          radius="md"
          className="h-12 w-14 shrink-0 bg-layer2-half text-red"
          aria-label={theme === 'dark' ? 'Ativar tema claro' : 'Ativar tema escuro'}
        >
          {theme === 'light' ? (
            <IoMoonOutline className="h-5 w-5" aria-hidden />
          ) : (
            <IoSunnyOutline className="h-5 w-5" aria-hidden />
          )}
        </Button>
      </div>

      <input
        ref={avatarInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="sr-only"
        onChange={(e) => void onAvatarFileChange(e)}
        tabIndex={-1}
      />
      <div className="mx-auto mb-8 mt-4 flex shrink-0 justify-center">
        <button
          type="button"
          onClick={() => avatarInputRef.current?.click()}
          disabled={photoUploading}
          className="group relative h-56 w-56 shrink-0 cursor-pointer overflow-hidden rounded-full border-2 border-grey bg-layer2 disabled:cursor-wait disabled:opacity-70"
          aria-label="Alterar foto do perfil"
        >
          {avatarPhoto?.startsWith('data:') || avatarPhoto?.startsWith('http') ? (
            // eslint-disable-next-line @next/next/no-img-element -- data URL e URLs externas
            <img src={avatarPhoto} alt="" className="h-full w-full object-cover" />
          ) : avatarPhoto ? (
            <NextImage src={avatarPhoto} alt="" fill className="object-cover" sizes="224px" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-2xl font-semibold text-text/80">
              {userName
                .split(/\s+/)
                .filter(Boolean)
                .slice(0, 2)
                .map((p) => p[0])
                .join('')
                .toUpperCase()
                .slice(0, 2) || '?'}
            </div>
          )}
          <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/55 opacity-0 transition group-hover:opacity-100 group-focus-visible:opacity-100">
            {photoUploading ? (
              <span className="text-xs text-text">…</span>
            ) : (
              <MdOutlineCameraAlt className="h-9 w-9 text-text" aria-hidden />
            )}
          </span>
        </button>
      </div>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <div className="space-y-1.5">
          <div className="grid grid-cols-3 gap-1.5">
            <ProfileField label="Nome:" className="col-span-2">
              <input
                className={`${inputBaseClass} ${toneUnchanged(name, editBaselineName)} cursor-text`}
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                aria-label="Nome"
              />
            </ProfileField>
            <ProfileField label="Idade:" className="col-span-1">
              <input
                className={`${inputBaseClass} ${savedFieldTextClass}`}
                value={ageValue}
                readOnly
                tabIndex={-1}
                aria-label="Idade"
              />
            </ProfileField>
          </div>

          <ProfileField label="Email:">
            <input
              type="email"
              className={`${inputBaseClass} ${toneUnchanged(email, editBaselineEmail)} cursor-text`}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              aria-label="Email"
            />
          </ProfileField>

          <div className="grid grid-cols-2 gap-1.5">
            <ProfileField label="Data:">
              <input
                type="date"
                className={`input-no-native-date ${inputBaseClass} ${toneUnchanged(birthDate, editBaselineBirthDate)} min-w-0 cursor-pointer`}
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                aria-label="Data de nascimento"
              />
            </ProfileField>
            <ProfileField label="Telefone:">
              <input
                className={`${inputBaseClass} ${toneUnchanged(phone.replace(/\D/g, ''), editBaselinePhoneDigits)} cursor-text`}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="(11) 99999-9999"
                inputMode="tel"
                autoComplete="tel"
                aria-label="Telefone"
              />
            </ProfileField>
          </div>

          <ProfileField label="Renda mensal:">
            <input
              type="number"
              step="0.01"
              min={0}
              className={`input-no-native-spin ${inputBaseClass} ${toneUnchanged(monthlyIncome.trim(), editBaselineMonthlyIncome)} cursor-text`}
              value={monthlyIncome}
              onChange={(e) => setMonthlyIncome(e.target.value)}
              placeholder="0,00"
              aria-label="Renda mensal"
            />
          </ProfileField>

          <ProfileField label="Senha:">
            <div className="min-w-0 flex-1">
              {pwdSurfaceMode === 'mask' && !showPass ? (
                <input
                  type="password"
                  readOnly
                  className={`${inputBaseClass} ${tonePwdField()} w-full cursor-pointer`}
                  value={passwordMask}
                  onClick={() => {
                    setPwdSurfaceMode('edit');
                    setNewPassword('');
                  }}
                  autoComplete="off"
                  spellCheck={false}
                  aria-label="Senha"
                />
              ) : pwdSurfaceMode === 'mask' && showPass ? (
                <input
                  type="text"
                  readOnly
                  className={`${inputBaseClass} ${tonePwdField()} w-full cursor-pointer`}
                  value={passwordMask}
                  onClick={() => {
                    setPwdSurfaceMode('edit');
                    setNewPassword('');
                  }}
                  autoComplete="off"
                  spellCheck={false}
                  aria-label="Senha"
                />
              ) : !showPass ? (
                <input
                  type="password"
                  className={`${inputBaseClass} ${tonePwdField()} w-full cursor-text`}
                  placeholder="nova senha (opcional)"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  onBlur={() => {
                    if (newPassword === '') {
                      setPwdSurfaceMode('mask');
                      setShowPass(() => false);
                    }
                  }}
                  autoComplete="off"
                  spellCheck={false}
                  aria-label="Senha"
                />
              ) : (
                <input
                  type="text"
                  className={`${inputBaseClass} ${tonePwdField()} w-full cursor-text`}
                  placeholder="nova senha (opcional)"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  onBlur={() => {
                    if (newPassword === '') {
                      setPwdSurfaceMode('mask');
                      setShowPass(() => false);
                    }
                  }}
                  autoComplete="off"
                  spellCheck={false}
                  aria-label="Senha"
                />
              )}
            </div>
            <span
              className={`-translate-x-5 shrink-0 [&_svg]:text-current ${
                pwdEyeRed
                  ? 'text-red [&_button]:cursor-pointer [&_button]:text-red'
                  : 'text-grey [&_button]:text-grey'
              } ${pwdEyeEnabled ? '[&_button]:cursor-pointer' : '[&_button]:cursor-not-allowed'}`}
            >
              <button
                type="button"
                disabled={!pwdEyeEnabled}
                className={`rounded p-1 transition hover:bg-white/5 ${
                  pwdEyeEnabled ? '' : 'opacity-50'
                } disabled:opacity-50`}
                onMouseDown={(e) => pwdEyeEnabled && e.preventDefault()}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (!pwdEyeEnabled) return;
                  setShowPass((prev) => !prev);
                }}
                aria-label={showPass ? 'Ocultar senha' : 'Mostrar senha'}
                aria-disabled={!pwdEyeEnabled}
              >
                {showPass ? <IconEyeOff /> : <IconEye />}
              </button>
            </span>
          </ProfileField>
        </div>

        <div className="mt-auto flex flex-col pt-4">
          <Button
            type="submit"
            size="lg"
            radius="xl"
            disabled={saving || !hasUnsavedChanges}
            className="mb-8 disabled:opacity-40"
          >
            {saving ? 'Saving…' : 'Save infos'}
          </Button>
        </div>
      </div>
    </Card>
  );
}
