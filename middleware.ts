import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { LOCALE_COOKIE, DEFAULT_LOCALE, SUPPORTED_LOCALES } from '@/lib/i18n';

/**
 * Middleware for role-based route protection
 * Protects /admin and /account routes based on user authentication and role
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Preserve locale cookie on redirects
  function redirect(url: URL) {
    const localeCookie = request.cookies.get(LOCALE_COOKIE)?.value;
    const response = NextResponse.redirect(url);
    if (localeCookie && SUPPORTED_LOCALES.includes(localeCookie as any)) {
      response.cookies.set(LOCALE_COOKIE, localeCookie, { path: '/', maxAge: 60 * 60 * 24 * 365 });
    }
    return response;
  }
  
  // Skip middleware for API routes, static files, and public routes
  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/SignIn') ||
    pathname.startsWith('/Register') ||
    pathname === '/'
  ) {
    return NextResponse.next();
  }
  
  try {
    // Get NextAuth JWT token
    const token = await getToken({ 
      req: request, 
      secret: process.env.NEXTAUTH_SECRET 
    });
    
    console.log('🔐 Middleware check:', {
      path: pathname,
      hasToken: !!token,
      role: token?.role,
    });
    
    // ADMIN ROUTES PROTECTION
    if (pathname.startsWith('/admin')) {
      // Not authenticated -> redirect to login
      if (!token) {
        console.log('❌ Admin route - No token, redirecting to login');
        const loginUrl = new URL('/SignIn', request.url);
        loginUrl.searchParams.set('redirect', pathname);
        loginUrl.searchParams.set('error', 'unauthenticated');
        return redirect(loginUrl);
      }

      // Authenticated but not admin -> redirect to account
      if (token.role !== 'admin') {
        console.log('❌ Admin route - User role, redirecting to account');
        const accountUrl = new URL('/account', request.url);
        return redirect(accountUrl);
      }
      
      console.log('✅ Admin route - Access granted');
      return NextResponse.next();
    }
    
    // USER ACCOUNT ROUTES PROTECTION
    if (pathname.startsWith('/account')) {
      // Not authenticated -> redirect to login
      if (!token) {
        console.log('❌ Account route - No token, redirecting to login');
        const loginUrl = new URL('/SignIn', request.url);
        loginUrl.searchParams.set('redirect', pathname);
        loginUrl.searchParams.set('error', 'unauthenticated');
        return redirect(loginUrl);
      }

      console.log('✅ Account route - Access granted');
      return NextResponse.next();
    }

    // All other routes - allow access
    return NextResponse.next();

  } catch (error) {
    console.error('❌ Middleware error:', error);

    // On error, redirect to login for protected routes
    if (pathname.startsWith('/admin') || pathname.startsWith('/account')) {
      const loginUrl = new URL('/SignIn', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      loginUrl.searchParams.set('error', 'server_error');
      return redirect(loginUrl);
    }
    
    // For other routes, allow access
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|images).*)',
  ],
};