'use client';

import { Badge } from '@/components/ui/badge';
import { ProfileDeleteAccountButton } from '@/components/perfil/profile-delete-account';
import type { ProfileHeaderProps } from '@/components/perfil/profile-form.types';
import { useDesktopAppVersion } from '@/hooks/use-desktop-app-version';

function formatRoleLabel(isAdmin: boolean, appVersion: string | null) {
  const role = isAdmin ? 'Admin' : 'Member';
  if (!appVersion) {
    return role;
  }
  return `${role} + Version [${appVersion}]`;
}

export function ProfileHeader({ data, actions }: ProfileHeaderProps) {
  const appVersion = useDesktopAppVersion();

  return (
    <div className="mb-4 mt-4 flex items-center justify-between gap-2">
      <Badge
        variant="muted"
        className="type-overline h-12 w-fit max-w-full justify-center rounded-md px-10"
      >
        {formatRoleLabel(data.isAdmin, appVersion)}
      </Badge>
      <ProfileDeleteAccountButton
        deleting={actions.deletingAccount}
        onConfirm={actions.onDeleteAccount}
      />
    </div>
  );
}
