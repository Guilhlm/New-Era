import { AvatarPicker } from '@/components/perfil/avatar-picker';
import { ProfileHeader } from '@/components/perfil/profile-header';
import { ProfileIdentityFields } from '@/components/perfil/profile-identity-fields';
import { ProfilePasswordField } from '@/components/perfil/profile-password-field';
import type { ProfileFormCardActions, ProfileFormCardData } from '@/components/perfil/profile-form.types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

type ProfileFormCardProps = {
  data: ProfileFormCardData;
  actions: ProfileFormCardActions;
};

export function ProfileFormCard({ data, actions }: ProfileFormCardProps) {
  const passwordFieldData = {
    inputType: data.password.data.inputType as 'text' | 'password',
    readOnly: data.password.data.readOnly,
    value: data.password.data.value,
    placeholder: data.password.data.placeholder,
    eyeEnabled: data.password.data.eyeEnabled,
    showPass: data.password.data.showPass,
  };

  return (
    <Card
      as="form"
      onSubmit={(e) => void actions.onSubmit(e)}
      className="flex h-full min-h-0 flex-col px-6 py-5 shadow-sm lg:px-7 lg:py-6"
      style={{ gridColumn: '1 / 3', gridRow: '1 / 3' }}
    >
      <ProfileHeader data={{ isAdmin: data.isAdmin }} />

      <AvatarPicker
        userName={data.userName}
        avatarPhoto={data.avatarPhoto}
        avatarInputRef={actions.avatarInputRef}
        onAvatarFileChange={actions.onAvatarFileChange}
        photoUploading={data.photoUploading}
      />

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <ProfileIdentityFields
          data={data.form}
          ui={{
            inputBaseClass: data.formUi.inputBaseClass,
            savedFieldTextClass: data.formUi.savedFieldTextClass,
            tones: data.formUi.tones,
          }}
          actions={{
            setName: actions.setName,
            setEmail: actions.setEmail,
            setBirthDate: actions.setBirthDate,
            setPhoneEditable: actions.setPhoneEditable,
            setMonthlyIncome: actions.setMonthlyIncome,
          }}
        />
        <div className="pt-1.5">
          <ProfilePasswordField
            inputBaseClass={data.formUi.inputBaseClass}
            toneClass={data.password.data.toneClass}
            data={passwordFieldData}
            actions={{
              setNewPassword: actions.setNewPassword,
              openEditMode: actions.openPasswordEdit,
              handleBlur: actions.handlePasswordBlur,
              toggleVisibility: actions.togglePasswordVisibility,
            }}
          />
        </div>

        <div className="mt-auto flex flex-col pt-4">
          <Button
            type="submit"
            size="lg"
            radius="xl"
            disabled={data.formUi.saving || !data.formUi.hasUnsavedChanges}
            className="mb-8 disabled:opacity-40"
          >
            {data.formUi.saving ? 'Saving…' : 'Save infos'}
          </Button>
        </div>
      </div>
    </Card>
  );
}
