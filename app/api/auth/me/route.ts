import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { connectToTenantDatabase } from '@/lib/mongodb-tenant';
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

        // Check if super admin
        const isSuperAdmin = payload.isSuperAdmin === true;
        const companyCode = payload.companyCode as string;
        const companyName = payload.companyName as string;

        // Super admin doesn't need database lookup
        if (isSuperAdmin) {
            return NextResponse.json({
                user: {
                    _id: payload.userId,
                    userId: payload.username,
                    name: payload.name,
                    role: 'superadmin',
                    status: 'active',
                    isSuperAdmin: true,
                    companyCode: 'ALL',
                    companyName: 'Master Admin',
                    permissions: {
                        canEdit: true,
                        canDelete: true,
                        canViewAudit: true,
                        canAccessSettings: true,
                    },
                }
            });
        }

        // Get user from tenant database
        const { db } = await connectToTenantDatabase(companyCode);
        const user = await db.collection<User>('users').findOne({
            _id: new ObjectId(payload.userId as string)
        });

        if (!user) {
            return NextResponse.json({ message: 'User tidak ditemukan' }, { status: 404 });
        }

        // Get company-specific permission matrix from master database
        const { connectToMasterDatabase } = await import('@/lib/mongodb-tenant');
        const { db: masterDb } = await connectToMasterDatabase();
        const companyPerms = await masterDb.collection('company_permissions').findOne({
            companyCode: companyCode
        });

        // Default permissions if no custom config exists
        const defaultPerms = {
            canView: ['superuser', 'admin', 'administrator', 'manager', 'hse_manager', 'staff', 'user'],
            canEdit: ['superuser', 'admin', 'administrator', 'manager', 'hse_manager'],
            canDelete: ['superuser', 'admin', 'administrator'],
            canUpload: ['superuser', 'admin', 'administrator', 'manager', 'hse_manager'],
            canViewAudit: ['superuser', 'admin', 'administrator', 'manager', 'hse_manager'],
            canAccessSettings: ['superuser', 'admin', 'administrator'],
        };

        // Use database permissions or defaults
        const permMatrix = companyPerms?.permissions || defaultPerms;
        const role = (user.role || 'user').toLowerCase();

        // Calculate permission flags based on company-specific matrix
        const canEdit = permMatrix.canEdit?.includes(role) || ['superuser', 'superadmin', 'admin', 'administrator'].includes(role) || false;
        const canDelete = permMatrix.canDelete?.includes(role) || ['superuser', 'superadmin', 'admin', 'administrator'].includes(role) || false;
        const canViewAudit = permMatrix.canViewAudit?.includes(role) || ['superuser', 'superadmin', 'admin', 'administrator'].includes(role) || false;
        const canAccessSettings = permMatrix.canAccessSettings?.includes(role) || ['superuser', 'superadmin', 'admin', 'administrator'].includes(role) || false;
        const canUpload = permMatrix.canUpload?.includes(role) || ['superuser', 'superadmin', 'admin', 'administrator'].includes(role) || false;

        // Return user data (without password) with permissions and company info
        return NextResponse.json({
            user: {
                _id: user._id,
                userId: user.userId,
                name: user.name,
                email: user.email,
                role: user.role,
                status: user.status,
                departmentId: user.departmentId,
                departmentName: (user as any).departmentName,
                // Multi-tenant info
                isSuperAdmin: false,
                companyCode: companyCode,
                companyName: companyName,
                // Permission flags for frontend
                permissions: {
                    canEdit,
                    canDelete,
                    canViewAudit,
                    canAccessSettings,
                    canUpload,
                },
            }
        });

    } catch (error) {
        console.error('Session error:', error);
        return NextResponse.json({ message: 'Sesi tidak valid atau telah berakhir' }, { status: 401 });
    }
}
