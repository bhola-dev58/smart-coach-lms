import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function proxy(req) {
    const token = req.nextauth.token;
    const { pathname } = req.nextUrl;

    // ── Public paths that bypass all checks ──
    const publicPaths = ['/lms/certificates/verify', '/certificates/verify'];
    if (publicPaths.some(p => pathname.startsWith(p))) {
      return NextResponse.next();
    }

    // ── OTP Verification Gate ──
    // If user is logged in but email not yet verified, send them to OTP page.
    // Allow /auth/verify-email itself so they don't get redirect-looped.
    if (
      token?.needsOtpVerification &&
      !pathname.startsWith('/auth/verify-email') &&
      !pathname.startsWith('/api/')
    ) {
      // Show OTP as modal on home page (same UX as login modal)
      const verifyUrl = new URL('/', req.url);
      verifyUrl.searchParams.set('auth', 'verify-otp');
      return NextResponse.redirect(verifyUrl);
    }

    // ── If already logged-in + verified, redirect away from auth pages ──
    if (pathname.startsWith('/auth') && token && !token.needsOtpVerification) {
      return NextResponse.redirect(new URL('/lms', req.url));
    }

    // ── Security headers ──
    const response = NextResponse.next();
    response.headers.set('X-XSS-Protection', '1; mode=block');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

    // ── Role-based: admin routes only for admins ──
    if (pathname.startsWith('/admin') && token?.role !== 'admin') {
      return NextResponse.rewrite(new URL('/404', req.url));
    }

    return response;
  },
  {
    callbacks: {
      authorized({ token, req }) {
        const { pathname } = req.nextUrl;

        // Auth pages are always accessible (login, register, verify-email)
        if (pathname.startsWith('/auth')) return true;

        // Public certificate verification
        const publicPaths = ['/lms/certificates/verify', '/certificates/verify'];
        if (publicPaths.some(p => pathname.startsWith(p))) return true;

        // Everything else requires a session token
        return !!token;
      },
    },
  }
);

// Routes this middleware applies to
export const config = {
  matcher: [
    '/lms/:path*',
    '/admin/:path*',
    '/profile/:path*',
    '/auth/:path*',
  ],
};
