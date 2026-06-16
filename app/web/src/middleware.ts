import { NextRequest, NextResponse } from 'next/server';

const AUTH_PATHS = ['/login', '/create-account', '/forgot-password'];

/**
 * Server-side route guard: pages under (main) require the auth cookie,
 * auth pages redirect home when a session cookie is already present.
 * Token validity is still enforced by the BFF/API on every data request.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
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
     * Match all paths except:
     * - /api (BFF handles its own auth)
     * - Next.js internals and static assets
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|webp|svg|gif|ico)$).*)',
  ],
};
