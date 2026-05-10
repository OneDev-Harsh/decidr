import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Route Protection Middleware
 * 
 * Protects app routes from unauthenticated access and redirects
 * authenticated users away from auth pages.
 * 
 * InsForge SDK stores the session token in cookies after login.
 * We check for the presence of the auth token cookie to determine
 * authentication state at the edge.
 */
export function middleware(request: NextRequest) {
  // InsForge SDK stores auth state in cookies. We look for any cookie starting with 'insforge'
  const allCookies = request.cookies.getAll();
  const tokenCookie = allCookies.find(c => c.name.startsWith('insforge'));
  const token = tokenCookie?.value;
  
  const { pathname } = request.nextUrl;

  const isAuthPage = pathname.startsWith('/login') || 
                     pathname.startsWith('/signup') ||
                     pathname.startsWith('/verify-email');

  const isProtectedPage = pathname.startsWith('/dashboard') ||
                          pathname.startsWith('/workspaces') ||
                          pathname.startsWith('/projects') ||
                          pathname.startsWith('/settings');

  // Redirect unauthenticated users to login
  if (isProtectedPage && !token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect authenticated users away from auth pages
  if (isAuthPage && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/workspaces/:path*', 
    '/projects/:path*',
    '/settings/:path*',
    '/login',
    '/signup',
    '/verify-email',
  ],
};
