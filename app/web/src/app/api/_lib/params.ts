import { NextResponse } from 'next/server';

/**
 * Resource ids are Prisma cuids (url-safe alphanumerics). Anything else
 * (slashes, dots, percent-encoding) is rejected before being interpolated
 * into an upstream URL, preventing path traversal against the API.
 */
const RESOURCE_ID_PATTERN = /^[A-Za-z0-9_-]{1,64}$/;

export function isValidResourceId(value: string | undefined | null): value is string {
  return typeof value === 'string' && RESOURCE_ID_PATTERN.test(value);
}

export function invalidIdResponse() {
  return NextResponse.json({ error: 'Invalid resource id' }, { status: 400 });
}
