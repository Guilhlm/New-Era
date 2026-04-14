import * as bcrypt from 'bcrypt';

export const BCRYPT_ROUNDS = 10;
export const MIN_PASSWORD_LENGTH = 6;

export function hashPasswordSync(value: string) {
  return bcrypt.hashSync(value, BCRYPT_ROUNDS);
}

export function hashPassword(value: string) {
  return bcrypt.hash(value, BCRYPT_ROUNDS);
}

export function comparePassword(value: string, hash: string) {
  return bcrypt.compare(value, hash);
}
