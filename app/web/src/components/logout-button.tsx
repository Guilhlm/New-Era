'use client';

import { useLogout } from '@/hooks/use-logout';

export function LogoutButton() {
  const logout = useLogout();

  return (
    <button
      type="button"
      onClick={() => void logout.actions.runLogout()}
      disabled={logout.data.loading}
      className="cursor-pointer rounded-full border border-grey bg-layer2 px-3 py-1 text-xs text-text transition hover:bg-layer2-half hover:brightness-110"
    >
      Sign out
    </button>
  );
}
