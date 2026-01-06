import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { connectToDatabase } from '@/lib/mongodb';

const COOKIE_NAME = 'session';
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'your-super-secret-jwt-key-that-is-at-least-32-bytes-long');
const LOGS_COLLECTION = 'security_logs';

export async function POST(request: Request) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get(COOKIE_NAME)?.value;

        // Try to get user info from token before deleting for logging
        let userName = 'Unknown User';
        let userId = null;
        let userRole = null;

        if (token) {
            try {
                const { payload } = await jwtVerify(token, JWT_SECRET);
                userName = payload.name as string || payload.username as string || 'Unknown User';
                userId = payload.userId as string || null;
                userRole = payload.role as string || null;
            } catch (decodeError) {
                console.error('Failed to decode token for logout logging:', decodeError);
            }
        }

        // Get client IP address
        const ipAddress = request.headers.get('x-forwarded-for') ||
            request.headers.get('x-real-ip') ||
            '127.0.0.1';

        // Log logout action
        try {
            const { db } = await connectToDatabase();
            await db.collection(LOGS_COLLECTION).insertOne({
                action: 'LOGOUT',
                module: 'Keamanan',
                description: `User ${userName} logout dari sistem`,
                details: {
                    userRole: userRole,
                },
                userId: userId,
                userName: userName,
                userRole: userRole,
                timestamp: new Date(),
                ip: ipAddress,
            });
        } catch (logError) {
            console.error('Failed to log logout activity:', logError);
            // Continue with logout even if logging fails
        }

        // Hapus cookie
        cookieStore.delete(COOKIE_NAME);

        return NextResponse.json({ message: 'Logout berhasil' });
    } catch (error) {
        console.error('Logout error:', error);
        return NextResponse.json({ message: 'Terjadi kesalahan saat logout' }, { status: 500 });
    }
}

