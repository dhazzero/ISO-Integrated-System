import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || 'your-super-secret-jwt-key-that-is-at-least-32-bytes-long'
);
const COOKIE_NAME = 'session';

// Routes that don't require authentication
const publicRoutes = ['/login', '/api/auth/login', '/api/seed'];

// API routes that should be public
const publicApiPrefixes = ['/api/auth/login', '/api/seed'];

// Role-based route restrictions (lowercase to match database values)
const roleRestrictedRoutes: Record<string, string[]> = {
    '/audit': ['superuser', 'admin', 'administrator', 'manager'], // STAFF cannot access
    '/settings': ['superuser', 'admin', 'administrator'], // Only superuser and admin/administrator
    '/api/settings': ['superuser', 'admin', 'administrator'], // Settings API
};

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const token = request.cookies.get(COOKIE_NAME)?.value;

    // Handle root path - redirect based on authentication status
    if (pathname === '/') {
        if (token) {
            // User is authenticated, redirect to home
            return NextResponse.redirect(new URL('/home', request.url));
        } else {
            // User is not authenticated, redirect to login
            return NextResponse.redirect(new URL('/login', request.url));
        }
    }

    // Allow public routes
    if (publicRoutes.includes(pathname)) {
        return NextResponse.next();
    }

    // Allow public API routes
    if (publicApiPrefixes.some(prefix => pathname.startsWith(prefix))) {
        return NextResponse.next();
    }

    // Allow static files and Next.js internals
    if (
        pathname.startsWith('/_next') ||
        pathname.startsWith('/static') ||
        pathname.includes('.') // files with extensions (images, etc.)
    ) {
        return NextResponse.next();
    }

    // Check for session cookie (token already declared at top)

    if (!token) {
        // No token, redirect to login
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('redirect', pathname);
        return NextResponse.redirect(loginUrl);
    }

    try {
        // Verify the JWT token
        const { payload } = await jwtVerify(token, JWT_SECRET);
        const userRole = payload.role as string || 'USER';

        // Check role-based route restrictions
        for (const [route, allowedRoles] of Object.entries(roleRestrictedRoutes)) {
            if (pathname.startsWith(route)) {
                if (!allowedRoles.includes(userRole)) {
                    // User doesn't have permission, redirect to home with error
                    console.log(`Access denied: User role ${userRole} cannot access ${pathname}`);
                    return NextResponse.redirect(new URL('/?error=unauthorized', request.url));
                }
                break;
            }
        }

        return NextResponse.next();
    } catch (error) {
        // Invalid token, redirect to login
        console.error('Invalid session token:', error);
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('redirect', pathname);

        // Clear the invalid cookie
        const response = NextResponse.redirect(loginUrl);
        response.cookies.delete(COOKIE_NAME);
        return response;
    }
}

// Configure which paths the middleware runs on
export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!_next/static|_next/image|favicon.ico).*)',
    ],
};
