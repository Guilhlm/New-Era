export const USER_PUBLIC_SELECT = {
  id: true,
  name: true,
  email: true,
  cpf: true,
  phone: true,
  birthDate: true,
  monthlyIncome: true,
  photoUser: true,
  themePreference: true,
  createdAt: true,
  updatedAt: true,
} as const;

export function omitPasswordHash<T extends { passwordHash?: unknown }>(user: T) {
  const { passwordHash: _removed, ...rest } = user;
  return rest;
}
