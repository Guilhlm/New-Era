export const authLinkClass =
  'cursor-pointer transition hover:opacity-90 hover:brightness-110 active:opacity-80';

export const authFieldsStackClass = 'flex w-full max-w-full flex-col gap-2.5';

export const authSubmitButtonClass =
  'w-full max-w-full disabled:cursor-not-allowed disabled:opacity-60';

export const authPasswordToggleButtonClass =
  'cursor-pointer rounded p-1 text-text transition hover:bg-white/5 hover:text-text';

export function formatCpfInput(raw: string) {
  const digits = raw.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
}
