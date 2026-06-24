import { NextResponse } from 'next/server';

/**
 * Converts an upstream (NestJS) error response into a safe JSON payload.
 * Only the structured `message` field is forwarded to the browser; raw
 * bodies (stack traces, HTML, Prisma details) are logged server-side only.
 */
export function upstreamErrorResponse(
  text: string,
  status: number,
  fallback: string,
) {
  let message = fallback;
  let code: string | undefined;
  try {
    const parsed = JSON.parse(text) as {
      message?: string | string[] | { message?: string; code?: string };
      error?: string;
      code?: string;
    };
    if (parsed.message && typeof parsed.message === 'object' && !Array.isArray(parsed.message)) {
      message = parsed.message.message ?? fallback;
      code = parsed.message.code ?? parsed.code;
    } else if (parsed.message) {
      message = Array.isArray(parsed.message)
        ? parsed.message.join(', ')
        : String(parsed.message);
      code = parsed.code;
    } else if (typeof parsed.error === 'string' && parsed.error) {
      message = parsed.error;
      code = parsed.code;
    }
  } catch {
    if (text) {
      console.error(`[bff] upstream error ${status}: ${text.slice(0, 500)}`);
    }
  }

  const safeStatus = status >= 400 && status <= 599 ? status : 502;
  if (code) {
    return NextResponse.json({ error: message, code }, { status: safeStatus });
  }
  return NextResponse.json({ error: message }, { status: safeStatus });
}

export function unreachableApiResponse() {
  return NextResponse.json(
    { error: 'Service temporarily unavailable. Try again in a moment.' },
    { status: 503 },
  );
}

export function invalidApiResponse() {
  return NextResponse.json({ error: 'Invalid API response' }, { status: 502 });
}

export function unauthenticatedResponse() {
  return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
}
