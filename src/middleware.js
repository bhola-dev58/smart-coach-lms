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

    // Role-based protection: Admin routes only accessible by admins
    if (req.nextUrl.pathname.startsWith('/admin') && token?.role !== 'admin') {
      return NextResponse.rewrite(new URL('/404', req.url)); // Hide the route completely if not admin
    }
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
