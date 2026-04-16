import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const isAuth = !!token;
    const isAuthPage = req.nextUrl.pathname.startsWith('/auth');

    // If the user is on an auth page and is already logged in, redirect to dashboard
    if (isAuthPage) {
      if (isAuth) {
        return NextResponse.redirect(new URL('/lms', req.url));
      }
      return null;
    }

    const headers = new Headers();
    // Security Headers
    headers.set('X-XSS-Protection', '1; mode=block');
    headers.set('X-Frame-Options', 'DENY');
    headers.set('X-Content-Type-Options', 'nosniff');
    headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

    // Role-based protection: Admin routes only accessible by admins
    if (req.nextUrl.pathname.startsWith('/admin') && token?.role !== 'admin') {
      return NextResponse.rewrite(new URL('/404', req.url), { headers }); // Hide the route completely if not admin
    }

    const response = NextResponse.next();
    // Apply headers to normal responses
    response.headers.set('X-XSS-Protection', '1; mode=block');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-Content-Type-Options', 'nosniff');
    return response;
  },
  {
    callbacks: {
      // User is authorized if they have a token (except for auth pages which we handle manually above)
      authorized({ token, req }) {
        const isAuthPage = req.nextUrl.pathname.startsWith('/auth');
        if (isAuthPage) return true; // Let them through to Auth pages to login
        
        return !!token; // All other matched routes require a valid token
      },
    },
  }
);

// Define which routes this middleware applies to
export const config = {
  matcher: [
    '/lms/:path*', 
    '/admin/:path*',
    '/profile/:path*',
    '/auth/:path*' // We run middleware on auth to redirect if already logged in
  ],
};
