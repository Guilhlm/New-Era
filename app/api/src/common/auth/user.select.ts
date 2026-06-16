export const USER_PUBLIC_SELECT = {
  id: true,
  name: true,
  email: true,
  cpf: true,
  phone: true,
  birthDate: true,
  monthlyIncome: true,
  photoUser: true,
  createdAt: true,
  updatedAt: true,
} as const;

export function omitPasswordHash<T extends { passwordHash?: unknown }>(
  user: T,
) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { passwordHash: _removed, ...rest } = user;
  return rest;
}
