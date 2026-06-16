import type { ConfigService } from '@nestjs/config';

const MIN_JWT_SECRET_LENGTH = 16;

/**
 * Fails fast at bootstrap when JWT_SECRET is missing or too weak,
 * instead of silently falling back to a guessable default.
 */
export function requireJwtSecret(configService: ConfigService): string {
  const secret = configService.get<string>('JWT_SECRET');
  if (!secret || secret.trim().length < MIN_JWT_SECRET_LENGTH) {
    throw new Error(
      `JWT_SECRET environment variable is required and must have at least ${MIN_JWT_SECRET_LENGTH} characters. Set it in app/api/.env.`,
    );
  }
  return secret;
}
