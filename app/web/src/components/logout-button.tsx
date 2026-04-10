'use client';

export function LogoutButton() {
  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/login';
  }

  return (
    <button
      type="button"
      onClick={() => void logout()}
      className="cursor-pointer rounded-full border border-grey bg-layer2 px-3 py-1 text-xs text-text transition hover:bg-layer2-half hover:brightness-110"
    >
      Sair
    </button>
  );
}
