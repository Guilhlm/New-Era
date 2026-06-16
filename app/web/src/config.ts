/**
 * Server-only configuration. `API_URL` must NOT use the NEXT_PUBLIC_ prefix:
 * it is only consumed by BFF route handlers and never shipped to the browser.
 * The NEXT_PUBLIC_API_URL fallback keeps existing .env files working.
 */
export const appConfig = {
  apiUrl:
    process.env.API_URL ??
    process.env.NEXT_PUBLIC_API_URL ??
    'http://localhost:6001',
};
