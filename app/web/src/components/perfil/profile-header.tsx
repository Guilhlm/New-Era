import { IoMoonOutline, IoSunnyOutline } from 'react-icons/io5';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { ProfileHeaderProps } from '@/components/perfil/profile-form.types';

export function ProfileHeader({ data, themeControls }: ProfileHeaderProps) {
  return (
    <div className="mb-4 mt-4 flex items-start justify-between gap-2">
      <Badge
        variant="muted"
        className="h-12 w-fit max-w-full justify-center rounded-md px-10 text-xs uppercase tracking-wide"
      >
        {data.isAdmin ? 'Admin' : 'Member'}
      </Badge>
      <Button
        type="button"
        suppressHydrationWarning
        onClick={themeControls.toggleTheme}
        variant="ghostIcon"
        size="icon"
        radius="md"
        className="h-12 w-14 shrink-0 bg-layer2-half text-red"
        aria-label={themeControls.theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
      >
        {themeControls.theme === 'light' ? (
          <IoMoonOutline className="h-5 w-5" aria-hidden />
        ) : (
          <IoSunnyOutline className="h-5 w-5" aria-hidden />
        )}
      </Button>
    </div>
  );
}
