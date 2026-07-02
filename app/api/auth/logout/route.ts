import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getTenantDb } from '@/lib/db-helper';

const COOKIE_NAME = 'session';
const LOGS_COLLECTION = 'security_logs';

export async function POST(request: Request) {
    try {
        const cookieStore = await cookies();

        // Get client IP
        const ipAddress = request.headers.get('x-forwarded-for') ||
            request.headers.get('x-real-ip') ||
            '127.0.0.1';

        // Log logout action to tenant database
        try {
            // getTenantDb will fetch the current user and their tenant connection
            // We use this to log the logout event into the correct tenant's log
            const { db, user } = await getTenantDb();

            if (user) {
                await db.collection(LOGS_COLLECTION).insertOne({
                    action: 'LOGOUT',
                    module: 'Keamanan',
                    description: `User ${user.userName} logout dari sistem`,
                    details: {
                        userRole: user.userRole,
                    },
                    userId: user.userId,
                    userName: user.userName,
                    userRole: user.userRole,
                    timestamp: new Date(),
                    ip: ipAddress,
                });
            }
        } catch (logError) {
            // If getTenantDb fails (e.g. invalid session), we just skip logging
            // and proceed to logout (clear cookie)
            console.warn('Failed to log logout activity (likely already logged out or invalid session):', logError);
        }

        // Hapus cookie
        cookieStore.delete(COOKIE_NAME);

        return NextResponse.json({ message: 'Logout berhasil' });
    } catch (error) {
        console.error('Logout error:', error);
        // Even if error, try to clear cookie if possible? 
        // But headers are immutable in Next response unless returning a new one with cookies.delete.
        // We typically want to force logout on error too.

        // Ensure even on error we return a response that might signal logout, 
        // but cleaner to just standard error here.
        return NextResponse.json({ message: 'Terjadi kesalahan saat logout' }, { status: 500 });
    }
}
