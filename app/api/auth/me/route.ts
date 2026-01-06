import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { User } from '@/lib/types';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'your-super-secret-jwt-key-that-is-at-least-32-bytes-long');
const COOKIE_NAME = 'session';

// GET current logged-in user from session
export async function GET() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get(COOKIE_NAME)?.value;

        if (!token) {
            return NextResponse.json({ message: 'Tidak ada sesi aktif' }, { status: 401 });
        }

        // Verify JWT
        const { payload } = await jwtVerify(token, JWT_SECRET);

        if (!payload.userId) {
            return NextResponse.json({ message: 'Token tidak valid' }, { status: 401 });
        }

        // Get user from database
        const { db } = await connectToDatabase();
        const user = await db.collection<User>('users').findOne({
            _id: new ObjectId(payload.userId as string)
        });

        if (!user) {
            return NextResponse.json({ message: 'User tidak ditemukan' }, { status: 404 });
        }

        // Calculate permission flags based on role (lowercase to match database)
        // Include all role variations that may exist in database
        const role = (user.role || 'user').toLowerCase();
        const canEdit = ['superuser', 'admin', 'administrator', 'manager', 'hse_manager'].includes(role);
        const canDelete = ['superuser'].includes(role);
        const canViewAudit = ['superuser', 'admin', 'administrator', 'manager', 'hse_manager'].includes(role);
        const canAccessSettings = ['superuser', 'admin', 'administrator'].includes(role);

        // Return user data (without password) with permissions
        return NextResponse.json({
            _id: user._id,
            userId: user.userId,
            name: user.name,
            email: user.email,
            role: user.role,
            status: user.status,
            departmentId: user.departmentId,
            departmentName: (user as any).departmentName,
            // Permission flags for frontend
            permissions: {
                canEdit,
                canDelete,
                canViewAudit,
                canAccessSettings,
            },
        });

    } catch (error) {
        console.error('Session error:', error);
        return NextResponse.json({ message: 'Sesi tidak valid atau telah berakhir' }, { status: 401 });
    }
}
