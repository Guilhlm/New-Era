import { Badge } from '@/components/ui/badge';
import { ProfileDeleteAccountButton } from '@/components/perfil/profile-delete-account';
import type { ProfileHeaderProps } from '@/components/perfil/profile-form.types';

export function ProfileHeader({ data, actions }: ProfileHeaderProps) {
  return (
    <div className="mb-4 mt-4 flex items-center justify-between gap-2">
      <Badge
        variant="muted"
        className="type-overline h-12 w-fit max-w-full justify-center rounded-md px-10"
      >
        {data.isAdmin ? 'Admin' : 'Member'}
      </Badge>
      <ProfileDeleteAccountButton
        deleting={actions.deletingAccount}
        onConfirm={actions.onDeleteAccount}
      />
    </div>
  );
}
