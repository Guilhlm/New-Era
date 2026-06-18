import { NextRequest, NextResponse } from 'next/server';

const AUTH_PATHS = ['/login', '/create-account', '/forgot-password'];
const UNSAFE_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

function forbidden() {
  return NextResponse.json({ error: 'Forbidden origin' }, { status: 403 });
}

/**
 * Defesa CSRF de defesa-em-profundidade: muta\u00e7\u00f5es no BFF (/api) precisam vir
 * da mesma origem. Validado apenas em produ\u00e7\u00e3o para n\u00e3o quebrar o dev-proxy local.
 */
function enforceSameOrigin(request: NextRequest) {
  if (process.env.NODE_ENV !== 'production') return null;
  const origin = request.headers.get('origin');
  if (!origin) return null;

  try {
    if (new URL(origin).host !== request.headers.get('host')) {
      return forbidden();
    }
  } catch {
    return forbidden();
  }
  return null;
}

/**
 * Server-side route guard: pages under (main) require the auth cookie,
 * auth pages redirect home when a session cookie is already present.
 * Token validity is still enforced by the BFF/API on every data request.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/api')) {
    if (UNSAFE_METHODS.has(request.method)) {
      const blocked = enforceSameOrigin(request);
      if (blocked) return blocked;
    }
    return NextResponse.next();
  }

  const hasSession = Boolean(request.cookies.get('auth_token')?.value);
  const isAuthPage = AUTH_PATHS.some((path) => pathname.startsWith(path));

  if (!hasSession && !isAuthPage) {
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  if (hasSession && isAuthPage) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match application pages (auth guard) and /api routes (CSRF origin check).
     * Skips Next.js internals and static assets.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|webp|svg|gif|ico)$).*)',
  ],
};
