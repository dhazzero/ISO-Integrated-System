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
const publicApiPrefixes = ['/api/auth/login', '/api/seed', '/api/companies'];

// Role-based route restrictions (lowercase to match database values)
const roleRestrictedRoutes: Record<string, string[]> = {
    '/audit': ['superuser', 'admin', 'administrator', 'manager', 'superadmin'],
    '/audit-logs': ['superuser', 'admin', 'administrator', 'manager', 'hse_manager', 'superadmin'],
    '/settings': ['superuser', 'admin', 'administrator', 'superadmin'],
    '/api/settings': ['superuser', 'admin', 'administrator', 'superadmin'],
    '/admin': ['superadmin'], // Super admin dashboard - only for super admins
    '/api/admin': ['superadmin'], // Super admin API
};

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const token = request.cookies.get(COOKIE_NAME)?.value;

    // Handle root path - redirect based on authentication status and role
    if (pathname === '/') {
        if (token) {
            try {
                const { payload } = await jwtVerify(token, JWT_SECRET);
                // Super admin goes to /admin, others go to /home
                if (payload.isSuperAdmin === true) {
                    return NextResponse.redirect(new URL('/admin', request.url));
                }
                return NextResponse.redirect(new URL('/home', request.url));
            } catch {
                return NextResponse.redirect(new URL('/login', request.url));
            }
        } else {
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

    if (!token) {
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('redirect', pathname);
        return NextResponse.redirect(loginUrl);
    }

    try {
        const { payload } = await jwtVerify(token, JWT_SECRET);
        const userRole = payload.role as string || 'USER';
        const isSuperAdmin = payload.isSuperAdmin === true;

        // Super admin trying to access regular dashboard - redirect to admin
        if (isSuperAdmin && (pathname === '/home' || pathname.startsWith('/documents') || pathname.startsWith('/risk') || pathname.startsWith('/audit') || pathname.startsWith('/compliance') || pathname.startsWith('/training') || pathname.startsWith('/reports'))) {
            return NextResponse.redirect(new URL('/admin', request.url));
        }

        // Regular user trying to access admin routes - redirect to home
        if (!isSuperAdmin && pathname.startsWith('/admin')) {
            return NextResponse.redirect(new URL('/home', request.url));
        }

        // Check role-based route restrictions
        for (const [route, allowedRoles] of Object.entries(roleRestrictedRoutes)) {
            if (pathname.startsWith(route)) {
                // Super admin has access to everything
                if (isSuperAdmin) break;

                if (!allowedRoles.includes(userRole.toLowerCase())) {
                    console.log(`Access denied: User role ${userRole} cannot access ${pathname}`);
                    return NextResponse.redirect(new URL('/?error=unauthorized', request.url));
                }
                break;
            }
        }

        return NextResponse.next();
    } catch (error) {
        console.error('Invalid session token:', error);
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('redirect', pathname);

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
