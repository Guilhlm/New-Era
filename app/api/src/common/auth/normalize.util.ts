export function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

export function normalizeCpf(value: string) {
  return value.replace(/\D/g, '');
}
