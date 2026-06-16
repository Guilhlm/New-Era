const REQUIRED_VARS = ['DATABASE_URL', 'JWT_SECRET'] as const;
const MIN_JWT_SECRET_LENGTH = 16;

/**
 * Validates environment variables at bootstrap (ConfigModule `validate`).
 * Fails fast with an actionable message instead of booting in a broken state.
 */
export function validateEnv(config: Record<string, unknown>) {
  const missing = REQUIRED_VARS.filter((key) => {
    const value = config[key];
    return typeof value !== 'string' || value.trim().length === 0;
  });

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}. Set them in app/api/.env.`,
    );
  }

  const jwtSecret = String(config.JWT_SECRET);
  if (jwtSecret.trim().length < MIN_JWT_SECRET_LENGTH) {
    throw new Error(
      `JWT_SECRET must have at least ${MIN_JWT_SECRET_LENGTH} characters.`,
    );
  }

  return config;
}
